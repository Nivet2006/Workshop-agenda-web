import * as XLSX from 'xlsx';
import { supabase } from './supabase';

export interface StoredSubmission {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  eventId: string;
  eventTitle: string;
  key: string;
  label: string;
  stepNumber: number;
  stepTitle: string;
  url: string;
  handle?: string;
  status: 'valid' | 'submitted' | 'reviewed';
  submittedAt: string;
}

const STORAGE_KEY = 'workshop_agenda_db_submissions';

export const isFakeSeedRecord = (item: Partial<StoredSubmission>): boolean => {
  if (!item) return false;
  return Boolean(
    (item.id && item.id.startsWith('sub-seed-')) ||
    item.userEmail === 'alex.rivers@example.com' ||
    item.userEmail === 'maya.c@example.com' ||
    item.userEmail === 'rohan.s@example.com' ||
    item.userName === 'Alex Rivers' ||
    item.userName === 'Maya Chen' ||
    item.userName === 'Rohan Sharma'
  );
};

export async function fetchDbSubmissions(): Promise<StoredSubmission[]> {
  // Query Supabase directly
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const mapped: StoredSubmission[] = data.map((d: any) => ({
          id: d.id,
          userId: d.user_id,
          userName: d.user_name || 'Workshop Participant',
          userEmail: d.user_email || '',
          eventId: d.event_id,
          eventTitle: d.event_title || 'LinkedIn Profile Building',
          key: d.key,
          label: d.label,
          stepNumber: d.step_number,
          stepTitle: d.step_title,
          url: d.url,
          handle: d.handle || '',
          status: (d.status as any) || 'valid',
          submittedAt: d.submitted_at || new Date().toISOString()
        })).filter(s => !isFakeSeedRecord(s));

        // Deduplicate: Keep only the most recent submission per user + event + stepNumber
        const seen = new Set<string>();
        const uniqueList: StoredSubmission[] = [];
        for (const item of mapped) {
          const dedupeKey = `${item.userId}_${item.eventId}_${item.stepNumber}`;
          if (!seen.has(dedupeKey)) {
            seen.add(dedupeKey);
            uniqueList.push(item);
          }
        }

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueList));
        } catch {}

        return uniqueList;
      } else if (error) {
        console.warn('Supabase fetch error, checking cache:', error.message);
      }
    } catch (err) {
      console.warn('Supabase network error, fallback to cache:', err);
    }
  }

  // Fallback to local storage cache if offline
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed: StoredSubmission[] = JSON.parse(cached);
      const clean = Array.isArray(parsed) ? parsed.filter(s => !isFakeSeedRecord(s)) : [];
      const seen = new Set<string>();
      const uniqueList: StoredSubmission[] = [];
      for (const item of clean) {
        const dedupeKey = `${item.userId}_${item.eventId}_${item.stepNumber}`;
        if (!seen.has(dedupeKey)) {
          seen.add(dedupeKey);
          uniqueList.push(item);
        }
      }
      return uniqueList;
    }
  } catch (e) {
    console.error('Failed reading localStorage submissions:', e);
  }

  return [];
}

