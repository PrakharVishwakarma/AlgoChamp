// apps/web/app/contests/[contestId]/_components/RegisterOnMount.tsx

'use client';

import { useEffect, useRef } from 'react';
import { registerForContest } from '../../action';


interface RegisterOnMountProps {
    contestId: string;
}

/**
 * A headless component that triggers the frictionless registration logic
 * once when the user visits the contest page.
 */
export function RegisterOnMount({ contestId }: RegisterOnMountProps) {
    // Use a ref to ensure we strictly only fire this once per mount,
    // even in React 18 Strict Mode which double-invokes effects.
    const hasRegistered = useRef(false);

    useEffect(() => {
        if (!hasRegistered.current) {
            hasRegistered.current = true;
            // Fire and forget - we don't need to wait for the result
            // or show a loading state for this background task.
            registerForContest(contestId).catch((err : unknown) => {
                console.error("Failed to auto-register:", err);
            });
        }
    }, [contestId]);

    // This component renders nothing
    return null;
}