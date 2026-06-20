import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Only callable from server-side with service role key — no CORS needed.

interface TelegramChannel {
  id: string
  region: string
  country_code: string
  language_code: string
  language_name: string
  channel_id: string
  channel_name: string
  active: boolean
}

interface BroadcastRequest {
  message: string          // raw message in Hebrew/English (source language)
  product_name?: string
  product_url?: string
  image_url?: string
  regions?: string[]       // optional filter: ['IL','US','RU'] — omit for all active
}

async function translateMessage(
  sourceMessage: string,
  targetLanguage: string,
  targetLanguageCode: string,
  productName: string,
  productUrl: string,
  anthropicKey: string,
): Promise<string> {
  const prompt = `You are a marketing copywriter. Translate and localize the following product marketing message to ${targetLanguage} (${targetLanguageCode}).

Rules:
- Keep the tone enthusiastic and natural for native ${targetLanguage} speakers
- Preserve any emojis
- If a product URL is provided, append it at the end
- Keep message concise (under 300 words)
- Do NOT add hashtags unless the original has them
- Return ONLY the translated message, nothing else

Product name: ${productName}
Product URL: ${productUrl}

Message to translate:
${sourceMessage}`

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text().catch(() => "")
    throw new Error(`Anthropic API error: ${res.status} ${err}`)
  }

  const json = await res.json() as { content: Array<{ type: string; text: string }> }
  return json.content?.[0]?.text?.trim() ?? sourceMessage
}

async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  text: string,
  imageUrl?: string,
): Promise<{ ok: boolean; error?: string }> {
  const baseUrl = `https://api.telegram.org/bot${botToken}`

  if (imageUrl) {
    const res = await fetch(`${baseUrl}/sendPhoto`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        photo: imageUrl,
        caption: text.slice(0, 1024),
        parse_mode: "HTML",
      }),
    })
    const json = await res.json() as { ok: boolean; description?: string }
    return { ok: json.ok, error: json.description }
  }

  const res = await fetch(`${baseUrl}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text.slice(0, 4096),
      parse_mode: "HTML",
      disable_web_page_preview: false,
    }),
  })
  const json = await res.json() as { ok: boolean; description?: string }
  return { ok: json.ok, error: json.description }
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 })
  }

  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const telegramToken = Deno.env.get("TELEGRAM_BOT_TOKEN")
  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY")

  // Auth: only service role key allowed
  const authHeader = req.headers.get("authorization") ?? ""
  const providedKey = authHeader.replace("Bearer ", "").trim()
  if (!serviceRole || providedKey !== serviceRole) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  if (!supabaseUrl || !telegramToken || !anthropicKey) {
    return new Response(JSON.stringify({ error: "Missing required env vars: TELEGRAM_BOT_TOKEN, ANTHROPIC_API_KEY" }), { status: 500 })
  }

  let body: BroadcastRequest
  try {
    body = await req.json() as BroadcastRequest
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 })
  }

  const { message, product_name = "", product_url = "", image_url, regions } = body
  if (!message || typeof message !== "string" || message.trim().length < 2) {
    return new Response(JSON.stringify({ error: "message is required" }), { status: 400 })
  }

  // Fetch active channels from DB
  let url = `${supabaseUrl}/rest/v1/telegram_channels?active=eq.true&select=*`
  if (regions && regions.length > 0) {
    const codes = regions.map(r => `"${r}"`).join(",")
    url += `&country_code=in.(${codes})`
  }

  const channelsRes = await fetch(url, {
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
    },
  })

  if (!channelsRes.ok) {
    const err = await channelsRes.text().catch(() => "")
    return new Response(JSON.stringify({ error: `Failed to fetch channels: ${err}` }), { status: 500 })
  }

  const channels = await channelsRes.json() as TelegramChannel[]
  if (!channels.length) {
    return new Response(JSON.stringify({ ok: true, sent: 0, message: "No active channels found" }), { status: 200 })
  }

  const results: Array<{ channel: string; region: string; ok: boolean; error?: string }> = []

  for (const ch of channels) {
    try {
      const localizedText = await translateMessage(
        message,
        ch.language_name,
        ch.language_code,
        product_name,
        product_url,
        anthropicKey,
      )

      const sendResult = await sendTelegramMessage(telegramToken, ch.channel_id, localizedText, image_url)
      results.push({ channel: ch.channel_name, region: ch.country_code, ok: sendResult.ok, error: sendResult.error })

      // Log to DB
      await fetch(`${supabaseUrl}/rest/v1/telegram_broadcast_log`, {
        method: "POST",
        headers: {
          apikey: serviceRole,
          Authorization: `Bearer ${serviceRole}`,
          "content-type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          channel_id: ch.id,
          country_code: ch.country_code,
          language_code: ch.language_code,
          original_message: message.slice(0, 1000),
          localized_message: localizedText.slice(0, 2000),
          product_name: product_name.slice(0, 200),
          product_url: product_url.slice(0, 500),
          image_url: image_url?.slice(0, 500),
          status: sendResult.ok ? "sent" : "failed",
          error_message: sendResult.error?.slice(0, 500),
        }),
      })

      // Rate-limit: Telegram allows ~30 messages/sec but per-chat is 1/sec
      await new Promise(r => setTimeout(r, 100))
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      results.push({ channel: ch.channel_name, region: ch.country_code, ok: false, error: errMsg })
      console.error(`Failed for channel ${ch.channel_name}:`, errMsg)
    }
  }

  const sent = results.filter(r => r.ok).length
  const failed = results.filter(r => !r.ok).length

  return new Response(
    JSON.stringify({ ok: true, sent, failed, results }),
    { status: 200, headers: { "content-type": "application/json" } },
  )
})
