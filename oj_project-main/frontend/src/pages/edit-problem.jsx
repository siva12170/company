import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const EditProblem = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'Easy',
        timeLimit: 1000,
        memoryLimit: 256,
        tags: []
    });
    const [testcases, setTestcases] = useState([{ input: '', output: '', visible: true }]);

    // Load problem data
    useEffect(() => {
        // Check user role
        if (!user) {
            navigate('/auth');
            return;
        }
        
        if (user?.accType !== 'Problemsetter' && user?.accType !== 'Admin') {
            window.showToast && window.showToast('Access denied. Only Problemsetters and Admins can edit problems.', 'error');
            navigate('/dashboard');
            return;
        }

        const fetchProblem = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/problems/${id}`, {
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    const problem = data.data;
                    
                    setFormData({
                        title: problem.title,
                        description: problem.description,
                        difficulty: problem.difficulty,
                        timeLimit: problem.timeLimit,
                        memoryLimit: problem.memoryLimit,
                        tags: problem.tags || []
                    });

                    if (problem.testcases && problem.testcases.length > 0) {
                        setTestcases(problem.testcases);
                    }
                } else {
                    console.error('Failed to fetch problem');
                    navigate('/my-problems');
                }
            } catch (error) {
                console.error('Error fetching problem:', error);
                navigate('/my-problems');
            } finally {
                setLoading(false);
            }
        };

        fetchProblem();
    }, [id, navigate, user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'tags') {
            setFormData(prev => ({
                ...prev,
                tags: value.split(',').map(tag => tag.trim()).filter(tag => tag)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleTestcaseChange = (index, field, value) => {
        const updatedTestcases = testcases.map((testcase, i) => 
            i === index ? { ...testcase, [field]: value } : testcase
        );
        setTestcases(updatedTestcases);
    };

    const addTestcase = () => {
        setTestcases([...testcases, { input: '', output: '', visible: false }]);
    };

    const removeTestcase = (index) => {
        if (testcases.length > 1) {
            setTestcases(testcases.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.description || testcases.length === 0) {
            window.showToast && window.showToast('Please fill in all required fields and add at least one test case.', 'warning');
            return;
        }

        if (testcases.some(tc => !tc.input.trim() || !tc.output.trim())) {
            window.showToast && window.showToast('Please fill in all test case inputs and outputs.', 'warning');
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/problems/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    ...formData,
                    testcases
                })
            });

            if (response.ok) {
                window.showToast && window.showToast('Problem updated successfully!', 'success');
                navigate('/my-problems');
            } else {
                const errorData = await response.json();
                window.showToast && window.showToast(errorData.message || 'Failed to update problem', 'error');
            }
        } catch (error) {
            console.error('Error updating problem:', error);
            window.showToast && window.showToast('Failed to update problem', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Loading state
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

    // Access control
    if (user && user.accType !== 'Problemsetter' && user.accType !== 'Admin') {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center pt-20 relative overflow-hidden">
                {/* Background with blur effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"></div>
                <div className="absolute inset-0 backdrop-blur-sm"></div>
                <div className="absolute left-1/4 top-1/4 w-[200px] h-[200px] rounded-full bg-black opacity-5 blur-[80px]"></div>
                <div className="absolute right-1/4 bottom-1/4 w-[150px] h-[150px] rounded-full bg-gray-400 opacity-10 blur-[60px]"></div>
                
                <div className="relative text-center">
                    <h2 className="text-2xl font-bold text-black mb-4">Access Denied</h2>
                    <p className="text-gray-600 mb-6">Only Problemsetters and Admins can edit problems.</p>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300"
                    >
                        Go to Dashboard
                    </button>
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
            
            <div className="relative container mx-auto px-6 max-w-4xl">
                {/* Header */}
                <div className="bg-white rounded-lg p-8 mb-8 border-2 border-black shadow-xl backdrop-blur-lg">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-black mb-2">Edit Problem</h1>
                            <p className="text-gray-600">Update your coding challenge</p>
                        </div>
                        <button
                            onClick={() => navigate('/my-problems')}
                            className="px-6 py-3 bg-gray-200 text-black border-2 border-gray-300 hover:bg-gray-300 rounded-lg transition-all duration-300 font-medium"
                        >
                            Back to My Problems
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 border-2 border-black shadow-xl backdrop-blur-lg">
                    <div className="space-y-8">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="lg:col-span-2">
                                <label className="block text-sm font-medium text-black mb-2">
                                    Problem Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter problem title"
                                    className="w-full px-4 py-3 bg-gray-50 text-black rounded-lg border-2 border-gray-200 focus:border-black focus:outline-none transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Difficulty *
                                </label>
                                <select
                                    name="difficulty"
                                    value={formData.difficulty}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-50 text-black rounded-lg border-2 border-gray-200 focus:border-black focus:outline-none transition-colors"
                                    required
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                    <option value="Extreme">Extreme</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Time Limit (ms) *
                                </label>
                                <input
                                    type="number"
                                    name="timeLimit"
                                    value={formData.timeLimit}
                                    onChange={handleInputChange}
                                    min="100"
                                    max="10000"
                                    className="w-full px-4 py-3 bg-gray-50 text-black rounded-lg border-2 border-gray-200 focus:border-black focus:outline-none transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Memory Limit (MB) *
                                </label>
                                <input
                                    type="number"
                                    name="memoryLimit"
                                    value={formData.memoryLimit}
                                    onChange={handleInputChange}
                                    min="1"
                                    max="1024"
                                    className="w-full px-4 py-3 bg-gray-50 text-black rounded-lg border-2 border-gray-200 focus:border-black focus:outline-none transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Tags (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags.join(', ')}
                                    onChange={handleInputChange}
                                    placeholder="e.g., array, sorting, dynamic programming"
                                    className="w-full px-4 py-3 bg-gray-50 text-black rounded-lg border-2 border-gray-200 focus:border-black focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-black mb-2">
                                Problem Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="12"
                                placeholder="Enter the problem description including constraints, input format, output format, and examples..."
                                className="w-full px-4 py-3 bg-gray-50 text-black rounded-lg border-2 border-gray-200 focus:border-black focus:outline-none transition-colors resize-vertical"
                                required
                            />
                        </div>

                        {/* Test Cases */}
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-black">Test Cases *</h3>
                                <button
                                    type="button"
                                    onClick={addTestcase}
                                    className="px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-lg transition-all duration-300 font-medium"
                                >
                                    Add Test Case
                                </button>
                            </div>

                            <div className="space-y-6">
                                {testcases.map((testcase, index) => (
                                    <div key={index} className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-semibold text-black">Test Case {index + 1}</h4>
                                            <div className="flex items-center space-x-3">
                                                <label className="flex items-center text-sm text-gray-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={testcase.visible}
                                                        onChange={(e) => handleTestcaseChange(index, 'visible', e.target.checked)}
                                                        className="mr-2 h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                                                    />
                                                    Make visible to users
                                                </label>
                                                {index > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTestcase(index)}
                                                        className="text-red-600 hover:text-red-800 px-2 py-1 rounded transition-colors"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Input
                                                </label>
                                                <textarea
                                                    value={testcase.input}
                                                    onChange={(e) => handleTestcaseChange(index, 'input', e.target.value)}
                                                    rows="4"
                                                    placeholder="Enter test input..."
                                                    className="w-full px-3 py-2 bg-white text-black rounded border-2 border-gray-200 focus:border-black focus:outline-none transition-colors text-sm font-mono"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Expected Output
                                                </label>
                                                <textarea
                                                    value={testcase.output}
                                                    onChange={(e) => handleTestcaseChange(index, 'output', e.target.value)}
                                                    rows="4"
                                                    placeholder="Enter expected output..."
                                                    className="w-full px-3 py-2 bg-white text-black rounded border-2 border-gray-200 focus:border-black focus:outline-none transition-colors text-sm font-mono"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                {saving ? 'Updating Problem...' : 'Update Problem'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/my-problems')}
                                disabled={saving}
                                className="flex-1 px-8 py-3 bg-white text-black border-2 border-black rounded-lg hover:bg-gray-100 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProblem;
