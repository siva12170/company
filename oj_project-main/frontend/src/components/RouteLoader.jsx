import React from 'react';

const RouteLoader = ({ message = "Loading..." }) => {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
            {/* Background Effects - matching website theme */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"></div>
            <div className="absolute inset-0 backdrop-blur-sm"></div>
            
            {/* Decorative grid pattern */}
            <div className="absolute inset-0 bg-white bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            
            {/* Floating elements for visual appeal */}
            <div className="absolute left-1/4 top-1/4 w-[200px] h-[200px] rounded-full bg-black opacity-5 blur-[80px] animate-pulse"></div>
            <div className="absolute right-1/4 bottom-1/4 w-[150px] h-[150px] rounded-full bg-gray-400 opacity-10 blur-[60px] animate-pulse"></div>
            
            {/* Main loading content */}
            <div className="relative z-10 text-center animate-fade-in">
                {/* Animated spinner */}
                <div className="relative mb-8">
                    {/* Outer ring */}
                    <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin mx-auto">
                        <div className="w-full h-full border-4 border-transparent border-t-black rounded-full"></div>
                    </div>
                    
                    {/* Inner dot */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-3 h-3 bg-black rounded-full animate-pulse"></div>
                    </div>
                </div>
                
                {/* Loading text */}
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-black animate-pulse">
                        {message}
                    </h2>
                    <div className="flex items-center justify-center space-x-1">
                        <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                </div>
                
                {/* Brand identifier */}
                <div className="mt-8 animate-fade-in-delayed">
                    <p className="text-gray-600 text-sm font-medium">
                        <span className="border-b-2 border-black">CodeJudge</span>
                    </p>
                </div>
            </div>
            
            {/* Custom CSS for smooth animations */}
            <style jsx="true">{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes fade-in-delayed {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }
                
                .animate-fade-in-delayed {
                    animation: fade-in-delayed 0.8s ease-out 0.3s both;
                }
            `}</style>
        </div>
    );
};

export default RouteLoader;
