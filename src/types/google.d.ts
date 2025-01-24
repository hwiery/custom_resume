interface Window {
    google?: {
        accounts?: {
            oauth2?: {
                revoke: (token: string, callback?: () => void) => void;
            };
            id?: {
                revoke: (callback: () => void, error?: () => void) => void;
            };
        };
    };
} 