import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KeyRound, X, AlertCircle, ArrowRight } from 'lucide-react';
import { getEventByCode, getAllEvents } from '../../lib/supabase';
import { EventModel } from '../../types';

interface EventAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventSelected: (event: EventModel) => void;
}

export function EventAccessModal({ isOpen, onClose, onEventSelected }: EventAccessModalProps) {
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableEvents, setAvailableEvents] = useState<EventModel[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      getAllEvents().then(setAvailableEvents);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const event = await getEventByCode(accessCode.trim());
      if (!event) {
        setError(`No event found with access code "${accessCode.toUpperCase()}".`);
        return;
      }
      onEventSelected(event);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error checking event access code.');
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
            className="w-full max-w-lg bg-[#111111] border border-[#242424] rounded-lg p-6 relative text-white"
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
                <KeyRound size={17} />
              </div>
              <div>
                <h3 className="text-lg font-serif font-normal tracking-tight text-white">Enter Event Code</h3>
                <p className="text-xs text-[#A1A1A1] font-sans">Unlock your workshop, hackathon, or training guide</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    placeholder="e.g. LINKEDIN"
                    className="flex-1 px-4 py-2.5 bg-[#0A0A0A] border border-[#242424] rounded-md text-white font-mono uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal placeholder-[#666666] focus:outline-none focus:border-white text-xs transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={loading || !accessCode.trim()}
                    className="px-5 py-2.5 rounded-md bg-[#FF5722] hover:bg-[#E64A19] text-white font-medium transition-colors disabled:opacity-40 flex items-center gap-1.5 text-xs"
                  >
                    <span>{loading ? 'Verifying...' : 'Join'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-[#161616] border border-[#FF5722]/50 rounded-md flex items-start gap-2 text-xs text-[#FF5722]">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </form>

            {availableEvents.length > 0 && (
              <div className="border-t border-[#242424] pt-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#666666] mb-3">
                  Available Published Events
                </p>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                  {availableEvents.map((evt) => (
                    <button
                      key={evt.id}
                      onClick={() => {
                        onEventSelected(evt);
                        onClose();
                      }}
                      className="w-full text-left p-3 rounded-md bg-[#0A0A0A] border border-[#242424] hover:border-[#404040] hover:bg-[#161616] transition-all flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-xs font-medium text-[#D4D4D4] group-hover:text-white">
                          {evt.title}
                        </div>
                        <div className="text-[11px] text-[#666666] font-mono mt-0.5 flex items-center gap-2">
                          <span>CODE:</span>
                          <span className="text-[#C5A059] font-semibold">{evt.accessCode}</span>
                          <span>&bull;</span>
                          <span className="capitalize text-[#A1A1A1]">{evt.status}</span>
                        </div>
                      </div>
                      <span className="text-xs text-[#666666] group-hover:text-white transition-colors">&rarr;</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
