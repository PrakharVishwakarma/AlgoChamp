// /apps/web/lib/route-config.ts

/**
 * Route Configuration for AlgoChamp
 * 
 * This file defines all route categories and their access rules.
 * It's the single source of truth for route protection logic.
 */

// ===== ROUTE DEFINITIONS =====

/**
 * Public routes - Only accessible when NOT authenticated
 * Authenticated users will be redirected to dashboard
 */
export const PUBLIC_ONLY_ROUTES = [
    '/register',                  // User registration
    '/login',                     // User login (if we add a custom login page)
    '/forgot-password',           // Password recovery
    '/reset-password',            // Password reset
    '/verify-email',              // Email verification
] as const;

/**
 * Protected routes - Only accessible when authenticated
 * Unauthenticated users will be redirected to sign in
 */
export const PROTECTED_ROUTES = [
    '/dashboard',                 // User dashboard
    '/problems',                  // Problem listing
    '/contests',                  // Contest listing
    '/leaderboard',               // Global rankings
    '/profile',                   // User profile
    '/settings',                  // Account settings
    '/submissions',               // User submissions history
    '/submissions/[id]',          // Individual submission view
    '/contests/[id]',             // Individual contest view
    '/problems/[id]',             // Individual problem view
] as const;

/**
 * Admin routes - Only accessible by admin users
 * Regular users will be redirected to dashboard
 */
export const ADMIN_ROUTES = [
    '/admin',                     // Admin dashboard
    '/admin/users',               // User management
    '/admin/problems',            // Problem management
    '/admin/problems/[id]',        // Individual problem management
    '/admin/contests',            // Contest management
    '/admin/contests/[id]',         // Individual contest management
    '/admin/analytics',           // Platform analytics
] as const;

/**
 * API routes that require authentication
 */
export const PROTECTED_API_ROUTES = [
    '/api/problems',              // Problem CRUD operations
    '/api/submissions',           // Submission operations
    '/api/contests',              // Contest operations
    '/api/user',                  // User profile operations
    '/api/admin',                 // Admin operations
] as const;

/**
 * Public API routes - No authentication required
 */
export const PUBLIC_API_ROUTES = [
    '/api/auth',                  // NextAuth routes
    '/api/register',              // User registration
    '/api/health',                // Health check (if implemented)
    '/api/public',                // Public data endpoints
] as const;

/**
 * Mixed routes - Accessible to all users (authenticated or not)
 * Content may vary based on authentication status
 */
export const MIXED_ROUTES = [
    '/',                          // Landing page
    '/about',                     // About page
    '/contact',                   // Contact page
    '/terms',                     // Terms of service
    '/privacy',                   // Privacy policy
    '/help',                      // Help documentation
    '/faq',                       // Frequently asked questions
] as const;

// ===== ROUTE MATCHING UTILITIES =====

/**
 * Check if a path matches any pattern in the given array
 * Supports dynamic routes like /problems/[id]
 */
export function matchesRoute(path: string, routes: readonly string[]): boolean {
    return routes.some(route => {
        // Exact match
        if (route === path) return true;

        // Dynamic route matching (e.g., /problems/[id])
        if (route.includes('[') && route.includes(']')) {
            const pattern = route.replace(/\[.*?\]/g, '[^/]+');
            const regex = new RegExp(`^${pattern}$`);
            return regex.test(path);
        }

        // Wildcard matching for nested routes (e.g., /admin/*)
        if (route.endsWith('/*')) {
            const baseRoute = route.slice(0, -2);
            return path.startsWith(baseRoute);
        }

        return false;
    });
}

/**
 * Check if a path is a public-only route
 */
export function isPublicOnlyRoute(path: string): boolean {
    return matchesRoute(path, PUBLIC_ONLY_ROUTES);
}

/**
 * Check if a path is a protected route
 */
export function isProtectedRoute(path: string): boolean {
    return matchesRoute(path, PROTECTED_ROUTES);
}

/**
 * Check if a path is an admin route
 */
export function isAdminRoute(path: string): boolean {
    return matchesRoute(path, ADMIN_ROUTES);
}

/**
 * Check if a path is a protected API route
 */
export function isProtectedApiRoute(path: string): boolean {
    return matchesRoute(path, PROTECTED_API_ROUTES);
}

/**
 * Check if a path is a public API route
 */
export function isPublicApiRoute(path: string): boolean {
    return matchesRoute(path, PUBLIC_API_ROUTES);
}

/**
 * Check if a path is a mixed route (accessible to all)
 */
export function isMixedRoute(path: string): boolean {
    return matchesRoute(path, MIXED_ROUTES);
}

// ===== REDIRECT DESTINATIONS =====

/**
 * Default redirect destinations for different scenarios
 */
export const REDIRECT_DESTINATIONS = {
    // Where to redirect authenticated users trying to access public-only routes
    AUTHENTICATED_FALLBACK: '/dashboard',

    // Where to redirect unauthenticated users trying to access protected routes
    UNAUTHENTICATED_FALLBACK: '/api/auth/signin',

    // Where to redirect non-admin users trying to access admin routes
    NON_ADMIN_FALLBACK: '/dashboard',

    // Where to redirect after successful authentication
    POST_LOGIN_FALLBACK: '/dashboard',

    // Where to redirect after logout
    POST_LOGOUT_FALLBACK: '/',
} as const;

// ===== ROUTE CATEGORIES FOR EASIER MANAGEMENT =====

/**
 * All route categories for comprehensive checking
 */
export const ROUTE_CATEGORIES = {
    publicOnly: PUBLIC_ONLY_ROUTES,
    protected: PROTECTED_ROUTES,
    admin: ADMIN_ROUTES,
    protectedApi: PROTECTED_API_ROUTES,
    publicApi: PUBLIC_API_ROUTES,
    mixed: MIXED_ROUTES,
} as const;

/**
 * Type definitions for route categories
 */
export type PublicOnlyRoute = typeof PUBLIC_ONLY_ROUTES[number];
export type ProtectedRoute = typeof PROTECTED_ROUTES[number];
export type AdminRoute = typeof ADMIN_ROUTES[number];
export type ProtectedApiRoute = typeof PROTECTED_API_ROUTES[number];
export type PublicApiRoute = typeof PUBLIC_API_ROUTES[number];
export type MixedRoute = typeof MIXED_ROUTES[number];