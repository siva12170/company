import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const Problems = () => {
    const navigate = useNavigate();
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        difficulty: '',
        tags: '',
        search: ''
    });
    const [searchInput, setSearchInput] = useState('');

    // Debounce search to avoid triggering API calls on every keystroke
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchInput }));
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchInput]);

    useEffect(() => {
        fetchProblems();
    }, [currentPage, filters]);

    const fetchProblems = async () => {
        // Only show full page loading on initial load
        if (currentPage === 1 && !filters.search && !filters.difficulty && !filters.tags) {
            setLoading(true);
        } else {
            setSearchLoading(true);
        }
        
        try {
            const queryParams = new URLSearchParams({
                page: currentPage,
                limit: 10,
                ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
            });

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/problems?${queryParams}`, {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setProblems(data.data.problems);
                setPagination(data.data.pagination);
            } else {
                console.error('Failed to fetch problems');
            }
        } catch (error) {
            console.error('Error fetching problems:', error);
        } finally {
            setLoading(false);
            setSearchLoading(false);
        }
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1); // Reset to first page when filters change
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'text-green-700 bg-green-100 border border-green-300';
            case 'Medium': return 'text-yellow-700 bg-yellow-100 border border-yellow-300';
            case 'Hard': return 'text-red-700 bg-red-100 border border-red-300';
            case 'Extreme': return 'text-purple-700 bg-purple-100 border border-purple-300';
            default: return 'text-gray-700 bg-gray-100 border border-gray-300';
        }
    };

    if (loading) {
        return (
            <div className="bg-white text-black min-h-screen flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="text-black font-medium">Loading problems...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white text-black min-h-screen p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2 text-black">Problems</h1>
                    <p className="text-gray-600">Challenge yourself with coding problems</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg p-6 mb-6 border-2 border-black">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="search" className="block text-sm font-medium mb-2 text-black">
                                Search
                            </label>
                            <input
                                type="text"
                                id="search"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search problems..."
                                className="w-full px-3 py-2 bg-white border-2 border-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-600 text-black placeholder-gray-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="difficulty" className="block text-sm font-medium mb-2 text-black">
                                Difficulty
                            </label>
                            <select
                                id="difficulty"
                                value={filters.difficulty}
                                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                                className="w-full px-3 py-2 bg-white border-2 border-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-600 text-black"
                            >
                                <option value="">All Difficulties</option>
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                                <option value="Extreme">Extreme</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="tags" className="block text-sm font-medium mb-2 text-black">
                                Tags
                            </label>
                            <input
                                type="text"
                                id="tags"
                                value={filters.tags}
                                onChange={(e) => handleFilterChange('tags', e.target.value)}
                                placeholder="e.g., arrays,graphs"
                                className="w-full px-3 py-2 bg-white border-2 border-black rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-600 text-black placeholder-gray-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Problems List */}
                {searchLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                        <p className="text-black font-medium">Searching problems...</p>
                    </div>
                ) : problems.length === 0 ? (
                    <div className="text-center py-12">
                        <h3 className="text-xl font-medium mb-4 text-black">No problems found</h3>
                        <p className="text-gray-600">Try adjusting your search filters</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {problems.map((problem) => (
                            <div 
                                key={problem._id} 
                                className="bg-white rounded-lg p-6 border-2 border-black hover:border-gray-600 transition-colors cursor-pointer hover:shadow-lg"
                                onClick={() => navigate(`/problem/${problem._id}`)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold mb-2 text-black hover:text-gray-700 transition-colors">
                                            {problem.title}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                                                {problem.difficulty}
                                            </span>
                                            <span>Time: {problem.timeLimit}ms</span>
                                            <span>Memory: {problem.memoryLimit}MB</span>
                                            <span>By: {problem.author?.fullName || problem.author?.username}</span>
                                            <span>Created: {new Date(problem.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Tags */}
                                {problem.tags && problem.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {problem.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-black text-white rounded-full text-xs border"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Description Preview */}
                                <div className="text-gray-700">
                                    <p className="line-clamp-2">
                                        {problem.description.length > 150 
                                            ? problem.description.replace(/[#*`]/g, '').substring(0, 150) + '...'
                                            : problem.description.replace(/[#*`]/g, '')
                                        }
                                    </p>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-300">
                                    <button className="text-black hover:text-gray-600 font-medium transition-colors border-b border-black hover:border-gray-600">
                                        Solve Problem →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center mt-8 space-x-2">
                        <button
                            onClick={() => setCurrentPage(pagination.currentPage - 1)}
                            disabled={!pagination.hasPrev}
                            className="px-4 py-2 bg-white border-2 border-black hover:bg-gray-100 disabled:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors text-black font-medium"
                        >
                            Previous
                        </button>
                        
                        <div className="flex space-x-1">
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                let page;
                                if (pagination.totalPages <= 5) {
                                    page = i + 1;
                                } else if (pagination.currentPage <= 3) {
                                    page = i + 1;
                                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                                    page = pagination.totalPages - 4 + i;
                                } else {
                                    page = pagination.currentPage - 2 + i;
                                }
                                
                                return (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-2 rounded border-2 transition-colors font-medium ${
                                            page === pagination.currentPage
                                                ? 'bg-black text-white border-black'
                                                : 'bg-white text-black border-black hover:bg-gray-100'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setCurrentPage(pagination.currentPage + 1)}
                            disabled={!pagination.hasNext}
                            className="px-4 py-2 bg-white border-2 border-black hover:bg-gray-100 disabled:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors text-black font-medium"
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* Stats */}
                {pagination.totalProblems > 0 && (
                    <div className="text-center text-gray-600 text-sm mt-6">
                        Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.totalProblems)} of {pagination.totalProblems} problems
                    </div>
                )}
            </div>
        </div>
    );
};

export default Problems;
