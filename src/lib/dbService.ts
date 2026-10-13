import * as XLSX from 'xlsx';

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

let hasInitialSyncRun = false;

export async function syncStoredSubmissionsToDb(): Promise<void> {
  if (hasInitialSyncRun) return;
  hasInitialSyncRun = true;

  if (typeof localStorage === 'undefined') return;

  try {
    const rawUserSubs = localStorage.getItem('eventflow_user_submissions');
    if (!rawUserSubs) return;
    const records: Record<string, any> = JSON.parse(rawUserSubs);

    // Fetch existing records from server to avoid re-saving
    let existingList: StoredSubmission[] = [];
    try {
      const res = await fetch('/api/db/submissions');
      if (res.ok) {
        existingList = await res.json();
      }
    } catch {}

    // Get current profile name/email if set
    let userName = 'Workshop Participant';
    let userEmail = '';
    try {
      const rawProfile = localStorage.getItem('eventflow_user_profile');
      if (rawProfile) {
        const p = JSON.parse(rawProfile);
        if (p.displayName) userName = p.displayName;
        if (p.email) userEmail = p.email;
      }
    } catch {}

    for (const [, record] of Object.entries(records)) {
      if (!record || typeof record !== 'object') continue;
      const eventId = record.eventId || 'e0000000-0000-0000-0000-000000000002';
      const userId = record.userId || 'guest-user';

      const itemsToSync = [
        record.customProfileUrl,
        record.publishedPostUrl,
        record.finalProfileUrl
      ].filter(Boolean);

      for (const item of itemsToSync) {
        if (!item || !item.url || isFakeSeedRecord(item)) continue;
        
        // Skip if already in existingList
        const alreadyExists = existingList.some(
          ex => ex.key === item.key && ex.userId === userId && ex.url === item.url
        );
        if (alreadyExists) continue;

        await saveDbSubmission({
          userId,
          userName,
          userEmail,
          eventId,
          key: item.key,
          label: item.label || 'Submit URL',
          stepNumber: item.stepNumber,
          stepTitle: item.stepNumber === 2 ? 'Custom Profile URL Configuration' : 
                     item.stepNumber === 10 ? 'Publish Live Event Post' : 
                     item.stepNumber === 11 ? 'Submit Final Profile for Review' : 'Milestone Submission',
          url: item.url,
          handle: item.url.split('/in/')[1]?.split(/[?/#]/)[0] || item.url.split('/posts/')[1]?.split(/[?/#]/)[0] || ''
        }, false);
      }
    }
  } catch (err) {
    console.error('Error syncing local user submissions to db:', err);
  }
}

export async function fetchDbSubmissions(): Promise<StoredSubmission[]> {
  // Sync once if not already run
  if (!hasInitialSyncRun) {
    await syncStoredSubmissionsToDb();
  }

  try {
    const res = await fetch('/api/db/submissions');
    if (res.ok) {
      const data: StoredSubmission[] = await res.json();
      if (Array.isArray(data)) {
        // Strip out any fake seed records
        const cleanData = data.filter(s => !isFakeSeedRecord(s));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanData));
        return cleanData;
      }
    }
  } catch (err) {
    console.warn('API /api/db/submissions unavailable, reading from local cache:', err);
  }

  // Fallback to local storage (filtering out fake seed data)
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed: StoredSubmission[] = JSON.parse(cached);
      const clean = Array.isArray(parsed) ? parsed.filter(s => !isFakeSeedRecord(s)) : [];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
      return clean;
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
  const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  
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

  try {
    const res = await fetch('/api/db/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.record) {
        // Update local storage cache directly without recursive network calls
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          const current: StoredSubmission[] = raw ? JSON.parse(raw) : [];
          const exists = current.findIndex(c => c.id === record.id || (c.userId === record.userId && c.key === record.key && c.eventId === record.eventId));
          if (exists >= 0) {
            current[exists] = record;
          } else {
            current.unshift(record);
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        } catch {}
      }
    }
  } catch (err) {
    console.warn('Failed saving to API /api/db/submissions, persisting locally:', err);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const current: StoredSubmission[] = raw ? JSON.parse(raw) : [];
      current.unshift(record);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch {}
  }

  if (dispatchEvent) {
    window.dispatchEvent(new CustomEvent('workshop_db_updated', { detail: { record } }));
  }
  return record;
}

export async function deleteDbSubmission(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/db/submissions?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id] })
    });
    if (!res.ok) {
      console.warn('API delete error, falling back locally');
    }
  } catch (err) {
    console.warn('Network error during submission delete:', err);
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
  
  try {
    const res = await fetch('/api/db/submissions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
    if (!res.ok) {
      console.warn('API group delete error, falling back locally');
    }
  } catch (err) {
    console.warn('Network error during group delete:', err);
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
