// /apps/web/lib/auth-helpers.ts

import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";

/**
 * Authentication Helper Utilities for Middleware
 * 
 * This file provides utilities for checking authentication status
 * and user permissions in middleware context.
 */

// ===== TYPES =====

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role?: string;
  isAdmin?: boolean;
}

export interface AuthSession {
  user: AuthUser;
  token: JWT;
  expires: string;
}

// ===== AUTHENTICATION CHECKERS =====

/**
 * Get the current user's authentication status from the request
 * Works in middleware context using JWT tokens
 */
export async function getAuthStatus(request: NextRequest): Promise<{
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: JWT | null;
}> {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_JWT_SECRET,
    });

    if (!token || !token.sub) {
      return {
        isAuthenticated: false,
        user: null,
        token: null,
      };
    }

    // Extract user information from token
    const user: AuthUser = {
      id: token.sub,
      email: token.email || '',
      name: token.name || null,
      role: token.role as string || 'USER',
      isAdmin: token.role === 'ADMIN' || false,
    };

    return {
      isAuthenticated: true,
      user,
      token,
    };
  } catch (error) {
    console.error('Auth status check failed:', error);
    return {
      isAuthenticated: false,
      user: null,
      token: null,
    };
  }
}

/**
 * Quick check if user is authenticated
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const { isAuthenticated } = await getAuthStatus(request);
  return isAuthenticated;
}

/**
 * Check if user has admin privileges
 */
export async function isAdmin(request: NextRequest): Promise<boolean> {
  const { user } = await getAuthStatus(request);
  return user?.isAdmin || false;
}

/**
 * Check if user has specific role
 */
export async function hasRole(request: NextRequest, role: string): Promise<boolean> {
  const { user } = await getAuthStatus(request);
  return user?.role === role;
}

// ===== SESSION VALIDATION =====

/**
 * Validate if the session is still valid and not expired
 */
export function isSessionValid(token: JWT | null): boolean {
  if (!token) return false;
  
  // Check if token has required fields
  if (!token.sub || !token.email) return false;
  
  // Check if token is expired
  if (token.exp && typeof token.exp === 'number' && Date.now() >= token.exp * 1000) {
    return false;
  }
  
  return true;
}

/**
 * Check if session needs refresh (expires in less than 1 hour)
 */
export function needsSessionRefresh(token: JWT | null): boolean {
  if (!token || !token.exp || typeof token.exp !== 'number') return false;
  
  const oneHourInSeconds = 60 * 60;
  const expiresInSeconds = token.exp - Math.floor(Date.now() / 1000);
  
  return expiresInSeconds < oneHourInSeconds;
}

// ===== URL HELPERS =====

/**
 * Create signin URL with callback
 */
export function createSignInUrl(callbackUrl?: string): string {
  const baseUrl = '/api/auth/signin';
  if (!callbackUrl) return baseUrl;
  
  const params = new URLSearchParams({
    callbackUrl: callbackUrl,
  });
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Create redirect URL with proper encoding
 */
export function createRedirectUrl(destination: string, origin?: string): string {
  // If destination is already a full URL, return as is
  if (destination.startsWith('http')) {
    return destination;
  }
  
  // If destination starts with /, it's relative to the root
  if (destination.startsWith('/')) {
    return origin ? `${origin}${destination}` : destination;
  }
  
  // Otherwise, prepend with /
  return `/${destination}`;
}

/**
 * Extract callback URL from signin URL
 */
export function extractCallbackUrl(url: string): string | null {
  try {
    const urlObj = new URL(url, 'http://localhost');
    return urlObj.searchParams.get('callbackUrl');
  } catch {
    return null;
  }
}

// ===== SECURITY HELPERS =====

/**
 * Check if request is from same origin (CSRF protection)
 */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  
  if (!origin || !host) return false;
  
  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}

/**
 * Get user's IP address for security logging
 */
export function getUserIP(request: NextRequest): string {
  // Check various headers for IP address
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const connectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }
  
  if (realIp) {
    return realIp;
  }
  
  if (connectingIp) {
    return connectingIp;
  }
  
  return 'unknown';
}

/**
 * Rate limiting helper with memory cleanup for production
 */
const rateLimitMap = new Map<string, { count: number; lastRequest: number; windowStart: number }>();

// Cleanup old entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;
  
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.lastRequest < fiveMinutesAgo) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);
  
  if (!userLimit) {
    rateLimitMap.set(identifier, { count: 1, lastRequest: now, windowStart: now });
    return true;
  }
  
  // Reset if window has passed
  if (now - userLimit.windowStart > windowMs) {
    rateLimitMap.set(identifier, { count: 1, lastRequest: now, windowStart: now });
    return true;
  }
  
  // Check if limit exceeded
  if (userLimit.count >= maxRequests) {
    return false;
  }
  
  // Increment counter
  userLimit.count++;
  userLimit.lastRequest = now;
  return true;
}

// ===== LOGGING HELPERS =====

/**
 * Log authentication events for security monitoring
 */
export function logAuthEvent(
  event: 'signin' | 'signout' | 'access_denied' | 'route_protection',
  request: NextRequest,
  details?: Record<string, string | number | boolean>
): void {
  const logData = {
    event,
    timestamp: new Date().toISOString(),
    ip: getUserIP(request),
    userAgent: request.headers.get('user-agent'),
    url: request.url,
    ...details,
  };
  
  // In production, you'd send this to your logging service
  console.log('[AUTH EVENT]', JSON.stringify(logData));
}

/**
 * Log security violations
 */
export function logSecurityViolation(
  violation: string,
  request: NextRequest,
  details?: Record<string, string | number | boolean>
): void {
  const logData = {
    violation,
    timestamp: new Date().toISOString(),
    ip: getUserIP(request),
    userAgent: request.headers.get('user-agent'),
    url: request.url,
    ...details,
  };
  
  // In production, you'd send this to your security monitoring system
  console.warn('[SECURITY VIOLATION]', JSON.stringify(logData));
}