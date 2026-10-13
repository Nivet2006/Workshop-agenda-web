import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserCheck, X, AlertCircle, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { signInUser } from '../../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'participant' | 'organizer'>('participant');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || displayName.trim().length < 2) {
      setError('Please provide your name (minimum 2 characters).');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { error: err } = await signInUser(displayName.trim(), email.trim() || undefined, role);
      if (err) throw err;
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md bg-[#111111] border border-[#242424] rounded-lg p-6 relative text-white"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-[#666666] hover:text-white p-1 rounded-md transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-md bg-[#161616] border border-[#242424] flex items-center justify-center text-[#C5A059]">
                <UserCheck size={18} />
              </div>
              <div>
                <h3 className="text-lg font-serif font-normal tracking-tight text-white">Sign In to One Percent Club</h3>
                <p className="text-xs text-[#A1A1A1] font-sans">Save your progress, milestone checklists, and submissions</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-[#161616] border border-[#FF5722]/50 rounded-md flex items-start gap-2 text-xs text-[#FF5722]">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1A1] mb-1.5">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Rivers"
                  autoFocus
                  required
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-[#242424] rounded-md text-white placeholder-[#666666] focus:outline-none focus:border-white text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1A1] mb-1.5">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex@example.com"
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-[#242424] rounded-md text-white placeholder-[#666666] focus:outline-none focus:border-white text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1A1] mb-1.5">
                  Your Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('participant')}
                    className={`py-2 px-3 rounded-md border text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                      role === 'participant'
                        ? 'border-white bg-[#161616] text-white font-semibold'
                        : 'border-[#242424] bg-[#0A0A0A] text-[#A1A1A1] hover:border-[#404040]'
                    }`}
                  >
                    <User size={13} />
                    <span>Participant</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('organizer')}
                    className={`py-2 px-3 rounded-md border text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                      role === 'organizer'
                        ? 'border-white bg-[#161616] text-white font-semibold'
                        : 'border-[#242424] bg-[#0A0A0A] text-[#A1A1A1] hover:border-[#404040]'
                    }`}
                  >
                    <ShieldCheck size={13} />
                    <span>Organizer</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !displayName.trim()}
                className="w-full mt-2 py-2.5 px-4 rounded-md bg-[#FF5722] hover:bg-[#E64A19] text-white font-medium transition-colors disabled:opacity-40 flex items-center justify-center gap-2 text-xs"
              >
                <span>{loading ? 'Signing In...' : 'Continue'}</span>
                <ArrowRight size={14} />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
