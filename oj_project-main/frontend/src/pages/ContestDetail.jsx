import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    Clock, 
    Trophy, 
    Users, 
    BookOpen, 
    Play, 
    CheckCircle,
    XCircle,
    AlertCircle,
    Timer
} from 'lucide-react';

const ContestDetail = () => {
    const { contestId } = useParams();
    const { user } = useAuth();
    const [contest, setContest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('problems');
    const [timeRemaining, setTimeRemaining] = useState('');

    useEffect(() => {
        if (contestId) {
            fetchContestDetails();
        }
    }, [contestId]);

    useEffect(() => {
        let interval;
        if (contest) {
            interval = setInterval(updateTimer, 1000);
        }
        return () => clearInterval(interval);
    }, [contest]);

    const fetchContestDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/contests/${contestId}`, {
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.success) {
                setContest(data.data);
            } else {
                console.error('Error fetching contest:', data.message);
            }
        } catch (error) {
            console.error('Error fetching contest details:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateTimer = () => {
        if (!contest) return;
        
        const now = new Date();
        const startTime = new Date(contest.startTime);
        const endTime = new Date(contest.endTime);

        if (now < startTime) {
            const diff = startTime - now;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            setTimeRemaining(`Starts in: ${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else if (now >= startTime && now <= endTime) {
            const diff = endTime - now;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            setTimeRemaining(`Time remaining: ${hours}h ${minutes}m ${seconds}s`);
        } else {
            setTimeRemaining('Contest ended');
        }
    };

    const getContestStatus = () => {
        if (!contest) return 'loading';
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

    const getProblemStatus = (problemId) => {
        if (!contest || !user) return 'not-attempted';
        
        const userParticipant = contest.participants?.find(p => p.user._id === user._id);
        if (!userParticipant) return 'not-attempted';
        
        const solvedProblem = userParticipant.solvedProblems?.find(sp => sp.problemId === problemId);
        if (solvedProblem) return 'solved';
        
        // Check if user has any submissions for this problem
        const hasSubmissions = contest.userSubmissions?.some(sub => sub.problemId === problemId);
        return hasSubmissions ? 'attempted' : 'not-attempted';
    };

    const getProblemStatusIcon = (status) => {
        switch (status) {
            case 'solved': return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'attempted': return <XCircle className="h-5 w-5 text-red-600" />;
            default: return <AlertCircle className="h-5 w-5 text-gray-400" />;
        }
    };

    const getProblemStatusColor = (status) => {
        switch (status) {
            case 'solved': return 'bg-green-50 border-green-200';
            case 'attempted': return 'bg-red-50 border-red-200';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!contest) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Contest Not Found</h1>
                    <p className="text-gray-600 mb-4">The contest you're looking for doesn't exist or you don't have access to it.</p>
                    <Link to="/contests" className="text-blue-600 hover:text-blue-800">
                        ← Back to Contests
                    </Link>
                </div>
            </div>
        );
    }

    const status = getContestStatus();
    const isRegistered = contest.participants?.some(p => p.user._id === user?._id);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{contest.title}</h1>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </span>
                            </div>
                            <p className="text-gray-600 mb-4">{contest.description}</p>
                            
                            {/* Contest Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Clock className="h-4 w-4 mr-2" />
                                    <span>Created by {contest.createdBy?.username}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Users className="h-4 w-4 mr-2" />
                                    <span>{contest.participants?.length || 0} participants</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    <span>{contest.problems?.length || 0} problems</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="ml-6">
                            <Link
                                to={`/contests/${contestId}/leaderboard`}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Trophy className="h-4 w-4 mr-2" />
                                Leaderboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timer */}
            {status === 'ongoing' && (
                <div className="bg-green-600 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <div className="flex items-center justify-center">
                            <Timer className="h-5 w-5 mr-2" />
                            <span className="font-medium">{timeRemaining}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div className="mb-8">
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                        {[
                            { key: 'problems', label: 'Problems' },
                            { key: 'submissions', label: 'My Submissions' },
                            { key: 'standings', label: 'Standings' }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    activeTab === tab.key
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'problems' && (
                    <div className="space-y-4">
                        {!isRegistered && status === 'upcoming' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                                    <span className="text-yellow-800">
                                        You need to register for this contest to participate.
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        {status === 'upcoming' && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <Clock className="h-5 w-5 text-blue-600 mr-2" />
                                    <span className="text-blue-800">
                                        Contest starts in: {timeRemaining}
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        {status === 'ended' && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <AlertCircle className="h-5 w-5 text-gray-600 mr-2" />
                                    <span className="text-gray-800">
                                        This contest has ended. You can view the problems and leaderboard.
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Problems List */}
                        <div className="grid grid-cols-1 gap-4">
                            {contest.problems?.map((problem, index) => {
                                const problemStatus = getProblemStatus(problem.problemId._id);
                                const canAccess = isRegistered && (status === 'ongoing' || status === 'ended');
                                
                                return (
                                    <div
                                        key={problem.problemId._id}
                                        className={`border rounded-lg p-6 ${getProblemStatusColor(problemStatus)}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    {getProblemStatusIcon(problemStatus)}
                                                    <span className="text-lg font-medium text-gray-900">
                                                        Problem {String.fromCharCode(65 + index)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {problem.problemId.title}
                                                    </h3>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            problem.problemId.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                                            problem.problemId.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                            problem.problemId.difficulty === 'Hard' ? 'bg-red-100 text-red-800' :
                                                            'bg-purple-100 text-purple-800'
                                                        }`}>
                                                            {problem.problemId.difficulty}
                                                        </span>
                                                        <span>{problem.points} points</span>
                                                        <span>{problem.problemId.timeLimit}ms time limit</span>
                                                        <span>{problem.problemId.memoryLimit}MB memory limit</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center space-x-2">
                                                {canAccess ? (
                                                    <Link
                                                        to={`/contests/${contestId}/problems/${problem.problemId._id}`}
                                                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                    >
                                                        <Play className="h-4 w-4 mr-2" />
                                                        Solve
                                                    </Link>
                                                ) : (
                                                    <button
                                                        disabled
                                                        className="flex items-center px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                                                    >
                                                        <Play className="h-4 w-4 mr-2" />
                                                        Solve
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'submissions' && (
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">My Submissions</h3>
                        </div>
                        <div className="p-6">
                            {contest.userSubmissions?.length > 0 ? (
                                <div className="space-y-4">
                                    {contest.userSubmissions.map((submission) => (
                                        <div key={submission._id} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        Problem: {submission.problemId?.title}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Language: {submission.language} | 
                                                        Submitted: {new Date(submission.submittedAt).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        submission.verdict === 'Accepted' ? 'bg-green-100 text-green-800' :
                                                        submission.verdict === 'Wrong Answer' ? 'bg-red-100 text-red-800' :
                                                        submission.verdict === 'Time Limit Exceeded' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {submission.verdict}
                                                    </span>
                                                    {submission.points > 0 && (
                                                        <span className="text-sm font-medium text-green-600">
                                                            +{submission.points} points
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600">No submissions yet.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'standings' && (
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Current Standings</h3>
                        </div>
                        <div className="p-6">
                            <Link
                                to={`/contests/${contestId}/leaderboard`}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                View full leaderboard →
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContestDetail;


