// filepath: d:\algo\oj_project\frontend\src\components\Header.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserDropdown from './UserDropdown';

export default function Header() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    return (
        <header className="fixed top-2 left-0 right-0 z-50">
            <nav className="container mx-auto px-6 py-0.5">
                <div className="flex justify-between items-center bg-white/90 backdrop-blur-lg border-2 border-black rounded-xl px-6 py-2 shadow-lg">
                    <h1 
                    
                        className="text-2xl font-bold text-black cursor-pointer hover:text-gray-700 transition-colors border-b-2 border-transparent hover:border-black" 
                        onClick={() => navigate('/')}
                    >
                        CodeJudge
                    </h1>
                                        <div className="flex items-center space-x-6">
                                                <button 
                                                        onClick={() => navigate('/')}
                                                        className="text-black hover:text-gray-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-100"
                                                >
                                                        Home
                                                </button>
                                                <button 
                                                        onClick={() => navigate('/problems')}
                                                        className="text-black hover:text-gray-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-100"
                                                >
                                                        Problems
                                                </button>
                                                {isAuthenticated && (
                                                        <button 
                                                                onClick={() => navigate('/submissions')}
                                                                className="text-black hover:text-gray-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-100"
                                                        >
                                                                Submissions
                                                        </button>
                                                )}
                                                {/* Dashboard Dropdown */}
                                                {isAuthenticated && (
                                                    <div className="relative group">
                                                        <button className="text-black hover:text-gray-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-1">
                                                            Dashboard
                                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                                        </button>
                                                        <ul className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-50">
                                                            <li>
                                                                <button onClick={() => navigate('/dashboard/accept-topics')} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Accept Topics</button>
                                                            </li>
                                                            <li>
                                                                <button onClick={() => navigate('/dashboard/post-topic')} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Post Topic</button>
                                                            </li>
                                                            <li>
                                                                <button onClick={() => navigate('/dashboard/messages')} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Messaging</button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                )}
                                                <UserDropdown />
                                        </div>
                </div>
            </nav>
        </header>
    );
}