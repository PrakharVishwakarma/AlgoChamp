// /apps/web/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
    isPublicOnlyRoute,
    isProtectedRoute,
    isAdminRoute,
    isProtectedApiRoute,
    isPublicApiRoute,
    isMixedRoute,
    REDIRECT_DESTINATIONS,
} from "./lib/route-config";
import {
    getAuthStatus,
    isAdmin,
    createSignInUrl,
    logAuthEvent,
    logSecurityViolation,
    checkRateLimit,
    getUserIP,
    isSameOrigin,
} from "./lib/auth-helpers";

/**
 * AlgoChamp Middleware - Route Protection System
 * 
 * This middleware handles:
 * 1. Route protection based on authentication status
 * 2. Role-based access control (admin routes)
 * 3. API route protection
 * 4. Rate limiting for sensitive endpoints
 * 5. Security logging and monitoring
 * 6. CSRF protection for state-changing operations
 */

// ===== CONFIGURATION =====

const RATE_LIMIT_CONFIG = {
    auth: { maxRequests: 5, windowMs: 60000 },    // 5 requests per minute for auth
    api: { maxRequests: 100, windowMs: 60000 },   // 100 requests per minute for API
    general: { maxRequests: 200, windowMs: 60000 }, // 200 requests per minute general
};

// ===== MAIN MIDDLEWARE FUNCTION =====

export async function middleware(request: NextRequest) {
    const { pathname, origin } = request.nextUrl;
    const userIP = getUserIP(request);

    // Skip middleware for static files and Next.js internals
    if (shouldSkipMiddleware(pathname)) {
        return NextResponse.next();
    }

    console.log(`[MIDDLEWARE] Processing: ${pathname}`);

    try {
        // ===== RATE LIMITING =====
        if (!applyRateLimit(request, userIP)) {
            logSecurityViolation('rate_limit_exceeded', request, {
                path: pathname,
                ip: userIP
            });
            return new NextResponse('Too Many Requests', { status: 429 });
        }

        // ===== AUTHENTICATION STATUS CHECK =====
        const { isAuthenticated: userIsAuth, user } = await getAuthStatus(request);

        console.log(`[MIDDLEWARE] Auth status: ${userIsAuth ? 'authenticated' : 'unauthenticated'}`,
            user ? `User: ${user.email}` : '');

        // ===== CSRF PROTECTION =====
        if (shouldCheckCSRF(request) && !isSameOrigin(request)) {
            logSecurityViolation('csrf_violation', request, {
                path: pathname,
                origin: request.headers.get('origin') || 'unknown'
            });
            return new NextResponse('Forbidden', { status: 403 });
        }

        // ===== ROUTE PROTECTION LOGIC =====

        // 1. PUBLIC-ONLY ROUTES (redirect authenticated users)
        if (isPublicOnlyRoute(pathname)) {
            if (userIsAuth) {
                logAuthEvent('route_protection', request, {
                    action: 'redirect_authenticated_from_public',
                    from: pathname,
                    to: REDIRECT_DESTINATIONS.AUTHENTICATED_FALLBACK
                });

                return NextResponse.redirect(
                    new URL(REDIRECT_DESTINATIONS.AUTHENTICATED_FALLBACK, origin)
                );
            }
            return NextResponse.next();
        }

        // 2. PROTECTED ROUTES (require authentication)
        if (isProtectedRoute(pathname)) {
            if (!userIsAuth) {
                logAuthEvent('access_denied', request, {
                    reason: 'unauthenticated',
                    attempted_path: pathname
                });

                const signInUrl = createSignInUrl(pathname);
                return NextResponse.redirect(new URL(signInUrl, origin));
            }
            return NextResponse.next();
        }

        // 3. ADMIN ROUTES (require admin privileges)
        if (isAdminRoute(pathname)) {
            if (!userIsAuth) {
                logAuthEvent('access_denied', request, {
                    reason: 'unauthenticated_admin',
                    attempted_path: pathname
                });

                const signInUrl = createSignInUrl(pathname);
                return NextResponse.redirect(new URL(signInUrl, origin));
            }

            const userIsAdmin = await isAdmin(request);
            if (!userIsAdmin) {
                logAuthEvent('access_denied', request, {
                    reason: 'insufficient_privileges',
                    attempted_path: pathname,
                    user_id: user?.id || 'unknown'
                });

                return NextResponse.redirect(
                    new URL(REDIRECT_DESTINATIONS.NON_ADMIN_FALLBACK, origin)
                );
            }
            return NextResponse.next();
        }

        // 4. PROTECTED API ROUTES
        if (isProtectedApiRoute(pathname)) {
            if (!userIsAuth) {
                logAuthEvent('access_denied', request, {
                    reason: 'unauthenticated_api',
                    attempted_path: pathname
                });

                return new NextResponse(
                    JSON.stringify({ error: 'Authentication required' }),
                    { status: 401, headers: { 'Content-Type': 'application/json' } }
                );
            }
            return NextResponse.next();
        }

        // 5. PUBLIC API ROUTES (no protection needed)
        if (isPublicApiRoute(pathname)) {
            return NextResponse.next();
        }

        // 6. MIXED ROUTES (accessible to all)
        if (isMixedRoute(pathname)) {
            return NextResponse.next();
        }

        // 7. DEFAULT BEHAVIOR (allow access but log unknown routes)
        console.log(`[MIDDLEWARE] Unknown route pattern: ${pathname}`);
        return NextResponse.next();

    } catch (error) {
        console.error('[MIDDLEWARE] Error:', error);
        logSecurityViolation('middleware_error', request, {
            error: String(error),
            path: pathname
        });

        // Fail safe - allow access but log the error
        return NextResponse.next();
    }
}

