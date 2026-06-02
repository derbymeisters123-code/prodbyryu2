import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

// A real server-side fetch proxy. This bypasses browser CORS restrictions by
// fetching the target page on the server and returning the (rewritten) HTML so
// it can be rendered without a "plain" cross-origin iframe.
export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get("url")

  if (!target) {
    return Response.json({ ok: false, error: "Missing url parameter." }, { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(target)
  } catch {
    return Response.json({ ok: false, error: "Invalid URL." }, { status: 400 })
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return Response.json({ ok: false, error: "Only http and https are supported." }, { status: 400 })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 12_000)

    const upstream = await fetch(parsed.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        // Present as a normal browser so we get the desktop page.
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    }).finally(() => clearTimeout(timeout))

    const contentType = upstream.headers.get("content-type") || ""
    const finalUrl = upstream.url || parsed.toString()

    if (!contentType.includes("text/html")) {
      return Response.json({
        ok: false,
        blocked: false,
        reason: "non-html",
        contentType,
        finalUrl,
        status: upstream.status,
      })
    }

    let html = await upstream.text()
    html = rewriteHtml(html, finalUrl)

    return Response.json({
      ok: true,
      html,
      finalUrl,
      title: extractTitle(html),
      status: upstream.status,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    const aborted = message.toLowerCase().includes("abort")
    return Response.json({
      ok: false,
      blocked: true,
      reason: aborted ? "timeout" : "fetch-failed",
      message,
    })
  }
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  return match ? match[1].trim().replace(/\s+/g, " ") : ""
}

function rewriteHtml(html: string, baseUrl: string): string {
  // Strip frame-busting / CSP meta tags that would block rendering inside srcdoc.
  let out = html.replace(
    /<meta[^>]+http-equiv=["']?(content-security-policy|x-frame-options|refresh)["']?[^>]*>/gi,
    "",
  )

  // Remove existing <base> tags then inject our own so relative assets resolve.
  out = out.replace(/<base[^>]*>/gi, "")

  const injection = `
<base href="${escapeAttr(baseUrl)}">
<style>
  ::-webkit-scrollbar{width:10px;height:10px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:#3f3f46;border-radius:8px}
</style>
<script>
(function(){
  // Intercept navigation so it flows back through the parent browser shell.
  document.addEventListener('click', function(e){
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if(!a) return;
    var href = a.getAttribute('href');
    if(!href || href.startsWith('javascript:') || href.startsWith('#') || href.startsWith('mailto:')) return;
    try {
      var abs = new URL(href, document.baseURI).href;
      e.preventDefault();
      parent.postMessage({ type: 'ryu-navigate', url: abs }, '*');
    } catch(_){}
  }, true);
  // Block in-page form submissions from breaking out of the sandbox.
  document.addEventListener('submit', function(e){ e.preventDefault(); }, true);
})();
</script>`

  if (/<head[^>]*>/i.test(out)) {
    out = out.replace(/<head[^>]*>/i, (m) => m + injection)
  } else {
    out = injection + out
  }

  return out
}

function escapeAttr(value: string): string {
  return value.replace(/"/g, "&quot;")
}
