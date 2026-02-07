import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Button, Card, Spinner } from './UI';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    if (!supabase) {
        return (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <Card className="w-full max-w-md p-8 bg-dark-800 border-red-900/50">
                    <h2 className="text-xl font-bold text-red-400 mb-2">Configuration Error</h2>
                    <p className="text-gray-300 mb-6">
                        Supabase credentials not found. Saving functionality is currently disabled in this environment.
                    </p>
                    <Button onClick={onClose} variant="secondary" className="w-full">Close</Button>
                </Card>
             </div>
        )
    }

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: authError } = isLogin 
                ? await supabase.auth.signInWithPassword({ email, password })
                : await supabase.auth.signUp({ email, password });

            if (authError) throw authError;

            // If signup, standard Supabase requires email confirmation by default, 
            // but for this demo we assume immediate success or handle user session check
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "An error occurred during authentication.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md p-8 bg-dark-800 shadow-2xl shadow-black">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {isLogin ? 'Sign in to save your creative campaigns.' : 'Sign up to start saving your brand assets.'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Email</label>
                        <input 
                            type="email" 
                            required
                            className="w-full bg-dark-900 border border-dark-600 rounded-lg p-3 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Password</label>
                        <input 
                            type="password" 
                            required
                            minLength={6}
                            className="w-full bg-dark-900 border border-dark-600 rounded-lg p-3 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-900/30 border border-red-900 rounded text-red-200 text-xs">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Spinner size="sm" /> : (isLogin ? 'Sign In' : 'Create Account')}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <button 
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-gray-400 hover:text-brand-400 transition-colors"
                    >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>
                 
                 <div className="mt-4 pt-4 border-t border-dark-700 text-center">
                    <button onClick={onClose} className="text-xs text-gray-500 hover:text-gray-300">Cancel</button>
                 </div>
            </Card>
        </div>
    );
};
