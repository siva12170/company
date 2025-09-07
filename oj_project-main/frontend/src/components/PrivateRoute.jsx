import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RouteWrapper from './RouteWrapper';

const PrivateRoute = ({ element, title }) => {
    const { isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }
    
    return (
        <RouteWrapper title={title} requireAuth={true}>
            {element}
        </RouteWrapper>
    );
};

export default PrivateRoute;
