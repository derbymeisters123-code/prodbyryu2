import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const encryptedQuery = searchParams.get('q');

  // 1. Verify the Secret Key header to protect your endpoint
  const authHeader = request.headers.get('x-proxy-secret');
  const serverSecret = process.env.PROXY_SECRET_KEY;

  if (!authHeader || authHeader !== serverSecret) {
    return new NextResponse('Unauthorized access to proxy', { status: 401 });
  }

  if (!encryptedQuery) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    // 2. Decode the Base64 search query back to plain text
    const decodedQuery = Buffer.from(encryptedQuery, 'base64').toString('utf-8');

    // 3. Forward the request securely to DuckDuckGo
    const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(decodedQuery)}`;
    
    const response = await fetch(ddgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from DuckDuckGo' }, { status: response.status });
    }

    const html = await response.text();
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}