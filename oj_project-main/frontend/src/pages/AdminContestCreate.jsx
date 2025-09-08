import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminContestCreate = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        isPublic: true,
        maxParticipants: ''
    });
    const [problems, setProblems] = useState([]);
    const [selectedProblems, setSelectedProblems] = useState([]); // {problemId, points}
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.accType !== 'Admin') navigate('/');
        fetchProblems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchProblems = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/problems?limit=100`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) setProblems(data.data.problems || []);
        } catch {}
    };

    const toggleProblem = (p) => {
        const exists = selectedProblems.find(sp => sp.problemId === p._id);
        if (exists) {
            setSelectedProblems(selectedProblems.filter(sp => sp.problemId !== p._id));
        } else {
            setSelectedProblems([...selectedProblems, { problemId: p._id, points: 100 }]);
        }
    };

    const updatePoints = (problemId, points) => {
        setSelectedProblems(selectedProblems.map(sp => sp.problemId === problemId ? { ...sp, points: Number(points) || 0 } : sp));
    };

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...form,
                maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : null,
                problems: selectedProblems.map((sp, idx) => ({ ...sp, order: idx }))
            };
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/contests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                navigate(`/contests/${data.data._id}`);
            } else {
                alert(data.message || 'Failed to create contest');
            }
        } catch (e) {
            alert('Failed to create contest');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Create Contest</h1>
            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <input className="w-full px-3 py-2 border rounded" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required />
                    <textarea className="w-full px-3 py-2 border rounded h-32" placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} required />
                    <label className="block text-sm text-gray-700">Start Time</label>
                    <input type="datetime-local" className="w-full px-3 py-2 border rounded" value={form.startTime} onChange={e=>setForm({...form, startTime:e.target.value})} required />
                    <label className="block text-sm text-gray-700">End Time</label>
                    <input type="datetime-local" className="w-full px-3 py-2 border rounded" value={form.endTime} onChange={e=>setForm({...form, endTime:e.target.value})} required />
                    <div className="flex items-center gap-2">
                        <input id="isPublic" type="checkbox" checked={form.isPublic} onChange={e=>setForm({...form, isPublic:e.target.checked})} />
                        <label htmlFor="isPublic" className="text-sm text-gray-700">Public contest</label>
                    </div>
                    <input className="w-full px-3 py-2 border rounded" placeholder="Max participants (optional)" value={form.maxParticipants} onChange={e=>setForm({...form, maxParticipants:e.target.value})} />
                    <div className="flex justify-end">
                        <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading? 'Creating...' : 'Create Contest'}</button>
                    </div>
                </div>
                <div>
                    <h2 className="text-lg font-medium mb-2">Select Problems</h2>
                    <div className="max-h-[480px] overflow-auto border rounded">
                        {problems.map(p => {
                            const selected = selectedProblems.find(sp => sp.problemId === p._id);
                            return (
                                <div key={p._id} className={`flex items-center justify-between px-3 py-2 border-b ${selected? 'bg-blue-50' : ''}`}>
                                    <div>
                                        <div className="font-medium">{p.title}</div>
                                        <div className="text-sm text-gray-600">{p.difficulty}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {selected && (
                                            <input type="number" className="w-24 px-2 py-1 border rounded" value={selected.points} onChange={e=>updatePoints(p._id, e.target.value)} />
                                        )}
                                        <button type="button" onClick={() => toggleProblem(p)} className="px-3 py-1 border rounded">
                                            {selected? 'Remove' : 'Add'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AdminContestCreate;


