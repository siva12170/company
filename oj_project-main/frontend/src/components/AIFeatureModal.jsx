import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AIFeatureModal({ 
    isOpen, 
    onClose, 
    feature, 
    code, 
    language,
    problemDescription = '',
    constraints = ''
}) {
    const [aiResult, setAiResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Automatically trigger AI analysis when modal opens with valid data
    useEffect(() => {
        if (isOpen && problemDescription.trim()) {
            handleSubmit();
        }
    }, [isOpen, problemDescription]);

    const handleSubmit = async () => {
        if (!problemDescription.trim()) {
            window.showToast && window.showToast('Please provide a problem description', 'warning');
            return;
        }

        setIsLoading(true);
        setAiResult('');

        try {
            const response = await fetch(`${import.meta.env.VITE_COMPILER_URL}/ai-feature`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    feature,
                    code,
                    language,
                    problemDescription,
                    constraints
                }),
            });

            const result = await response.json();
            
            if (result.success) {
                setAiResult(result.result || result.analysis || 'Analysis completed successfully');
            } else {
                setAiResult(`Error: ${result.error || 'Analysis failed'}`);
            }
        } catch (error) {
            console.error('AI Feature error:', error);
            setAiResult('Error: Failed to get AI analysis. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setAiResult('');
        setIsLoading(false);
        onClose();
    };

    if (!isOpen) return null;




    const getFeatureTitle = () => {
        switch (feature) {
            case 'Hint': return 'AI Hint Generator';
            case 'Feedback': return 'AI Code Feedback';
            case 'Explain': return 'AI Code Explainer';
            case 'Complexity': return 'AI Complexity Analyzer';
            default: return 'AI Code Analysis';
        }
    };

    const getFeatureDescription = () => {
        switch (feature) {
            case 'Hint': return 'Get strategic guidance and hints for solving your problem';
            case 'Feedback': return 'Get feedback on your code quality, correctness, and improvements';
            case 'Explain': return 'Get detailed explanation of your code logic and algorithms';
            case 'Complexity': return 'Analyze the time and space complexity of your code';
            default: return 'Get AI-powered analysis of your code';
        }
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold">{getFeatureTitle()}</h2>
                            <p className="text-gray-300 mt-1">{getFeatureDescription()}</p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-gray-300 hover:text-white text-2xl"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {/* Single Column - Just AI Result */}
                    <div className="space-y-4">
                        <div>
                            <div className="border border-gray-300 rounded-lg p-6 min-h-[500px] bg-gray-50">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center h-full py-20">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                        <span className="text-gray-600 text-lg">Analyzing your code...</span>
                                        <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
                                    </div>
                                ) : aiResult ? (
                                    <div className="prose prose-lg max-w-none">
                                        <Markdown remarkPlugins={[remarkGfm]}>
                                            {aiResult}
                                        </Markdown>
                                    </div>
                                ) : (
                                    <div className="text-gray-500 text-center py-20">
                                        <div className="mb-4">
                                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                            <p className="text-lg font-medium text-gray-600">AI analysis will appear here</p>
                                            <p className="text-sm text-gray-400 mt-2">Analysis is automatically triggered when the modal opens</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