// ===== HELPER FUNCTIONS =====

/**
 * Check if middleware should be skipped for this path
 */
function shouldSkipMiddleware(pathname: string): boolean {
    return (
        pathname.startsWith('/_next/') ||      // Next.js internals
        pathname.startsWith('/api/auth/') ||   // NextAuth.js routes (handle their own protection)
        pathname.startsWith('/__nextjs_original-stack-frame') || // Dev mode
        pathname.includes('.') ||              // Static files (images, css, js, etc.)
        pathname === '/favicon.ico' ||         // Favicon
        pathname === '/robots.txt' ||          // Robots
        pathname === '/sitemap.xml'            // Sitemap
    );
}

/**
 * Apply rate limiting based on route type
 */
function applyRateLimit(request: NextRequest, userIP: string): boolean {
    const { pathname } = request.nextUrl;

    // Different limits for different route types
    if (pathname.startsWith('/api/auth/')) {
        return checkRateLimit(
            `auth:${userIP}`,
            RATE_LIMIT_CONFIG.auth.maxRequests,
            RATE_LIMIT_CONFIG.auth.windowMs
        );
    }

    if (pathname.startsWith('/api/')) {
        return checkRateLimit(
            `api:${userIP}`,
            RATE_LIMIT_CONFIG.api.maxRequests,
            RATE_LIMIT_CONFIG.api.windowMs
        );
    }

    return checkRateLimit(
        `general:${userIP}`,
        RATE_LIMIT_CONFIG.general.maxRequests,
        RATE_LIMIT_CONFIG.general.windowMs
    );
}

/**
 * Check if CSRF protection should be applied
 */
function shouldCheckCSRF(request: NextRequest): boolean {
    const method = request.method;
    const pathname = request.nextUrl.pathname;

    // Only check CSRF for state-changing operations
    if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        return false;
    }

    // Skip CSRF for NextAuth routes (they handle their own CSRF)
    if (pathname.startsWith('/api/auth/')) {
        return false;
    }

    return true;
}

// ===== MIDDLEWARE CONFIGURATION =====

/**
 * Configure which paths the middleware should run on
 * Using a matcher for better performance
 */
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
    ],
};

// Export types for use in other parts of the application
export type { AuthUser, AuthSession } from './lib/auth-helpers';