import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileAvatar from '../components/ProfileAvatar';
import { handleError, handleSuccess } from '../utils';

const EditProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        gender: '',
        location: '',
        website: '',
        avatar: ''
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            
            // Fetch fresh data from backend
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
                    setFormData({
                        fullName: result.data.fullName || '',
                        username: result.data.username || '',
                        email: result.data.email || '',
                        gender: result.data.gender || 'N',
                        location: result.data.location || '',
                        website: result.data.website || '',
                        avatar: result.data.avatar || ''
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            handleError('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAvatarChange = (file) => {
        setAvatarFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setFormData(prev => ({
                    ...prev,
                    avatar: e.target.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.fullName.trim() || !formData.username.trim() || !formData.email.trim()) {
            handleError('Please fill in all required fields');
            return;
        }

        try {
            setSaving(true);
            
            const updateData = new FormData();
            updateData.append('fullName', formData.fullName);
            updateData.append('username', formData.username);
            updateData.append('email', formData.email);
            updateData.append('gender', formData.gender);
            updateData.append('location', formData.location);
            updateData.append('website', formData.website);
            
            if (avatarFile) {
                updateData.append('avatar', avatarFile);
            }

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/update-profile`, {
                method: 'PUT',
                credentials: 'include',
                body: updateData
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    // No localStorage update
                    handleSuccess('Profile updated successfully!');
                    setTimeout(() => {
                        navigate('/profile');
                    }, 1500);
                } else {
                    handleError(result.message || 'Failed to update profile');
                }
            } else {
                const errorResult = await response.json();
                handleError(errorResult.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            handleError('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const getUserInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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

    return (
        <div className="min-h-screen bg-white pt-20 pb-8 relative overflow-hidden">
            {/* Background with blur effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"></div>
            <div className="absolute inset-0 backdrop-blur-sm"></div>
            <div className="absolute left-1/4 top-1/4 w-[200px] h-[200px] rounded-full bg-black opacity-5 blur-[80px]"></div>
            <div className="absolute right-1/4 bottom-1/4 w-[150px] h-[150px] rounded-full bg-gray-400 opacity-10 blur-[60px]"></div>
            
            <div className="relative container mx-auto px-6 max-w-2xl">
                <div className="bg-white rounded-lg p-8 border-2 border-black shadow-xl backdrop-blur-lg">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-black">Edit Profile</h1>
                        <button
                            onClick={() => navigate('/profile')}
                            className="text-black hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center space-y-4">
                            <ProfileAvatar 
                                src={formData.avatar}
                                alt={formData.fullName}
                                size="xl"
                                fallback={getUserInitials(formData.fullName)}
                                editable={true}
                                onAvatarChange={handleAvatarChange}
                            />
                            <p className="text-sm text-gray-600">Click on avatar to change profile picture</p>
                        </div>

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-50 text-black rounded-lg border-2 border-gray-200 focus:border-black focus:outline-none transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Username *
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-50 text-black rounded-lg border-2 border-gray-200 focus:border-black focus:outline-none transition-colors"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-black mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-50 text-black rounded-lg border-2 border-gray-200 focus:border-black focus:outline-none transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Gender
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-50 text-black rounded-lg border-2 border-gray-200 focus:border-black focus:outline-none transition-colors"
                                >
                                    <option value="N">Not specified</option>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                    <option value="O">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="Your location"
                                    className="w-full px-4 py-3 bg-gray-50 text-black rounded-lg border-2 border-gray-200 focus:border-black focus:outline-none transition-colors"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-black mb-2">
                                    Website
                                </label>
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleInputChange}
                                    placeholder="https://your-website.com"
                                    className="w-full px-4 py-3 bg-gray-50 text-black rounded-lg border-2 border-gray-200 focus:border-black focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                {saving ? 'Saving Changes...' : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                disabled={saving}
                                className="flex-1 px-8 py-3 bg-white text-black border-2 border-black rounded-lg hover:bg-gray-100 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;
