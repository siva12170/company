import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    ArrowLeft, 
    Play, 
    Clock, 
    CheckCircle, 
    XCircle, 
    AlertCircle,
    Timer,
    Trophy
} from 'lucide-react';

const ContestProblem = () => {
    const { contestId, problemId } = useParams();
    const { user } = useAuth();
    const [contest, setContest] = useState(null);
    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('cpp');
    const [submitting, setSubmitting] = useState(false);
    const [submissions, setSubmissions] = useState([]);
    const [timeRemaining, setTimeRemaining] = useState('');
    // Custom run (no scoring)
    const [customInput, setCustomInput] = useState('');
    const [running, setRunning] = useState(false);
    const [runResult, setRunResult] = useState(null);

    // language options with default code (mirrors problem-detail)
    const languageOptions = [
        { value: 'cpp', label: 'C++', monacoLanguage: 'cpp', defaultCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}' },
        { value: 'java', label: 'Java', monacoLanguage: 'java', defaultCode: 'public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}' },
        { value: 'python', label: 'Python', monacoLanguage: 'python', defaultCode: '# Your Python code here\n' },
        { value: 'c', label: 'C', monacoLanguage: 'c', defaultCode: '#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}' },
    ];

    const getDefaultCode = (lang) => {
        const opt = languageOptions.find(l => l.value === lang);
        return opt ? opt.defaultCode : '';
    };

    const getMonacoLanguage = (lang) => {
        const opt = languageOptions.find(l => l.value === lang);
        return opt ? opt.monacoLanguage : 'javascript';
    };

    // initialize default code when language changes if editor is empty
    useEffect(() => {
        if (!code) {
            setCode(getDefaultCode(language));
        }
    }, [language]);

    useEffect(() => {
        if (contestId && problemId) {
            fetchContestDetails();
            fetchProblemDetails();
            fetchSubmissions();
        }
    }, [contestId, problemId]);

    useEffect(() => {
        let interval;
        if (contest) {
            interval = setInterval(updateTimer, 1000);
        }
        return () => clearInterval(interval);
    }, [contest]);

    const fetchContestDetails = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/contests/${contestId}`, {
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.success) {
                setContest(data.data);
            }
        } catch (error) {
            console.error('Error fetching contest details:', error);
        }
    };

    const mapLanguageToExtension = (lang) => {
        switch (lang) {
            case 'cpp': return 'cpp';
            case 'c': return 'c';
            case 'java': return 'java';
            case 'python': return 'py';
            default: return null;
        }
    };

    const handleRun = async () => {
        const extension = mapLanguageToExtension(language);
        if (!extension) {
            alert('Unsupported language');
            return;
        }
        if (!code.trim()) {
            alert('Please write some code before running');
            return;
        }
        setRunning(true);
        setRunResult(null);
        try {
            const res = await fetch(`${import.meta.env.VITE_COMPILER_URL}/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ extension, code, input: customInput })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setRunResult({ success: true, output: data.output });
            } else {
                setRunResult({ success: false, error: data.error || 'Run failed', details: data.details });
            }
        } catch (e) {
            setRunResult({ success: false, error: 'Network error while running code' });
        } finally {
            setRunning(false);
        }
    };

    const fetchProblemDetails = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/problems/${problemId}`, {
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.success) {
                setProblem(data.data);
            }
        } catch (error) {
            console.error('Error fetching problem details:', error);
        }
    };

    const fetchSubmissions = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/contests/${contestId}`, {
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.success) {
                const userSubmissions = data.data.userSubmissions?.filter(
                    sub => sub.problemId === problemId
                ) || [];
                setSubmissions(userSubmissions);
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
        }
    };

    const updateTimer = () => {
        if (!contest) return;
        
        const now = new Date();
        const endTime = new Date(contest.endTime);
        const diff = endTime - now;

        if (diff > 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            setTimeRemaining(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        } else {
            setTimeRemaining('00:00:00');
        }
    };

    const handleSubmit = async () => {
        if (!code.trim()) {
            alert('Please write some code before submitting');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/contests/${contestId}/problems/${problemId}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    language,
                    code
                })
            });

            const data = await response.json();
            
            if (data.success) {
                // Add new submission to the list
                setSubmissions(prev => [data.data, ...prev]);
                
                // Show success message
                alert(`Submission successful! Verdict: ${data.data.verdict}`);
                
                // Refresh contest details to update score
                fetchContestDetails();
            } else {
                alert(data.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Error submitting solution:', error);
            alert('Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    const getVerdictColor = (verdict) => {
        switch (verdict) {
            case 'Accepted': return 'text-green-600';
            case 'Wrong Answer': return 'text-red-600';
            case 'Time Limit Exceeded': return 'text-yellow-600';
            case 'Memory Limit Exceeded': return 'text-orange-600';
            case 'Runtime Error': return 'text-red-600';
            case 'Compilation Error': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getVerdictIcon = (verdict) => {
        switch (verdict) {
            case 'Accepted': return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'Wrong Answer': return <XCircle className="h-4 w-4 text-red-600" />;
            default: return <AlertCircle className="h-4 w-4 text-yellow-600" />;
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

    if (!contest || !problem) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const status = getContestStatus();
    const isContestActive = status === 'ongoing';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <Link
                                to={`/contests/${contestId}`}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{problem.title}</h1>
                                <p className="text-sm text-gray-600">{contest.title}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            {isContestActive && (
                                <div className="flex items-center space-x-2 text-red-600">
                                    <Timer className="h-5 w-5" />
                                    <span className="font-mono text-lg">{timeRemaining}</span>
                                </div>
                            )}
                            
                            <Link
                                to={`/contests/${contestId}/leaderboard`}
                                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Trophy className="h-4 w-4 mr-2" />
                                Leaderboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Problem Description */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-medium text-gray-900">Problem Description</h2>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                            problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                            problem.difficulty === 'Hard' ? 'bg-red-100 text-red-800' :
                                            'bg-purple-100 text-purple-800'
                                        }`}>
                                            {problem.difficulty}
                                        </span>
                                        <span>{problem.timeLimit}ms</span>
                                        <span>{problem.memoryLimit}MB</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="prose max-w-none">
                                    <div dangerouslySetInnerHTML={{ __html: problem.description }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Code Editor and Submissions */}
                    <div className="space-y-6">
                        {/* Code Editor */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900">Code Editor</h3>
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                                    >
                                        <option value="cpp">C++</option>
                                        <option value="c">C</option>
                                        <option value="java">Java</option>
                                        <option value="python">Python</option>
                                    </select>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className={`${!isContestActive ? 'opacity-75 pointer-events-none' : ''}`}>
                                    <Editor
                                        height="300px"
                                        language={getMonacoLanguage(language)}
                                        value={code}
                                        onChange={(value) => setCode(value || '')}
                                        theme="light"
                                        options={{
                                            minimap: { enabled: false },
                                            fontSize: 14,
                                            lineNumbers: 'on',
                                            automaticLayout: true,
                                            tabSize: 4,
                                            wordWrap: 'on'
                                        }}
                                    />
                                </div>
                                
                                <div className="mt-4 grid grid-cols-1 gap-3">
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-1">Custom input (optional)</label>
                                        <textarea
                                            value={customInput}
                                            onChange={(e) => setCustomInput(e.target.value)}
                                            placeholder="Enter stdin input..."
                                            className="w-full h-24 p-3 border border-gray-300 rounded-md font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={handleRun}
                                            disabled={running || !code.trim()}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                !running && code.trim() ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            {running ? 'Running...' : 'Run with custom input'}
                                        </button>
                                        <div className="flex-1" />
                                        <button
                                            onClick={handleSubmit}
                                            disabled={!isContestActive || submitting || !code.trim()}
                                            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                                                isContestActive && code.trim() && !submitting
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            {submitting ? (
                                                <div className="flex items-center">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Submitting...
                                                </div>
                                            ) : (
                                                <div className="flex items-center">
                                                    <Play className="h-4 w-4 mr-2" />
                                                    Submit
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {runResult && (
                                    <div className={`mt-4 p-3 rounded border ${runResult.success ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                                        <div className="text-sm font-medium mb-1">Run Output</div>
                                        <pre className="whitespace-pre-wrap text-sm font-mono text-gray-900">{runResult.success ? runResult.output : (runResult.error + (runResult.details ? `\n${runResult.details}` : ''))}</pre>
                                    </div>
                                )}
                                
                                {!isContestActive && (
                                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                        <div className="flex items-center">
                                            <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                                            <span className="text-sm text-yellow-800">
                                                Contest is not currently active. You cannot submit solutions.
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submissions */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">My Submissions</h3>
                            </div>
                            <div className="p-6">
                                {submissions.length > 0 ? (
                                    <div className="space-y-3">
                                        {submissions.map((submission, index) => (
                                            <div key={submission._id} className="border rounded-lg p-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        {getVerdictIcon(submission.verdict)}
                                                        <span className={`text-sm font-medium ${getVerdictColor(submission.verdict)}`}>
                                                            {submission.verdict}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {new Date(submission.submittedAt).toLocaleTimeString()}
                                                    </div>
                                                </div>
                                                {submission.points > 0 && (
                                                    <div className="mt-1 text-sm text-green-600 font-medium">
                                                        +{submission.points} points
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-600 text-sm">No submissions yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContestProblem;


