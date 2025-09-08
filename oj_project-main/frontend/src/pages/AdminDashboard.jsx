import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
    Users, 
    BookOpen, 
    Trophy, 
    FileText, 
    BarChart3, 
    Settings,
    Calendar,
    TrendingUp,
    Clock,
    CheckCircle
} from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.accType === 'Admin') {
            fetchDashboardStats();
        }
    }, [user]);

    const fetchDashboardStats = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/dashboard/stats`, {
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'problems', label: 'Problems', icon: BookOpen },
        { id: 'contests', label: 'Contests', icon: Trophy },
        { id: 'settings', label: 'Settings', icon: Settings }
    ];

    if (user?.accType !== 'Admin') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
                    <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="text-gray-600 mt-1">Manage your online judge platform</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                                <p className="text-sm text-gray-500">Administrator</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                                <span className="text-white font-medium">
                                    {user?.fullName?.charAt(0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-64">
                        <nav className="space-y-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                                            activeTab === tab.id
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <Icon className="h-5 w-5 mr-3" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {activeTab === 'overview' && <OverviewTab stats={stats} />}
                        {activeTab === 'users' && <UsersTab />}
                        {activeTab === 'problems' && <ProblemsTab />}
                        {activeTab === 'contests' && <ContestsTab />}
                        {activeTab === 'settings' && <SettingsTab />}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Overview Tab Component
const OverviewTab = ({ stats }) => {
    if (!stats) return <div>Loading...</div>;

    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: Users,
            color: 'bg-blue-500',
            change: '+12%'
        },
        {
            title: 'Total Problems',
            value: stats.totalProblems,
            icon: BookOpen,
            color: 'bg-green-500',
            change: '+8%'
        },
        {
            title: 'Total Contests',
            value: stats.totalContests,
            icon: Trophy,
            color: 'bg-yellow-500',
            change: '+5%'
        },
        {
            title: 'Total Submissions',
            value: stats.totalSubmissions,
            icon: FileText,
            color: 'bg-purple-500',
            change: '+15%'
        }
    ];

    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className={`p-3 rounded-lg ${stat.color}`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                    <p className="text-sm text-green-600">{stat.change} from last month</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Users */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Recent Users</h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {stats.recentUsers?.map((user, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                        <span className="text-sm font-medium text-gray-700">
                                            {user.fullName?.charAt(0)}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                                        <p className="text-sm text-gray-500">@{user.username}</p>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Active Contests */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Active Contests</h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {stats.activeContests?.map((contest, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{contest.title}</p>
                                        <p className="text-sm text-gray-500">
                                            {contest.participants?.length || 0} participants
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-500">
                                            {new Date(contest.endTime).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Placeholder components for other tabs
const UsersTab = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [accType, setAccType] = useState('');
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [roleUser, setRoleUser] = useState(null);
    const [deleteUserState, setDeleteUserState] = useState(null);

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, accType]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ page: String(page), limit: '10' });
            if (search.trim()) params.append('search', search.trim());
            if (accType) params.append('accType', accType);
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/users?${params.toString()}`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setUsers(data.data.users);
                setTotalPages(data.data.pagination.totalPages);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const onSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                <button
                    onClick={() => setShowCreate(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Create User
                </button>
            </div>

            <form onSubmit={onSearch} className="flex flex-wrap gap-3 items-center mb-4">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search username, name, email"
                    className="flex-1 min-w-[220px] px-3 py-2 border border-gray-300 rounded-md"
                />
                <select
                    value={accType}
                    onChange={(e) => { setAccType(e.target.value); setPage(1); }}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                >
                    <option value="">All Roles</option>
                    <option value="User">User</option>
                    <option value="Problemsetter">Problemsetter</option>
                    <option value="Admin">Admin</option>
                </select>
                <button type="submit" className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Search</button>
            </form>

            {loading ? (
                <div className="py-12 text-center text-gray-600">Loading users...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((u) => {
                                const isSelf = user?._id === u._id;
                                return (
                                    <tr key={u._id}>
                                        <td className="px-4 py-2">
                                            <div className="text-sm font-medium text-gray-900">{u.fullName}</div>
                                            <div className="text-sm text-gray-500">@{u.username}</div>
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-900">{u.email}</td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                u.accType === 'Admin' ? 'bg-purple-100 text-purple-800' :
                                                u.accType === 'Problemsetter' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {u.accType}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    disabled={isSelf}
                                                    onClick={() => setEditUser(u)}
                                                    className={`px-3 py-1 border rounded-md text-sm ${isSelf ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    disabled={isSelf}
                                                    onClick={() => setRoleUser(u)}
                                                    className={`px-3 py-1 border rounded-md text-sm ${isSelf ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                                                >
                                                    Change Role
                                                </button>
                                                <button
                                                    disabled={isSelf || u.accType === 'Admin'}
                                                    onClick={() => setDeleteUserState(u)}
                                                    className={`px-3 py-1 border rounded-md text-sm text-red-700 ${isSelf || u.accType === 'Admin' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50 border-red-300'}`}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-4 flex justify-center gap-2">
                    <button disabled={page===1} onClick={() => setPage(p => Math.max(1, p-1))} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
                    <span className="px-3 py-1 text-sm text-gray-600">Page {page} of {totalPages}</span>
                    <button disabled={page===totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
                </div>
            )}

            {showCreate && (
                <UserCreateModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); fetchUsers(); }} />
            )}
            {editUser && (
                <UserEditModal userData={editUser} onClose={() => setEditUser(null)} onUpdated={() => { setEditUser(null); fetchUsers(); }} />
            )}
            {roleUser && (
                <UserRoleModal userData={roleUser} onClose={() => setRoleUser(null)} onUpdated={() => { setRoleUser(null); fetchUsers(); }} />
            )}
            {deleteUserState && (
                <UserDeleteModal userData={deleteUserState} onClose={() => setDeleteUserState(null)} onDeleted={() => { setDeleteUserState(null); fetchUsers(); }} />
            )}
        </div>
    );
};

const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-6">{children}</div>
        </div>
    </div>
);

const UserCreateModal = ({ onClose, onCreated }) => {
    const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '', accType: 'User' });
    const [submitting, setSubmitting] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (data.success) onCreated();
            else alert(data.message || 'Failed to create user');
        } catch (e) {
            alert('Failed to create user');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal title="Create User" onClose={onClose}>
            <form onSubmit={submit} className="space-y-3">
                <input className="w-full px-3 py-2 border rounded" placeholder="Full name" value={form.fullName} onChange={e=>setForm({...form, fullName:e.target.value})} required />
                <input className="w-full px-3 py-2 border rounded" placeholder="Username" value={form.username} onChange={e=>setForm({...form, username:e.target.value})} required />
                <input className="w-full px-3 py-2 border rounded" placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />
                <input className="w-full px-3 py-2 border rounded" placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required />
                <select className="w-full px-3 py-2 border rounded" value={form.accType} onChange={e=>setForm({...form, accType:e.target.value})}>
                    <option value="User">User</option>
                    <option value="Problemsetter">Problemsetter</option>
                    <option value="Admin">Admin</option>
                </select>
                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
                    <button disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded">{submitting? 'Creating...' : 'Create'}</button>
                </div>
            </form>
        </Modal>
    );
};

