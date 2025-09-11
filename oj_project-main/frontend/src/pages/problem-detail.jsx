import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import AIReview from '../components/AIReview';
import SubmissionHistory from '../components/SubmissionHistory';

export default function ProblemDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Problem state
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [verdict, setVerdict] = useState(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    // Code editor states
    const [code, setCode] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('cpp');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState(null);
    const [customInput, setCustomInput] = useState('');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [showAIReview, setShowAIReview] = useState(false);
    
    // View toggle state
    const [showSubmissions, setShowSubmissions] = useState(false);

    // Language options
    const languageOptions = [
        { 
            value: 'cpp', 
            label: 'C++', 
            monacoLanguage: 'cpp',
            defaultCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}\n' 
        },
        { 
            value: 'java', 
            label: 'Java', 
            monacoLanguage: 'java',
            defaultCode: 'public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}\n' 
        },
        { 
            value: 'python', 
            label: 'Python', 
            monacoLanguage: 'python',
            defaultCode: '# Your Python code here\n' 
        },
        { 
            value: 'c', 
            label: 'C', 
            monacoLanguage: 'c',
            defaultCode: '#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}\n' 
        }
    ];

    // Get default code for language
    const getDefaultCode = (language) => {
        const lang = languageOptions.find(l => l.value === language);
        return lang ? lang.defaultCode : '';
    };

    const getDifficultyClass = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'text-green-700 bg-green-100 border border-green-300';
            case 'Medium': return 'text-yellow-700 bg-yellow-100 border border-yellow-300';
            case 'Hard': return 'text-red-700 bg-red-100 border border-red-300';
            case 'Extreme': return 'text-purple-700 bg-purple-100 border border-purple-300';
            default: return 'text-gray-700 bg-gray-100 border border-gray-300';
        }
    };

    // Get language for Monaco Editor
    const getMonacoLanguage = (language) => {
        const lang = languageOptions.find(l => l.value === language);
        return lang ? lang.monacoLanguage : 'javascript';
    };
    // Handle language change
    const handleLanguageChange = (language) => {
        setSelectedLanguage(language);
        setCode(getDefaultCode(language));
    };

    // Fetch problem data
    useEffect(() => {
        fetchProblem();
    }, [id]);

    // Initialize code when language changes
    useEffect(() => {
        if (!code) {
            setCode(getDefaultCode(selectedLanguage));
        }
    }, [selectedLanguage]);

    // Fetch user's last submission for this problem
    useEffect(() => {
        if (problem) {
            checkSubmissionStatus();
        }
    }, [problem]);

    const fetchProblem = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/problems/${id}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setProblem(data.data);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to fetch problem');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const checkSubmissionStatus = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/submissions/problem/${id}?limit=1`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data.submissions.length > 0) {
                    const lastSubmission = data.data.submissions[0];
                    setVerdict(lastSubmission.verdict);
                    setHasSubmitted(true);
                }
            }
        } catch (err) {
            console.error('Error checking submission status:', err);
        }
    };
    const runCode = async () => {
        if (!code.trim()) {
            setOutput('Please write some code first!');
            return;
        }

        setIsRunning(true);
        setOutput('> Running code...');
        
        try {
            // Ensure we're using the correct URL variable
            const compilerUrl = import.meta.env.VITE_COMPILER_URL;
            if (!compilerUrl) {
                throw new Error('Compiler URL is not defined in environment variables');
            }
            
            const response = await fetch(`${compilerUrl}/run`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    extension: selectedLanguage,
                    code: code,
                    input: customInput
                })
            });

            const result = await response.json();

            if (response.ok) {
                setOutput(result.output || 'No output');
            } else {
                setOutput(`Error: ${result.error || 'Unknown error occurred'}`);
            }
        } catch (error) {
            setOutput(`Error: ${error.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    const submitCode = async () => {
        if (!code.trim()) {
            window.showToast && window.showToast('Please write some code first!', 'warning');
            return;
        }

        // Debug: Print backend URL
        console.log('VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);

        setIsSubmitting(true);
        setSubmitResult(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/submissions/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    problemId: id,
                    language: selectedLanguage,
                    code: code
                }),
                credentials: 'include'
            });

            const result = await response.json();

            if (response.ok) {
                setSubmitResult(result.data);
                setVerdict(result.data.verdict);
                setHasSubmitted(true);
                
                // Show success/failure toast based on verdict
                const verdictType = result.data.verdict === 'Accepted' ? 'success' : 'error';
                window.showToast && window.showToast(
                    `Submission completed! Verdict: ${result.data.verdict}`,
                    verdictType,
                    5000
                );
                
                // Refresh submission status
                checkSubmissionStatus();
            } else {
                if (response.status === 401) {
                    navigate('/auth');
                } else {
                    window.showToast && window.showToast(
                        result.message || 'Submission failed',
                        'error'
                    );
                }
            }
        } catch (error) {
            window.showToast && window.showToast(
                'Error submitting solution: ' + error.message,
                'error'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const getVerdictText = (verdict) => {
        switch (verdict) {
            case 'Accepted': return 'Accepted';
            case 'Wrong Answer': return 'Wrong Answer';
            case 'Time Limit Exceeded': return 'Time Limit Exceeded';
            case 'Memory Limit Exceeded': return 'Memory Limit Exceeded';
            case 'Runtime Error': return 'Runtime Error';
            case 'Compilation Error': return 'Compilation Error';
            case 'Pending': return 'Pending';
            case 'Judging': return 'Judging';
            default: return verdict || 'Unknown';
        }
    };

    const getVerdictClass = (verdict) => {
        switch (verdict) {
            case 'Accepted':
                return 'text-black bg-white border-2 border-black';
            case 'Wrong Answer':
                return 'text-gray-800 bg-gray-200 border-2 border-gray-600';
            case 'Time Limit Exceeded':
                return 'text-gray-700 bg-gray-300 border-2 border-gray-500';
            case 'Memory Limit Exceeded':
                return 'text-black bg-gray-200 border-2 border-gray-300';
            case 'Runtime Error':
                return 'text-gray-800 bg-gray-200 border-2 border-gray-600';
            case 'Compilation Error':
                return 'text-gray-700 bg-gray-300 border-2 border-gray-500';
            case 'Pending':
            case 'Judging':
                return 'text-blue-700 bg-blue-100 border-2 border-blue-300';
            default:
                return 'text-gray-700 bg-gray-300 border-2 border-gray-500';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white pt-20 pb-8 flex items-center justify-center relative overflow-hidden">
                {/* Background with blur effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"></div>
                <div className="absolute inset-0 backdrop-blur-sm"></div>
                <div className="absolute left-1/4 top-1/4 w-[200px] h-[200px] rounded-full bg-black opacity-5 blur-[80px]"></div>
                <div className="absolute right-1/4 bottom-1/4 w-[150px] h-[150px] rounded-full bg-gray-400 opacity-10 blur-[60px]"></div>
                
                <div className="relative text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="text-black font-medium">Loading problem...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white pt-20 pb-8 flex items-center justify-center relative overflow-hidden">
                {/* Background with blur effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"></div>
                <div className="absolute inset-0 backdrop-blur-sm"></div>
                <div className="absolute left-1/4 top-1/4 w-[200px] h-[200px] rounded-full bg-black opacity-5 blur-[80px]"></div>
                <div className="absolute right-1/4 bottom-1/4 w-[150px] h-[150px] rounded-full bg-gray-400 opacity-10 blur-[60px]"></div>
                
                <div className="relative text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-gray-300">
                        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">Error</h2>
                    <p className="text-gray-700 mb-4 px-4">{error}</p>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 px-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors border-2 border-black"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate('/problems')}
                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Back to Problems
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="min-h-screen bg-white pt-20 pb-8 flex items-center justify-center relative overflow-hidden">
                {/* Background with blur effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"></div>
                <div className="absolute inset-0 backdrop-blur-sm"></div>
                <div className="absolute left-1/4 top-1/4 w-[200px] h-[200px] rounded-full bg-black opacity-5 blur-[80px]"></div>
                <div className="absolute right-1/4 bottom-1/4 w-[150px] h-[150px] rounded-full bg-gray-400 opacity-10 blur-[60px]"></div>
                
                <div className="relative text-center">
                    <h2 className="text-xl sm:text-2xl font-bold text-black mb-4">Problem not found</h2>
                    <button
                        onClick={() => navigate('/problems')}
                        className="px-4 py-2 bg-white text-black rounded-lg hover:bg_gray-100 transition-colors border-2 border-black"
                    >
                        Back to Problems
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg_white pt-20 pb-8 relative overflow-hidden">
            {/* Background with blur effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"></div>
            <div className="absolute inset-0 backdrop-blur-sm"></div>
            <div className="absolute left-1/4 top-1/4 w-[200px] h-[200px] rounded-full bg-black opacity-5 blur-[80px]"></div>
            <div className="absolute right-1/4 bottom-1/4 w-[150px] h-[150px] rounded-full bg-gray-400 opacity-10 blur-[60px]"></div>
            
            <div className="relative container mx-auto px-4 sm:px-6 max-w-7xl">
                {/* Breadcrumb */}
                <div className="mb-4 sm:mb-6">
                    <button
                        onClick={() => navigate('/problems')}
                        className="flex items-center text-gray-600 hover:text-black transition-colors mb-4"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Problems
                    </button>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Left Column - Problem Description or Submissions */}
                    <div className="space-y-4 sm:space-y-6">
                        {!showSubmissions ? (
                            <>
                                {/* Problem Header */}
                                <div className="bg-white rounded-lg p-4 sm:p-6 border-2 border-black shadow-xl backdrop-blur-lg">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3 sm:gap-0 mb-4">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-3">
                                                <h1 className="text-2xl sm:text-3xl font-bold text-black">{problem.title}</h1>
                                                <button
                                                    onClick={() => setShowSubmissions(true)}
                                                    className="px-3 py-1.5 bg-white text-black border-2 border-black rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium flex items-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                    Submissions
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                                <span>Difficulty: 
                                                    <span className={`ml-2 px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium ${getDifficultyClass(problem.difficulty)}`}>
                                                        {problem.difficulty}
                                                    </span>
                                                </span>
                                                <span>Time Limit: {problem.timeLimit}ms</span>
                                                <span>Memory Limit: {problem.memoryLimit}MB</span>
                                            </div>
                                        </div>

                                        {/* Verdict Display */}
                                        {hasSubmitted && verdict && (
                                            <div className="sm:ml-4">
                                                <div className={`flex items-center px-3 py-2 rounded-lg ${getVerdictClass(verdict)}`}>
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                                            d={verdict === 'Accepted' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                                                    </svg>
                                                    <span className="font-medium">{getVerdictText(verdict)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Tags */}
                                    {problem.tags && problem.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {problem.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-gray-200 rounded-full text-sm text-black border border-gray-300"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Problem Description */}
                                <div className="bg-white rounded-lg p-4 sm:p-6 border-2 border-black shadow-xl backdrop-blur-lg">
                                    <h2 className="text-lg sm:text-xl font-bold text-black mb-4">Problem Description</h2>
                                    <div className="text-gray-700 prose prose-gray max-w-none">
                                        <p className="whitespace-pre-wrap">{problem.description}</p>
                                    </div>
                                </div>

                                {/* Sample Test Cases */}
                                {problem.testcases && problem.testcases.filter(tc => tc.visible).length > 0 && (
                                    <div className="bg-white rounded-lg p-4 sm:p-6 border-2 border-black shadow-xl backdrop-blur-lg">
                                        <h2 className="text-lg sm:text-xl font-bold text-black mb-4">Sample Test Cases</h2>
                                        <div className="space-y-4">
                                            {problem.testcases.filter(tc => tc.visible).map((testCase, index) => (
                                                <div key={index} className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                                                    <h3 className="text-base sm:text-lg font-semibold text-black mb-3">
                                                        Sample {index + 1}
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <h4 className="text-sm font-medium text-black mb-2">Input:</h4>
                                                            <pre className="bg-gray-100 p-3 rounded text-sm text-black overflow-x-auto border-2 border-gray-300">
                                                                {testCase.input}
                                                            </pre>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-medium text-black mb-2">Expected Output:</h4>
                                                            <pre className="bg-gray-100 p-3 rounded text-sm text-black overflow-x-auto border-2 border-gray-300">
                                                                {testCase.output}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            /* Submissions View */
                            <div className="bg-white rounded-lg p-4 sm:p-6 border-2 border-black shadow-xl backdrop-blur-lg">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
                                    <h2 className="text-xl sm:text-2xl font-bold text-black">Submissions</h2>
                                    <button
                                        onClick={() => setShowSubmissions(false)}
                                        className="px-3 py-1.5 bg-white text_black border-2 border_black rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Back to Problem
                                    </button>
                                </div>
                                <SubmissionHistory problemId={id} />
                            </div>
                        )}
                    </div>

                    {/* Right Column - Code Editor */}
                    <div className="space-y-4 sm:space-y-6">
                        {/* Code Editor */}
                        <div className="bg-white rounded_lg border-2 border_black shadow_xl backdrop_blur_lg">
                            {/* Header */}
                            <div className="bg-gray-50 px-4 py-3 border_b-2 border_gray-200 rounded_t_lg">
                                <div className="flex justify_between items_center">
                                    <div className="flex items_center space_x_3">
                                        <h3 className="text-lg font-semibold text-black">Code Editor</h3>
                                        <select
                                            value={selectedLanguage}
                                            onChange={(e) => handleLanguageChange(e.target.value)}
                                            className="px-3 py-1 bg-white text-black border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                                        >
                                            {languageOptions.map((lang) => (
                                                <option key={lang.value} value={lang.value}>
                                                    {lang.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={runCode}
                                            disabled={isRunning}
                                            className="bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 px-3 py-1.5 rounded-lg transition-all duration-300 text-sm flex items-center gap-2 border-2 border-gray-300 group"
                                        >
                                            {isRunning ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    <span>Running...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg 
                                                        className="w-4 h-4 transform group-hover:scale-110 transition-transform duration-200" 
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path 
                                                            strokeLinecap="round" 
                                                            strokeLinejoin="round" 
                                                            strokeWidth="2" 
                                                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1M9 16h1m4 0h1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                                                        />
                                                    </svg>
                                                    <span>Run</span>
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setCode(getDefaultCode(selectedLanguage));
                                                setOutput('');
                                                setCustomInput('');
                                            }}
                                            className="bg-white text-black hover:bg-gray-100 border-2 border-black px-3 py-1.5 rounded-lg transition-all duration-300 text-sm flex items-center gap-2 group"
                                        >
                                            <svg 
                                                className="w-4 h-4 transform group-hover:rotate-12 transition-transform duration-200" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                            >
                                                <path 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round" 
                                                    strokeWidth="2" 
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                                                />
                                            </svg>
                                            <span>Clear</span>
                                        </button>
                                        <button
                                onClick={submitCode}
                                disabled={isSubmitting}
                                className="w-full px-3 py-1.5 bg-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white border-2 border-gray-300 rounded-lg transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2 group"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Submitting...</span>
                                    </div>
                                ) : (
                                    <>
                                        <svg 
                                            className="w-4 h-4 transform group-hover:scale-110 transition-transform duration-200" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth="2" 
                                                d="M13 10V3L4 14h7v7l9-11h-7z" 
                                            />
                                        </svg>
                                        <span>Submit</span>
                                    </>
                                )}
                            </button>
                                        <button
                                            onClick={() => setShowAIReview(true)}
                                            className="bg-white text-black hover:bg-gray-100 border-2 border-gray-300 px-3 py-1.5 rounded-lg transition-colors text-sm flex items-center gap-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                            AI
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Code Editor */}
                            <div className="p-4">
                                <Editor
                                    height="300px"
                                    language={getMonacoLanguage(selectedLanguage)}
                                    value={code}
                                    onChange={(value) => setCode(value || '')}
                                    theme="light"
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        lineNumbers: 'on',
                                        roundedSelection: false,
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        tabSize: 4,
                                        wordWrap: 'on',
                                        folding: true,
                                        lineNumbersMinChars: 3,
                                        scrollbar: {
                                            vertical: 'auto',
                                            horizontal: 'auto',
                                            verticalScrollbarSize: 8,
                                            horizontalScrollbarSize: 8
                                        },
                                        renderLineHighlight: 'line',
                                        cursorStyle: 'line',
                                        fontFamily: '"Fira Code", "Consolas", "Monaco", monospace'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Custom Input */}
                        <div className="bg-white rounded-lg border-2 border-black shadow-xl backdrop-blur-lg">
                            <div className="bg-gray-50 px-4 py-3 border-2 border-gray-200 rounded-t-lg">
                                <h3 className="text-lg font-semibold text-black">Custom Input</h3>
                            </div>
                            <div className="p-4">
                                <textarea
                                    value={customInput}
                                    onChange={(e) => setCustomInput(e.target.value)}
                                    placeholder="Enter custom input here..."
                                    className="w-full h-24 bg-gray-50 text-black border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-black resize-none font-mono text-sm"
                                />
                            </div>
                        </div>

                        {/* Output */}
                        <div className="bg-white rounded-lg border-2 border-black shadow-xl backdrop-blur-lg">
                            <div className="bg-gray-50 px-4 py-3 border-2 border-gray-200 rounded-t-lg">
                                <h3 className="text-lg font-semibold text-black">Output</h3>
                            </div>
                            <div className="p-4 min-h-[100px]">
                                <pre className={`font-mono text-sm whitespace-pre-wrap ${
                                    output.includes('Error') ? 'text-red-600' : 'text-black'
                                }`}>
                                    {output || '> Run your code to see the output here...'}
                                </pre>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* AI Review Modal */}
            {showAIReview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg max-w-4xl w-full mx-4 h-[80vh] border-2 border-black shadow-xl flex flex-col">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-2 border-gray-200 bg-gray-50 rounded-t-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg sm:text-xl font-bold text-black">AI Code Review</h3>
                                    <p className="text-gray-600 text-xs sm:text-sm">Get intelligent feedback on your code</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAIReview(false)}
                                className="text-gray-600 hover:text-black transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        {/* AI Review Content */}
                        <div className="flex-1 bg-white text-black overflow-hidden">
                            <AIReview 
                                code={code} 
                                language={selectedLanguage} 
                                onClose={() => setShowAIReview(false)} 
                            />
                        </div>
                        
                        {/* Modal Footer */}
                        <div className="p-4 border-2 border-gray-200 bg-gray-50 rounded-b-lg">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                <p className="text-gray-600 text-sm">
                                    Language: <span className="font-medium text-black">{selectedLanguage.toUpperCase()}</span>
                                </p>
                                <button
                                    onClick={() => setShowAIReview(false)}
                                    className="px-4 py-2 bg-white text-black border-2 border-black rounded-lg hover:bg-gray-100 transition-colors font-medium"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
