import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserCheck, Check, X } from 'lucide-react';
import { updateUserProfile } from '../../lib/supabase';
import { UserProfile } from '../../types';

interface ProfileConfirmationModalProps {
  isOpen: boolean;
  profile: UserProfile | null;
  onConfirmed: (updatedName: string) => void;
}

export function ProfileConfirmationModal({ isOpen, profile, onConfirmed }: ProfileConfirmationModalProps) {
  const [displayName, setDisplayName] = useState(profile?.displayName || 'Participant');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || displayName.trim().length < 2) {
      setError('Please provide a display name with at least 2 characters.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      if (profile) {
        await updateUserProfile(profile.id, displayName.trim());
      }
      onConfirmed(displayName.trim());
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
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
            className="w-full max-w-md bg-[#111111] border border-[#242424] rounded-lg p-6 text-white relative"
          >
            <div className="w-9 h-9 rounded-md bg-[#161616] border border-[#242424] flex items-center justify-center text-[#C5A059] mb-4">
              <UserCheck size={18} />
            </div>

            <h3 className="text-lg font-serif font-normal tracking-tight text-white mb-1">
              Confirm Display Name
            </h3>
            <p className="text-xs text-[#A1A1A1] font-sans mb-6">
              This name will appear on the workshop leaderboard and your completion record.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1A1] mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Rivers"
                  maxLength={50}
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-[#242424] rounded-md text-white placeholder-[#666666] focus:outline-none focus:border-white text-xs transition-colors"
                />
              </div>

              {error && <p className="text-xs text-[#FF5722]">{error}</p>}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 px-4 rounded-md bg-[#FF5722] hover:bg-[#E64A19] text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
              >
                <Check size={15} />
                <span>{saving ? 'Saving...' : 'Confirm & Continue'}</span>
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
