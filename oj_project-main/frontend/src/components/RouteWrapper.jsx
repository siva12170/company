import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import RouteLoader from '../components/RouteLoader';

const RouteWrapper = ({ children, title, requireAuth = false }) => {
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        // Show loading for route transitions
        setIsLoading(true);
        
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500); // Minimum loading time for smooth transition

        return () => clearTimeout(timer);
    }, [location.pathname]);

    if (isLoading) {
        return <RouteLoader message={`Loading ${title}...`} />;
    }

    return children;
};

export default RouteWrapper;
