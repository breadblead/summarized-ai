import { NextResponse, NextRequest } from "next/server";

const protectedRoutes = ["/dashboard"];

function isProtectedRoute(path: string): boolean {
  return protectedRoutes.some((route) => path.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const jwt = request.cookies.get("jwt")?.value;
  const currentPath = request.nextUrl.pathname;

  if (isProtectedRoute(currentPath) && !jwt) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}
