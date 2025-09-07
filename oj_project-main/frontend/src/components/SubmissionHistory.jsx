import React, { useState, useEffect } from 'react';

const SubmissionHistory = ({ problemId = null }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [verdictFilter, setVerdictFilter] = useState('');

    const verdictOptions = [
        { value: '', label: 'All Verdicts' },
        { value: 'Accepted', label: 'Accepted' },
        { value: 'Wrong Answer', label: 'Wrong Answer' },
        { value: 'Time Limit Exceeded', label: 'Time Limit Exceeded' },
        { value: 'Memory Limit Exceeded', label: 'Memory Limit Exceeded' },
        { value: 'Runtime Error', label: 'Runtime Error' },
        { value: 'Compilation Error', label: 'Compilation Error' }
    ];

    useEffect(() => {
        fetchSubmissions();
    }, [currentPage, verdictFilter, problemId]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            let url = `${import.meta.env.VITE_BACKEND_URL}/submissions?page=${currentPage}&limit=10`;

            if (problemId) {
                url = `${import.meta.env.VITE_BACKEND_URL}/submissions/problem/${problemId}?page=${currentPage}&limit=10`;
            }
            
            if (verdictFilter) {
                url += `&verdict=${verdictFilter}`;
            }

            const response = await fetch(url, {
                credentials: 'include'
            });

            const data = await response.json();
            
            if (data.success) {
                setSubmissions(data.data.submissions);
                setTotalPages(data.data.totalPages);
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissionDetails = async (submissionId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/submissions/${submissionId}`, {
                credentials: 'include'
            });

            const data = await response.json();
            
            if (data.success) {
                setSelectedSubmission(data.data);
            }
        } catch (error) {
            console.error('Error fetching submission details:', error);
        }
    };

    const getVerdictColor = (verdict) => {
        switch (verdict) {
            case 'Accepted': return 'text-green-700 bg-green-100 border border-green-300';
            case 'Wrong Answer': return 'text-red-700 bg-red-100 border border-red-300';
            case 'Time Limit Exceeded': return 'text-yellow-700 bg-yellow-100 border border-yellow-300';
            case 'Memory Limit Exceeded': return 'text-orange-700 bg-orange-100 border border-orange-300';
            case 'Runtime Error': return 'text-red-700 bg-red-100 border border-red-300';
            case 'Compilation Error': return 'text-purple-700 bg-purple-100 border border-purple-300';
            default: return 'text-gray-700 bg-gray-100 border border-gray-300';
        }
    };


    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getLanguageColor = (language) => {
        switch (language.toLowerCase()) {
            case 'cpp': return 'bg-blue-100 text-blue-800 border border-blue-300';
            case 'c': return 'bg-gray-100 text-gray-800 border border-gray-300';
            case 'java': return 'bg-orange-100 text-orange-800 border border-orange-300';
            case 'python': return 'bg-green-100 text-green-800 border border-green-300';
            default: return 'bg-gray-100 text-gray-800 border border-gray-300';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header and Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-black">
                    {problemId ? 'Problem Submissions' : 'Submission History'}
                </h2>
                
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <select
                            value={verdictFilter}
                            onChange={(e) => {
                                setVerdictFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3 py-2 border-2 border-black rounded-lg focus:outline-none focus:border-gray-600 bg-white text-black text-sm"
                        >
                            {verdictOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Submissions Table */}
            <div className="bg-white rounded-lg shadow-sm border-2 border-black overflow-hidden">
                {submissions.length === 0 ? (
                    <div className="p-8 text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        <p className="text-gray-500">
                            No submissions found. Start solving problems to see your submissions here!
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b-2 border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Problem
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Verdict
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Language
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Memory
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Submitted
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {submissions.map((submission) => (
                                    <tr key={submission._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {!problemId && (
                                                <div>
                                                    <div className="text-sm font-medium text-black">
                                                        {submission.problemId?.title || 'Unknown Problem'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {submission.problemId?.difficulty || 'Unknown'}
                                                    </div>
                                                </div>
                                            )}
                                            {problemId && (
                                                <div className="text-sm text-gray-500">
                                                    Submission #{submission._id.slice(-6)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVerdictColor(submission.verdict)}`}>
                                                    {submission.verdict}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLanguageColor(submission.language)}`}>
                                                {submission.language.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                                            <div className="flex items-center gap-1">
                                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {submission.executionTime}ms
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                                            <div className="flex items-center gap-1">
                                                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                                </svg>
                                                {submission.memoryUsed}MB
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(submission.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => fetchSubmissionDetails(submission._id)}
                                                className="text-black hover:text-gray-600 font-medium text-sm flex items-center gap-1 px-3 py-1 border-2 border-black rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Submission Details View */}
            {selectedSubmission && (
                <div className="bg-white rounded-lg border-2 border-black shadow-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-black">
                            Submission Details
                        </h3>
                        <button
                            onClick={() => setSelectedSubmission(null)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors border-2 border-gray-300"
                        >
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    {/* Submission Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                            <h4 className="font-medium text-black mb-2">
                                Problem
                            </h4>
                            <p className="text-gray-600">
                                {selectedSubmission.problemId?.title}
                            </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                            <h4 className="font-medium text-black mb-2">
                                Verdict
                            </h4>
                            <div className="flex items-center gap-2">
                                <span className={`font-semibold px-2 py-1 rounded text-sm ${getVerdictColor(selectedSubmission.verdict)}`}>
                                    {selectedSubmission.verdict}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Code */}
                    <div className="mb-6">
                        <h4 className="font-medium text-black mb-3">
                            Code ({selectedSubmission.language.toUpperCase()})
                        </h4>
                        <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm font-mono text-black border-2 border-gray-200">
                            {selectedSubmission.code}
                        </pre>
                    </div>

                    {/* Error Message */}
                    {selectedSubmission.errorMessage && (
                        <div className="mb-6">
                            <h4 className="font-medium text-black mb-3">
                                Error Details
                            </h4>
                            <pre className="bg-red-50 border-2 border-red-200 p-4 rounded-lg text-sm font-mono text-red-700">
                                {selectedSubmission.errorMessage}
                            </pre>
                        </div>
                    )}

                    {/* Test Case Results */}
                    {selectedSubmission.testCaseResults && selectedSubmission.testCaseResults.length > 0 && (
                        <div>
                            <h4 className="font-medium text-black mb-3">
                                Test Case Results
                            </h4>
                            
                            {/* Visible Test Cases - Full Details */}
                            <div className="space-y-3 mb-4">
                                {selectedSubmission.testCaseResults
                                    .filter(testCase => testCase.visible)
                                    .map((testCase, index) => (
                                    <div 
                                        key={`visible-${index}`}
                                        className={`border-2 rounded-lg p-4 ${
                                            testCase.verdict === 'Accepted'
                                                ? 'border-green-200 bg-green-50' 
                                                : 'border-red-200 bg-red-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium">
                                                Test Case {testCase.testCase || (index + 1)}
                                            </span>
                                            <span className={`text-sm font-medium ${
                                                testCase.verdict === 'Accepted'
                                                    ? 'text-green-600' 
                                                    : 'text-red-600'
                                            }`}>
                                                {testCase.verdict === 'Accepted' ? 'Passed' : `${testCase.verdict}`}
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="font-medium text-gray-700 mb-1">
                                                    Input:
                                                </p>
                                                <pre className="bg-white p-2 rounded border-2 border-gray-200 font-mono text-xs">
                                                    {testCase.input || 'No input'}
                                                </pre>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-700 mb-1">
                                                    Expected Output:
                                                </p>
                                                <pre className="bg-white p-2 rounded border-2 border-gray-200 font-mono text-xs">
                                                    {testCase.expectedOutput}
                                                </pre>
                                            </div>
                                            <div className="md:col-span-2">
                                                <p className="font-medium text-gray-700 mb-1">
                                                    Your Output:
                                                </p>
                                                <pre className="bg-white p-2 rounded border-2 border-gray-200 font-mono text-xs">
                                                    {testCase.actualOutput}
                                                </pre>
                                            </div>
                                        </div>
                                        
                                        {testCase.executionTime && (
                                            <div className="mt-2 text-sm text-gray-600">
                                                <span className="font-medium">Execution Time:</span> {testCase.executionTime}ms
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Hidden Test Cases - Capsule Format */}
                            {selectedSubmission.testCaseResults.filter(testCase => !testCase.visible).length > 0 && (
                                <div>
                                    <h5 className="font-medium text-gray-700 mb-2 text-sm">
                                        Hidden Test Cases:
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedSubmission.testCaseResults
                                            .filter(testCase => !testCase.visible)
                                            .map((testCase, index) => {
                                                const isAccepted = testCase.verdict === 'Accepted';
                                                const tooltipContent = isAccepted 
                                                    ? `Test Case ${testCase.testCase}: Passed (${testCase.executionTime || 0}ms)`
                                                    : `Test Case ${testCase.testCase}: ${testCase.verdict}${testCase.error ? ` - ${testCase.error}` : ''}${testCase.executionTime ? ` (${testCase.executionTime}ms)` : ''}`;
                                                
                                                return (
                                                    <div
                                                        key={`hidden-${index}`}
                                                        className={`group relative inline-flex items-center px-3 py-1 rounded-full text-xs font-medium cursor-default transition-all hover:scale-105 ${
                                                            isAccepted
                                                                ? 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200'
                                                                : 'bg-red-100 text-red-800 border border-red-300 hover:bg-red-200'
                                                        }`}
                                                    >
                                                        <span className={`w-2 h-2 rounded-full mr-2 ${
                                                            isAccepted ? 'bg-green-500' : 'bg-red-500'
                                                        }`}></span>
                                                        TC {testCase.testCase}
                                                        
                                                        {/* Hover tooltip */}
                                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 whitespace-nowrap z-10 max-w-xs">
                                                            {tooltipContent}
                                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                    
                                    {/* Summary */}
                                    <div className="mt-3 text-sm text-gray-600">
                                        <span className="font-medium">
                                            Hidden Cases: 
                                        </span>
                                        <span className="text-green-600 ml-1">
                                            {selectedSubmission.testCaseResults.filter(tc => !tc.visible && tc.verdict === 'Accepted').length} passed
                                        </span>
                                        <span className="mx-1">•</span>
                                        <span className="text-red-600">
                                            {selectedSubmission.testCaseResults.filter(tc => !tc.visible && tc.verdict !== 'Accepted').length} failed
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SubmissionHistory;
