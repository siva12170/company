import React, { useState } from 'react';

export default function Contact() {
	const [form, setForm] = useState({ name: '', email: '', message: '' });

	return (
		<div className="container mx-auto px-6 py-10">
			<div className="bg-white border-2 border-black rounded-xl p-8 shadow-lg max-w-2xl mx-auto">
				<h2 className="text-3xl font-bold mb-4">Contact</h2>
				<p className="text-gray-700 leading-relaxed mb-6">
					Have a question or feedback? Send us a message and we’ll get back soon.
				</p>
				<form className="space-y-4">
					<div>
						<label className="block text-sm font-medium mb-1">Name</label>
						<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border-2 border-black rounded-md px-3 py-2" placeholder="Your name" />
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">Email</label>
						<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border-2 border-black rounded-md px-3 py-2" placeholder="you@example.com" />
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">Message</label>
						<textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full border-2 border-black rounded-md px-3 py-2" placeholder="How can we help?" />
					</div>
					<button type="button" className="px-4 py-2 border-2 border-black rounded-md hover:bg-gray-100 transition-colors">Send</button>
				</form>
			</div>
		</div>
	);
}


