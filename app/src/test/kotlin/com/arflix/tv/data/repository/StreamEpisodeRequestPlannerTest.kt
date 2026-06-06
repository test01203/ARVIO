package com.arflix.tv.data.repository

import org.junit.Assert.assertEquals
import org.junit.Test

class StreamEpisodeRequestPlannerTest {
    @Test
    fun `anime-native addons prefer kitsu then tmdb before imdb`() {
        val candidates = buildEpisodeIdCandidates(
            seriesId = "tt9054364:3:1",
            animeQuery = "kitsu:46729:1",
            tmdbEpisodeId = "tmdb:82684:3:1",
            preferNativeAnimeIds = true
        )

        assertEquals(
            listOf("kitsu:46729:1", "tmdb:82684:3:1", "tt9054364:3:1"),
            candidates.map { it.contentId }
        )
        assertEquals(listOf("kitsu", "tmdb", "imdb"), candidates.map { it.label })
        assertEquals(listOf(true, true, false), candidates.map { it.preferAnimePath })
    }

    @Test
    fun `generic series addons keep imdb first and use anime ids as fallback`() {
        val candidates = buildEpisodeIdCandidates(
            seriesId = "tt9054364:3:1",
            animeQuery = "kitsu:46729:1",
            tmdbEpisodeId = "tmdb:82684:3:1",
            preferNativeAnimeIds = false
        )

        assertEquals(
            listOf("tt9054364:3:1", "kitsu:46729:1", "tmdb:82684:3:1"),
            candidates.map { it.contentId }
        )
        assertEquals(listOf("imdb", "kitsu", "tmdb"), candidates.map { it.label })
    }

    @Test
    fun `native anime addons can skip ambiguous tmdb episode ids`() {
        val candidates = buildEpisodeIdCandidates(
            seriesId = "tt9054364:3:1",
            animeQuery = "kitsu:46729:1",
            tmdbEpisodeId = "tmdb:82684:3:1",
            preferNativeAnimeIds = true,
            includeTmdbCandidate = false
        )

        assertEquals(
            listOf("kitsu:46729:1", "tt9054364:3:1"),
            candidates.map { it.contentId }
        )
        assertEquals(listOf("kitsu", "imdb"), candidates.map { it.label })
    }

    @Test
    fun `duplicate anime query does not repeat the imdb request`() {
        val candidates = buildEpisodeIdCandidates(
            seriesId = "tt2560140:1:1",
            animeQuery = "tt2560140:1:1",
            tmdbEpisodeId = null,
            preferNativeAnimeIds = true
        )

        assertEquals(listOf("tt2560140:1:1"), candidates.map { it.contentId })
        assertEquals(listOf("imdb"), candidates.map { it.label })
    }

    @Test
    fun `animation with missing language can use native anime addon fallback`() {
        val shouldFallback = shouldTryNativeAnimeFallback(
            genreIds = listOf(16, 10759),
            originalLanguage = null,
            nativeAnimeAddonAvailable = true
        )

        assertEquals(true, shouldFallback)
    }

    @Test
    fun `native anime fallback does not apply without anime addon`() {
        val shouldFallback = shouldTryNativeAnimeFallback(
            genreIds = listOf(16, 10759),
            originalLanguage = null,
            nativeAnimeAddonAvailable = false
        )

        assertEquals(false, shouldFallback)
    }

    @Test
    fun `native anime fallback avoids non Japanese animation when language is known`() {
        val shouldFallback = shouldTryNativeAnimeFallback(
            genreIds = listOf(16, 35),
            originalLanguage = "en",
            nativeAnimeAddonAvailable = true
        )

        assertEquals(false, shouldFallback)
    }
}
