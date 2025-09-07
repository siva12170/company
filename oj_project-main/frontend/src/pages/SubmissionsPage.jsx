import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubmissionHistory from '../components/SubmissionHistory';

const SubmissionsPage = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubmissionStats();
    }, []);

    const fetchSubmissionStats = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/submissions/stats`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data.data);
            } else if (response.status === 401) {
                navigate('/auth');
            }
        } catch (error) {
            console.error('Error fetching submission stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const getVerdictColor = (verdict) => {
        switch (verdict) {
            case 'Accepted': return 'bg-green-100 text-green-800 border border-green-300';
            case 'Wrong Answer': return 'bg-red-100 text-red-800 border border-red-300';
            case 'Time Limit Exceeded': return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
            case 'Memory Limit Exceeded': return 'bg-orange-100 text-orange-800 border border-orange-300';
            case 'Runtime Error': return 'bg-red-100 text-red-800 border border-red-300';
            case 'Compilation Error': return 'bg-purple-100 text-purple-800 border border-purple-300';
            default: return 'bg-gray-100 text-gray-800 border border-gray-300';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white pt-20 pb-8 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"></div>
                <div className="absolute left-1/4 top-1/4 w-[200px] h-[200px] rounded-full bg-black opacity-5 blur-[80px]"></div>
                
                <div className="relative container mx-auto px-6 max-w-7xl">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-20 pb-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"></div>
            <div className="absolute left-1/4 top-1/4 w-[200px] h-[200px] rounded-full bg-black opacity-5 blur-[80px]"></div>
            <div className="absolute right-1/4 bottom-1/4 w-[150px] h-[150px] rounded-full bg-gray-400 opacity-10 blur-[60px]"></div>
            
            <div className="relative container mx-auto px-6 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/problems')}
                        className="flex items-center text-gray-600 hover:text-black transition-colors mb-6"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Problems
                    </button>

                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-black mb-4">
                            My Submissions
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Track your coding progress and submission history
                        </p>
                    </div>
                </div>

                {/* Statistics Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Total Submissions */}
                        <div className="bg-white rounded-lg p-6 border-2 border-black shadow-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">
                                        Total Submissions
                                    </p>
                                    <p className="text-3xl font-bold text-black">
                                        {stats.totalSubmissions}
                                    </p>
                                </div>
                                <div className="bg-blue-100 p-3 rounded-lg border border-blue-300">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Accepted Submissions */}
                        <div className="bg-white rounded-lg p-6 border-2 border-black shadow-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">
                                        Accepted
                                    </p>
                                    <p className="text-3xl font-bold text-green-600">
                                        {stats.acceptedSubmissions}
                                    </p>
                                </div>
                                <div className="bg-green-100 p-3 rounded-lg border border-green-300">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Acceptance Rate */}
                        <div className="bg-white rounded-lg p-6 border-2 border-black shadow-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">
                                        Acceptance Rate
                                    </p>
                                    <p className="text-3xl font-bold text-black">
                                        {stats.acceptanceRate}%
                                    </p>
                                </div>
                                <div className="bg-purple-100 p-3 rounded-lg border border-purple-300">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Solved Problems */}
                        <div className="bg-white rounded-lg p-6 border-2 border-black shadow-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">
                                        Problems Solved
                                    </p>
                                    <p className="text-3xl font-bold text-black">
                                        {stats.solvedProblems}
                                    </p>
                                </div>
                                <div className="bg-orange-100 p-3 rounded-lg border border-orange-300">
                                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Verdict Breakdown */}
                {stats && stats.verdictBreakdown && stats.verdictBreakdown.length > 0 && (
                    <div className="bg-white rounded-lg p-6 border-2 border-black shadow-xl mb-8">
                        <h2 className="text-xl font-bold text-black mb-4">
                            Verdict Breakdown
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {stats.verdictBreakdown.map((verdict, index) => (
                                <div 
                                    key={index}
                                    className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-200"
                                >
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVerdictColor(verdict._id)}`}>
                                        {verdict._id}
                                    </span>
                                    <span className="font-semibold text-black">
                                        {verdict.count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Submission History */}
                <div className="bg-white rounded-lg border-2 border-black shadow-xl">
                    <div className="p-6">
                        <SubmissionHistory />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmissionsPage;
