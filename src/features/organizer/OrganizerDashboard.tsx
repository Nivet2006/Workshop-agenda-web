import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BarChart3, 
  Calendar, 
  Download, 
  Search, 
  Megaphone, 
  Play, 
  CheckCircle2, 
  Clock, 
  X,
  Radio,
  FileSpreadsheet
} from 'lucide-react';
import { EventModel, EventStep, UserProfile, EventMembership } from '../../types';
import { getAllEvents, getEventSteps, createOrUpdateEvent } from '../../lib/supabase';

interface OrganizerDashboardProps {
  currentEvent: EventModel;
  onSelectEvent: (event: EventModel) => void;
  onOpenBuilder: () => void;
  onLaunchLiveQuiz: () => void;
  onClose: () => void;
}

export function OrganizerDashboard({
  currentEvent,
  onSelectEvent,
  onOpenBuilder,
  onLaunchLiveQuiz,
  onClose
}: OrganizerDashboardProps) {
  const [allEvents, setAllEvents] = useState<EventModel[]>([]);
  const [steps, setSteps] = useState<EventStep[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [activeAnnouncement, setActiveAnnouncement] = useState<string | null>(null);
  const [currentLiveStepId, setCurrentLiveStepId] = useState<string>(currentEvent.currentStepId || '');

  const [participants, setParticipants] = useState<Array<{
    id: string;
    displayName: string;
    email: string;
    status: 'active' | 'completed';
    progressPercentage: number;
    lastActive: string;
  }>>([
    { id: '1', displayName: 'Alex Rivers', email: 'alex.rivers@example.com', status: 'completed', progressPercentage: 100, lastActive: '2m ago' },
    { id: '2', displayName: 'Maya Chen', email: 'maya.c@example.com', status: 'active', progressPercentage: 82, lastActive: '5m ago' },
    { id: '3', displayName: 'Rohan Sharma', email: 'rohan.s@example.com', status: 'active', progressPercentage: 91, lastActive: '1m ago' },
    { id: '4', displayName: 'Elena Rostova', email: 'elena.r@example.com', status: 'active', progressPercentage: 45, lastActive: '12m ago' },
    { id: '5', displayName: 'Devon Miles', email: 'devon.m@example.com', status: 'completed', progressPercentage: 100, lastActive: '8m ago' }
  ]);

  useEffect(() => {
    getAllEvents().then(setAllEvents);
    getEventSteps(currentEvent.id).then(setSteps);
  }, [currentEvent.id]);

  const handleExportCSV = () => {
    const headers = ['User ID', 'Display Name', 'Email', 'Status', 'Progress (%)', 'Last Active'];
    const rows = participants.map(p => [
      `"${p.id}"`,
      `"${p.displayName.replace(/"/g, '""')}"`,
      `"${p.email.replace(/"/g, '""')}"`,
      `"${p.status}"`,
      p.progressPercentage,
      `"${p.lastActive}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `eventflow_${currentEvent.slug}_participants.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    setActiveAnnouncement(announcementText.trim());
    setAnnouncementText('');
  };

  const handleSetLiveStep = async (stepId: string) => {
    setCurrentLiveStepId(stepId);
    await createOrUpdateEvent({ ...currentEvent, currentStepId: stepId });
  };

  const filteredParticipants = participants.filter(p =>
    p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const avgProgress = Math.round(
    participants.reduce((acc, p) => acc + p.progressPercentage, 0) / participants.length
  );

  return (
    <div className="flex-1 flex flex-col bg-[#0A0A0A] text-white overflow-hidden">
      {/* Top Header */}
      <header className="h-14 border-b border-[#242424] px-6 flex items-center justify-between bg-[#0A0A0A] shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-[#161616] text-[#14B8A6] border border-[#242424]">
            <BarChart3 size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-base text-white tracking-tight">Organizer Dashboard</h2>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-[3px] bg-[#111111] border border-[#242424] text-[#C5A059]">
                {currentEvent.accessCode}
              </span>
            </div>
            <p className="text-[11px] text-[#666666] font-mono">
              EVENT: <span className="text-[#A1A1A1]">{currentEvent.title}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onLaunchLiveQuiz}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#161616] hover:bg-[#222222] border border-[#242424] text-[#C5A059] text-xs font-mono transition-colors"
          >
            <Play size={13} />
            <span>Launch Arena</span>
          </button>

          <button
            onClick={onOpenBuilder}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-[#0A0A0A] hover:bg-[#E8E8E8] font-medium text-xs transition-colors"
          >
            <span>Edit Guide</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-[#666666] hover:text-white rounded-md hover:bg-[#111111] transition-colors"
            aria-label="Close Dashboard"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto w-full">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-md bg-[#111111] border border-[#242424]">
            <div className="flex justify-between items-start text-[#666666] mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider">TOTAL PARTICIPANTS</span>
              <Users size={14} />
            </div>
            <div className="text-3xl font-mono text-white">{participants.length}</div>
            <div className="text-[11px] text-[#14B8A6] font-mono mt-1">● 100% active this session</div>
          </div>

          <div className="p-5 rounded-md bg-[#111111] border border-[#242424]">
            <div className="flex justify-between items-start text-[#666666] mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider">AVERAGE PROGRESS</span>
              <BarChart3 size={14} />
            </div>
            <div className="text-3xl font-mono text-[#14B8A6]">{avgProgress}%</div>
            <div className="text-[11px] text-[#666666] font-mono mt-1">Across 11 milestones</div>
          </div>

          <div className="p-5 rounded-md bg-[#111111] border border-[#242424]">
            <div className="flex justify-between items-start text-[#666666] mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider">COMPLETIONS</span>
              <CheckCircle2 size={14} />
            </div>
            <div className="text-3xl font-mono text-white">
              {participants.filter(p => p.status === 'completed').length}
            </div>
            <div className="text-[11px] text-[#666666] font-mono mt-1">40% completion rate</div>
          </div>

          <div className="p-5 rounded-md bg-[#111111] border border-[#242424]">
            <div className="flex justify-between items-start text-[#666666] mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider">EVENT ACCESS</span>
              <Radio size={14} className="text-[#C5A059]" />
            </div>
            <div className="text-3xl font-mono text-[#C5A059]">{currentEvent.accessCode}</div>
            <div className="text-[11px] text-[#666666] font-mono mt-1">Status: {currentEvent.status}</div>
          </div>
        </div>

        {/* Live Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Live Step Broadcaster */}
          <div className="p-5 rounded-md bg-[#111111] border border-[#242424]">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#1B1B1B]">
              <Radio size={15} className="text-[#14B8A6]" />
              <h3 className="font-mono text-xs uppercase tracking-widest text-white">Live Step Synchronization</h3>
            </div>
            <p className="text-xs text-[#A1A1A1] mb-3 font-sans">
              Set active milestone to guide all attendees simultaneously.
            </p>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {steps.map(step => (
                <button
                  key={step.id}
                  onClick={() => handleSetLiveStep(step.id)}
                  className={`w-full text-left p-2.5 rounded-md border text-xs font-mono flex items-center justify-between transition-colors ${
                    currentLiveStepId === step.id
                      ? 'border-white bg-[#161616] text-white'
                      : 'border-transparent bg-[#0A0A0A] text-[#A1A1A1] hover:text-white hover:border-[#242424]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[10px] text-[#666666]">STEP {step.position}</span>
                    <span className="truncate">{step.title.replace(/^Step\s*\d+\s*[—–-]\s*/i, '')}</span>
                  </div>
                  {currentLiveStepId === step.id && (
                    <span className="text-[9px] font-mono bg-white text-[#0A0A0A] px-1.5 py-0.2 rounded font-semibold">
                      ACTIVE
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Broadcast Announcement */}
          <div className="p-5 rounded-md bg-[#111111] border border-[#242424] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#1B1B1B]">
                <Megaphone size={15} className="text-[#C5A059]" />
                <h3 className="font-mono text-xs uppercase tracking-widest text-white">Broadcast Announcement</h3>
              </div>
              <p className="text-xs text-[#A1A1A1] mb-3 font-sans">
                Push real-time alert banner to all participant screens.
              </p>

              {activeAnnouncement && (
                <div className="mb-3 p-2.5 bg-[#161616] border border-[#C5A059]/40 rounded-md text-xs text-[#D4D4D4] flex items-center justify-between font-mono">
                  <span>&bull; "{activeAnnouncement}"</span>
                  <button onClick={() => setActiveAnnouncement(null)} className="text-[#666666] hover:text-white">
                    <X size={13} />
                  </button>
                </div>
              )}

              <form onSubmit={handleSendAnnouncement} className="space-y-2">
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="e.g. 5 minutes remaining for this milestone..."
                  className="w-full px-3.5 py-2 bg-[#0A0A0A] border border-[#242424] rounded-md text-white placeholder-[#666666] text-xs focus:outline-none focus:border-white font-mono"
                />
                <button
                  type="submit"
                  disabled={!announcementText.trim()}
                  className="w-full py-2 rounded-md bg-[#FF5722] hover:bg-[#E64A19] text-white font-medium text-xs transition-colors disabled:opacity-40"
                >
                  Broadcast Announcement
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Linear/Apple Style Participants Table */}
        <div className="p-5 rounded-md bg-[#111111] border border-[#242424]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#1B1B1B]">
            <div>
              <h3 className="font-mono text-xs uppercase tracking-widest text-white">Participant Engagement Roster</h3>
              <p className="text-xs text-[#666666]">Real-time attendance, milestone completion, and activity</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#666666]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search participants..."
                  className="pl-7 pr-3 py-1 bg-[#0A0A0A] border border-[#242424] rounded-md text-xs text-white placeholder-[#666666] focus:outline-none focus:border-white"
                />
              </div>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#161616] hover:bg-[#222222] border border-[#242424] rounded-md text-xs font-mono text-[#D4D4D4] hover:text-white transition-colors"
                title="Export participants to CSV"
              >
                <FileSpreadsheet size={13} className="text-[#14B8A6]" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#242424] text-[#666666] font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">PARTICIPANT</th>
                  <th className="py-2.5 px-3">EMAIL</th>
                  <th className="py-2.5 px-3">PROGRESS</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3">LAST ACTIVE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B1B1B]">
                {filteredParticipants.map(participant => (
                  <tr key={participant.id} className="hover:bg-[#161616] transition-colors">
                    <td className="py-2.5 px-3 font-medium text-white flex items-center gap-2">
                      <div className="w-5 h-5 rounded-[2px] bg-[#161616] border border-[#242424] flex items-center justify-center text-[10px] font-mono text-[#A1A1A1]">
                        {participant.displayName.charAt(0)}
                      </div>
                      <span>{participant.displayName}</span>
                    </td>
                    <td className="py-2.5 px-3 text-[#A1A1A1] font-mono">{participant.email}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1 bg-[#0A0A0A] rounded-full overflow-hidden border border-[#242424]">
                          <div
                            className="h-full bg-[#14B8A6]"
                            style={{ width: `${participant.progressPercentage}%` }}
                          />
                        </div>
                        <span className="font-mono text-[#D4D4D4] text-[11px]">{participant.progressPercentage}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      {participant.status === 'completed' ? (
                        <span className="text-[#14B8A6]">● Completed</span>
                      ) : (
                        <span className="text-[#C5A059]">● Active</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-[#666666] font-mono">{participant.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
