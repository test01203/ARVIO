package com.arflix.tv.ui.screens.player

import android.media.MediaCodec
import android.media.MediaExtractor
import android.media.MediaFormat
import android.util.Log
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.util.TreeMap
import java.util.concurrent.TimeUnit

private const val TAG = "SpeechSubtitle"

/**
 * Speech-to-Subtitle engine using Groq Whisper + pre-fetch.
 *
 * Algorithm:
 * 1. MediaExtractor reads audio 20-30 seconds AHEAD of current playback position.
 * 2. MediaCodec decodes compressed audio (AAC/MP3/etc.) → 16kHz mono PCM.
 * 3. 4-second PCM chunks → Groq whisper-large-v3-turbo → text + timestamps.
 * 4. Stored in TreeMap<timeMs, hebrewText>.
 * 5. displayLoop() checks player.currentPosition every 100ms → shows right subtitle.
 *
 * Result: zero perceived delay — subtitle is ready BEFORE the audio plays.
 */
class SpeechSubtitleEngine(
    private val positionMs: StateFlow<Long>,   // updated by PlayerScreen each frame
    private val apiKey: String,
    private val scope: CoroutineScope
) {
    companion object {
        private const val CHUNK_SEC     = 4L      // transcribe in 4s chunks
        private const val PREFETCH_SEC  = 25L     // stay 25s ahead of playback
        private const val TARGET_RATE   = 16000   // Whisper expects 16kHz
        private const val DISPLAY_AFTER_SEC = 4.5 // hide cue after 4.5s
        private const val GROQ_WHISPER  = "https://api.groq.com/openai/v1/audio/transcriptions"
        private val SILENCE_CHECK_COUNT = TARGET_RATE * CHUNK_SEC.toInt() / 2  // mono samples
    }

    private val subtitleMap = TreeMap<Long, Pair<String, Long>>() // timeMs → (text, endMs)
    private val _subtitle = MutableStateFlow<String?>(null)
    val subtitle: StateFlow<String?> = _subtitle

    private var transcribeJob: Job? = null
    private var displayJob:    Job? = null
    private var mediaUrl: String? = null

    private val http = OkHttpClient.Builder()
        .callTimeout(20, TimeUnit.SECONDS)
        .build()

    // ── Public API ─────────────────────────────────────────────────────────

    fun start(url: String) {
        mediaUrl = url
        transcribeJob?.cancel()
        displayJob?.cancel()
        synchronized(subtitleMap) { subtitleMap.clear() }

        transcribeJob = scope.launch(Dispatchers.IO) {
            runTranscriptionLoop(url)
        }
        displayJob = scope.launch {
            runDisplayLoop()
        }
        Log.i(TAG, "Started speech subtitle engine for $url")
    }

    fun stop() {
        transcribeJob?.cancel()
        displayJob?.cancel()
        synchronized(subtitleMap) { subtitleMap.clear() }
        _subtitle.value = null
        Log.i(TAG, "Stopped speech subtitle engine")
    }

    // ── Transcription loop ─────────────────────────────────────────────────

    private suspend fun runTranscriptionLoop(url: String) {
        val extractor = MediaExtractor()
        val codec: MediaCodec

        try {
            extractor.setDataSource(url)
        } catch (e: Exception) {
            Log.e(TAG, "MediaExtractor.setDataSource failed: ${e.message}")
            return
        }

        // Find audio track
        val (audioTrackIdx, audioFormat) = findAudioTrack(extractor) ?: run {
            Log.e(TAG, "No audio track found")
            extractor.release()
            return
        }

        extractor.selectTrack(audioTrackIdx)

        // Prepare decoder
        val mime = audioFormat.getString(MediaFormat.KEY_MIME) ?: run {
            extractor.release()
            return
        }
        codec = try {
            MediaCodec.createDecoderByType(mime).also { it.configure(audioFormat, null, null, 0); it.start() }
        } catch (e: Exception) {
            Log.e(TAG, "MediaCodec init failed: ${e.message}")
            extractor.release()
            return
        }

        val sampleRate   = audioFormat.getInteger(MediaFormat.KEY_SAMPLE_RATE)
        val channelCount = if (audioFormat.containsKey(MediaFormat.KEY_CHANNEL_COUNT))
            audioFormat.getInteger(MediaFormat.KEY_CHANNEL_COUNT) else 1

        try {
            while (currentCoroutineContext().isActive) {
                // Wait until we need to prefetch
                val playerPosMs = positionMs.value
                val targetMs    = playerPosMs + PREFETCH_SEC * 1000

                // Check what we've already transcribed
                val lastTranscribedMs = synchronized(subtitleMap) {
                    subtitleMap.lastEntry()?.value?.second ?: playerPosMs
                }

                if (lastTranscribedMs >= targetMs) {
                    delay(1000)
                    continue
                }

                // Seek extractor to where we left off
                val seekToUs = lastTranscribedMs * 1000L
                extractor.seekTo(seekToUs, MediaExtractor.SEEK_TO_CLOSEST_SYNC)

                // Extract and decode CHUNK_SEC seconds of audio
                val chunkStartMs = extractor.sampleTime / 1000
                val chunkPcm = decodePcmChunk(
                    extractor, codec, audioFormat, sampleRate, channelCount,
                    chunkDurationMs = CHUNK_SEC * 1000
                ) ?: break

                if (chunkPcm.isEmpty()) {
                    delay(500)
                    continue
                }

                // Resample to 16kHz mono if needed
                val pcm16k = resampleToMono16k(chunkPcm, sampleRate, channelCount)

                // Skip truly silent chunks (saves API calls)
                if (isSilent(pcm16k)) {
                    continue
                }

                // Transcribe via Groq Whisper
                val segments = transcribeWhisper(pcm16k, chunkStartMs)
                segments.forEach { (relativeMs, text) ->
                    val absMs  = chunkStartMs + relativeMs
                    val endMs  = absMs + (DISPLAY_AFTER_SEC * 1000).toLong()
                    synchronized(subtitleMap) { subtitleMap[absMs] = Pair(text, endMs) }
                }
            }
        } finally {
            try { codec.stop(); codec.release() } catch (_: Exception) {}
            extractor.release()
        }
    }

    // ── Find audio track ───────────────────────────────────────────────────

    private fun findAudioTrack(extractor: MediaExtractor): Pair<Int, MediaFormat>? {
        for (i in 0 until extractor.trackCount) {
            val fmt = extractor.getTrackFormat(i)
            val mime = fmt.getString(MediaFormat.KEY_MIME) ?: continue
            if (mime.startsWith("audio/")) return Pair(i, fmt)
        }
        return null
    }

    // ── Decode PCM chunk ───────────────────────────────────────────────────

    private suspend fun decodePcmChunk(
        extractor: MediaExtractor,
        codec: MediaCodec,
        format: MediaFormat,
        sampleRate: Int,
        channels: Int,
        chunkDurationMs: Long
    ): ByteArray? = withContext(Dispatchers.IO) {
        val output = ByteArrayOutputStream()
        val startUs = extractor.sampleTime
        val endUs   = startUs + chunkDurationMs * 1000

        val bufferInfo = MediaCodec.BufferInfo()
        var inputDone  = false
        var outputDone = false

        while (!outputDone && isActive) {
            // Feed input
            if (!inputDone) {
                val inIdx = codec.dequeueInputBuffer(5000)
                if (inIdx >= 0) {
                    val buf = codec.getInputBuffer(inIdx) ?: break
                    val size = extractor.readSampleData(buf, 0)
                    if (size < 0 || extractor.sampleTime > endUs) {
                        codec.queueInputBuffer(inIdx, 0, 0, 0, MediaCodec.BUFFER_FLAG_END_OF_STREAM)
                        inputDone = true
                    } else {
                        codec.queueInputBuffer(inIdx, 0, size, extractor.sampleTime, 0)
                        extractor.advance()
                    }
                }
            }

            // Collect output
            val outIdx = codec.dequeueOutputBuffer(bufferInfo, 5000)
            when {
                outIdx >= 0 -> {
                    val outBuf = codec.getOutputBuffer(outIdx)
                    if (outBuf != null && bufferInfo.size > 0) {
                        val bytes = ByteArray(bufferInfo.size)
                        outBuf.get(bytes)
                        output.write(bytes)
                    }
                    codec.releaseOutputBuffer(outIdx, false)
                    if (bufferInfo.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM != 0) {
                        outputDone = true
                    }
                    if (bufferInfo.presentationTimeUs >= endUs) outputDone = true
                }
                outIdx == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED -> { /* format change, ignore */ }
            }
        }

        output.toByteArray()
    }

    // ── Resample → 16kHz mono PCM-16LE ────────────────────────────────────

    private fun resampleToMono16k(pcm: ByteArray, srcRate: Int, channels: Int): ByteArray {
        if (srcRate == TARGET_RATE && channels == 1) return pcm

        // Convert bytes → float samples
        val shorts = ShortArray(pcm.size / 2)
        ByteBuffer.wrap(pcm).order(ByteOrder.LITTLE_ENDIAN).asShortBuffer().get(shorts)

        // Mix down to mono
        val mono = if (channels > 1) {
            FloatArray(shorts.size / channels) { i ->
                (0 until channels).sumOf { ch -> shorts[i * channels + ch].toDouble() }.toFloat() / channels
            }
        } else {
            FloatArray(shorts.size) { i -> shorts[i].toFloat() }
        }

        // Resample to 16kHz using linear interpolation
        val outLen = (mono.size.toLong() * TARGET_RATE / srcRate).toInt()
        val out16k = FloatArray(outLen) { i ->
            val srcIdx = i.toDouble() * srcRate / TARGET_RATE
            val lo = srcIdx.toInt().coerceIn(0, mono.size - 1)
            val hi = (lo + 1).coerceIn(0, mono.size - 1)
            val frac = (srcIdx - lo).toFloat()
            mono[lo] * (1 - frac) + mono[hi] * frac
        }

        // Convert back to PCM-16LE bytes
        val result = ByteArray(out16k.size * 2)
        val bb = ByteBuffer.wrap(result).order(ByteOrder.LITTLE_ENDIAN)
        out16k.forEach { s -> bb.putShort((s.coerceIn(-32768f, 32767f)).toInt().toShort()) }
        return result
    }

    // ── Silence detection ──────────────────────────────────────────────────

    private fun isSilent(pcm: ByteArray): Boolean {
        if (pcm.size < 4) return true
        val shorts = ShortArray(pcm.size / 2)
        ByteBuffer.wrap(pcm).order(ByteOrder.LITTLE_ENDIAN).asShortBuffer().get(shorts)
        val rms = Math.sqrt(shorts.take(SILENCE_CHECK_COUNT).sumOf { it.toDouble() * it } / minOf(SILENCE_CHECK_COUNT, shorts.size))
        return rms < 100.0
    }

    // ── WAV wrapper ────────────────────────────────────────────────────────

    private fun pcmToWav(pcm: ByteArray): ByteArray {
        val out = ByteArrayOutputStream(44 + pcm.size)
        fun i32(v: Int) = ByteBuffer.allocate(4).order(ByteOrder.LITTLE_ENDIAN).putInt(v).array()
        fun i16(v: Int) = ByteBuffer.allocate(2).order(ByteOrder.LITTLE_ENDIAN).putShort(v.toShort()).array()
        out.write("RIFF".toByteArray()); out.write(i32(36 + pcm.size))
        out.write("WAVE".toByteArray()); out.write("fmt ".toByteArray())
        out.write(i32(16)); out.write(i16(1)); out.write(i16(1))        // PCM, mono
        out.write(i32(TARGET_RATE)); out.write(i32(TARGET_RATE * 2))   // sampleRate, byteRate
        out.write(i16(2)); out.write(i16(16))                           // blockAlign, bitsPerSample
        out.write("data".toByteArray()); out.write(i32(pcm.size)); out.write(pcm)
        return out.toByteArray()
    }

    // ── Groq Whisper API ───────────────────────────────────────────────────

    /**
     * Returns list of (relativeTimeMs, hebrewText) segments.
     * Uses verbose_json to get per-segment timestamps, then translates via LLaMA.
     */
    private suspend fun transcribeWhisper(pcm16k: ByteArray, chunkStartMs: Long): List<Pair<Long, String>> = withContext(Dispatchers.IO) {
        val wav = pcmToWav(pcm16k)
        try {
            val reqBody = MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart("file", "a.wav", wav.toRequestBody("audio/wav".toMediaType()))
                .addFormDataPart("model", "whisper-large-v3-turbo")
                .addFormDataPart("response_format", "verbose_json")
                .addFormDataPart("temperature", "0")
                .build()

            val resp = http.newCall(
                Request.Builder()
                    .url(GROQ_WHISPER)
                    .header("Authorization", "Bearer $apiKey")
                    .post(reqBody)
                    .build()
            ).execute()

            if (!resp.isSuccessful) {
                Log.w(TAG, "Whisper HTTP ${resp.code}")
                return@withContext emptyList()
            }

            val json = JSONObject(resp.body?.string() ?: return@withContext emptyList())
            val segments = json.optJSONArray("segments") ?: return@withContext emptyList()

            // Check overall no_speech_prob
            val avgNoSpeech = (0 until segments.length())
                .map { segments.getJSONObject(it).optDouble("no_speech_prob", 0.0) }
                .average()
            if (avgNoSpeech > 0.5) return@withContext emptyList()

            // Collect valid segments
            val results = mutableListOf<Pair<Long, String>>()
            for (i in 0 until segments.length()) {
                val seg = segments.getJSONObject(i)
                val text = seg.optString("text").trim()
                val startSec = seg.optDouble("start", 0.0)
                val noSpeech = seg.optDouble("no_speech_prob", 0.0)
                if (text.isBlank() || noSpeech > 0.6) continue

                // Translate to Hebrew
                val hebrew = translateToHebrew(text)
                if (hebrew.isNotBlank()) {
                    results.add(Pair((startSec * 1000).toLong(), hebrew))
                }
            }
            results
        } catch (e: Exception) {
            Log.e(TAG, "Whisper error: ${e.message}")
            emptyList()
        }
    }

    private var lastContext = ""

    private suspend fun translateToHebrew(text: String): String = withContext(Dispatchers.IO) {
        val ctx = if (lastContext.isNotEmpty()) "הקשר: \"$lastContext\".\n" else ""
        val prompt = "${ctx}תרגם לעברית דבורה קצרה (שורה אחת). פלט רק את התרגום:\n\"$text\""
        try {
            val body = org.json.JSONObject().apply {
                put("model", "llama-3.1-8b-instant")
                put("max_tokens", 80)
                put("temperature", 0.05)
                put("messages", org.json.JSONArray().put(
                    org.json.JSONObject().apply { put("role", "user"); put("content", prompt) }
                ))
            }
            val resp = http.newCall(
                Request.Builder()
                    .url("https://api.groq.com/openai/v1/chat/completions")
                    .header("Authorization", "Bearer $apiKey")
                    .header("Content-Type", "application/json")
                    .post(body.toString().toRequestBody("application/json".toMediaType()))
                    .build()
            ).execute()
            if (!resp.isSuccessful) return@withContext text
            val result = JSONObject(resp.body?.string() ?: return@withContext text)
                .getJSONArray("choices").getJSONObject(0)
                .getJSONObject("message").getString("content").trim().trim('"', '\'')
            lastContext = result
            result
        } catch (e: Exception) {
            text
        }
    }

    // ── Display loop ───────────────────────────────────────────────────────

    private suspend fun runDisplayLoop() {
        var lastText: String? = null
        while (currentCoroutineContext().isActive) {
            val posMs = positionMs.value

            val entry = synchronized(subtitleMap) {
                subtitleMap.floorEntry(posMs)
            }

            val text = if (entry != null && posMs < entry.value.second) {
                entry.value.first
            } else null

            if (text != lastText) {
                _subtitle.value = text
                lastText = text
            }
            delay(80)
        }
    }
}
