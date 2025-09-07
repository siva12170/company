import React, { useState, useEffect } from 'react';

const ProfileStats = ({ userId }) => {
    const [stats, setStats] = useState({
        totalSubmissions: 0,
        acceptedSubmissions: 0,
        problemsSolved: 0,
        acceptanceRate: 0,
        verdictBreakdown: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            fetchUserStats();
        }
    }, [userId]);

    const fetchUserStats = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/submissions/stats`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setStats({
                        totalSubmissions: result.data.totalSubmissions || 0,
                        acceptedSubmissions: result.data.acceptedSubmissions || 0,
                        problemsSolved: result.data.solvedProblems || 0,
                        acceptanceRate: result.data.acceptanceRate || 0,
                        verdictBreakdown: result.data.verdictBreakdown || []
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching user stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-gray-100 h-16 rounded-lg border border-gray-200"></div>
                    ))}
                </div>
            </div>
        );
    }

    const statItems = [
        {
            label: 'Total Submissions',
            value: stats.totalSubmissions,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            color: 'text-gray-600'
        },
        {
            label: 'Accepted',
            value: stats.acceptedSubmissions,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            ),
            color: 'text-black'
        },
        {
            label: 'Problems Solved',
            value: stats.problemsSolved,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            ),
            color: 'text-gray-700'
        },
        {
            label: 'Accuracy Rate',
            value: `${stats.acceptanceRate.toFixed(1)}%`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            color: 'text-gray-600'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                {statItems.map((item, index) => (
                    <div 
                        key={index}
                        className="bg-white rounded-lg p-4 hover:bg-gray-50 transition-colors border-2 border-gray-200 hover:border-gray-300"
                    >
                        <div className="flex items-center space-x-3">
                            <div className={`${item.color}`}>
                                {item.icon}
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">{item.label}</p>
                                <p className="text-lg font-semibold text-black">{item.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Accuracy Rate Progress Bar */}
            <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className="text-sm text-black font-medium">{stats.acceptanceRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                        className="bg-gradient-to-r from-gray-600 to-black h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(stats.acceptanceRate, 100)}%` }}
                    ></div>
                </div>
            </div>

            {/* Verdict Breakdown */}
            {stats.verdictBreakdown.length > 0 && (
                <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                    <h3 className="text-lg font-semibold text-black mb-4">Submission Breakdown</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {stats.verdictBreakdown.map((verdict, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                                <span className="text-sm text-gray-700">{verdict._id}</span>
                                <span className="text-sm font-medium text-black">{verdict.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileStats;
