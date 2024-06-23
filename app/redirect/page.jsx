'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const VerifyAuth = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const response = await fetch(`/api/auth/verify?${searchParams.toString()}`, {
                    method: 'GET',
                    credentials: 'include', // Ensure cookies are included
                });

                if (response.ok) {
                    // Redirect to the desired page after successful verification
                    router.push('/matchmaking/findmatch');
                } else {
                    // Handle error (e.g., display an error message or redirect to an error page)
                    console.error('Verification failed');
                }
            } catch (error) {
                console.error('Error during verification:', error);
            }
        };

        verifyAuth();
    }, [router, searchParams]);

    return (
        <div>
            <p>Verifying authentication, please wait...</p>
        </div>
    );
};

const RedirectPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyAuth />
        </Suspense>
    );
};

export default RedirectPage;
