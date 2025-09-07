import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileAvatar from '../components/ProfileAvatar';
import ProfileStats from '../components/ProfileStats';
import CodingActivity from '../components/CodingActivity';
import { handleError, handleSuccess } from '../utils';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserProfile();
        fetchUserSubmissions();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            

            // Always fetch fresh data from backend
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/profile`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setUser(result.data);
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            handleError('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserSubmissions = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/submissions?limit=365`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setSubmissions(result.data.submissions || []);
                }
            }
        } catch (error) {
            console.error('Error fetching user submissions:', error);
        }
    };

    const getUserInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getGenderDisplay = (gender) => {
        const genderMap = {
            'M': 'Male',
            'F': 'Female',
            'O': 'Other',
            'N': 'Not specified'
        };
        return genderMap[gender] || 'Not specified';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="text-black font-medium">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-black mb-4">Profile not found</h2>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
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
                {/* Profile Header */}
                <div className="bg-white rounded-lg p-8 mb-8 border-2 border-black shadow-xl backdrop-blur-lg">
                    <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                        {/* Avatar Section */}
                        <div className="relative">
                            <ProfileAvatar 
                                src={user.avatar}
                                alt={user.fullName}
                                size="lg"
                                fallback={getUserInitials(user.fullName)}
                                editable={false}
                            />
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div>
                                <h1 className="text-4xl font-bold text-black mb-3">{user.fullName}</h1>
                                <p className="text-xl text-gray-700 mb-3">@{user.username}</p>
                                <p className="text-gray-600">{user.email}</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => navigate('/edit-profile')}
                                    className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                >
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Personal Information */}
                    <div className="bg-white rounded-lg p-8 border-2 border-black shadow-xl backdrop-blur-lg">
                        <h2 className="text-2xl font-bold text-black mb-6 border-b-2 border-gray-200 pb-2">Personal Information</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-black mb-2">Email</label>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">{user.email}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">Gender</label>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">{getGenderDisplay(user.gender)}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">Location</label>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">{user.location || 'Not specified'}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">Website</label>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    {user.website ? (
                                        <a 
                                            href={user.website} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-black hover:text-gray-600 underline font-medium"
                                        >
                                            {user.website}
                                        </a>
                                    ) : (
                                        'Not specified'
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="bg-white rounded-lg p-8 border-2 border-black shadow-xl backdrop-blur-lg">
                        <h2 className="text-2xl font-bold text-black mb-6 border-b-2 border-gray-200 pb-2">Statistics</h2>
                        <ProfileStats userId={user._id} />
                    </div>
                </div>

                {/* Coding Activity Section */}
                <div className="mb-8">
                    <CodingActivity submissions={submissions} />
                </div>

                {/* Account Information */}
                <div className="bg-white rounded-lg p-8 border-2 border-black shadow-xl backdrop-blur-lg">
                    <h2 className="text-2xl font-bold text-black mb-6 border-b-2 border-gray-200 pb-2">Account Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-black mb-2">Account Type</label>
                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 capitalize">{user.accType?.toLowerCase()}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-black mb-2">Member Since</label>
                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                {new Date(user.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