export async function saveDbSubmission(payload: {
  userId: string;
  userName?: string;
  userEmail?: string;
  eventId: string;
  eventTitle?: string;
  key: string;
  label: string;
  stepNumber: number;
  stepTitle: string;
  url: string;
  handle?: string;
}, dispatchEvent = true): Promise<StoredSubmission> {
  const timestamp = new Date().toISOString();
  // Deterministic ID per user, event, and step so re-submissions update the same row
  const id = `sub_${payload.userId.replace(/[^a-zA-Z0-9_-]/g, '')}_s${payload.stepNumber}`;
  
  const record: StoredSubmission = {
    id,
    userId: payload.userId,
    userName: payload.userName || 'Workshop Participant',
    userEmail: payload.userEmail || '',
    eventId: payload.eventId,
    eventTitle: payload.eventTitle || 'LinkedIn Profile Building',
    key: payload.key,
    label: payload.label,
    stepNumber: payload.stepNumber,
    stepTitle: payload.stepTitle,
    url: payload.url,
    handle: payload.handle || '',
    status: 'valid',
    submittedAt: timestamp
  };

  // Direct and Instant Supabase DB write with onConflict on unique user + event + step
  if (supabase) {
    try {
      const { error } = await supabase
        .from('submissions')
        .upsert({
          id: record.id,
          user_id: record.userId,
          user_name: record.userName,
          user_email: record.userEmail,
          event_id: record.eventId,
          event_title: record.eventTitle,
          key: record.key,
          label: record.label,
          step_number: record.stepNumber,
          step_title: record.stepTitle,
          url: record.url,
          handle: record.handle,
          status: record.status,
          submitted_at: record.submittedAt
        }, { onConflict: 'user_id,event_id,step_number' });

      if (error) {
        console.error('Direct Supabase write error:', error);
      }
    } catch (err) {
      console.error('Direct Supabase exception:', err);
    }
  }

  // Update local cache for instant UI response (strictly 1 entry per step)
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const current: StoredSubmission[] = raw ? JSON.parse(raw) : [];
    const exists = current.findIndex(c => 
      c.id === record.id || 
      (c.userId === record.userId && c.stepNumber === record.stepNumber && c.eventId === record.eventId)
    );
    if (exists >= 0) {
      current[exists] = record;
    } else {
      current.unshift(record);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {}

  if (dispatchEvent) {
    window.dispatchEvent(new CustomEvent('workshop_db_updated', { detail: { record } }));
    window.dispatchEvent(new CustomEvent('eventflow_submission_saved', { detail: { record } }));
  }
  return record;
}

export async function deleteDbSubmission(id: string): Promise<boolean> {
  // Direct Supabase delete
  if (supabase) {
    try {
      const { error } = await supabase.from('submissions').delete().eq('id', id);
      if (error) {
        console.error('Direct Supabase delete error:', error);
      }
    } catch (err) {
      console.error('Direct Supabase delete exception:', err);
    }
  }

  // Update local storage cache
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const list: StoredSubmission[] = JSON.parse(cached);
      const filtered = list.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch (e) {
    console.error('Error updating cache on delete:', e);
  }

  window.dispatchEvent(new CustomEvent('workshop_db_updated', { detail: { deletedId: id } }));
  return true;
}

export async function deleteDbSubmissionsGroup(ids: string[]): Promise<number> {
  if (!ids || ids.length === 0) return 0;

  // Direct Supabase group delete
  if (supabase) {
    try {
      const { error } = await supabase.from('submissions').delete().in('id', ids);
      if (error) {
        console.error('Direct Supabase group delete error:', error);
      }
    } catch (err) {
      console.error('Direct Supabase group delete exception:', err);
    }
  }

  // Update local storage cache
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const list: StoredSubmission[] = JSON.parse(cached);
      const filtered = list.filter(item => !ids.includes(item.id));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch (e) {
    console.error('Error updating cache on group delete:', e);
  }

  window.dispatchEvent(new CustomEvent('workshop_db_updated', { detail: { deletedIds: ids } }));
  return ids.length;
}

export function exportSubmissionsToXLSX(
  submissions: StoredSubmission[], 
  filename = `workshop_submissions_${new Date().toISOString().split('T')[0]}.xlsx`
): void {
  if (!submissions || submissions.length === 0) {
    alert('No submissions available to export.');
    return;
  }

  // Transform records into user-friendly spreadsheet rows
  const formattedRows = submissions.map((sub, idx) => ({
    '#': idx + 1,
    'Participant Name': sub.userName || 'Anonymous',
    'Email Address': sub.userEmail || 'N/A',
    'Milestone Step': `Step ${sub.stepNumber}`,
    'Milestone Title': sub.stepTitle || 'N/A',
    'Submission Category': sub.label || sub.key,
    'Submitted URL': sub.url,
    'Extracted Handle / ID': sub.handle || 'N/A',
    'Verification Status': sub.status?.toUpperCase() || 'VALID',
    'Submitted Date & Time (UTC)': new Date(sub.submittedAt).toISOString().replace('T', ' ').substring(0, 19),
    'Event Name': sub.eventTitle || 'LinkedIn Profile Building Workshop',
    'Record Database ID': sub.id,
    'User ID': sub.userId
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedRows);

  // Set professional column widths
  worksheet['!cols'] = [
    { wch: 5 },  // #
    { wch: 22 }, // Participant Name
    { wch: 26 }, // Email
    { wch: 15 }, // Milestone Step
    { wch: 32 }, // Milestone Title
    { wch: 28 }, // Submission Category
    { wch: 55 }, // Submitted URL
    { wch: 22 }, // Handle
    { wch: 18 }, // Status
    { wch: 24 }, // Submitted Date & Time
    { wch: 35 }, // Event Name
    { wch: 22 }, // Record Database ID
    { wch: 22 }, // User ID
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Submissions');

  // Trigger browser download
  XLSX.writeFile(workbook, filename);
}
