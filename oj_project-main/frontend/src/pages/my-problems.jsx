import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MyProblems = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyProblems();
    }, [currentPage]);

    const fetchMyProblems = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/problems/my-problems?page=${currentPage}&limit=10`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setProblems(data.data.problems);
                setPagination(data.data.pagination);
            } else if (response.status === 403) {
                window.showToast && window.showToast('Access denied. Only Problemsetters and Admins can view this page.', 'error');
                navigate('/dashboard');
            } else {
                console.error('Failed to fetch problems');
            }
        } catch (error) {
            console.error('Error fetching problems:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (problemId, title) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) {
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/problems/${problemId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                window.showToast && window.showToast('Problem deleted successfully', 'success');
                fetchMyProblems(); // Refresh the list
            } else {
                const data = await response.json();
                window.showToast && window.showToast(data.message || 'Failed to delete problem', 'error');
            }
        } catch (error) {
            console.error('Error deleting problem:', error);
            window.showToast && window.showToast('Failed to delete problem', 'error');
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'text-green-600';
            case 'Medium': return 'text-yellow-600';
            case 'Hard': return 'text-red-600';
            case 'Extreme': return 'text-purple-600';
            default: return 'text-gray-600';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center pt-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="text-black font-medium">Loading your problems...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-20 pb-8 relative overflow-hidden">
            {/* Background with blur effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"></div>
            <div className="absolute inset-0 backdrop-blur-sm"></div>
            <div className="absolute left-1/4 top-1/4 w-[200px] h-[200px] rounded-full bg-black opacity-5 blur-[80px]"></div>
            <div className="absolute right-1/4 bottom-1/4 w-[150px] h-[150px] rounded-full bg-gray-400 opacity-10 blur-[60px]"></div>
            
            <div className="relative container mx-auto px-6 max-w-6xl">
                {/* Header Section */}
                <div className="bg-white rounded-lg p-8 mb-8 border-2 border-black shadow-xl backdrop-blur-lg">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 text-black">My Problems</h1>
                            <p className="text-gray-600">Manage your created problems</p>
                        </div>
                        <button 
                            onClick={() => navigate('/create-problem')}
                            className="px-6 py-3 bg-black text-white hover:bg-gray-800 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            Create New Problem
                        </button>
                    </div>
                </div>

                {/* Problems List */}
                <div className="bg-white rounded-lg border-2 border-black shadow-xl backdrop-blur-lg">
                    {problems.length === 0 ? (
                        <div className="text-center py-12">
                            <h3 className="text-xl font-medium mb-4 text-black">No problems created yet</h3>
                            <p className="text-gray-600 mb-6">Start by creating your first problem!</p>
                            <button 
                                onClick={() => navigate('/create-problem')}
                                className="px-6 py-3 bg-black text-white hover:bg-gray-800 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Create New Problem
                            </button>
                        </div>
                    ) : (
                        <div className="p-6">
                            <div className="space-y-4">
                                {problems.map((problem) => (
                                    <div key={problem._id} className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200 hover:border-black transition-all duration-300">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold mb-2 text-black">{problem.title}</h3>
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                    <span className={`font-medium ${getDifficultyColor(problem.difficulty)}`}>
                                                        {problem.difficulty}
                                                    </span>
                                                    <span>Time: {problem.timeLimit}ms</span>
                                                    <span>Memory: {problem.memoryLimit}MB</span>
                                                    <span>Test Cases: {problem.testcases?.length || 0}</span>
                                                    <span>Created: {new Date(problem.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2 ml-4">
                                                <button 
                                                    onClick={() => navigate(`/problem/${problem._id}`)}
                                                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-black rounded text-sm transition-colors"
                                                >
                                                    View
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/edit-problem/${problem._id}`)}
                                                    className="px-3 py-1 bg-black text-white hover:bg-gray-800 rounded text-sm transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(problem._id, problem.title)}
                                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        {problem.tags && problem.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {problem.tags.map((tag, index) => (
                                                    <span 
                                                        key={index}
                                                        className="px-2 py-1 bg-gray-200 text-black rounded-full text-xs border border-gray-300"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Description Preview */}
                                        <div className="text-gray-700">
                                            <p className="line-clamp-2">
                                                {problem.description.length > 200 
                                                    ? problem.description.substring(0, 200) + '...'
                                                    : problem.description
                                                }
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center mt-8 space-x-2">
                        <button
                            onClick={() => setCurrentPage(pagination.currentPage - 1)}
                            disabled={!pagination.hasPrev}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors text-black border border-gray-300"
                        >
                            Previous
                        </button>
                        <div className="flex space-x-1">
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-2 rounded transition-colors border ${
                                        page === pagination.currentPage
                                            ? 'bg-black text-white border-black'
                                            : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage(pagination.currentPage + 1)}
                            disabled={!pagination.hasNext}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors text-black border border-gray-300"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyProblems;
