import { useState, useEffect } from 'react';

export const usePageLoading = (initialDelay = 300) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, initialDelay);

        return () => clearTimeout(timer);
    }, [initialDelay]);

    return { isLoading, setIsLoading };
};

export default usePageLoading;
