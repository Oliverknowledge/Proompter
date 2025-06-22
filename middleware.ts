import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if headers are too large (rough estimate)
  const headerSize = JSON.stringify(request.headers).length;
  const maxHeaderSize = 8192; // 8KB limit
  
  if (headerSize > maxHeaderSize) {
    console.warn(`Large headers detected: ${headerSize} bytes`);
    
    // For API routes, try to continue with essential headers only
    if (request.nextUrl.pathname.startsWith('/api/')) {
      const essentialHeaders = new Headers();
      
      // Only keep essential headers
      const essentialHeaderNames = [
        'content-type',
        'authorization',
        'user-agent',
        'host',
        'accept',
        'accept-encoding',
        'accept-language',
        'connection',
        'content-length'
      ];
      
      for (const [name, value] of request.headers.entries()) {
        if (essentialHeaderNames.includes(name.toLowerCase())) {
          essentialHeaders.set(name, value);
        }
      }
      
      // Create a new request with filtered headers
      const newRequest = new NextRequest(request.url, {
        method: request.method,
        headers: essentialHeaders,
        body: request.body,
      });
      
      return NextResponse.next({
        request: newRequest,
      });
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
}; 