const UserEditModal = ({ userData, onClose, onUpdated }) => {
    const [form, setForm] = useState({ fullName: userData.fullName, username: userData.username, email: userData.email, accType: userData.accType });
    const [submitting, setSubmitting] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/users/${userData._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (data.success) onUpdated();
            else alert(data.message || 'Failed to update user');
        } catch (e) {
            alert('Failed to update user');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal title="Edit User" onClose={onClose}>
            <form onSubmit={submit} className="space-y-3">
                <input className="w-full px-3 py-2 border rounded" placeholder="Full name" value={form.fullName} onChange={e=>setForm({...form, fullName:e.target.value})} required />
                <input className="w-full px-3 py-2 border rounded" placeholder="Username" value={form.username} onChange={e=>setForm({...form, username:e.target.value})} required />
                <input className="w-full px-3 py-2 border rounded" placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />
                <div className="text-sm text-gray-500">Role can be changed via "Change Role" action.</div>
                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
                    <button disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded">{submitting? 'Saving...' : 'Save'}</button>
                </div>
            </form>
        </Modal>
    );
};

const UserRoleModal = ({ userData, onClose, onUpdated }) => {
    const [accType, setAccType] = useState(userData.accType);
    const [submitting, setSubmitting] = useState(false);
    const submit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/users/${userData._id}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ accType })
            });
            const data = await res.json();
            if (data.success) onUpdated();
            else alert(data.message || 'Failed to change role');
        } catch (e) {
            alert('Failed to change role');
        } finally {
            setSubmitting(false);
        }
    };
    return (
        <Modal title="Change Role" onClose={onClose}>
            <form onSubmit={submit} className="space-y-3">
                <div>
                    <div className="text-sm text-gray-700 mb-1">Select role for <span className="font-medium">@{userData.username}</span></div>
                    <select className="w-full px-3 py-2 border rounded" value={accType} onChange={e=>setAccType(e.target.value)}>
                        <option value="User">User</option>
                        <option value="Problemsetter">Problemsetter</option>
                        <option value="Admin">Admin</option>
                    </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
                    <button disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded">{submitting? 'Updating...' : 'Update'}</button>
                </div>
            </form>
        </Modal>
    );
};

const UserDeleteModal = ({ userData, onClose, onDeleted }) => {
    const [submitting, setSubmitting] = useState(false);
    const submit = async () => {
        setSubmitting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/users/${userData._id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) onDeleted();
            else alert(data.message || 'Failed to delete user');
        } catch (e) {
            alert('Failed to delete user');
        } finally {
            setSubmitting(false);
        }
    };
    return (
        <Modal title="Delete User" onClose={onClose}>
            <div className="space-y-4">
                <p className="text-gray-700">Are you sure you want to delete <span className="font-medium">@{userData.username}</span>? This action cannot be undone.</p>
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
                    <button disabled={submitting} onClick={submit} className="px-4 py-2 bg-red-600 text-white rounded">{submitting? 'Deleting...' : 'Delete'}</button>
                </div>
            </div>
        </Modal>
    );
};

const ProblemsTab = () => (
    <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Problem Management</h2>
        <p className="text-gray-600">Problem management interface will be implemented here.</p>
    </div>
);

const ContestsTab = () => {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Contest Management</h2>
                <a href="/admin/contests/create" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create Contest</a>
            </div>
            <p className="text-gray-600">Use the button above to create a new contest. Listing and editing can be added next.</p>
        </div>
    );
};

const SettingsTab = () => (
    <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Settings</h2>
        <p className="text-gray-600">System settings will be implemented here.</p>
    </div>
);

export default AdminDashboard;

