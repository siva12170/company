import React from 'react';

export default function Careers() {
	const roles = [
		{ title: 'Frontend Engineer', location: 'Remote', type: 'Full-time' },
		{ title: 'Backend Engineer', location: 'Remote', type: 'Full-time' },
		{ title: 'Developer Advocate', location: 'Remote', type: 'Contract' },
	];

	return (
		<div className="container mx-auto px-6 py-10">
			<div className="bg-white border-2 border-black rounded-xl p-8 shadow-lg">
				<h2 className="text-3xl font-bold mb-4">Careers</h2>
				<p className="text-gray-700 leading-relaxed mb-6">
					Join us to build a world-class problem solving platform. We value curiosity,
					ownership, and kindness.
				</p>
				<ul className="space-y-4">
					{roles.map((role) => (
						<li key={role.title} className="border border-black rounded-lg p-4 flex items-center justify-between">
							<div>
								<p className="font-semibold">{role.title}</p>
								<p className="text-sm text-gray-600">{role.location} • {role.type}</p>
							</div>
							<a href="mailto:careers@example.com?subject=Application:%20" className="px-4 py-2 border-2 border-black rounded-md hover:bg-gray-100 transition-colors">Apply</a>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}

