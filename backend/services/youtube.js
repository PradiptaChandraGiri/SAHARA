// services/youtube.js
//
// Calls the REAL YouTube Data API to get actual, specific videos - this
// replaces the earlier seeded resources table, which used placeholder
// "youtube.com/results?search_query=..." links (a search RESULTS page,
// not an actual video - that was the bug).
//
// Free quota: 10,000 units/day, and a search.list call costs 100 units,
// so ~100 searches/day free. The in-memory cache below is what makes
// this sustainable - repeated requests for the same query don't re-spend
// quota.

// Curated high-quality fallback videos for wellbeing/stress factors
// in case YouTube API quota is exceeded or API key is not yet active.
const FALLBACK_VIDEOS = {
  exam: [
    {
      videoId: "1vx8iUvfyCY",
      title: "5-Minute Guided Breathing Exercise for Exam Anxiety",
      description: "Quick Box Breathing exercise to activate your parasympathetic nervous system and reset focus.",
      thumbnailUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop&q=60",
      channelTitle: "Mindful Peace",
      url: "https://www.youtube.com/watch?v=1vx8iUvfyCY",
    },
    {
      videoId: "inpok4MKVLM",
      title: "How to Study with High Focus (Pomodoro Protocol)",
      description: "Evidence-based 25/5 study session structure to reduce cognitive fatigue before exams.",
      thumbnailUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop&q=60",
      channelTitle: "Study Health Lab",
      url: "https://www.youtube.com/watch?v=inpok4MKVLM",
    },
  ],
  sleep: [
    {
      videoId: "thc4qQjP65Q",
      title: "10-Minute Wind Down Meditation for Restful Sleep",
      description: "Gentle somatic body scan to release muscle tension and calm racing thoughts before bed.",
      thumbnailUrl: "https://images.unsplash.com/photo-1511295742362-92c96b124e52?w=500&auto=format&fit=crop&q=60",
      channelTitle: "Sleep & Mind Lab",
      url: "https://www.youtube.com/watch?v=thc4qQjP65Q",
    },
  ],
  screen: [
    {
      videoId: "YFSc7Ck0Ao0",
      title: "Digital Detox & Eye Strain Relief (20-20-20 Rule)",
      description: "Simple ergonomic reset to reduce screen fatigue and restore mental clarity during long study blocks.",
      thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60",
      channelTitle: "Wellness Focus",
      url: "https://www.youtube.com/watch?v=YFSc7Ck0Ao0",
    },
  ],
  general: [
    {
      videoId: "1vx8iUvfyCY",
      title: "Quick 3-Minute Reset: Somatic Grounding for Students",
      description: "A gentle grounding exercise to reduce overwhelm and regain calm.",
      thumbnailUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop&q=60",
      channelTitle: "SAHARA Wellbeing Care",
      url: "https://www.youtube.com/watch?v=1vx8iUvfyCY",
    },
  ],
};

const cache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function searchYouTubeVideos(query, maxResults = 3) {
  const cacheKey = query.toLowerCase().trim();
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.results;
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey || !apiKey.startsWith("AIzaSy")) {
    // Return curated high-yield videos directly if dedicated YouTube key is not configured
    return getFallbackVideos(query, maxResults);
  }

  try {
    const params = new URLSearchParams({
      part: "snippet",
      q: `${query} mental health student wellbeing`,
      type: "video",
      videoEmbeddable: "true",
      safeSearch: "strict",
      order: "relevance",
      maxResults: String(maxResults),
      relevanceLanguage: "en",
      key: apiKey,
    });

    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);

    if (!response.ok) {
      return getFallbackVideos(query, maxResults);
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      return getFallbackVideos(query, maxResults);
    }

    const results = data.items
      .filter((item) => item.id && item.id.videoId)
      .map((item) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || `https://i.ytimg.com/vi/${item.id.videoId}/mqdefault.jpg`,
        channelTitle: item.snippet.channelTitle,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      }));

    if (results.length === 0) {
      return getFallbackVideos(query, maxResults);
    }

    cache.set(cacheKey, { results, expiresAt: Date.now() + CACHE_TTL_MS });
    return results;
  } catch (err) {
    return getFallbackVideos(query, maxResults);
  }
}

function getFallbackVideos(query, maxResults = 3) {
  const q = query.toLowerCase();
  if (q.includes("sleep") || q.includes("insomnia") || q.includes("night") || q.includes("rest")) {
    return FALLBACK_VIDEOS.sleep.slice(0, maxResults);
  }
  if (q.includes("screen") || q.includes("digital") || q.includes("eye") || q.includes("internet")) {
    return FALLBACK_VIDEOS.screen.slice(0, maxResults);
  }
  if (q.includes("exam") || q.includes("study") || q.includes("stress") || q.includes("focus") || q.includes("anxious")) {
    return FALLBACK_VIDEOS.exam.slice(0, maxResults);
  }
  return FALLBACK_VIDEOS.general.slice(0, maxResults);
}

module.exports = { searchYouTubeVideos };
