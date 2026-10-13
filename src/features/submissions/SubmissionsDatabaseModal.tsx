import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Trash2, 
  Search, 
  ExternalLink, 
  Copy, 
  Check, 
  Database, 
  RefreshCw, 
  CheckSquare, 
  Square, 
  Filter, 
  AlertTriangle,
  User,
  Calendar,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { 
  StoredSubmission, 
  fetchDbSubmissions, 
  deleteDbSubmission, 
  deleteDbSubmissionsGroup, 
  exportSubmissionsToXLSX 
} from '../../lib/dbService';

interface SubmissionsDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId?: string;
}

export function SubmissionsDatabaseModal({
  isOpen,
  onClose,
  eventId
}: SubmissionsDatabaseModalProps) {
  const [submissions, setSubmissions] = useState<StoredSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'custom_profile_url' | 'published_post_url' | 'final_profile_url'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal confirmation states
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'single' | 'group';
    id?: string;
    count?: number;
  }>({ isOpen: false, type: 'single' });

  // Load submissions from ./db
  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchDbSubmissions();
      setSubmissions(data);
    } catch (err) {
      console.error('Error fetching submissions from db:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setSelectedIds(new Set());
    }
  }, [isOpen]);

  // Listen for live updates only when modal is open
  useEffect(() => {
    if (!isOpen) return;

    let timer: ReturnType<typeof setTimeout>;
    const handleUpdate = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        loadData();
      }, 250);
    };

    window.addEventListener('workshop_db_updated', handleUpdate);
    window.addEventListener('eventflow_submission_saved', handleUpdate);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('workshop_db_updated', handleUpdate);
      window.removeEventListener('eventflow_submission_saved', handleUpdate);
    };
  }, [isOpen]);

  // Filtered & Searched Submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      // Event filter (optional if provided)
      if (eventId && sub.eventId && sub.eventId !== eventId) {
        // Allow browsing current event, or all if preferred
      }

      // Category / Key filter
      if (selectedFilter !== 'all' && sub.key !== selectedFilter) {
        return false;
      }

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        sub.userName.toLowerCase().includes(q) ||
        (sub.userEmail && sub.userEmail.toLowerCase().includes(q)) ||
        sub.url.toLowerCase().includes(q) ||
        (sub.handle && sub.handle.toLowerCase().includes(q)) ||
        sub.stepTitle.toLowerCase().includes(q) ||
        sub.label.toLowerCase().includes(q)
      );
    });
  }, [submissions, eventId, selectedFilter, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    return {
      total: submissions.length,
      customUrl: submissions.filter(s => s.key === 'custom_profile_url').length,
      postUrl: submissions.filter(s => s.key === 'published_post_url').length,
      finalUrl: submissions.filter(s => s.key === 'final_profile_url').length
    };
  }, [submissions]);

  // Copy URL helper
  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Selection toggle
  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredSubmissions.length && filteredSubmissions.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSubmissions.map(s => s.id)));
    }
  };

  // Individual deletion
  const requestDeleteSingle = (id: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'single',
      id
    });
  };

  // Group deletion
  const requestDeleteGroup = () => {
    if (selectedIds.size === 0) return;
    setDeleteConfirmation({
      isOpen: true,
      type: 'group',
      count: selectedIds.size
    });
  };

  const confirmDelete = async () => {
    if (deleteConfirmation.type === 'single' && deleteConfirmation.id) {
      await deleteDbSubmission(deleteConfirmation.id);
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(deleteConfirmation.id!);
        return next;
      });
      await loadData();
    } else if (deleteConfirmation.type === 'group') {
      const idsArray = Array.from<string>(selectedIds);
      await deleteDbSubmissionsGroup(idsArray);
      setSelectedIds(new Set<string>());
      await loadData();
    }
    setDeleteConfirmation({ isOpen: false, type: 'single' });
  };

  // Export handlers
  const handleExportAll = () => {
    exportSubmissionsToXLSX(filteredSubmissions, `workshop_submissions_all_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportSelected = () => {
    const selectedList = submissions.filter(s => selectedIds.has(s.id));
    exportSubmissionsToXLSX(selectedList, `workshop_submissions_selected_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-6xl max-h-[92vh] flex flex-col bg-[#111111] border border-[#242424] rounded-xl shadow-2xl overflow-hidden font-sans text-gray-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 md:p-6 border-b border-[#242424] bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-[#14B8A6] shadow-inner">
              <Database size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg md:text-xl font-semibold text-white tracking-tight">
                  Submissions Database
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#1A1A1A] text-[#14B8A6] border border-[#14B8A6]/30">
                  ./db/submissions.json
                </span>
              </div>
              <p className="text-xs text-[#888888] mt-0.5">
                View, verify, delete, and export attendee milestone link submissions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* Refresh */}
            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2 rounded-md bg-[#181818] border border-[#282828] text-[#A1A1A1] hover:text-white hover:border-[#404040] transition-colors"
              title="Refresh database records"
            >
              <RefreshCw size={15} className={isLoading ? "animate-spin text-[#14B8A6]" : ""} />
            </button>

            {/* Export XLSX Button */}
            <button
              onClick={selectedIds.size > 0 ? handleExportSelected : handleExportAll}
              disabled={filteredSubmissions.length === 0}
              className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#107C41] hover:bg-[#0E6B37] text-white text-xs font-medium shadow transition-colors disabled:opacity-30 disabled:pointer-events-none"
              title="Export records to Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet size={15} />
              <span>
                {selectedIds.size > 0 
                  ? `Export Selected (${selectedIds.size}) to XLSX` 
                  : `Export All to XLSX`}
              </span>
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-md bg-[#181818] border border-[#282828] text-[#888888] hover:text-white hover:border-[#404040] transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 md:px-6 bg-[#0E0E0E] border-b border-[#202020]">
          <div className="px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#222222]">
            <span className="text-[10px] font-mono text-[#777777] uppercase tracking-wider block">Total Submissions</span>
            <span className="text-xl font-mono font-semibold text-white mt-0.5 block">{metrics.total}</span>
          </div>
          <div className="px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#222222]">
            <span className="text-[10px] font-mono text-[#777777] uppercase tracking-wider block">Step 2: Vanity URLs</span>
            <span className="text-xl font-mono font-semibold text-[#14B8A6] mt-0.5 block">{metrics.customUrl}</span>
          </div>
          <div className="px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#222222]">
            <span className="text-[10px] font-mono text-[#777777] uppercase tracking-wider block">Step 10: Post URLs</span>
            <span className="text-xl font-mono font-semibold text-[#C5A059] mt-0.5 block">{metrics.postUrl}</span>
          </div>
          <div className="px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#222222]">
            <span className="text-[10px] font-mono text-[#777777] uppercase tracking-wider block">Step 11: Final Review</span>
            <span className="text-xl font-mono font-semibold text-[#60A5FA] mt-0.5 block">{metrics.finalUrl}</span>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="p-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-3 border-b border-[#202020] bg-[#121212]">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors whitespace-nowrap ${
                selectedFilter === 'all'
                  ? 'bg-[#222222] text-white border border-[#333333]'
                  : 'text-[#888888] hover:text-white hover:bg-[#181818]'
              }`}
            >
              All ({submissions.length})
            </button>
            <button
              onClick={() => setSelectedFilter('custom_profile_url')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors whitespace-nowrap ${
                selectedFilter === 'custom_profile_url'
                  ? 'bg-[#222222] text-[#14B8A6] border border-[#14B8A6]/40'
                  : 'text-[#888888] hover:text-white hover:bg-[#181818]'
              }`}
            >
              Step 2: Vanity URL
            </button>
            <button
              onClick={() => setSelectedFilter('published_post_url')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors whitespace-nowrap ${
                selectedFilter === 'published_post_url'
                  ? 'bg-[#222222] text-[#C5A059] border border-[#C5A059]/40'
                  : 'text-[#888888] hover:text-white hover:bg-[#181818]'
              }`}
            >
              Step 10: Post URL
            </button>
            <button
              onClick={() => setSelectedFilter('final_profile_url')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors whitespace-nowrap ${
                selectedFilter === 'final_profile_url'
                  ? 'bg-[#222222] text-[#60A5FA] border border-[#60A5FA]/40'
                  : 'text-[#888888] hover:text-white hover:bg-[#181818]'
              }`}
            >
              Step 11: Final Profile
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search user, URL, or handle..."
              className="w-full pl-9 pr-3 py-1.5 rounded-md bg-[#181818] border border-[#282828] text-xs text-white placeholder-[#555555] focus:outline-none focus:border-[#14B8A6] transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Group Action Banner (when records are selected) */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between px-6 py-2.5 bg-[#1F1715] border-b border-[#EF4444]/30 animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse"></span>
              <span className="text-xs font-mono text-[#FCA5A5] font-medium">
                {selectedIds.size} of {filteredSubmissions.length} submission{selectedIds.size > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-[11px] font-mono text-[#999999] hover:text-white underline ml-2"
              >
                Deselect All
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportSelected}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#107C41]/80 hover:bg-[#107C41] text-white text-xs font-medium transition-colors"
              >
                <FileSpreadsheet size={13} />
                <span>Export ({selectedIds.size})</span>
              </button>

              <button
                onClick={requestDeleteGroup}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-medium transition-colors shadow"
              >
                <Trash2 size={13} />
                <span>Delete Selected ({selectedIds.size})</span>
              </button>
            </div>
          </div>
        )}

        {/* Submissions Table */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#666666]">
              <RefreshCw size={24} className="animate-spin text-[#14B8A6] mb-3" />
              <p className="text-xs font-mono">Reading records from ./db/submissions.json...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-[#181818] border border-[#242424] flex items-center justify-center text-[#666666] mb-3">
                <Database size={20} />
              </div>
              <h3 className="text-sm font-medium text-white">No Submissions Found</h3>
              <p className="text-xs text-[#777777] max-w-sm mt-1">
                {searchQuery || selectedFilter !== 'all' 
                  ? 'No records match your current filter or search criteria.' 
                  : 'No link submissions have been saved to ./db/submissions.json yet. Submit a link in Step 2, Step 10, or Step 11 to see it appear here.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#202020] bg-[#141414] text-[#777777] font-mono text-[11px] uppercase tracking-wider sticky top-0 z-10">
                  <th className="py-3 px-4 w-10 text-center">
                    <button
                      onClick={toggleSelectAll}
                      className="text-[#888888] hover:text-white transition-colors"
                      title={selectedIds.size === filteredSubmissions.length ? "Deselect All" : "Select All"}
                    >
                      {selectedIds.size === filteredSubmissions.length && filteredSubmissions.length > 0 ? (
                        <CheckSquare size={15} className="text-[#14B8A6]" />
                      ) : (
                        <Square size={15} />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">Participant</th>
                  <th className="py-3 px-4">Milestone</th>
                  <th className="py-3 px-4">Submitted Link</th>
                  <th className="py-3 px-4">Handle</th>
                  <th className="py-3 px-4">Submitted At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                {filteredSubmissions.map(sub => {
                  const isSelected = selectedIds.has(sub.id);
                  const isPost = sub.key === 'published_post_url';
                  const isFinal = sub.key === 'final_profile_url';

                  return (
                    <tr 
                      key={sub.id}
                      className={`hover:bg-[#161616] transition-colors ${
                        isSelected ? 'bg-[#181414] border-l-2 border-l-[#EF4444]' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleSelectRow(sub.id)}
                          className="text-[#777777] hover:text-white transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare size={15} className="text-[#14B8A6]" />
                          ) : (
                            <Square size={15} />
                          )}
                        </button>
                      </td>

                      {/* Participant */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#1F1F1F] border border-[#2D2D2D] flex items-center justify-center text-[10px] font-mono font-bold text-[#A1A1A1] shrink-0">
                            {sub.userName ? sub.userName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium text-white block truncate">
                              {sub.userName}
                            </span>
                            {sub.userEmail && (
                              <span className="text-[11px] text-[#777777] font-mono block truncate">
                                {sub.userEmail}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Milestone */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-mono uppercase font-medium border ${
                            isPost 
                              ? 'bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/30' 
                              : isFinal 
                              ? 'bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/30' 
                              : 'bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/30'
                          }`}>
                            Step {sub.stepNumber}
                          </span>
                          <span className="text-[#A1A1A1] text-xs truncate max-w-[150px]">
                            {sub.label || sub.stepTitle}
                          </span>
                        </div>
                      </td>

                      {/* Submitted Link */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 max-w-xs md:max-w-md">
                          <a 
                            href={sub.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-blue-400 hover:text-blue-300 underline truncate flex items-center gap-1"
                            title={sub.url}
                          >
                            <span className="truncate">{sub.url}</span>
                            <ExternalLink size={11} className="shrink-0" />
                          </a>

                          <button
                            onClick={() => handleCopyUrl(sub.url, sub.id)}
                            className="p-1 rounded text-[#777777] hover:text-white hover:bg-[#202020] transition-colors shrink-0"
                            title="Copy link to clipboard"
                          >
                            {copiedId === sub.id ? (
                              <Check size={12} className="text-[#14B8A6]" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Handle */}
                      <td className="py-3 px-4">
                        {sub.handle ? (
                          <span className="px-2 py-0.5 rounded bg-[#181818] border border-[#262626] text-[11px] font-mono text-[#D4D4D4]">
                            {sub.handle}
                          </span>
                        ) : (
                          <span className="text-[#555555] font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* Submitted At */}
                      <td className="py-3 px-4 text-[#888888] font-mono text-[11px] whitespace-nowrap">
                        {new Date(sub.submittedAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      {/* Action: Delete Single Record */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => requestDeleteSingle(sub.id)}
                          className="p-1.5 rounded text-[#777777] hover:text-[#EF4444] hover:bg-[#241717] transition-colors"
                          title="Delete this submission record from database"
                          aria-label={`Delete submission ${sub.id}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-[#202020] bg-[#141414] text-xs text-[#777777] font-mono">
          <div className="flex items-center gap-2">
            <span>Showing {filteredSubmissions.length} of {submissions.length} total records</span>
            <span className="text-[#444444]">•</span>
            <span className="text-[#14B8A6]">Data source: ./db/submissions.json</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportAll}
              disabled={filteredSubmissions.length === 0}
              className="flex items-center gap-1.5 text-xs text-[#A1A1A1] hover:text-white transition-colors"
            >
              <FileSpreadsheet size={13} className="text-[#107C41]" />
              <span>Export Full Database to XLSX</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#161616] border border-[#333333] rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#EF4444]">
              <div className="w-10 h-10 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base">
                  {deleteConfirmation.type === 'single' ? 'Delete Submission Record?' : 'Delete Selected Submissions?'}
                </h3>
                <p className="text-xs text-[#888888] mt-0.5 font-sans">
                  This action will permanently delete the record(s) from <span className="font-mono text-[#EF4444]">./db/submissions.json</span>.
                </p>
              </div>
            </div>

            <p className="text-xs text-[#A1A1A1] bg-[#111111] p-3 rounded border border-[#242424] font-mono leading-relaxed">
              {deleteConfirmation.type === 'single'
                ? `Record ID: ${deleteConfirmation.id}`
                : `Total to delete: ${deleteConfirmation.count} selected submissions`}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmation({ isOpen: false, type: 'single' })}
                className="px-4 py-2 rounded-md bg-[#222222] border border-[#333333] text-xs text-white hover:bg-[#2A2A2A] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-md bg-[#EF4444] hover:bg-[#DC2626] text-xs font-medium text-white transition-colors shadow"
              >
                {deleteConfirmation.type === 'single' ? 'Delete Record' : `Delete ${deleteConfirmation.count} Records`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
