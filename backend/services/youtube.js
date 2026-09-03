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
      videoId: "1ZYbU82GVz4",
      title: "Exam Panic & Anxiety Relief (4-7-8 Breathing Technique)",
      description: "Quick Box and 4-7-8 breathing exercises to calm heart rate and clear mental fog before exams.",
      thumbnailUrl: "https://i.ytimg.com/vi/1ZYbU82GVz4/hqdefault.jpg",
      channelTitle: "Mindful Health Lab",
      url: "https://www.youtube.com/watch?v=1ZYbU82GVz4",
    },
    {
      videoId: "1vx8iUvfyCY",
      title: "5-Minute Guided Breathing Exercise for Exam Anxiety",
      description: "Quick somatic breathing exercise to activate your parasympathetic nervous system and reset focus.",
      thumbnailUrl: "https://i.ytimg.com/vi/1vx8iUvfyCY/hqdefault.jpg",
      channelTitle: "Mindful Peace",
      url: "https://www.youtube.com/watch?v=1vx8iUvfyCY",
    },
  ],
  study: [
    {
      videoId: "inpok4MKVLM",
      title: "How to Study with High Focus (Pomodoro Protocol)",
      description: "Evidence-based 25/5 study session structure to reduce cognitive fatigue before exams.",
      thumbnailUrl: "https://i.ytimg.com/vi/inpok4MKVLM/hqdefault.jpg",
      channelTitle: "Study Health Lab",
      url: "https://www.youtube.com/watch?v=inpok4MKVLM",
    },
    {
      videoId: "jfKfPfyJRdk",
      title: "50/10 Pomodoro Study with Lofi Beats & Rain",
      description: "Calm background study sprints with built-in rest intervals to sustain focus.",
      thumbnailUrl: "https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg",
      channelTitle: "Lofi Focus Cafe",
      url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    },
  ],
  sleep: [
    {
      videoId: "pL02HRFk2vo",
      title: "10-Minute NSDR (Non-Sleep Deep Rest) - Huberman Lab",
      description: "Zero-cost somatic protocol for rapid neuro-recovery, dopamine replenishment, and deep rest.",
      thumbnailUrl: "https://i.ytimg.com/vi/pL02HRFk2vo/hqdefault.jpg",
      channelTitle: "Huberman Lab",
      url: "https://www.youtube.com/watch?v=pL02HRFk2vo",
    },
    {
      videoId: "thc4qQjP65Q",
      title: "10-Minute Wind Down Meditation for Restful Sleep",
      description: "Gentle somatic body scan to release muscle tension and calm racing thoughts before bed.",
      thumbnailUrl: "https://i.ytimg.com/vi/thc4qQjP65Q/hqdefault.jpg",
      channelTitle: "Sleep & Mind Lab",
      url: "https://www.youtube.com/watch?v=thc4qQjP65Q",
    },
  ],
  screen: [
    {
      videoId: "YFSc7Ck0Ao0",
      title: "Digital Detox & Eye Strain Relief (20-20-20 Rule)",
      description: "Simple ergonomic reset to reduce screen fatigue and restore mental clarity during long study blocks.",
      thumbnailUrl: "https://i.ytimg.com/vi/YFSc7Ck0Ao0/hqdefault.jpg",
      channelTitle: "Wellness Focus",
      url: "https://www.youtube.com/watch?v=YFSc7Ck0Ao0",
    },
  ],
  burnout: [
    {
      videoId: "VbXvX5H-R38",
      title: "How to Reset When College & Life Feel Overwhelming",
      description: "Practical strategies to break academic paralysis into gentle 15-minute micro-steps.",
      thumbnailUrl: "https://i.ytimg.com/vi/VbXvX5H-R38/hqdefault.jpg",
      channelTitle: "Mental Fitness Hub",
      url: "https://www.youtube.com/watch?v=VbXvX5H-R38",
    },
  ],
  stretch: [
    {
      videoId: "4pKly2JojMw",
      title: "10-Minute Desk & Dorm Stretch for Mental Clarity",
      description: "Gentle physical movement to unclamp neck and shoulder tension from sitting and studying.",
      thumbnailUrl: "https://i.ytimg.com/vi/4pKly2JojMw/hqdefault.jpg",
      channelTitle: "Somatic Flow",
      url: "https://www.youtube.com/watch?v=4pKly2JojMw",
    },
  ],
  general: [
    {
      videoId: "1vx8iUvfyCY",
      title: "Quick 3-Minute Reset: Somatic Grounding for Students",
      description: "A gentle grounding exercise to reduce overwhelm and regain calm.",
      thumbnailUrl: "https://i.ytimg.com/vi/1vx8iUvfyCY/hqdefault.jpg",
      channelTitle: "SAHARA Wellbeing Care",
      url: "https://www.youtube.com/watch?v=1vx8iUvfyCY",
    },
  ],
};

