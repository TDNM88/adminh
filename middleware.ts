import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// List of allowed origins for CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'https://0034deeb2b4a.ngrok-free.app',
  // Add any other development origins you need
]

export function middleware(request: NextRequest) {
  // Skip middleware for WebSocket upgrade requests
  if (request.headers.get('connection')?.toLowerCase().includes('upgrade') && 
      request.headers.get('upgrade')?.toLowerCase() === 'websocket') {
    return NextResponse.next()
  }
  
  // Get the origin from the request headers
  const origin = request.headers.get('origin')
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  
  // Handle authentication for non-API routes
  if (!isApiRoute) {
    const session = request.cookies.get("admin-session")
    const isLoginPage = request.nextUrl.pathname === "/login"

    if (!session && !isLoginPage) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    if (session && isLoginPage) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }
  
  // For API routes or other routes, apply CORS headers
  const response = NextResponse.next()
  
  // Apply CORS headers if origin is in the allowed list or in development mode
  if (origin && (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development')) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }
  
  // Handle preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: response.headers })
  }
  
  return response
}

export const config = {
  matcher: [
    // Apply to all routes except static files and WebSocket connections
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
