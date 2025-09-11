import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import AIFeatureModal from '../components/AIFeatureModal';
import UserDashboard from './UserDashboard.jsx';
import CreatorDashboard from './CreatorDashboard.jsx';
import './home-dashboard.css';
import axios from 'axios';

export default function Home() {
    const navigate = useNavigate();
    
    // Code editor states
    const [code, setCode] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('cpp');
    const [customInput, setCustomInput] = useState('');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState('');

    // AI Feature Modal state
    const [showAIModal, setShowAIModal] = useState(false);
    const [activeTab, setActiveTab] = useState('Input');
    const [problemDescription, setProblemDescription] = useState('');
    const [constraints, setConstraints] = useState('');
    
    // Authentication state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    // Check authentication status on component mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/me`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data) {
                        setIsAuthenticated(true);
                        setUser(result.data);
                    }
                }
            } catch (error) {
                console.error('Auth check error:', error);
            }
        };
        checkAuth();
    }, []);

    // Language options
    const languageOptions = [
        { 
            value: 'cpp', 
            label: 'C++',
            monacoLanguage: 'cpp',
            defaultCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n' 
        },
        { 
            value: 'java', 
            label: 'Java',
            monacoLanguage: 'java', 
            defaultCode: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n' 
        },
        { 
            value: 'py', 
            label: 'Python',
            monacoLanguage: 'python',
            defaultCode: 'print("Hello, World!")' 
        },
        { 
            value: 'c', 
            label: 'C',
            monacoLanguage: 'c',
            defaultCode: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}\n' 
        }
    ];

    // Initialize with default code
    useEffect(() => {
        setCode(getDefaultCode(selectedLanguage));
    }, [selectedLanguage]);

    const getDefaultCode = (language) => {
        const lang = languageOptions.find(l => l.value === language);
        return lang ? lang.defaultCode : '';
    };

    const getMonacoLanguage = (language) => {
        const lang = languageOptions.find(l => l.value === language);
        return lang ? lang.monacoLanguage : 'javascript';
    };

    const handleLanguageChange = (language) => {
        setSelectedLanguage(language);
        setCode(getDefaultCode(language));
        setOutput('');
    };
    const handleAIRequest = async () => {
        if (!problemDescription.trim() && selectedFeature!== 'Complexity') {
            window.showToast && window.showToast('Please provide a problem description', 'warning');
            return;
        }

        if (!selectedFeature) {
            window.showToast && window.showToast('Please select an AI feature first', 'warning');
            return;
        }

        if (!code.trim()) {
            window.showToast && window.showToast('Please write some code before requesting AI analysis', 'warning');
            return;
        }

        setIsRunning(true);
        setShowAIModal(true);
        // Modal will handle the API request
        try {
            const response = await fetch(`${import.meta.env.VITE_COMPILER_URL}/ai-feature`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    feature: selectedFeature,
                    code,
                    description: problemDescription,
                    constraints,
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

    const runCode = async () => {
        if (!code.trim()) {
            setOutput('Please write some code first!');
            return;
        }
        setActiveTab('Output');
        setIsRunning(true);
        setOutput('> Running code...');

        try {
            const response = await fetch(`${import.meta.env.VITE_COMPILER_URL}/run`, {
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

    const handleAIFeature = (feature) => {
        if (isAuthenticated) {
            setSelectedFeature(feature);
            setActiveTab('AI');
        }
    };

    const handleGetStarted = () => {
        if (isAuthenticated) {
            navigate('/dashboard');
        } else {
            navigate('/auth');
        }
    };

    const features = [
        {
            title: "Learn",
            description: "Master algorithms and data structures with curated problems and step-by-step solutions"
        },
        {
            title: "Code",
            description: "Practice with our powerful online compiler supporting multiple programming languages"
        },
        {
            title: "Crack",
            description: "Prepare for your dream job with interview-focused problems and AI-powered feedback"
        }
    ];

    function AllMessages() {
        const [messages, setMessages] = useState([]);
        useEffect(() => {
          axios.get('/api/v1/messages/all')
            .then(res => setMessages(Array.isArray(res.data) ? res.data : []))
            .catch(() => setMessages([]));
        }, []);
        return (
          <div className="my-8 p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">All Messages (Demo)</h2>
            <ul className="max-h-52 overflow-y-auto space-y-1 text-sm">
              {messages.map(msg => (
                <li key={msg._id} className="flex flex-wrap items-center gap-1">
                  <span className="font-medium">{msg.senderUsername || msg.senderEmail}</span>
                  <span>→</span>
                  <span className="font-medium">{msg.receiverUsername || msg.receiverEmail}:</span>
                  <span className="break-words">{msg.message}</span>
                  <span className="text-[10px] text-gray-500">({new Date(msg.timestamp).toLocaleString()})</span>
                </li>
              ))}
            </ul>
          </div>
        );
      }

    return (
        <div className="min-h-screen bg-white">
            {/* Header Dashboards & Messages */}
            <header className="w-full bg-gray-100 border-b border-gray-200 py-4 px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1 flex items-center gap-4">
                    {user?.role === 'user' && <UserDashboard user={user} />}
                    {user?.role === 'creator' && <CreatorDashboard user={user} />}
                </div>
                <div className="flex-1">
                    <AllMessages />
                </div>
            </header>
            {/* Hero Section */}
            <div className="relative pt-14 sm:pt-16 md:pt-20 pb-12 sm:pb-14 md:pb-16 overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"></div>
                <div className="absolute inset-0 backdrop-blur-sm"></div>
                <div className="absolute left-1/4 top-1/4 w-[300px] h-[300px] rounded-full bg-black opacity-5 blur-[100px]"></div>
                <div className="absolute right-1/4 bottom-1/4 w-[200px] h-[200px] rounded-full bg-gray-400 opacity-10 blur-[80px]"></div>

                <div className="relative container mx-auto px-6 text-center">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black mb-6">
                    Learn, Code, Teach, Repeat
                        <span className="block text-gray-700"> -Become a True Dev.</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        {/* Master coding interviews with our comprehensive platform. Practice problems, 
                        get AI-powered feedback, and build the skills top companies are looking for. */}
                        Earn knowledge by posting your doubts, gain confidence by coding, and earn money by teaching others — a community-driven platform where every learner grows into a true Dev.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={handleGetStarted}
                            className="px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                        >
                            {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
                        </button>
                        <button
                            onClick={() => document.getElementById('compiler').scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 bg-white text-black border-2 border-black rounded-lg hover:bg-gray-100 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            Try Compiler
                        </button>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-20 bg-gray-50/50 backdrop-blur-sm">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-bold text-black text-center mb-16">
                        Post to learn, teach to earn.
                    </h2>
                    <div className="dashboard-card-wrapper">
                        {user?.role === 'user' && <UserDashboard user={user} />}
                        {user?.role === 'creator' && <CreatorDashboard user={user} />}
                        {!user?.role && (
                            <div className="dashboard-card empty-dashboard">
                                <p className="text-center text-gray-500">No dashboard available for your role.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Online Compiler Section */}
            <div id="compiler" className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-black mb-4">
                            Try Our Online Compiler
                        </h2>
                        <p className="text-xl text-gray-600">
                            Write, run, and test your code instantly with AI-powered features
                        </p>
                    </div>

                    <div className="max-w-6xl mx-auto bg-white rounded-lg border-2 border-black shadow-xl backdrop-blur-lg">
                        {/* Compiler Header */}
                        <div className="bg-gray-50 px-6 py-4 border-b-2 border-gray-200 rounded-t-lg">  
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-4">
                                    <h3 className="text-lg font-semibold text-black">Code Editor</h3>   
                                    <select
                                        value={selectedLanguage}
                                        onChange={(e) => handleLanguageChange(e.target.value)}
                                        className="px-3 py-2 bg-white text-black border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                                    >
                                        {languageOptions.map((lang) => (
                                            <option key={lang.value} value={lang.value}>
                                                {lang.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {/* AI Feature Buttons - Show when NOT logged in */}
                                    {isAuthenticated && (
                                        <div className="flex space-x-2 mr-4">
                                            <button
                                                onClick={() => handleAIFeature('Hint')}
                                                className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-2 rounded-lg transition-colors text-sm"
                                            >
                                                Hint
                                            </button>
                                            <button
                                                onClick={() => handleAIFeature('Feedback')}
                                                className="bg-green-500 text-white hover:bg-green-600 px-3 py-2 rounded-lg transition-colors text-sm"
                                            >
                                                Feedback
                                            </button>
                                            <button
                                                onClick={() => handleAIFeature('Explain')}
                                                className="bg-purple-500 text-white hover:bg-purple-600 px-3 py-2 rounded-lg transition-colors text-sm"
                                            >
                                                Explain
                                            </button>
                                            <button
                                                onClick={() => handleAIFeature('Complexity')}
                                                className="bg-yellow-400 text-white hover:bg-yellow-500 px-3 py-2 rounded-lg transition-colors text-sm"
                                            >
                                                Complexity
                                            </button>
                                        </div>
                                    )}
                                    <button
                                        onClick={runCode}
                                        disabled={isRunning}
                                        className="bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2"
                                    >
                                        {isRunning ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1M9 16h1m4 0h1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )}
                                        {isRunning ? 'Running...' : 'Run Code'}
                                    </button>
                                </div>
                            </div>
                        </div>                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                            {/* Code Editor */}
                            <div className="space-y-4">
                                <div className="bg-gray-50 rounded-lg border-2 border-gray-300 overflow-hidden">
                                    <Editor
                                        height="61vh"
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
                                            lineNumbersMinChars: 10,
                                            scrollbar: {
                                                vertical: 'auto',
                                                horizontal: 'auto',
                                                verticalScrollbarSize: 8,
                                                horizontalScrollbarSize: 8
                                            }
                                        }}
                                    />
                                </div>

                                {/* Custom Input */}
                                {! isAuthenticated && (
                                    <div className="bg-white rounded-lg border-2 border-gray-300">
                                    <div className="bg-gray-50 px-4 py-2 border-b-2 border-gray-200 rounded-t-lg">
                                        <h4 className="text-sm font-semibold text-black">Input</h4>
                                    </div>
                                    <textarea
                                        value={customInput}
                                        onChange={(e) => setCustomInput(e.target.value)}
                                        placeholder="Enter input here..."
                                        className="w-full h-24 bg-white text-black border-0 rounded-b-lg p-3 focus:outline-none resize-none font-mono text-sm"
                                    />
                                </div>
                                    )}
                            </div>

                            {/* Output and AI Features */}
                            <div className="space-y-4">
                                {/* Tab Headers - Show when NOT logged in */}
                                {isAuthenticated && (
                                    <div className="flex border-b-2 border-gray-200">
                                        <button
                                            onClick={() => setActiveTab('Input')}
                                            className={`px-4 py-2 font-medium ${
                                                activeTab === 'Input'
                                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                                    : 'text-gray-600 hover:text-gray-800'
                                            }`}
                                        >
                                            Input
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('Output')}
                                            className={`px-4 py-2 font-medium ${
                                                activeTab === 'Output'
                                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                                    : 'text-gray-600 hover:text-gray-800'
                                            }`}
                                        >
                                            Output
                                        </button>
                                    </div>
                                )}

                                {/* Content based on authentication and active tab */}
                                {isAuthenticated ? (
                                    <div className="space-y-4">
                                        {activeTab === 'Input' && (
                                            <div className="bg-white rounded-lg border-2 border-gray-300">
                                                <div className="bg-gray-50 px-4 py-2 border-b-2 border-gray-200 rounded-t-lg">
                                                    <h4 className="text-sm font-semibold text-black">Input</h4>
                                                </div>
                                                <div className="min-h-[150px]">
                                                    <textarea
                                                        value={customInput}
                                                        onChange={(e) => setCustomInput(e.target.value)}
                                                        placeholder="Enter input here..."
                                                        className="w-full h-24 bg-white text-black border-0 rounded-b-lg p-3 focus:outline-none resize-none font-mono text-sm"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'AI' && selectedFeature !== 'Complexity' && (
                                            <>
                                                
                                                {/* Problem Description */}
                                                <div className="bg-white rounded-lg border-2 border-gray-300">
                                                    <div className="bg-gray-50 px-4 py-2 border-b-2 border-gray-200 rounded-t-lg">
                                                        <h4 className="text-sm font-semibold text-black">Problem Description</h4>
                                                    </div>
                                                    <textarea
                                                        value={problemDescription}
                                                        onChange={(e) => setProblemDescription(e.target.value)}
                                                        placeholder="Describe the problem and what needs to be solved..."
                                                        className="w-full h-32 bg-white text-black border-0 rounded-b-lg p-3 focus:outline-none resize-none text-sm"
                                                    />
                                                </div>

                                                {/* Constraints */}
                                                <div className="bg-white rounded-lg border-2 border-gray-300">
                                                    <div className="bg-gray-50 px-4 py-2 border-b-2 border-gray-200 rounded-t-lg">
                                                        <h4 className="text-sm font-semibold text-black">Constraints</h4>
                                                    </div>
                                                    <textarea
                                                        value={constraints}
                                                        onChange={(e) => setConstraints(e.target.value)}
                                                        placeholder="e.g., 1 ≤ nums.length ≤ 10⁴"
                                                        className="w-full h-24 bg-white text-black border-0 rounded-b-lg p-3 focus:outline-none resize-none text-sm"
                                                    />
                                                </div>
                                                {/* I want color according to the selectedFeature */}
                                            </>
                                        )}
                                        {activeTab=== 'AI' && (
                                               <button
                                                    onClick={handleAIRequest}
                                                    className={`mt-2 w-full py-2 rounded-lg hover:bg-black ${
                                                        selectedFeature === 'Hint'
                                                            ? 'bg-blue-500 text-white'
                                                            : selectedFeature === 'Feedback'
                                                            ? 'bg-green-500 text-white'
                                                            : selectedFeature === 'Explain'
                                                            ? 'bg-purple-500 text-white'
                                                            : selectedFeature === 'Complexity'
                                                            ? 'bg-yellow-500 text-white'
                                                            : 'bg-gray-300 text-gray-700'

                                                    }`}
                                                >
                                                    Get {selectedFeature}
                                                </button>
                                        )} 

                                        {activeTab === 'Output' && (
                                            <div className="bg-white rounded-lg border-2 border-gray-300">
                                                <div className="bg-gray-50 px-4 py-2 border-b-2 border-gray-200 rounded-t-lg">
                                                    <h4 className="text-sm font-semibold text-black">Output</h4>
                                                </div>
                                                <div className="p-4 min-h-[150px]">
                                                    <pre className={`font-mono text-sm whitespace-pre-wrap ${
                                                        output.includes('Error') ? 'text-red-600' : 'text-black'
                                                    }`}>
                                                        {output || '> Run your code to see the output here...'}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* UnAuthenticated users see simplified output-only layout */
                                    <div className="bg-white rounded-lg border-2 border-gray-300">
                                        <div className="bg-gray-50 px-4 py-2 border-b-2 border-gray-200 rounded-t-lg">
                                            <h4 className="text-sm font-semibold text-black">Output</h4>
                                        </div>
                                        <div className="p-4 min-h-[150px]">
                                            <pre className={`font-mono text-sm whitespace-pre-wrap ${
                                                output.includes('Error') ? 'text-red-600' : 'text-black'
                                            }`}>
                                                {output || '> Run your code to see the output here...'}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                {/* AI Features - Show only when NOT logged in */}
                                {!isAuthenticated && (
                                    <div className="bg-white rounded-lg border-2 border-gray-300">
                                        <div className="bg-gray-50 px-4 py-2 border-b-2 border-gray-200 rounded-t-lg">
                                            <h4 className="text-sm font-semibold text-black">AI Features</h4>
                                        </div>
                                        <div className="p-4 grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => setShowLoginModal(true)}
                                                className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium border border-blue-300"
                                            >
                                                Hint
                                            </button>
                                            <button
                                                onClick={() => setShowLoginModal(true)}
                                                className="px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium border border-green-300"
                                            >
                                                Feedback
                                            </button>
                                            <button
                                                onClick={() => setShowLoginModal(true)}
                                                className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium border border-purple-300"
                                            >
                                                Explain
                                            </button>
                                            <button
                                                onClick={() => setShowLoginModal(true)}
                                                className="px-3 py-2 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium border border-orange-300"
                                            >
                                                ⚡ Complexity
                                            </button>
                                        </div>
                                        <div className="px-4 pb-4">
                                            <p className="text-xs text-gray-500">
                                                Click any AI feature to Enter and access advanced Quests-solving assistance
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Section - For Demo/Testing */}
            <AllMessages />
            {/* CTA Section */}
            {/* <div className="py-20 bg-black text-white relative overflow-hidden">
                <div className="absolute inset-0 backdrop-blur-sm"></div>
                <div className="absolute left-1/4 top-1/4 w-[200px] h-[200px] rounded-full bg-white opacity-5 blur-[80px]"></div>
                <div className="absolute right-1/4 bottom-1/4 w-[150px] h-[150px] rounded-full bg-gray-400 opacity-10 blur-[60px]"></div>
                
                <div className="relative container mx-auto px-6 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
                    <p className="text-lg sm:text-xl text-gray-300 mb-8">
                        {isAuthenticated 
                            ? `Welcome back, ${user?.fullName || 'User'}! Continue your coding journey.`
                            : 'Join thousands of developers who have cracked their dream jobs'
                        }
                    </p>
                    <button
                        onClick={handleGetStarted}
                        className="px-8 py-4 bg-white text-black rounded-lg hover:bg-gray-100 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        {isAuthenticated ? 'Continue to Dashboard' : 'Get Started Today'}
                    </button>
                </div>
            </div> */}
            <div className="py-12 bg-black text-white relative overflow-hidden">
            <div className="absolute inset-0 backdrop-blur-sm"></div>
            <div className="absolute left-1/4 top-1/4 w-[200px] h-[200px] rounded-full bg-white opacity-5 blur-[80px]"></div>
            <div className="absolute right-1/4 bottom-1/4 w-[150px] h-[150px] rounded-full bg-gray-400 opacity-10 blur-[60px]"></div>

            <div className="relative container mx-auto px-6 text-center">
                {/* Footer Navigation */}
                <nav className="flex flex-wrap justify-center gap-8 mb-6 text-gray-300">
                <a href="/" className="hover:text-white transition-colors">Home</a>
                <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
                <a href="/careers" className="hover:text-white transition-colors">Careers</a>
                <a href="/about" className="hover:text-white transition-colors">About</a>
                <a href="/contact" className="hover:text-white transition-colors">Contact</a>
                </nav>

                {/* Footer Branding / Message */}
                <p className="text-sm text-gray-400">
                © {new Date().getFullYear()} DevPlatform. All rights reserved.
                </p>
            </div>
            </div>

            {/* Login Modal */}
            {showLoginModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 border-2 border-black shadow-xl">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-gray-300">
                                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-black mb-2">Login Required</h3>
                            <p className="text-gray-600 mb-6">
                                You need to sign in to access {selectedFeature} feature and other AI-powered tools.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => {
                                        setShowLoginModal(false);
                                        navigate('/auth');
                                    }}
                                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => setShowLoginModal(false)}
                                    className="px-4 py-2 bg-white text-black border-2 border-black rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        {/* AI Feature Modal */}
        <AIFeatureModal
            isOpen={showAIModal}
            onClose={() => setShowAIModal(false)}
            feature={selectedFeature}
            code={code}
            language={selectedLanguage}
            problemDescription={problemDescription}
            constraints={constraints}
        />
    </div>
    );
}
