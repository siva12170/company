import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
    const navigate = useNavigate();
    const { user: loggedInUser } = useAuth();

    const getAccountTypeBadge = (accType) => {
        switch (accType) {
            case 'Problemsetter':
                return (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-black text-white border-2 border-gray-300">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Problemsetter
                    </span>
                );
            case 'Admin':
                return (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-black text-white border-2 border-gray-300">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm2.5 1a1.5 1.5 0 000 3h7a1.5 1.5 0 000-3h-7z" clipRule="evenodd" />
                        </svg>
                        Admin
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white text-black border-2 border-black">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        User
                    </span>
                );
        }
    };

  return (
    <div className="bg-white text-black min-h-screen p-6">
        {/* Background blur effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-50 backdrop-blur-sm pointer-events-none"></div>
        
        <div className="relative max-w-6xl mx-auto">
            {/* Welcome Section */}
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold mb-6 text-black">
                    Welcome back, {loggedInUser.fullName || 'User'}!
                </h1>
                <div className="flex justify-center mb-6">
                    {getAccountTypeBadge(loggedInUser.accType)}
                </div>
                <p className="text-gray-600 text-xl">
                    Ready to continue your coding journey?
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {/* Problems */}
                <div className="bg-white rounded-lg p-8 border-2 border-black hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 backdrop-blur-sm">
                    <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mr-4">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-black">Browse Problems</h3>
                    </div>
                    <p className="text-gray-600 mb-6 leading-relaxed">Explore and solve coding challenges</p>
                    <button 
                        onClick={() => navigate('/problems')}
                        className="w-full px-6 py-3 bg-black text-white hover:bg-gray-800 rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                    >
                        View Problems
                    </button>
                </div>

                {/* Code Editor */}
                <div className="bg-white rounded-lg p-8 border-2 border-black hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 backdrop-blur-sm">
                    <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mr-4">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-black">Code Editor</h3>
                    </div>
                    <p className="text-gray-600 mb-6 leading-relaxed">Write and test your code</p>
                    <button 
                        onClick={() => navigate('/code')}
                        className="w-full px-6 py-3 bg-black text-white hover:bg-gray-800 rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                    >
                        Open Editor
                    </button>
                </div>

                {/* Profile */}
                <div className="bg-white rounded-lg p-8 border-2 border-black hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 backdrop-blur-sm">
                    <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mr-4">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-black">Your Profile</h3>
                    </div>
                    <p className="text-gray-600 mb-6 leading-relaxed">View your stats and achievements</p>
                    <button 
                        onClick={() => navigate('/profile')}
                        className="w-full px-6 py-3 bg-black text-white hover:bg-gray-800 rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                    >
                        View Profile
                    </button>
                </div>

                {/* Problemsetter-specific cards */}
                {(loggedInUser.accType === 'Problemsetter' || loggedInUser.accType === 'Admin') && (
                    <>
                        <div className="bg-black text-white rounded-lg p-8 border-2 border-gray-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 backdrop-blur-sm">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-4">
                                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold">Create Problem</h3>
                            </div>
                            <p className="text-gray-300 mb-6 leading-relaxed">Design new coding challenges</p>
                            <button 
                                onClick={() => navigate('/create-problem')}
                                className="w-full px-6 py-3 bg-white text-black hover:bg-gray-100 font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Create New Problem
                            </button>
                        </div>

                        <div className="bg-gray-900 text-white rounded-lg p-8 border-2 border-gray-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 backdrop-blur-sm">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-4">
                                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold">My Problems</h3>
                            </div>
                            <p className="text-gray-300 mb-6 leading-relaxed">Manage your created problems</p>
                            <button 
                                onClick={() => navigate('/my-problems')}
                                className="w-full px-6 py-3 bg-white text-black hover:bg-gray-100 font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                View My Problems
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Welcome message based on account type */}
            {loggedInUser.accType === 'Problemsetter' && (
                <div className="bg-gray-50 rounded-lg p-8 border-2 border-black backdrop-blur-sm">
                    <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-black">Problemsetter Features</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                        As a Problemsetter, you have special privileges to create and manage coding problems. 
                        Help the community grow by contributing challenging and educational problems!
                    </p>
                </div>
            )}
        </div>
    </div>
  )
}

export default Dashboard