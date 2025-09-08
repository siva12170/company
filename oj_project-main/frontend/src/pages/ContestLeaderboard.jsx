import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    Trophy, 
    Medal, 
    Clock, 
    Users, 
    ArrowLeft,
    RefreshCw,
    Crown
} from 'lucide-react';
import socket from '../utils/socket';

const ContestLeaderboard = () => {
    const { contestId } = useParams();
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        if (contestId) {
            fetchLeaderboard();
        }
    }, [contestId]);

    useEffect(() => {
        let interval;
        if (autoRefresh && leaderboard?.contest?.status === 'ongoing') {
            interval = setInterval(() => {
                fetchLeaderboard();
            }, 30000); // Refresh every 30 seconds
        }
        return () => clearInterval(interval);
    }, [autoRefresh, leaderboard?.contest?.status]);

    // websocket live updates
    useEffect(() => {
        if (!contestId) return;
        socket.emit('contest:join', { contestId });
        const handler = (payload) => {
            if (payload?.contestId === contestId) {
                fetchLeaderboard();
            }
        };
        socket.on('leaderboard:update', handler);
        return () => {
            socket.off('leaderboard:update', handler);
            socket.emit('contest:leave', { contestId });
        };
    }, [contestId]);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/contests/${contestId}/leaderboard`, {
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.success) {
                setLeaderboard(data.data);
                setLastUpdated(new Date());
            } else {
                console.error('Error fetching leaderboard:', data.message);
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1:
                return <Crown className="h-6 w-6 text-yellow-500" />;
            case 2:
                return <Medal className="h-6 w-6 text-gray-400" />;
            case 3:
                return <Medal className="h-6 w-6 text-amber-600" />;
            default:
                return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
        }
    };

    const getRankColor = (rank) => {
        switch (rank) {
            case 1:
                return 'bg-yellow-50 border-yellow-200';
            case 2:
                return 'bg-gray-50 border-gray-200';
            case 3:
                return 'bg-amber-50 border-amber-200';
            default:
                return 'bg-white border-gray-200';
        }
    };

    const getContestStatus = () => {
        if (!leaderboard?.contest) return 'loading';
        const now = new Date();
        const startTime = new Date(leaderboard.contest.startTime);
        const endTime = new Date(leaderboard.contest.endTime);

        if (now < startTime) return 'upcoming';
        if (now >= startTime && now <= endTime) return 'ongoing';
        return 'ended';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'upcoming': return 'bg-blue-100 text-blue-800';
            case 'ongoing': return 'bg-green-100 text-green-800';
            case 'ended': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!leaderboard) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Leaderboard Not Found</h1>
                    <p className="text-gray-600 mb-4">The leaderboard for this contest is not available.</p>
                    <Link to="/contests" className="text-blue-600 hover:text-blue-800">
                        ← Back to Contests
                    </Link>
                </div>
            </div>
        );
    }

    const status = getContestStatus();
    const userRank = leaderboard.leaderboard.findIndex(entry => entry.user._id === user?._id) + 1;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <Link
                                    to={`/contests/${contestId}`}
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                                <h1 className="text-3xl font-bold text-gray-900">{leaderboard.contest.title}</h1>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </span>
                            </div>
                            <p className="text-gray-600">Live Leaderboard</p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            {/* Auto-refresh toggle */}
                            {status === 'ongoing' && (
                                <div className="flex items-center space-x-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={autoRefresh}
                                            onChange={(e) => setAutoRefresh(e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-600">Auto-refresh</span>
                                    </label>
                                    <button
                                        onClick={fetchLeaderboard}
                                        className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                            
                            {lastUpdated && (
                                <div className="text-sm text-gray-500">
                                    Last updated: {lastUpdated.toLocaleTimeString()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Contest Info */}
                <div className="bg-white rounded-lg shadow mb-8">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Contest Information</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-center text-sm text-gray-600">
                                <Clock className="h-4 w-4 mr-2" />
                                <div>
                                    <p className="font-medium">Start Time</p>
                                    <p>{new Date(leaderboard.contest.startTime).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Clock className="h-4 w-4 mr-2" />
                                <div>
                                    <p className="font-medium">End Time</p>
                                    <p>{new Date(leaderboard.contest.endTime).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Users className="h-4 w-4 mr-2" />
                                <div>
                                    <p className="font-medium">Participants</p>
                                    <p>{leaderboard.leaderboard.length} users</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User's Current Position */}
                {user && userRank > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Trophy className="h-5 w-5 text-blue-600" />
                                <span className="font-medium text-blue-900">Your Position</span>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-blue-900">#{userRank}</div>
                                <div className="text-sm text-blue-700">
                                    {leaderboard.leaderboard[userRank - 1]?.score || 0} points
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Leaderboard Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Leaderboard</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rank
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Score
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Solved
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Time
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {leaderboard.leaderboard.map((entry, index) => {
                                    const rank = index + 1;
                                    const isCurrentUser = user && entry.user._id === user._id;
                                    
                                    return (
                                        <tr
                                            key={entry.user._id}
                                            className={`${getRankColor(rank)} ${isCurrentUser ? 'ring-2 ring-blue-500' : ''}`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {getRankIcon(rank)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {entry.user.fullName?.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {entry.user.fullName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            @{entry.user.username}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {entry.score}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {entry.solvedCount}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {formatTime(entry.totalTime)}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Empty State */}
                {leaderboard.leaderboard.length === 0 && (
                    <div className="text-center py-12">
                        <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No participants yet</h3>
                        <p className="text-gray-600">The leaderboard will appear once users start participating.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContestLeaderboard;

