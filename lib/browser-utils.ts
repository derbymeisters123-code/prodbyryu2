export type ViewKind = "home" | "search" | "page"

export type HistoryEntry = {
  id: string
  kind: ViewKind
  // for search
  query?: string
  // for page
  url?: string
  // display label for the address bar
  address: string
  title: string
}

export type SearchResult = {
  title: string
  url: string
  displayUrl: string
  snippet: string
}

const SEARCH_LIKE_TLDS = [
  ".com",
  ".org",
  ".net",
  ".io",
  ".dev",
  ".app",
  ".co",
  ".ai",
  ".gov",
  ".edu",
  ".xyz",
  ".me",
  ".tv",
  ".news",
]

/** Decide whether the address-bar text is a URL or a search query. */
export function parseInput(raw: string): { kind: "url" | "search"; value: string } {
  const text = raw.trim()
  if (!text) return { kind: "search", value: "" }

  if (/^https?:\/\//i.test(text)) {
    return { kind: "url", value: text }
  }

  const hasSpace = /\s/.test(text)
  const looksLikeDomain =
    !hasSpace &&
    (text.startsWith("www.") || SEARCH_LIKE_TLDS.some((tld) => text.toLowerCase().includes(tld + "/") || text.toLowerCase().endsWith(tld)))

  if (looksLikeDomain) {
    return { kind: "url", value: `https://${text.replace(/^www\./i, "www.")}` }
  }

  return { kind: "search", value: text }
}

export function hostFromUrl(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

export function makeId(): string {
  return Math.random().toString(36).slice(2, 10)
}

/** Curated, deterministic "private search" results. No real network call. */
export function generateResults(query: string): SearchResult[] {
  const q = query.trim()
  const slug = encodeURIComponent(q.toLowerCase().replace(/\s+/g, "-"))
  const enc = encodeURIComponent(q)

  const templates: Array<Omit<SearchResult, "snippet"> & { snippet: string }> = [
    {
      title: `${q} — Wikipedia, the free encyclopedia`,
      url: `https://en.wikipedia.org/wiki/${slug}`,
      displayUrl: "en.wikipedia.org › wiki",
      snippet: `${q} is a topic with a rich history and ongoing relevance. This article covers its origins, key concepts, notable figures, and modern interpretations across multiple disciplines.`,
    },
    {
      title: `${q}: A Complete 2026 Guide`,
      url: `https://guides.example.com/${slug}`,
      displayUrl: "guides.example.com",
      snippet: `Everything you need to know about ${q}, broken down into beginner, intermediate, and advanced sections with practical examples and curated references.`,
    },
    {
      title: `Latest news about ${q}`,
      url: `https://news.example.org/search?q=${enc}`,
      displayUrl: "news.example.org",
      snippet: `Stay up to date with the most recent coverage of ${q}. Aggregated headlines, analysis, and primary sources updated throughout the day.`,
    },
    {
      title: `${q} discussion — community forum`,
      url: `https://forum.example.net/t/${slug}`,
      displayUrl: "forum.example.net › topics",
      snippet: `Join thousands of people discussing ${q}. Read top-rated threads, ask questions, and find answers from experienced community members.`,
    },
    {
      title: `Official ${q} documentation`,
      url: `https://docs.example.dev/${slug}`,
      displayUrl: "docs.example.dev",
      snippet: `Reference material, getting-started tutorials, and API details related to ${q}. Includes searchable guides and versioned release notes.`,
    },
    {
      title: `${q} — images & media`,
      url: `https://media.example.io/explore/${slug}`,
      displayUrl: "media.example.io › explore",
      snippet: `Browse a privacy-respecting gallery of media related to ${q}, with no third-party tracking pixels and zero personalized ad profiling.`,
    },
  ]

  return templates
}

export const QUICK_LINKS = [
  { label: "Wikipedia", url: "https://en.wikipedia.org", host: "en.wikipedia.org" },
  { label: "Hacker News", url: "https://news.ycombinator.com", host: "news.ycombinator.com" },
  { label: "MDN Web Docs", url: "https://developer.mozilla.org", host: "developer.mozilla.org" },
  { label: "Example.com", url: "https://example.com", host: "example.com" },
]