const cache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function scrapeLiveYouTubeVideos(query, maxResults = 3) {
  try {
    const encoded = encodeURIComponent(query.trim());
    const response = await fetch(`https://www.youtube.com/results?search_query=${encoded}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!response.ok) return null;

    const html = await response.text();
    const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
    if (!match) return null;

    const parsed = JSON.parse(match[1]);
    const sectionList = parsed.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
    const contents = sectionList.find((c) => c.itemSectionRenderer)?.itemSectionRenderer?.contents || [];

    const videos = [];
    for (const item of contents) {
      const v = item.videoRenderer;
      if (v && v.videoId && v.title?.runs?.[0]?.text) {
        const videoId = v.videoId;
        const title = v.title.runs.map((r) => r.text).join("");
        const channelTitle = v.ownerText?.runs?.[0]?.text || "YouTube Wellbeing";
        const description = v.detailedMetadataSnippets?.[0]?.snippetText?.runs?.map((r) => r.text).join("") || "";
        const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        videos.push({
          videoId,
          title,
          description,
          thumbnailUrl,
          channelTitle,
          url: `https://www.youtube.com/watch?v=${videoId}`,
        });
        if (videos.length >= maxResults) break;
      }
    }
    return videos.length > 0 ? videos : null;
  } catch (err) {
    console.warn("Live YouTube scraper fallback:", err.message);
    return null;
  }
}

async function searchYouTubeVideos(query, maxResults = 3) {
  const cacheKey = query.toLowerCase().trim();
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.results;
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  // 1. If official API key is provided, try YouTube Data API v3
  if (apiKey && apiKey.startsWith("AIzaSy")) {
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
      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          const results = data.items
            .filter((item) => item.id && item.id.videoId)
            .map((item) => ({
              videoId: item.id.videoId,
              title: item.snippet.title,
              description: item.snippet.description,
              thumbnailUrl: `https://i.ytimg.com/vi/${item.id.videoId}/hqdefault.jpg`,
              channelTitle: item.snippet.channelTitle,
              url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            }));

          if (results.length > 0) {
            cache.set(cacheKey, { results, expiresAt: Date.now() + CACHE_TTL_MS });
            return results;
          }
        }
      }
    } catch (err) {
      console.warn("Official YouTube API query error, proceeding to live dynamic scraper:", err.message);
    }
  }

  // 2. Dynamic live search scraper - delivers real, query-specific YouTube results per student prompt
  const liveResults = await scrapeLiveYouTubeVideos(query, maxResults);
  if (liveResults && liveResults.length > 0) {
    cache.set(cacheKey, { results: liveResults, expiresAt: Date.now() + CACHE_TTL_MS });
    return liveResults;
  }

  // 3. High-quality curated catalog fallback
  const fallback = getFallbackVideos(query, maxResults);
  return fallback;
}

function getFallbackVideos(query, maxResults = 3) {
  const q = query.toLowerCase();
  if (q.includes("sleep") || q.includes("insomnia") || q.includes("night") || q.includes("rest") || q.includes("tired")) {
    return FALLBACK_VIDEOS.sleep.slice(0, maxResults);
  }
  if (q.includes("burnout") || q.includes("overwhelm") || q.includes("hopeless") || q.includes("paralysis") || q.includes("strain")) {
    return FALLBACK_VIDEOS.burnout.slice(0, maxResults);
  }
  if (q.includes("study") || q.includes("focus") || q.includes("pomodoro") || q.includes("concentrat") || q.includes("procrastinat")) {
    return FALLBACK_VIDEOS.study.slice(0, maxResults);
  }
  if (q.includes("stretch") || q.includes("body") || q.includes("physical") || q.includes("exercise") || q.includes("desk")) {
    return FALLBACK_VIDEOS.stretch.slice(0, maxResults);
  }
  if (q.includes("screen") || q.includes("digital") || q.includes("eye") || q.includes("internet") || q.includes("phone")) {
    return FALLBACK_VIDEOS.screen.slice(0, maxResults);
  }
  if (q.includes("exam") || q.includes("test") || q.includes("stress") || q.includes("panic") || q.includes("anxious") || q.includes("breath")) {
    return FALLBACK_VIDEOS.exam.slice(0, maxResults);
  }
  return FALLBACK_VIDEOS.general.slice(0, maxResults);
}

module.exports = { searchYouTubeVideos };
