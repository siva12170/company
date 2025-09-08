import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    Calendar, 
    Clock, 
    Users, 
    Trophy, 
    Play, 
    UserPlus,
    UserMinus,
    Eye
} from 'lucide-react';

const Contests = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, upcoming, ongoing, ended
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchContests();
    }, [filter, page]);

    const fetchContests = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10'
            });
            
            if (filter !== 'all') {
                params.append('status', filter);
            }

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/contests/public?${params}`, {
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.success) {
                setContests(data.data.contests);
                setTotalPages(data.data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error fetching contests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (contestId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/contests/${contestId}/register`, {
                method: 'POST',
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.success) {
                // find the contest to decide navigation
                const justRegistered = contests.find(c => c._id === contestId);
                if (justRegistered) {
                    const status = getContestStatus(justRegistered);
                    if (status === 'ongoing') {
                        // Go straight to contest page so user can see problems and solve
                        navigate(`/contests/${contestId}`);
                        return;
                    }
                }
                // Otherwise refresh list to reflect registered state
                fetchContests();
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Error registering for contest:', error);
            alert('Registration failed');
        }
    };

    const handleUnregister = async (contestId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/contests/${contestId}/unregister`, {
                method: 'POST',
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.success) {
                // Refresh contests to update registration status
                fetchContests();
            } else {
                alert(data.message || 'Unregistration failed');
            }
        } catch (error) {
            console.error('Error unregistering from contest:', error);
            alert('Unregistration failed');
        }
    };

    const getContestStatus = (contest) => {
        const now = new Date();
        const startTime = new Date(contest.startTime);
        const endTime = new Date(contest.endTime);

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

    const isUserRegistered = (contest) => {
        if (!user) return false;
        return contest.participants?.some(p => p.user._id === user._id);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getTimeRemaining = (contest) => {
        const now = new Date();
        const startTime = new Date(contest.startTime);
        const endTime = new Date(contest.endTime);

        if (now < startTime) {
            const diff = startTime - now;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            
            if (days > 0) return `${days}d ${hours}h ${minutes}m`;
            if (hours > 0) return `${hours}h ${minutes}m`;
            return `${minutes}m`;
        } else if (now >= startTime && now <= endTime) {
            const diff = endTime - now;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            return `${hours}h ${minutes}m remaining`;
        }
        return 'Ended';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Contests</h1>
                            <p className="text-gray-600 mt-1">Participate in coding contests and compete with others</p>
                        </div>
                        {user?.accType === 'Admin' && (
                            <Link
                                to="/admin/contests/create"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Create Contest
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filter Tabs */}
                <div className="mb-8">
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                        {[
                            { key: 'all', label: 'All Contests' },
                            { key: 'upcoming', label: 'Upcoming' },
                            { key: 'ongoing', label: 'Ongoing' },
                            { key: 'ended', label: 'Ended' }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => {
                                    setFilter(tab.key);
                                    setPage(1);
                                }}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    filter === tab.key
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Contests Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contests.map((contest) => {
                        const status = getContestStatus(contest);
                        const isRegistered = isUserRegistered(contest);
                        
                        return (
                            <div key={contest._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    {/* Contest Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                {contest.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {contest.description}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </span>
                                    </div>

                                    {/* Contest Info */}
                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            <span>Created by {contest.createdBy?.username}</span>
                                        </div>
                                        
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Clock className="h-4 w-4 mr-2" />
                                            <span>Starts: {formatDate(contest.startTime)}</span>
                                        </div>
                                        
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Clock className="h-4 w-4 mr-2" />
                                            <span>Ends: {formatDate(contest.endTime)}</span>
                                        </div>
                                        
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Users className="h-4 w-4 mr-2" />
                                            <span>{contest.participants?.length || 0} participants</span>
                                        </div>
                                        
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Trophy className="h-4 w-4 mr-2" />
                                            <span>{contest.problems?.length || 0} problems</span>
                                        </div>
                                    </div>

                                    {/* Time Remaining */}
                                    <div className="mb-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {getTimeRemaining(contest)}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex space-x-2">
                                        {status === 'upcoming' && user && (
                                            <>
                                                {isRegistered ? (
                                                    <button
                                                        onClick={() => handleUnregister(contest._id)}
                                                        className="flex-1 flex items-center justify-center px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
                                                    >
                                                        <UserMinus className="h-4 w-4 mr-1" />
                                                        Unregister
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleRegister(contest._id)}
                                                        className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                                    >
                                                        <UserPlus className="h-4 w-4 mr-1" />
                                                        Register
                                                    </button>
                                                )}
                                            </>
                                        )}
                                        
                                        {status === 'ongoing' && isRegistered && (
                                            <Link
                                                to={`/contests/${contest._id}`}
                                                className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                            >
                                                <Play className="h-4 w-4 mr-1" />
                                                Enter Contest
                                            </Link>
                                        )}
                                        
                                        <Link
                                            to={`/contests/${contest._id}/leaderboard`}
                                            className="flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className={`px-3 py-2 border rounded-md text-sm font-medium ${
                                        page === pageNum
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            ))}
                            
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page === totalPages}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {contests.length === 0 && (
                    <div className="text-center py-12">
                        <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No contests found</h3>
                        <p className="text-gray-600">There are no contests matching your current filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Contests;


