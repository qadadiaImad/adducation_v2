import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const apiBaseUrl = process.env.API_BASE_URL || 'http://m4o0sko4wscoc4g8kw880sok.37.27.220.218.sslip.io';
  const url = `${apiBaseUrl}/${path}`;
  
  console.log(`Proxying GET request to: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        ...Object.fromEntries(request.headers),
        // Remove host header to avoid conflicts
        'host': new URL(apiBaseUrl).host,
      },
    });
    
    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from API' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const apiBaseUrl = process.env.API_BASE_URL || 'http://m4o0sko4wscoc4g8kw880sok.37.27.220.218.sslip.io';
  const url = `${apiBaseUrl}/${path}`;
  
  console.log(`Proxying POST request to: ${url}`);
  
  try {
    const body = await request.json();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(request.headers),
        // Remove host header to avoid conflicts
        'host': new URL(apiBaseUrl).host,
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(data);
    } catch {
      responseData = data;
    }
    
    return NextResponse.json(responseData, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from API' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}

// Add other methods as needed (PUT, DELETE, etc.)

// Add other methods as needed (PUT, DELETE, etc.)
