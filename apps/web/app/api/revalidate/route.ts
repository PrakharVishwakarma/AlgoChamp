// apps/web/app/api/revalidate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * On-Demand Revalidation API Route
 * 
 * This endpoint allows admins to immediately invalidate the cache for specific
 * problems when they make updates, without waiting for the revalidation timer.
 * 
 * Usage:
 * POST /api/revalidate
 * Headers: { "x-revalidate-secret": "your-secret-key" }
 * Body: { "slug": "two-sum" } or { "path": "/problems/two-sum" }
 * 
 * Security: Requires a secret token to prevent unauthorized cache invalidation
 */

export async function POST(request: NextRequest) {
    try {
        // ✅ SECURITY: Verify the revalidation secret
        const secret = request.headers.get('x-revalidate-secret');
        const expectedSecret = process.env.REVALIDATE_SECRET || 'your-secret-key-change-in-production';

        if (secret !== expectedSecret) {
            console.warn('⚠️ Unauthorized revalidation attempt');
            return NextResponse.json(
                { error: 'Unauthorized', message: 'Invalid revalidation secret' },
                { status: 401 }
            );
        }

        // ✅ Parse request body
        const body = await request.json();
        const { slug, path, type } = body;

        // ✅ Validate input
        if (!slug && !path) {
            return NextResponse.json(
                { error: 'Bad Request', message: 'Either "slug" or "path" is required' },
                { status: 400 }
            );
        }

        const revalidatedPaths: string[] = [];

        // ✅ Revalidate specific problem by slug
        if (slug) {
            const problemPath = `/problems/${slug}`;
            revalidatePath(problemPath);
            revalidatedPaths.push(problemPath);
            console.log(`✅ Revalidated problem: ${problemPath}`);
        }

        // ✅ Revalidate custom path
        if (path) {
            revalidatePath(path);
            revalidatedPaths.push(path);
            console.log(`✅ Revalidated path: ${path}`);
        }

        // ✅ Revalidate problems list if type is 'list'
        if (type === 'list') {
            revalidatePath('/problems');
            revalidatedPaths.push('/problems');
            console.log(`✅ Revalidated problems list`);
        }

        return NextResponse.json({
            success: true,
            revalidated: true,
            paths: revalidatedPaths,
            timestamp: new Date().toISOString(),
            message: `Successfully revalidated ${revalidatedPaths.length} path(s)`,
        });
    } catch (error) {
        console.error('❌ Revalidation error:', error);
        return NextResponse.json(
            { 
                success: false,
                error: 'Internal Server Error', 
                message: 'Failed to revalidate',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// ✅ Handle GET requests with usage instructions
export async function GET() {
    return NextResponse.json({
        message: 'On-Demand Revalidation API',
        usage: {
            method: 'POST',
            endpoint: '/api/revalidate',
            headers: {
                'Content-Type': 'application/json',
                'x-revalidate-secret': 'your-secret-key'
            },
            body: {
                slug: 'problem-slug (optional)',
                path: '/custom/path (optional)',
                type: 'list (optional, revalidates /problems)'
            }
        },
        examples: [
            {
                description: 'Revalidate a specific problem',
                body: { slug: 'two-sum' }
            },
            {
                description: 'Revalidate problems list',
                body: { type: 'list' }
            },
            {
                description: 'Revalidate multiple paths',
                body: { slug: 'two-sum', type: 'list' }
            }
        ]
    });
}
