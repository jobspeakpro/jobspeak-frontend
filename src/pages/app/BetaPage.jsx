import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AvatarDropdown from '../../components/AvatarDropdown.jsx';

export default function BetaPage() {
    const navigate = useNavigate();
    const [features, setFeatures] = useState([]);
    const [newIdeaTitle, setNewIdeaTitle] = useState('');
    const [newIdeaDesc, setNewIdeaDesc] = useState('');
    const [hasVoted, setHasVoted] = useState({});

    useEffect(() => {
        // Load features from localStorage
        const saved = localStorage.getItem('beta_features_v1');
        const savedVotes = localStorage.getItem('beta_user_votes');

        if (saved) {
            setFeatures(JSON.parse(saved));
        }
        if (savedVotes) {
            setHasVoted(JSON.parse(savedVotes));
        }
    }, []);

    useEffect(() => {
        if (features.length > 0) {
            localStorage.setItem('beta_features_v1', JSON.stringify(features));
        }
    }, [features]);

    useEffect(() => {
        localStorage.setItem('beta_user_votes', JSON.stringify(hasVoted));
    }, [hasVoted]);

    const handleVote = (id, type) => {
        const currentVote = hasVoted[id];
        let voteChange = 0;

        if (currentVote === type) {
            voteChange = type === 'up' ? -1 : 1;
            setHasVoted(prev => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
        } else {
            if (currentVote === 'up') voteChange = -1;
            if (currentVote === 'down') voteChange = 1;
            voteChange += (type === 'up' ? 1 : -1);
            setHasVoted(prev => ({ ...prev, [id]: type }));
        }

        setFeatures(prev => prev.map(f =>
            f.id === id ? { ...f, upvotes: (f.upvotes || 0) + voteChange } : f
        ));
    };

    const handleSubmitIdea = () => {
        if (!newIdeaTitle.trim()) return;

        const newFeature = {
            id: Date.now(),
            title: newIdeaTitle,
            desc: newIdeaDesc,
            upvotes: 1,
            downvotes: 0,
            createdAt: new Date().toISOString()
        };

        setFeatures(prev => [newFeature, ...prev]);
        setHasVoted(prev => ({ ...prev, [newFeature.id]: 'up' }));
        setNewIdeaTitle('');
        setNewIdeaDesc('');
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-[#111418] dark:text-white font-display antialiased min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full bg-white dark:bg-[#1A222C] border-b border-[#f0f2f4] dark:border-gray-800">
                <div className="px-4 sm:px-10 py-3 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-4 text-[#111418] dark:text-white hover:opacity-80 transition-opacity">
                        <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">graphic_eq</span>
                        </div>
                        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">JobSpeak Pro</h2>
                    </Link>
                    <div className="flex flex-1 justify-end gap-8 items-center">
                        <nav className="hidden md:flex items-center gap-9">
                            <Link to="/dashboard" className="text-[#111418] dark:text-gray-200 text-sm font-medium hover:text-primary transition-colors">Dashboard</Link>
                            <Link to="/start" className="text-[#111418] dark:text-gray-200 text-sm font-medium hover:text-primary transition-colors">Practice</Link>
                            <Link to="/beta" className="text-primary text-sm font-medium">Beta</Link>
                            <Link to="/profile" className="text-[#111418] dark:text-gray-200 text-sm font-medium hover:text-primary transition-colors">Profile</Link>
                        </nav>
                        <AvatarDropdown />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-[#111418] dark:text-white mb-2">Feature Requests</h1>
                    <p className="text-[#617289] dark:text-gray-400 text-base">Vote on what we should build next.</p>
                </div>

                {/* Empty State or Feature List */}
                {features.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6 bg-white dark:bg-[#1A222C] rounded-xl border border-[#dbe0e6] dark:border-gray-800 shadow-sm text-center">
                        <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
                            <span className="material-symbols-outlined text-4xl">lightbulb</span>
                        </div>
                        <h2 className="text-2xl font-bold text-[#111418] dark:text-white mb-2">No feature requests yet</h2>
                        <p className="text-[#617289] dark:text-gray-400 text-base max-w-md mb-6">
                            Be the first to suggest a feature and vote on what we should build next.
                        </p>
                        <button
                            onClick={() => document.getElementById('idea-title')?.focus()}
                            className="px-6 py-3 bg-primary hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-md transition-colors"
                        >
                            Suggest a Feature
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 mb-8">
                        {features.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)).map(feature => (
                            <div key={feature.id} className="flex items-start gap-4 p-6 bg-white dark:bg-[#1A222C] rounded-xl border border-[#dbe0e6] dark:border-gray-800 shadow-sm">
                                <div className="flex flex-col items-center gap-2">
                                    <button
                                        onClick={() => handleVote(feature.id, 'up')}
                                        className={`flex items-center justify-center size-8 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${hasVoted[feature.id] === 'up' ? 'text-primary' : 'text-slate-400'}`}
                                    >
                                        <span className="material-symbols-outlined text-lg">thumb_up</span>
                                    </button>
                                    <span className="font-bold text-base text-[#111418] dark:text-white">{feature.upvotes || 0}</span>
                                    <button
                                        onClick={() => handleVote(feature.id, 'down')}
                                        className={`flex items-center justify-center size-8 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${hasVoted[feature.id] === 'down' ? 'text-red-500' : 'text-slate-400'}`}
                                    >
                                        <span className="material-symbols-outlined text-lg">thumb_down</span>
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-1">{feature.title}</h3>
                                    <p className="text-[#617289] dark:text-gray-400 text-sm">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Submit Idea Form */}
                <div className="bg-white dark:bg-[#1A222C] rounded-xl border border-[#dbe0e6] dark:border-gray-800 p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-[#111418] dark:text-white mb-2">Have an idea?</h2>
                    <p className="text-[#617289] dark:text-gray-400 text-sm mb-6">Submit a feature request and let others vote on it.</p>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-[#111418] dark:text-white mb-1.5 block">Feature Title</label>
                            <input
                                id="idea-title"
                                value={newIdeaTitle}
                                onChange={(e) => setNewIdeaTitle(e.target.value)}
                                className="w-full rounded-lg border border-[#dbe0e6] dark:border-gray-700 bg-white dark:bg-slate-800 p-3 text-sm text-[#111418] dark:text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                placeholder="e.g., Dark Mode for Dashboard"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-[#111418] dark:text-white mb-1.5 block">Description</label>
                            <textarea
                                value={newIdeaDesc}
                                onChange={(e) => setNewIdeaDesc(e.target.value)}
                                className="w-full rounded-lg border border-[#dbe0e6] dark:border-gray-700 bg-white dark:bg-slate-800 p-3 text-sm text-[#111418] dark:text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                                placeholder="Explain what problem this feature solves..."
                                rows="3"
                            />
                        </div>
                        <button
                            onClick={handleSubmitIdea}
                            disabled={!newIdeaTitle.trim()}
                            className="px-5 py-3 bg-primary hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Submit Idea
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
