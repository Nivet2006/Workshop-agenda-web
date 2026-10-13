// =============================================================================
// EventFlow Seed Workshop: 13-Step Make.com + Telegram Guide
// Preserves complete original content from src/data.ts
// =============================================================================

import { EventModel, EventSection, EventStep, QuizModel } from '../types';

export const SAMPLE_EVENT_ID = 'a0000000-0000-0000-0000-000000000001';
export const SAMPLE_QUIZ_ID = 'c0000000-0000-0000-0000-000000000001';

export const sampleEvent: EventModel = {
  id: SAMPLE_EVENT_ID,
  title: 'No-Code Automation with Make.com & Telegram',
  slug: 'nocode-automation-workshop',
  description: 'Interactive hands-on workshop guide for building real automation systems without code using Make.com and Telegram.',
  timezone: 'Asia/Kolkata',
  status: 'published',
  accessCode: 'NIVET2006',
  accessPolicy: 'code',
  theme: {
    palette: 'dark',
    accentColor: '#10b981',
    badge: 'NIVET2006'
  },
  publishedVersion: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const sampleSections: EventSection[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    eventId: SAMPLE_EVENT_ID,
    title: 'Part 1: Introduction & Fundamentals',
    description: 'Setting the stage and core automation concepts',
    position: 1,
    visibility: 'visible'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    eventId: SAMPLE_EVENT_ID,
    title: 'Part 2: Setup & Your First Bot',
    description: 'BotFather setup, Make scenarios, and auto-reply',
    position: 2,
    visibility: 'visible'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    eventId: SAMPLE_EVENT_ID,
    title: 'Part 3: Advanced Automations',
    description: 'Weather API connections and time-delayed reminder bots',
    position: 3,
    visibility: 'visible'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000004',
    eventId: SAMPLE_EVENT_ID,
    title: 'Part 4: Mini Challenge & 24/7 Deployment',
    description: 'Interactive challenge, 24/7 activation, and wrap-up',
    position: 4,
    visibility: 'visible'
  }
];

export const sampleSteps: EventStep[] = [
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    eventId: SAMPLE_EVENT_ID,
    sectionId: 'b0000000-0000-0000-0000-000000000001',
    type: 'instruction',
    title: 'Opening',
    timeRange: '0:00 – 0:10',
    durationMinutes: 10,
    position: 1,
    required: true,
    completionRule: 'manual',
    publishedVersion: 1,
    summary: 'Good morning & mission briefing',
    content: {
      html: `
        <p class="mb-4">"Good morning everyone.</p>
        <p class="mb-4">Today we are building real automation systems — without writing code.</p>
        <p class="mb-4">By the end of this session, you will:</p>
        <ul class="list-disc pl-5 mb-6 space-y-2">
          <li>Create a Telegram bot</li>
          <li>Connect it to APIs using Make</li>
          <li>Build weather alerts and reminder automation</li>
        </ul>
        <p class="mb-4 font-bold">No coding. Pure logic."</p>
        <blockquote class="border-l-2 border-white pl-4 italic text-gray-400 my-6">
          "Automation is a skill every engineer must know."
        </blockquote>
      `
    }
  },
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    eventId: SAMPLE_EVENT_ID,
    sectionId: 'b0000000-0000-0000-0000-000000000001',
    type: 'instruction',
    title: 'What is No-Code Automation?',
    timeRange: '0:10 – 0:20',
    durationMinutes: 10,
    position: 2,
    required: true,
    completionRule: 'manual',
    publishedVersion: 1,
    summary: 'The Trigger -> Action -> Output paradigm',
    content: {
      html: `
        <p class="mb-4">"Automation means making systems work automatically.</p>
        <p class="mb-6">No-code means:<br/>You connect blocks visually instead of writing programs."</p>
        <div class="bg-zinc-900 p-6 rounded-lg border border-zinc-800 mb-6 font-mono text-sm">
          <span class="text-emerald-400">Trigger</span> &rarr; 
          <span class="text-blue-400">Action</span> &rarr; 
          <span class="text-purple-400">Output</span>
        </div>
        <p class="mb-2 font-bold">Example:</p>
        <p class="mb-4">Message received &rarr; Fetch weather &rarr; Send reply</p>
        <p class="italic text-gray-500">(Draw flow on board)</p>
      `
    }
  },
  {
    id: 'd0000000-0000-0000-0000-000000000003',
    eventId: SAMPLE_EVENT_ID,
    sectionId: 'b0000000-0000-0000-0000-000000000001',
    type: 'instruction',
    title: 'Why Telegram + Make?',
    timeRange: '0:20 – 0:30',
    durationMinutes: 10,
    position: 3,
    required: true,
    completionRule: 'manual',
    publishedVersion: 1,
    summary: 'Synergy between real-time messaging and visual pipelines',
    content: {
      html: `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div class="p-6 border border-zinc-800 rounded-xl bg-zinc-900/50">
            <h4 class="text-xl font-accent mb-4 text-blue-400">Why Telegram?</h4>
            <ul class="list-disc pl-5 space-y-2 text-gray-300">
              <li>Free Bot API</li>
              <li>Instant deployment</li>
              <li>Used in startups</li>
            </ul>
          </div>
          <div class="p-6 border border-zinc-800 rounded-xl bg-zinc-900/50">
            <h4 class="text-xl font-accent mb-4 text-purple-400">Why Make?</h4>
            <ul class="list-disc pl-5 space-y-2 text-gray-300">
              <li>Drag-and-drop interface</li>
              <li>Connects 1000+ apps</li>
              <li>Real-time execution</li>
            </ul>
          </div>
        </div>
        <p class="text-xl font-medium text-center">"A Telegram bot + Make scenario = powerful automation."</p>
      `
    }
  },
  {
    id: 'd0000000-0000-0000-0000-000000000004',
    eventId: SAMPLE_EVENT_ID,
    sectionId: 'b0000000-0000-0000-0000-000000000002',
    type: 'checklist',
    title: 'Create Telegram Bot (Live Setup)',
    timeRange: '0:30 – 0:45',
    durationMinutes: 15,
    position: 4,
    required: true,
    completionRule: 'checklist_all',
    publishedVersion: 1,
    summary: 'BotFather configuration and API token retrieval',
    content: {
      html: `
        <p class="mb-4">"Open Telegram."</p>
        <div class="space-y-4 mb-8">
          <div class="flex items-start gap-4">
            <div class="bg-zinc-800 text-white px-2 py-1 rounded font-mono text-xs mt-1">SEARCH</div>
            <p>Search for <strong>BotFather</strong></p>
          </div>
          <div class="flex items-start gap-4">
            <div class="bg-zinc-800 text-white px-2 py-1 rounded font-mono text-xs mt-1">COMMAND</div>
            <p>Type <code class="bg-zinc-800 px-1 rounded">/start</code></p>
          </div>
          <div class="flex items-start gap-4">
            <div class="bg-zinc-800 text-white px-2 py-1 rounded font-mono text-xs mt-1">COMMAND</div>
            <p>Type <code class="bg-zinc-800 px-1 rounded">/newbot</code></p>
          </div>
          <div class="flex items-start gap-4">
            <div class="bg-zinc-800 text-white px-2 py-1 rounded font-mono text-xs mt-1">INPUT</div>
            <p>Give it a name</p>
          </div>
          <div class="flex items-start gap-4">
            <div class="bg-zinc-800 text-white px-2 py-1 rounded font-mono text-xs mt-1">INPUT</div>
            <p>Give it a username ending with "bot"</p>
          </div>
        </div>
        <div class="bg-red-900/20 border border-red-900/50 p-4 rounded text-red-200 mb-4">
          <strong>Important:</strong> Copy the token. Keep this token safe.
        </div>
        <p class="italic text-gray-500">Pause until everyone finishes.</p>
      `
    },
    tasks: [
      { id: 't1', stepId: 'd0000000-0000-0000-0000-000000000004', title: 'Open Telegram & Search @BotFather', position: 1, required: true },
      { id: 't2', stepId: 'd0000000-0000-0000-0000-000000000004', title: 'Execute /newbot and provide a bot name', position: 2, required: true },
      { id: 't3', stepId: 'd0000000-0000-0000-0000-000000000004', title: 'Choose unique username ending with "bot"', position: 3, required: true },
      { id: 't4', stepId: 'd0000000-0000-0000-0000-000000000004', title: 'Securely copy the generated Bot Token', position: 4, required: true }
    ]
  },
  {
    id: 'd0000000-0000-0000-0000-000000000005',
    eventId: SAMPLE_EVENT_ID,
    sectionId: 'b0000000-0000-0000-0000-000000000002',
    type: 'instruction',
    title: 'Create Make Account & First Scenario',
    timeRange: '0:45 – 1:05',
    durationMinutes: 20,
    position: 5,
    required: true,
    completionRule: 'manual',
    publishedVersion: 1,
    summary: 'Setting up the Telegram trigger module in Make.com',
    content: {
      html: `
        <p class="mb-4">Open: <strong>make.com</strong></p>
        <ol class="list-decimal pl-5 space-y-4 mb-8">
          <li>Create account</li>
          <li>Click <strong>"Create Scenario"</strong></li>
          <li>Add <strong>Telegram</strong> module</li>
          <li>Choose <strong>"Watch Updates"</strong></li>
          <li>Paste Bot Token</li>
          <li>Click <strong>Run Once</strong></li>
        </ol>
        <div class="p-4 bg-zinc-900 rounded border border-zinc-800 mb-4">
          <p class="font-bold mb-2">Test:</p>
          <p>Send a message to your bot on Telegram.</p>
        </div>
        <p class="mb-2">When it detects message:</p>
        <p class="text-xl font-accent mb-4">"This is your trigger."</p>
        <p class="text-sm text-gray-400">Explain: Trigger = event listener.</p>
      `
    }
  },
  {
    id: 'd0000000-0000-0000-0000-000000000006',
    eventId: SAMPLE_EVENT_ID,
    sectionId: 'b0000000-0000-0000-0000-000000000002',
    type: 'activity',
    title: 'Experiment 1 – Simple Auto Reply Bot',
    timeRange: '1:05 – 1:25',
    durationMinutes: 20,
    position: 6,
    required: true,
    completionRule: 'manual',
    publishedVersion: 1,
    summary: 'Adding Send Message module and parameter mapping',
    content: {
      html: `
        <div class="mb-8">
          <h4 class="text-lg font-bold mb-4">Add Module:</h4>
          <div class="flex items-center gap-2 font-mono text-sm bg-zinc-900 p-3 rounded border border-zinc-800">
            <span>Telegram</span>
            <span class="text-gray-500">&rarr;</span>
            <span>"Send a Message"</span>
          </div>
        </div>
        <div class="mb-8">
          <h4 class="text-lg font-bold mb-4">Map Data:</h4>
          <ul class="list-disc pl-5 space-y-2">
            <li><strong>Chat ID:</strong> Map from trigger</li>
            <li><strong>Text:</strong> "Hello from Make Automation!"</li>
          </ul>
        </div>
        <div class="p-4 bg-emerald-900/20 border border-emerald-900/50 rounded mb-6">
          <p class="font-bold text-emerald-400 mb-2">Action:</p>
          <p>Run scenario. Send message to bot.</p>
        </div>
        <p class="mb-4">When reply comes:</p>
        <p class="text-2xl font-accent mb-6">"You just built automation without code."</p>
        <div class="text-sm text-gray-400 border-t border-zinc-800 pt-4">
          <p class="font-bold text-gray-300 mb-1">Concepts:</p>
          <ul class="list-disc pl-5">
            <li>Data mapping</li>
            <li>Trigger &rarr; Action flow</li>
          </ul>
        </div>
      `
    }
  },
  {
    id: 'd0000000-0000-0000-0000-000000000007',
    eventId: SAMPLE_EVENT_ID,
    sectionId: 'b0000000-0000-0000-0000-000000000003',
    type: 'break',
    title: 'Break',
    timeRange: '1:25 – 1:35',
    durationMinutes: 10,
    position: 7,
    required: false,
    completionRule: 'manual',
    publishedVersion: 1,
    summary: 'Recharge & stretch',
    content: {
      html: `
        <div class="flex flex-col items-center justify-center h-64 text-center">
          <h2 class="text-4xl font-accent mb-4">10 Minutes</h2>
          <p class="text-gray-400">Grab a coffee, stretch, or chat with your neighbor.</p>
        </div>
      `
    }
  },
  {
    id: 'd0000000-0000-0000-0000-000000000008',
    eventId: SAMPLE_EVENT_ID,
    sectionId: 'b0000000-0000-0000-0000-000000000003',
    type: 'activity',
    title: 'Experiment 2 – Weather Forecast Bot',
    timeRange: '1:35 – 2:00',
    durationMinutes: 25,
    position: 8,
    required: true,
    completionRule: 'manual',
    publishedVersion: 1,
    summary: 'Connecting external OpenWeather API with HTTP requests',
    content: {
      html: `
        <p class="text-xl mb-6">"Now we connect to real-world data."</p>
        <p class="mb-4">Use API: <strong>OpenWeather</strong></p>
        <div class="space-y-6 mb-8">
          <div class="border-l-2 border-blue-500 pl-4">
            <h5 class="font-bold mb-1">Step 1</h5>
            <p>Create free API key</p>
          </div>
          <div class="border-l-2 border-blue-500 pl-4">
            <h5 class="font-bold mb-1">Step 2</h5>
            <p>Add <strong>HTTP</strong> module in Make</p>
          </div>
          <div class="border-l-2 border-blue-500 pl-4">
            <h5 class="font-bold mb-1">Step 3</h5>
            <p>Configure <strong>GET</strong> request</p>
          </div>
          <div class="border-l-2 border-blue-500 pl-4">
            <h5 class="font-bold mb-1">Step 4</h5>
            <p>Use city from Telegram message</p>
          </div>
        </div>
        <p class="mb-4 text-gray-300">Explain: Map message text &rarr; API parameter</p>
        <div class="bg-zinc-900 p-4 rounded border border-zinc-800 mb-6">
          <p class="mb-2">Add another Telegram <strong>"Send Message"</strong> module.</p>
          <p>Extract temperature from JSON response.</p>
        </div>
        <p class="font-bold mb-2">Test:</p>
        <p class="mb-6">Send city name</p>
        <p class="text-xl font-accent">"This bot is now connected to global servers."</p>
      `
    }
  },
  {
    id: 'd0000000-0000-0000-0000-000000000009',
    eventId: SAMPLE_EVENT_ID,
    sectionId: 'b0000000-0000-0000-0000-000000000003',
    type: 'instruction',
    title: 'Understanding the Flow',
    timeRange: '2:00 – 2:15',
    durationMinutes: 15,
    position: 9,
    required: true,
    completionRule: 'manual',
    publishedVersion: 1,
    summary: 'Client-server flow and data transformation pipelines',
    content: {
      html: `
        <div class="flex flex-wrap items-center justify-center gap-4 font-mono text-xs md:text-sm mb-8 p-6 bg-zinc-900 rounded-xl border border-zinc-800">
          <div class="bg-black px-3 py-2 rounded border border-zinc-700">User</div>
          <span class="text-gray-500">&rarr;</span>
          <div class="bg-blue-900/30 px-3 py-2 rounded border border-blue-800 text-blue-300">Telegram</div>
          <span class="text-gray-500">&rarr;</span>
          <div class="bg-purple-900/30 px-3 py-2 rounded border border-purple-800 text-purple-300">Make</div>
          <span class="text-gray-500">&rarr;</span>
          <div class="bg-orange-900/30 px-3 py-2 rounded border border-orange-800 text-orange-300">Weather API</div>
          <span class="text-gray-500">&rarr;</span>
          <div class="bg-purple-900/30 px-3 py-2 rounded border border-purple-800 text-purple-300">Make</div>
          <span class="text-gray-500">&rarr;</span>
          <div class="bg-black px-3 py-2 rounded border border-zinc-700">User</div>
        </div>
        <h4 class="font-bold mb-4">Key Concepts:</h4>
        <ul class="list-disc pl-5 space-y-2 text-gray-300">
          <li>Client–Server architecture</li>
          <li>Triggers</li>
          <li>Data transformation</li>
        </ul>
      `
    }
  },
  {
    id: 'd0000000-0000-0000-0000-000000000010',
    eventId: SAMPLE_EVENT_ID,
    sectionId: 'b0000000-0000-0000-0000-000000000003',
    type: 'activity',
    title: 'Experiment 3 – Reminder Bot',
    timeRange: '2:15 – 2:35',
    durationMinutes: 20,
    position: 10,
    required: true,
    completionRule: 'manual',
    publishedVersion: 1,
    summary: 'Time automation with Tools -> Sleep delay modules',
    content: {
      html: `
        <p class="mb-6 text-gray-400">Time Automation</p>
        <div class="space-y-4 mb-8">
          <div class="flex items-center gap-4">
            <div class="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-mono">1</div>
            <div>Add module: <strong>Telegram &rarr; Watch Updates</strong></div>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-mono">2</div>
            <div>Use text format: <code class="bg-zinc-900 px-2 py-1 rounded ml-2">10 Meeting</code></div>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-mono">3</div>
            <div>Add: <strong>Tools &rarr; Sleep</strong></div>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-mono">4</div>
            <div>Map first number as delay.</div>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-mono">5</div>
            <div>Add: <strong>Telegram &rarr; Send Message</strong> (Send reminder text)</div>
          </div>
        </div>
        <div class="p-4 bg-zinc-900 border border-zinc-800 rounded mb-6">
          <p class="font-bold mb-2">Test:</p>
          <p>Test with 10 seconds.</p>
        </div>
        <p class="mb-4">When reminder appears:</p>
        <p class="text-xl font-accent mb-6">"This is time-based automation."</p>
        <div class="text-sm text-gray-400">
          <p class="font-bold text-gray-300 mb-1">Real-world uses:</p>
          <ul class="list-disc pl-5">
            <li>Exam alerts</li>
            <li>Payment reminders</li>
            <li>Scheduling</li>
          </ul>
        </div>
      `
    }
  },
  {
    id: 'd0000000-0000-0000-0000-000000000011',
    eventId: SAMPLE_EVENT_ID,
    sectionId: 'b0000000-0000-0000-0000-000000000004',
    type: 'challenge',
    title: 'Mini Challenge',
    timeRange: '2:35 – 2:50',
    durationMinutes: 15,
    position: 11,
    required: true,
    completionRule: 'manual',
    attachedQuizId: SAMPLE_QUIZ_ID,
    publishedVersion: 1,
    summary: 'Build your own bot: Quote, Joke, College, or News Bot',
    content: {
      html: `
        <h3 class="text-2xl font-bold mb-6">Students build one:</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div class="p-4 border border-zinc-700 hover:border-white transition-colors rounded cursor-default group">
            <h4 class="font-bold group-hover:text-emerald-400 transition-colors">Quote Bot</h4>
            <p class="text-sm text-gray-500 mt-1">Use public quote API</p>
          </div>
          <div class="p-4 border border-zinc-700 hover:border-white transition-colors rounded cursor-default group">
            <h4 class="font-bold group-hover:text-yellow-400 transition-colors">Joke Bot</h4>
            <p class="text-sm text-gray-500 mt-1">Tell me a joke</p>
          </div>
          <div class="p-4 border border-zinc-700 hover:border-white transition-colors rounded cursor-default group">
            <h4 class="font-bold group-hover:text-blue-400 transition-colors">College Announcement Bot</h4>
            <p class="text-sm text-gray-500 mt-1">Broadcast updates</p>
          </div>
          <div class="p-4 border border-zinc-700 hover:border-white transition-colors rounded cursor-default group">
            <h4 class="font-bold group-hover:text-red-400 transition-colors">News Bot</h4>
            <p class="text-sm text-gray-500 mt-1">Latest headlines</p>
          </div>
        </div>
        <p class="italic text-gray-400 mb-4">Walk around and assist.</p>
        <p class="font-bold">Encourage logic thinking: Trigger &rarr; Process &rarr; Output</p>
      `
    }
  },
  {
    id: 'd0000000-0000-0000-0000-000000000012',
    eventId: SAMPLE_EVENT_ID,
    sectionId: 'b0000000-0000-0000-0000-000000000004',
    type: 'instruction',
    title: 'Deployment & 24/7 Automation',
    timeRange: '2:50 – 2:55',
    durationMinutes: 5,
    position: 12,
    required: true,
    completionRule: 'manual',
    publishedVersion: 1,
    summary: 'Cloud schedule activation for permanent running',
    content: {
      html: `
        <p class="mb-4">Explain: Make runs in cloud.</p>
        <div class="flex items-center justify-center p-8">
          <button class="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(5,150,105,0.5)] hover:shadow-[0_0_30px_rgba(5,150,105,0.7)] transition-shadow">
            Turn Scenario ON
          </button>
        </div>
        <p class="text-center text-xl font-accent">"Your bot now works 24/7 without your laptop."</p>
      `
    }
  },
  {
    id: 'd0000000-0000-0000-0000-000000000013',
    eventId: SAMPLE_EVENT_ID,
    sectionId: 'b0000000-0000-0000-0000-000000000004',
    type: 'instruction',
    title: 'Closing',
    timeRange: '2:55 – 3:00',
    durationMinutes: 5,
    position: 13,
    required: true,
    completionRule: 'manual',
    publishedVersion: 1,
    summary: 'Review, future inspiration & next steps',
    content: {
      html: `
        <p class="mb-6">"Today you built:"</p>
        <ul class="list-disc pl-5 space-y-2 mb-8 text-lg">
          <li>Reply Bot</li>
          <li>Weather Automation</li>
          <li>Reminder System</li>
        </ul>
        <p class="text-xl font-bold mb-2">All without coding.</p>
        <p class="text-2xl font-accent mb-8">"Automation is not about syntax. It is about logic."</p>
        <div class="border-t border-zinc-800 pt-6">
          <p class="mb-4 text-gray-400">Encourage them to build:</p>
          <div class="flex flex-wrap gap-2">
            <span class="px-3 py-1 bg-zinc-900 rounded-full text-sm border border-zinc-800">Attendance Bot</span>
            <span class="px-3 py-1 bg-zinc-900 rounded-full text-sm border border-zinc-800">Quiz Bot</span>
            <span class="px-3 py-1 bg-zinc-900 rounded-full text-sm border border-zinc-800">File Sharing Bot</span>
            <span class="px-3 py-1 bg-zinc-900 rounded-full text-sm border border-zinc-800">Placement Alert Bot</span>
          </div>
        </div>
        <p class="mt-8 text-center text-gray-500 italic">"Start small. Build big."</p>
      `
    }
  }
];

export const sampleQuiz: QuizModel = {
  id: SAMPLE_QUIZ_ID,
  eventId: SAMPLE_EVENT_ID,
  title: 'No-Code Automation Mastery Quiz',
  description: 'Test your understanding of triggers, actions, APIs, and Webhooks.',
  settings: {
    timeLimitSeconds: 30,
    pointsPerQuestion: 100,
    speedBonus: true,
    negativeMarking: false,
    revealAnswerMode: 'after_each',
    leaderboardMode: 'top3_and_me'
  },
  theme: {
    name: 'dark',
    accent: '#10b981',
    soundEnabled: false
  },
  status: 'published',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  questions: [
    {
      id: 'q1',
      quizId: SAMPLE_QUIZ_ID,
      type: 'single_choice',
      prompt: 'In No-Code automation, what is the role of a "Trigger"?',
      options: [
        'It transforms data into a new format',
        'It is an event listener that initiates the scenario',
        'It stores credentials securely in the cloud',
        'It terminates execution after an error'
      ],
      correctAnswerKeys: ['It is an event listener that initiates the scenario'],
      explanation: 'A trigger listens for specific events (like a message received or a webhook payload) and kicks off the automation flow.',
      points: 100,
      timeLimitSeconds: 30,
      position: 1
    },
    {
      id: 'q2',
      quizId: SAMPLE_QUIZ_ID,
      type: 'true_false',
      prompt: 'Once a Make.com scenario is turned ON, it runs 24/7 in the cloud without requiring your laptop to remain open.',
      options: ['True', 'False'],
      correctAnswerKeys: ['True'],
      explanation: 'Make scenarios run on cloud infrastructure independently of your local computer.',
      points: 100,
      timeLimitSeconds: 20,
      position: 2
    },
    {
      id: 'q3',
      quizId: SAMPLE_QUIZ_ID,
      type: 'multiple_select',
      prompt: 'Which of the following are valid real-world use cases for webhook/time-based automation?',
      options: [
        'Weather condition alerts',
        'Automated payment reminders',
        'College event notifications',
        'Direct human telepathy'
      ],
      correctAnswerKeys: [
        'Weather condition alerts',
        'Automated payment reminders',
        'College event notifications'
      ],
      explanation: 'Alerts, reminders, and broadcast notifications are standard applications for no-code workflows.',
      points: 150,
      timeLimitSeconds: 35,
      position: 3
    }
  ]
};

// =============================================================================
// LinkedIn Profile Building Workshop (11-Step Event Guide)
// =============================================================================

export const LINKEDIN_EVENT_ID = 'e1000000-0000-0000-0000-000000000001';

export const linkedinEvent: EventModel = {
  id: LINKEDIN_EVENT_ID,
  title: 'LinkedIn Profile Building Workshop',
  slug: 'linkedin-profile-building-workshop',
  description: 'Interactive hands-on guide to building a professional LinkedIn presence, optimizing visibility, networking with peers, and publishing an event reflection.',
  timezone: 'Asia/Kolkata',
  status: 'published',
  accessCode: 'LINKEDIN',
  accessPolicy: 'code',
  theme: {
    palette: 'dark',
    accentColor: '#0077b5',
    badge: 'LINKEDIN'
  },
  publishedVersion: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const linkedinSections: EventSection[] = [
  {
    id: 'sec-li-1',
    eventId: LINKEDIN_EVENT_ID,
    title: 'Part 1: Account & Identity Setup',
    description: 'Account access and customized vanity URL configuration',
    position: 1,
    visibility: 'visible'
  },
  {
    id: 'sec-li-2',
    eventId: LINKEDIN_EVENT_ID,
    title: 'Part 2: Profile Core & Visual Branding',
    description: 'Header introduction, professional photo, and customized banner',
    position: 2,
    visibility: 'visible'
  },
  {
    id: 'sec-li-3',
    eventId: LINKEDIN_EVENT_ID,
    title: 'Part 3: Professional Narrative & Credentials',
    description: 'About story, practical experience, academic background, and skills',
    position: 3,
    visibility: 'visible'
  },
  {
    id: 'sec-li-4',
    eventId: LINKEDIN_EVENT_ID,
    title: 'Part 4: Engagement & Networking Challenge',
    description: 'Live event post publishing, profile submission, and peer networking',
    position: 4,
    visibility: 'visible'
  },
  {
    id: 'sec-li-5',
    eventId: LINKEDIN_EVENT_ID,
    title: 'Networking',
    description: 'Connect directly with event speakers and instructors via LinkedIn QR codes',
    position: 5,
    visibility: 'visible'
  }
];

export const linkedinSteps: EventStep[] = [
  // Step 1
  {
    id: 'li-step-01',
    eventId: LINKEDIN_EVENT_ID,
    sectionId: 'sec-li-1',
    type: 'instruction',
    title: 'Login / Sign Up',
    timeRange: '0:00 – 0:15',
    durationMinutes: 15,
    position: 1,
    required: true,
    completionRule: 'manual',
    publishedVersion: 1,
    summary: 'Ensure every attendee can access their LinkedIn account',
    objective: 'Ensure every attendee can access LinkedIn and verify account functionality.',
    content: {
      html: `
        <p class="mb-4 text-base">Welcome to the <strong>LinkedIn Profile Building Workshop</strong>.</p>
        <p class="mb-4">Today you will transform your LinkedIn profile into a compelling, recruiter-ready professional asset.</p>

        <div class="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl mb-6">
          <h4 class="font-bold text-white mb-2 text-sm uppercase tracking-wider font-mono">Action Instructions:</h4>
          <ol class="list-decimal pl-5 space-y-2 text-zinc-300 text-sm">
            <li>Open LinkedIn using the official website (<a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline font-mono">linkedin.com</a>) or mobile app.</li>
            <li>Sign in using your existing account, or click <strong>Join now</strong> to create a new profile.</li>
            <li>Complete any required two-factor or email/phone verification.</li>
            <li>Confirm that your home feed and profile page are loaded and accessible before proceeding.</li>
          </ol>
        </div>

        <div class="p-4 bg-blue-950/30 border border-blue-800/50 rounded-xl text-blue-200 text-xs">
          <strong>Tip:</strong> If you are creating a new account, use your primary personal email address that you will keep access to throughout your college and professional career.
        </div>
      `
    },
    tasks: [
      { id: 'li-t1-1', stepId: 'li-step-01', title: 'Open official LinkedIn website or mobile application', position: 1, required: true },
      { id: 'li-t1-2', stepId: 'li-step-01', title: 'Sign in to existing account or register new profile', position: 2, required: true },
      { id: 'li-t1-3', stepId: 'li-step-01', title: 'Complete email or SMS security verification', position: 3, required: true },
      { id: 'li-t1-4', stepId: 'li-step-01', title: 'Verify account feed and profile view are loaded', position: 4, required: true }
    ],
    resources: [
      { id: 'res-li-1', stepId: 'li-step-01', label: 'LinkedIn Official Portal', type: 'link', url: 'https://www.linkedin.com', position: 1 }
    ]
  },

  // Step 2
  {
    id: 'li-step-02',
    eventId: LINKEDIN_EVENT_ID,
    sectionId: 'sec-li-1',
    type: 'instruction',
    title: 'Custom Username Setup',
    timeRange: '0:15 – 0:30',
    durationMinutes: 15,
    position: 2,
    required: true,
    completionRule: 'manual',
    publishedVersion: 1,
    summary: 'Create a clean, professional, personalized LinkedIn profile URL',
    objective: 'Create a professional, personalized vanity LinkedIn profile URL.',
    content: {
      html: `
        <p class="mb-4">By default, LinkedIn assigns random numbers to your URL (e.g. <code>linkedin.com/in/alex-rivers-78a94b21</code>). Clean this up into a concise, branded link suitable for resumes and email signatures.</p>

        <div class="space-y-4 mb-6">
          <div class="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-sm">
            <h5 class="font-bold text-white mb-2 font-mono">How to edit your Public Profile URL:</h5>
            <ol class="list-decimal pl-5 space-y-1.5 text-zinc-300">
              <li>Click your profile picture icon at the top right labeled <strong>"Me"</strong> &rarr; <strong>View Profile</strong>.</li>
              <li>On the right side of your profile page, click <strong>"Public profile & URL"</strong> (or the pencil edit icon).</li>
              <li>Under <strong>"Edit your custom URL"</strong>, click the pencil icon next to your link.</li>
              <li>Type your preferred handle based on your name, such as <code>firstname-lastname</code> or <code>firstnamelastname</code>.</li>
              <li>Avoid unnecessary numbers, nicknames, or unprofessional phrasing.</li>
              <li>Click <strong>Save</strong> and copy your new URL.</li>
            </ol>
          </div>
        </div>

        <div class="p-4 bg-emerald-950/30 border border-emerald-800/50 rounded-xl text-emerald-200 text-xs">
          <strong>Recommended Format:</strong> <code>linkedin.com/in/firstname-lastname</code> or <code>linkedin.com/in/firstnamelastname</code>
        </div>
      `,
      submissionType: 'url',
      submissionKey: 'custom_profile_url',
      submissionLabel: 'Test & Verify: Paste your custom profile URL below',
      submissionPlaceholder: 'https://www.linkedin.com/in/your-name'
    },
    tasks: [
      { id: 'li-t2-1', stepId: 'li-step-02', title: 'Open LinkedIn Profile & click "Public profile & URL"', position: 1, required: true },
      { id: 'li-t2-2', stepId: 'li-step-02', title: 'Edit custom URL to firstname-lastname format', position: 2, required: true },
      { id: 'li-t2-3', stepId: 'li-step-02', title: 'Remove auto-generated numbers and save changes', position: 3, required: true },
      { id: 'li-t2-4', stepId: 'li-step-02', title: 'Copy and verify your updated custom profile URL', position: 4, required: true }
    ]
  },

  // Step 3
  {
    id: 'li-step-03',
    eventId: LINKEDIN_EVENT_ID,
    sectionId: 'sec-li-2',
    type: 'checklist',
    title: 'Edit Intro',
    timeRange: '0:30 – 0:50',
    durationMinutes: 20,
    position: 3,
    required: true,
    completionRule: 'checklist_all',
    publishedVersion: 1,
    summary: 'Complete the core introduction fields shown at the top of your profile',
    objective: 'Complete the basic information displayed at the top of the LinkedIn profile.',
    content: {
      html: `
        <p class="mb-4">The top card of your profile is the first thing recruiters and peers see. Review and personalize each field carefully.</p>

        <div class="p-5 bg-zinc-900 border border-zinc-800 rounded-xl mb-6">
          <h4 class="font-bold text-white mb-2 text-sm">Professional Headline Guidelines</h4>
          <p class="text-zinc-400 text-xs mb-3">Your headline should accurately represent your current status, skills, or professional aspirations. Personalize it rather than using a forced generic line.</p>
          <div class="p-3 bg-black rounded-lg border border-zinc-700 font-mono text-xs text-emerald-400">
            Example: Computer Science Engineering Student at Gopalan College of Engineering and Management (GCEM), Bengaluru | Aspiring Software Developer
          </div>
        </div>

        <div class="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs text-zinc-300 space-y-2 mb-4">
          <p><strong>Education Example:</strong> Gopalan College of Engineering and Management (GCEM), Bengaluru. (Lake Montfort School or previous schooling may be added as previous education where relevant).</p>
          <p><strong>Organization:</strong> Use your actual organization, company, or student chapter if applicable. Do not select unverified sample organizations.</p>
          <p><strong>Note on Variations:</strong> LinkedIn displays different fields depending on account type and interface version. Pronouns and additional name are optional.</p>
        </div>
      `,
      sampleHeadline: 'Computer Science Engineering Student at Gopalan College of Engineering and Management (GCEM), Bengaluru | Aspiring Software Developer'
    },
    tasks: [
      { id: 'li-t3-01', stepId: 'li-step-03', title: 'First name', position: 1, required: true },
      { id: 'li-t3-02', stepId: 'li-step-03', title: 'Last name', position: 2, required: true },
      { id: 'li-t3-03', stepId: 'li-step-03', title: 'Additional name / name pronunciation (Optional)', position: 3, required: false },
      { id: 'li-t3-04', stepId: 'li-step-03', title: 'Pronouns (Optional)', position: 4, required: false },
      { id: 'li-t3-05', stepId: 'li-step-03', title: 'Professional headline (Personalized current role / target field)', position: 5, required: true },
      { id: 'li-t3-06', stepId: 'li-step-03', title: 'Country / Region (e.g. India)', position: 6, required: true },
      { id: 'li-t3-07', stepId: 'li-step-03', title: 'City (e.g. Bengaluru, Karnataka)', position: 7, required: true },
      { id: 'li-t3-08', stepId: 'li-step-03', title: 'Organization (Actual workplace or student community, where applicable)', position: 8, required: false },
      { id: 'li-t3-09', stepId: 'li-step-03', title: 'Education institution (e.g. GCEM Bengaluru)', position: 9, required: true },
      { id: 'li-t3-10', stepId: 'li-step-03', title: 'Industry (e.g. Technology, Information & Internet)', position: 10, required: true },
      { id: 'li-t3-11', stepId: 'li-step-03', title: 'Contact information (Email, phone, personal links)', position: 11, required: true },
      { id: 'li-t3-12', stepId: 'li-step-03', title: 'Custom LinkedIn profile URL verified in intro header', position: 12, required: true }
    ]
  },

  // Step 4
  {
    id: 'li-step-04',
    eventId: LINKEDIN_EVENT_ID,
    sectionId: 'sec-li-2',
    type: 'activity',
    title: 'Profile Picture Generation and Upload',
    timeRange: '0:50 – 1:10',
    durationMinutes: 20,
    position: 4,
    required: true,
    completionRule: 'manual',
    publishedVersion: 1,
    summary: 'Upload a clear, well-lit, professional headshot photo',
    objective: 'Create a professional and recognizable profile image.',
    content: {
      html: `
        <p class="mb-4">Profiles with professional pictures receive up to <strong>21x more views</strong> and <strong>9x more connection requests</strong>.</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-xs space-y-2">
            <h5 class="font-bold text-emerald-400 font-mono uppercase">Characteristics of a Great Photo:</h5>
            <ul class="list-disc pl-4 space-y-1 text-zinc-300">
              <li>Clear focus and high resolution.</li>
              <li>Front-facing headshot (face occupies ~60% of frame).</li>
              <li>Good natural or soft lighting without harsh shadows.</li>
              <li>Neutral, uncluttered, or solid background.</li>
              <li>Friendly, professional expression.</li>
            </ul>
          </div>
          <div class="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-xs space-y-2">
            <h5 class="font-bold text-purple-400 font-mono uppercase">AI & Editing Guidance:</h5>
            <ul class="list-disc pl-4 space-y-1 text-zinc-300">
              <li>If using AI tools (background cleanup, lighting enhancement), ensure the image remains a <strong>realistic, recognizable likeness of you</strong>.</li>
              <li>Avoid over-stylized, cartoonish, or heavily altered avatars.</li>
              <li>Image generation is optional—an authentic smartphone photo with good lighting is completely suitable.</li>
            </ul>
          </div>
        </div>

        <div class="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs text-zinc-400">
          <strong>How to upload:</strong> Click the circular camera icon on your LinkedIn profile picture &rarr; Upload photo &rarr; Adjust crop circle &rarr; Set visibility to "Public" or "All LinkedIn Members" &rarr; Save.
        </div>
      `,
      aiPromptTitle: 'Professional LinkedIn Profile Headshot AI Prompt',
      aiPrompt: `## Prompt: Professional LinkedIn Profile Headshot

**Objective:** Transform the uploaded photograph into a high-quality, photorealistic corporate headshot suitable for LinkedIn, professional networking, resumes, company profiles, and developer portfolios.

### 1. Identity Preservation — Highest Priority

Use the uploaded photograph as the primary and authoritative reference for the person's identity.

- Preserve the person's exact facial identity, facial structure, face shape, skin tone, ethnicity, age appearance, eye shape, nose, lips, jawline, ears, and natural facial proportions.
- Retain distinctive identifying features, natural asymmetry, facial hair, hairstyle, hairline, and other recognizable characteristics visible in the original.
- Do not replace the face, generate a different person, beautify excessively, or apply artificial facial reconstruction.
- Do not change the person's apparent age, alter their skin tone, slim or widen their face, enlarge their eyes, reshape their nose, or artificially modify their smile.
- Maintain realistic skin texture, pores, fine facial details, and natural hair strands.
- If the original photograph is low-resolution, improve clarity conservatively without inventing facial details.

### 2. Professional Attire

Dress the person in elegant, understated corporate attire appropriate for a software engineer or backend developer.

- Preferred outfit: a well-fitted dark navy or charcoal blazer over a clean white or light-blue formal shirt.
- Ensure the clothing fits naturally around the shoulders and neck.
- Use realistic fabric texture, natural folds, proper collar alignment, and professional tailoring.
- Keep accessories minimal and appropriate.
- Avoid flashy patterns, visible logos, excessive jewellery, ties unless appropriate, or distracting accessories.
- Preserve the person's natural body proportions.

### 3. Head Position and Composition

Create a conventional professional studio headshot.

- Use a straight-on, front-facing composition with the person looking directly into the camera.
- Keep the head upright, shoulders relaxed, and posture confident and natural.
- Frame the image from the upper chest or shoulders upward.
- Position the face centrally, with the head and shoulders balanced within the frame.
- The face should occupy approximately 60% of the image height, with enough space above the head and around the shoulders.
- Keep both eyes clearly visible and naturally aligned.
- Use a natural, friendly, confident expression with a subtle, genuine smile.
- Avoid exaggerated smiling, stiff poses, excessive head tilting, or dramatic angles.

### 4. Lighting and Image Quality

Use realistic professional portrait photography techniques.

- Apply soft, diffused studio lighting that resembles natural window light.
- Illuminate the face evenly while retaining natural facial contours and depth.
- Avoid harsh shadows, blown highlights, excessive contrast, coloured lighting, and artificial glow.
- Maintain accurate skin tones and neutral white balance.
- Render sharp facial details, especially the eyes, while keeping the overall image natural.
- Simulate a professional portrait lens with subtle background separation and realistic depth of field.
- Avoid excessive sharpening, artificial skin smoothing, plastic-looking skin, HDR effects, or oversaturated colours.

### 5. Background

Use a clean, neutral, distraction-free background.

- Preferred background: solid light grey, warm off-white, or a subtle neutral studio backdrop.
- Keep the background uniform and professional.
- Use gentle natural tonal separation between the subject and background.
- Ensure the background does not blend awkwardly with the hair or shoulders.
- Do not add office scenes, furniture, graphics, patterns, text, logos, artificial bokeh, or decorative elements.

### 6. Retouching

Apply only subtle, realistic professional retouching.

- Correct minor lighting inconsistencies and temporary photographic imperfections.
- Preserve natural skin texture, pores, facial hair, and individual characteristics.
- Keep the eyes, teeth, hair, and skin realistic.
- Do not remove permanent identifying features, birthmarks, scars, or natural characteristics.
- Do not apply beauty filters, excessive whitening, face reshaping, artificial eye enhancement, or unrealistic skin smoothing.

### 7. Technical Output

- Aspect ratio: 1:1 square.
- Resolution: at least 1024 × 1024 pixels, preferably higher if supported.
- Output: one finished, high-resolution, photorealistic headshot.
- Keep the face and shoulders within the central safe area for LinkedIn's circular profile-picture crop.
- Ensure the image remains clear and recognizable at small profile-picture sizes.
- Use natural colours, realistic proportions, and professional photographic quality.

### 8. Strict Negative Instructions

Do not generate a new identity. Do not change the person's face, age, skin tone, hairstyle, or distinctive features. Do not create an illustration, painting, anime portrait, 3D render, synthetic-looking face, or AI beauty portrait. Do not add text, watermarks, logos, borders, props, or unrelated objects. Do not distort the head, eyes, ears, shoulders, hands, clothing, or background edges.

### Final Quality Standard

The final result must look like an authentic photograph taken by a professional corporate portrait photographer, not an AI-generated image. It should communicate competence, approachability, confidence, authenticity, and professionalism while remaining unmistakably the same person shown in the uploaded photograph.

**Execute the transformation using the uploaded photograph as the identity reference. Prioritize identity accuracy over aesthetic enhancement.**`
    },
    tasks: [
      { id: 'li-t4-1', stepId: 'li-step-04', title: 'Select or take a well-lit, front-facing headshot with neutral background', position: 1, required: true },
      { id: 'li-t4-2', stepId: 'li-step-04', title: 'Verify image looks authentic, sharp, and recognizable', position: 2, required: true },
      { id: 'li-t4-3', stepId: 'li-step-04', title: 'Upload image to LinkedIn and adjust crop alignment', position: 3, required: true },
      { id: 'li-t4-4', stepId: 'li-step-04', title: 'Set visibility to Public / All LinkedIn Members and save', position: 4, required: true }
    ]
  },

  // Step 5
  {
    id: 'li-step-05',
    eventId: LINKEDIN_EVENT_ID,
    sectionId: 'sec-li-2',
    type: 'activity',
    title: 'Custom Banner Design and Upload',
    timeRange: '1:10 – 1:30',
    durationMinutes: 20,
    position: 5,
    required: true,
    completionRule: 'manual',
    publishedVersion: 1,
    summary: 'Design and upload a customized profile background banner',
    objective: 'Personalize the LinkedIn profile with a professional banner.',
    content: {
      html: `
        <p class="mb-4">The profile banner (cover photo) is your personal billboard. It visually establishes your domain, interests, and professional aspirations.</p>

        <div class="space-y-4 mb-6">
          <div class="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-xs space-y-2">
            <h5 class="font-bold text-white font-mono uppercase">Banner Design Best Practices:</h5>
            <ul class="list-disc pl-4 space-y-1.5 text-zinc-300">
              <li><strong>Recommended Dimensions:</strong> 1584 &times; 396 pixels (4:1 aspect ratio).</li>
              <li><strong>Keep Left Clear:</strong> Your circular profile picture overlaps the bottom-left portion on desktop and center-left on mobile. Keep text and logos toward the right or center.</li>
              <li><strong>Content Ideas:</strong> Tech stack icons, domain keywords (e.g. Cloud Computing | AI | Web Engineering), portfolio link, or a clean minimalist gradient with your personal motto.</li>
              <li><strong>Personalized:</strong> Create a design that reflects your genuine direction. Do not require all attendees to use identical graphics.</li>
            </ul>
          </div>
        </div>

        <div class="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs text-zinc-400">
          <strong>Tools:</strong> You can create a free custom banner on Canva (<a href="https://www.canva.com/templates/banners/linkedin/" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline">Canva LinkedIn Banner Templates</a>) or Figma.
        </div>
      `
    },
    tasks: [
      { id: 'li-t5-1', stepId: 'li-step-05', title: 'Create or choose a personalized banner (1584 x 396 px)', position: 1, required: true },
      { id: 'li-t5-2', stepId: 'li-step-05', title: 'Ensure text & key elements are positioned away from the profile picture overlap', position: 2, required: true },
      { id: 'li-t5-3', stepId: 'li-step-05', title: 'Upload banner via the pencil icon at top right of the cover area', position: 3, required: true },
      { id: 'li-t5-4', stepId: 'li-step-05', title: 'Verify appearance on both desktop and mobile view', position: 4, required: true }
    ],
    resources: [
      { id: 'res-li-2', stepId: 'li-step-05', label: 'Canva LinkedIn Banner Templates', type: 'link', url: 'https://www.canva.com/templates/banners/linkedin/', position: 1 }
    ]
  },

  // Step 6
  {
    id: 'li-step-06',
    eventId: LINKEDIN_EVENT_ID,
    sectionId: 'sec-li-3',
    type: 'instruction',
    title: 'About Section',
    timeRange: '1:30 – 1:55',
    durationMinutes: 25,
    position: 6,
    required: true,
    completionRule: 'manual',
    publishedVersion: 1,
    summary: 'Craft a compelling narrative communicating who you are and where you are headed',
    objective: 'Write a concise, authentic professional introduction.',
    content: {
      html: `
        <p class="mb-4">Your <strong>About</strong> section is your elevator pitch in written form. It turns a list of qualifications into a coherent story.</p>

        <div class="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-xs space-y-2 mb-6">
          <h5 class="font-bold text-white font-mono uppercase">Suggested 6-Part Framework:</h5>
          <ol class="list-decimal pl-4 space-y-1.5 text-zinc-300">
            <li><strong>Who you are:</strong> Introduce yourself and your current degree or role.</li>
            <li><strong>Current focus:</strong> Mention your primary technical or domain interests.</li>
            <li><strong>Projects & highlights:</strong> Briefly describe 1–2 practical projects, hackathons, or learning milestones.</li>
            <li><strong>Non-technical strengths:</strong> Teamwork, problem-solving, community involvement.</li>
            <li><strong>Career vision:</strong> What kind of engineering or professional challenges excite you.</li>
            <li><strong>Call to action:</strong> Invite connections, mentorship, and collaboration.</li>
          </ol>
        </div>

        <div class="p-5 bg-zinc-950 border border-zinc-800 rounded-xl mb-6">
          <h5 class="font-bold text-emerald-400 font-mono text-xs mb-2 uppercase">Adaptable Sample Template (Personalize for Yourself):</h5>
          <blockquote class="text-xs text-zinc-300 leading-relaxed font-sans italic bg-zinc-900/50 p-4 rounded border-l-2 border-emerald-500">
            "I am a Computer Science Engineering student at Gopalan College of Engineering and Management (GCEM), Bengaluru, with a deep interest in software engineering and cloud systems.<br/><br/>
            Currently, I am building full-stack web applications and exploring scalable backend architectures. I enjoy taking ideas from concept to deployment, whether collaborating during hackathons or developing personal projects.<br/><br/>
            Beyond coding, I actively contribute to peer tech communities and enjoy mentoring peers in no-code automation and web fundamentals.<br/><br/>
            I am always eager to connect with fellow developers, mentors, and engineers. Feel free to reach out to exchange ideas or discuss software projects!"
          </blockquote>
        </div>

        <p class="text-xs text-zinc-500 italic">Important: Do not fabricate experience. Write naturally in your own authentic voice.</p>
      `,
      sampleAboutText: `I am a Computer Science Engineering student at Gopalan College of Engineering and Management (GCEM), Bengaluru, with a deep interest in software engineering and cloud systems. Currently building practical applications and eager to collaborate!`
    },
    tasks: [
      { id: 'li-t6-1', stepId: 'li-step-06', title: 'Draft opening statement introducing current study / professional role', position: 1, required: true },
      { id: 'li-t6-2', stepId: 'li-step-06', title: 'Highlight 2-3 genuine technical skills and project experiences', position: 2, required: true },
      { id: 'li-t6-3', stepId: 'li-step-06', title: 'State career interests and target domains', position: 3, required: true },
      { id: 'li-t6-4', stepId: 'li-step-06', title: 'Add networking call-to-action inviting connections', position: 4, required: true },
      { id: 'li-t6-5', stepId: 'li-step-06', title: 'Save formatted text into the LinkedIn About summary section', position: 5, required: true }
    ]
  },

  // Step 7
  {
    id: 'li-step-07',
    eventId: LINKEDIN_EVENT_ID,
    sectionId: 'sec-li-3',
    type: 'checklist',
    title: 'Experience',
    timeRange: '1:55 – 2:15',
    durationMinutes: 20,
    position: 7,
    required: true,
    completionRule: 'checklist_all',
    publishedVersion: 1,
    summary: 'Document internships, student leadership, volunteer work, or project involvement',
    objective: 'Represent relevant practical experience and involvement accurately.',
    content: {
      html: `
        <p class="mb-4">Experience on LinkedIn is not limited to salaried corporate jobs. It includes any role where you took responsibility and delivered results.</p>

        <div class="p-4 bg-red-950/20 border border-red-900/50 rounded-xl text-red-200 text-xs mb-6">
          <strong>Integrity Rule:</strong> If you do not have formal work experience yet, <strong>do not invent jobs</strong>. Instead, document genuine student club roles, open-source work, hackathons, or leave the section for future roles.
        </div>

        <div class="space-y-3 mb-6 text-xs text-zinc-300">
          <p class="font-bold text-white">Applicable Experience Types to Add:</p>
          <ul class="list-disc pl-5 space-y-1 text-zinc-400">
            <li><strong>Internships & Apprenticeships:</strong> Summer training, virtual internships, part-time developer roles.</li>
            <li><strong>Student Leadership & Clubs:</strong> Technical club leads, event coordinators, IEEE/CSI/ACM chapter roles.</li>
            <li><strong>Volunteering & Community:</strong> Workshop organizing, college fest management, NGO tech support.</li>
            <li><strong>Major Project Roles:</strong> Capstone projects, open-source maintainership, hackathon team lead roles.</li>
          </ul>
        </div>
      `
    },
    tasks: [
      { id: 'li-t7-1', stepId: 'li-step-07', title: 'Review existing experience or confirm applicable student activities', position: 1, required: true },
      { id: 'li-t7-2', stepId: 'li-step-07', title: 'Add genuine internships, volunteer work, or club responsibilities', position: 2, required: true },
      { id: 'li-t7-3', stepId: 'li-step-07', title: 'Include action verbs (Built, Spearheaded, Coordinated) and measurable impact', position: 3, required: true },
      { id: 'li-t7-4', stepId: 'li-step-07', title: 'Verify accurate start and end dates before saving', position: 4, required: true }
    ]
  },

  // Step 8
  {
    id: 'li-step-08',
    eventId: LINKEDIN_EVENT_ID,
    sectionId: 'sec-li-3',
    type: 'instruction',
    title: 'Education',
    timeRange: '2:15 – 2:30',
    durationMinutes: 15,
    position: 8,
    required: true,
    completionRule: 'manual',
    publishedVersion: 1,
    summary: 'Present your college, degree, and academic milestones clearly',
    objective: 'Present academic qualifications clearly and accurately.',
    content: {
      html: `
        <p class="mb-4">Your education section links you to your college alumni network—one of the highest-converting sources for job referrals.</p>

        <div class="p-5 bg-zinc-900 border border-zinc-800 rounded-xl mb-6 text-xs space-y-3">
          <h5 class="font-bold text-white font-mono uppercase">Key Details to Include:</h5>
          <ul class="list-disc pl-5 space-y-2 text-zinc-300">
            <li><strong>School / College:</strong> Select the official LinkedIn page of your institution (e.g. <em>Gopalan College of Engineering and Management (GCEM), Bengaluru</em>) so its official logo displays.</li>
            <li><strong>Degree:</strong> Bachelor of Engineering (B.E.), B.Tech, BCA, or applicable degree.</li>
            <li><strong>Field of Study:</strong> Computer Science and Engineering, Electronics, etc.</li>
            <li><strong>Start & Expected End Year:</strong> e.g. 2022 – 2026.</li>
            <li><strong>Activities and Societies:</strong> Mention coding clubs, sports, technical symposiums.</li>
            <li><strong>Previous Education (Optional):</strong> High school / pre-university (e.g. Lake Montfort School) may be added if relevant.</li>
          </ul>
        </div>
      `
    },
    tasks: [
      { id: 'li-t8-1', stepId: 'li-step-08', title: 'Select official university / college LinkedIn page (e.g. GCEM Bengaluru)', position: 1, required: true },
      { id: 'li-t8-2', stepId: 'li-step-08', title: 'Enter exact degree and field of study', position: 2, required: true },
      { id: 'li-t8-3', stepId: 'li-step-08', title: 'Specify accurate enrollment and graduation dates', position: 3, required: true },
      { id: 'li-t8-4', stepId: 'li-step-08', title: 'Add notable student societies or academic achievements', position: 4, required: true }
    ]
  },

  // Step 9
  {
    id: 'li-step-09',
    eventId: LINKEDIN_EVENT_ID,
    sectionId: 'sec-li-3',
    type: 'checklist',
    title: 'Licenses & Certifications and Skills',
    timeRange: '2:30 – 2:50',
    durationMinutes: 20,
    position: 9,
    required: true,
    completionRule: 'checklist_all',
    publishedVersion: 1,
    summary: 'Highlight verifiable certificates and select top searchable skills',
    objective: 'Highlight verifiable credentials and relevant capabilities.',
    content: {
      html: `
        <div class="space-y-6 mb-6">
          <div class="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-xs space-y-2">
            <h5 class="font-bold text-blue-400 font-mono uppercase">A. Licenses & Certifications</h5>
            <p class="text-zinc-300">Add genuine credentials from platforms like Coursera, AWS, Google Cloud, HackerRank, or verified workshop certificates.</p>
            <ul class="list-disc pl-4 space-y-1 text-zinc-400">
              <li>Include credential name, issuing body, issue date, and expiration date (if any).</li>
              <li>Add the verification URL or Credential ID so recruiters can validate it.</li>
              <li>Do not invent certificates or claim courses not completed.</li>
            </ul>
          </div>

          <div class="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-xs space-y-2">
            <h5 class="font-bold text-purple-400 font-mono uppercase">B. Skills Selection</h5>
            <p class="text-zinc-300">Recruiters search LinkedIn by skills. Add at least <strong>5 technical skills</strong> and <strong>3 professional competencies</strong>.</p>
            <ul class="list-disc pl-4 space-y-1 text-zinc-400">
              <li><strong>Technical:</strong> Python, JavaScript, React.js, SQL, REST APIs, Git.</li>
              <li><strong>Professional:</strong> Problem Solving, Team Leadership, Critical Thinking, Public Speaking.</li>
              <li><strong>Pin Top 3:</strong> Reorder skills to pin the 3 most relevant to your target career at the top.</li>
            </ul>
          </div>
        </div>
      `
    },
    tasks: [
      { id: 'li-t9-1', stepId: 'li-step-09', title: 'Add verified certifications with issuer and credential URL', position: 1, required: true },
      { id: 'li-t9-2', stepId: 'li-step-09', title: 'Add 5+ core technical skills reflecting actual knowledge', position: 2, required: true },
      { id: 'li-t9-3', stepId: 'li-step-09', title: 'Add 3+ professional collaboration & communication skills', position: 3, required: true },
      { id: 'li-t9-4', stepId: 'li-step-09', title: 'Pin your top 3 primary skills to the profile highlight', position: 4, required: true }
    ]
  },

  // Step 10
  {
    id: 'li-step-10',
    eventId: LINKEDIN_EVENT_ID,
    sectionId: 'sec-li-4',
    type: 'activity',
    title: 'Create a LinkedIn Post About the Current Event',
    timeRange: '2:50 – 3:15',
    durationMinutes: 25,
    position: 10,
    required: true,
    completionRule: 'manual',
    publishedVersion: 1,
    summary: 'Publish a reflection post tagging the One Percent Club and using event hashtags',
    objective: 'Publish a professional post reflecting on the workshop experience.',
    content: {
      html: `
        <p class="mb-4">Publishing an insightful post demonstrates initiative, communication skills, and continuous learning to your network.</p>

        <div class="p-5 bg-zinc-900 border border-zinc-800 rounded-xl mb-6 text-xs space-y-3">
          <h5 class="font-bold text-white font-mono uppercase">Posting Requirements:</h5>
          <ul class="list-disc pl-5 space-y-1.5 text-zinc-300">
            <li><strong>Mention Official Account:</strong> Tag the official <strong>One Percent Club</strong> LinkedIn page in your post.</li>
            <li><strong>Include Event Hashtags:</strong> Use the approved tags specified by organizers below.</li>
            <li><strong>Attach Event Photos:</strong> Use the workshop photos provided by the facilitators.</li>
            <li><strong>Authentic Reflection:</strong> Summarize 2–3 key takeaways in your own words.</li>
            <li><strong>Publish & Submit:</strong> Publish on your personal profile and submit the link below.</li>
          </ul>
        </div>
      `,
      officialAccountMention: '@One Percent Club',
      officialAccountUrl: 'https://www.linkedin.com/in/theonepercentclub/',
      requiredHashtags: [
        '#LinkedInWorkshop',
        '#OnePercentClub',
        '#ProfessionalBranding',
        '#CareerGrowth',
        '#Networking'
      ],
      samplePostText: `Just completed an insightful LinkedIn Profile Building Workshop organized by the One Percent Club! 🚀

Here are my top 3 takeaways from today's hands-on session:
1. The importance of a personalized headline and custom vanity URL for discoverability.
2. How to craft an authentic About section that tells a compelling professional story.
3. Leveraging LinkedIn for meaningful professional connections rather than passive browsing.

Huge thanks to the organizers and mentors for hosting such an impactful session! Looking forward to applying these strategies as I continue my software engineering journey.

#LinkedInWorkshop #OnePercentClub #ProfessionalBranding #CareerGrowth #Networking`,
      submissionType: 'url',
      submissionKey: 'published_post_url',
      submissionLabel: 'Submit Your Published LinkedIn Post URL',
      submissionPlaceholder: 'https://www.linkedin.com/posts/your-name_post-activity-...'
    },
    tasks: [
      { id: 'li-t10-1', stepId: 'li-step-10', title: 'Review key takeaways from the workshop sessions', position: 1, required: true },
      { id: 'li-t10-2', stepId: 'li-step-10', title: 'Draft personalized post text in your own authentic words', position: 2, required: true },
      { id: 'li-t10-3', stepId: 'li-step-10', title: 'Mention official One Percent Club LinkedIn account', position: 3, required: true },
      { id: 'li-t10-4', stepId: 'li-step-10', title: 'Include the required event hashtags in the post', position: 4, required: true },
      { id: 'li-t10-5', stepId: 'li-step-10', title: 'Attach approved workshop photo and publish post', position: 5, required: true },
      { id: 'li-t10-6', stepId: 'li-step-10', title: 'Copy post URL and submit in the verification box below', position: 6, required: true }
    ],
    resources: [
      { id: 'res-li-3', stepId: 'li-step-10', label: 'One Percent Club on LinkedIn', type: 'link', url: 'https://www.linkedin.com/in/theonepercentclub/', position: 1 }
    ]
  },

  // Step 11
  {
    id: 'li-step-11',
    eventId: LINKEDIN_EVENT_ID,
    sectionId: 'sec-li-4',
    type: 'challenge',
    title: 'Share Your Profile and Build Your Network',
    timeRange: '3:15 – 3:30',
    durationMinutes: 15,
    position: 11,
    required: true,
    completionRule: 'manual',
    publishedVersion: 1,
    summary: 'Submit your completed profile URL and begin professional networking',
    objective: 'Help attendees begin using LinkedIn for professional networking and complete workshop.',
    content: {
      html: `
        <p class="mb-4">Congratulations! You have transformed your profile into a polished, professional hub. The final step is to put it to work.</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-xs space-y-2">
            <h5 class="font-bold text-white font-mono uppercase">Networking Action Items:</h5>
            <ul class="list-disc pl-4 space-y-1.5 text-zinc-300">
              <li>Submit your profile URL below so the event mentors can review your completed setup.</li>
              <li>Send connection requests to your fellow workshop peers and instructors.</li>
              <li>Follow the <strong>One Percent Club</strong> and key leaders in your target domain.</li>
              <li>Always include a brief personal note when connecting with professionals you haven't met.</li>
            </ul>
          </div>

          <div class="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-xs space-y-2">
            <h5 class="font-bold text-emerald-400 font-mono uppercase">Professional vs Casual Social Media:</h5>
            <p class="text-zinc-300">Unlike casual platforms (Instagram, TikTok), LinkedIn is built around <strong>value, mutual support, and career advancement</strong>.</p>
            <p class="text-zinc-400">Support your connections by congratulating them on achievements, leaving thoughtful comments on technical articles, and sharing your genuine learning milestones.</p>
          </div>
        </div>

        <div class="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl mb-6">
          <h4 class="font-bold text-white text-sm mb-3 font-mono uppercase tracking-wider">Final Activity Summary Checklist:</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300 font-mono">
            <div class="flex items-center gap-2">&#x2714; LinkedIn account accessible</div>
            <div class="flex items-center gap-2">&#x2714; Custom profile URL configured</div>
            <div class="flex items-center gap-2">&#x2714; Intro section completed</div>
            <div class="flex items-center gap-2">&#x2714; Profile picture uploaded</div>
            <div class="flex items-center gap-2">&#x2714; Custom banner uploaded</div>
            <div class="flex items-center gap-2">&#x2714; About section completed</div>
            <div class="flex items-center gap-2">&#x2714; Experience reviewed</div>
            <div class="flex items-center gap-2">&#x2714; Education updated</div>
            <div class="flex items-center gap-2">&#x2714; Certifications & skills added</div>
            <div class="flex items-center gap-2">&#x2714; Event post published</div>
            <div class="flex items-center gap-2">&#x2714; Profile shared & networking active</div>
          </div>
        </div>
      `,
      submissionType: 'url',
      submissionKey: 'final_profile_url',
      submissionLabel: 'Submit Your Final Profile URL for Review',
      submissionPlaceholder: 'https://www.linkedin.com/in/your-custom-handle'
    },
    tasks: [
      { id: 'li-t11-1', stepId: 'li-step-11', title: 'Submit your custom profile URL in the field below', position: 1, required: true },
      { id: 'li-t11-2', stepId: 'li-step-11', title: 'Send personalized connection requests to at least 3-5 workshop peers', position: 2, required: true },
      { id: 'li-t11-3', stepId: 'li-step-11', title: 'Follow official One Percent Club and industry leaders', position: 3, required: true },
      { id: 'li-t11-4', stepId: 'li-step-11', title: 'Confirm completion of all 11 workshop milestones', position: 4, required: true }
    ]
  },

  // Step 12 - Networking with Speakers
  {
    id: 'li-step-12',
    eventId: LINKEDIN_EVENT_ID,
    sectionId: 'sec-li-5',
    type: 'resource_collection',
    title: 'Networking',
    timeRange: '3:30 – 3:45',
    durationMinutes: 15,
    position: 12,
    required: false,
    completionRule: 'manual',
    publishedVersion: 1,
    summary: 'Connect with workshop speakers Nived Shaji and Nithesh V on LinkedIn',
    objective: 'Scan QR codes to connect with workshop speakers Nived Shaji and Nithesh V on LinkedIn.',
    content: {
      html: `
        <p class="mb-4 text-base">Congratulations on finishing all workshop milestones!</p>
        <p class="mb-4 text-sm text-zinc-300">The final component of today's session is direct networking. Connect with today's speakers and mentors below to keep in touch for career mentorship, code reviews, and upcoming engineering workshops.</p>
      `
    },
    tasks: [
      { id: 'li-t12-1', stepId: 'li-step-12', title: 'Scan or open Nived Shaji\'s LinkedIn profile', position: 1, required: true },
      { id: 'li-t12-2', stepId: 'li-step-12', title: 'Send a personalized connection request to Nived Shaji', position: 2, required: true },
      { id: 'li-t12-3', stepId: 'li-step-12', title: 'Scan or open Nithesh V\'s LinkedIn profile', position: 3, required: true },
      { id: 'li-t12-4', stepId: 'li-step-12', title: 'Send a personalized connection request to Nithesh V', position: 4, required: true }
    ],
    resources: [
      { id: 'res-sp-1', stepId: 'li-step-12', label: 'Nived Shaji (linkedin.com/in/nivet2006)', type: 'link', url: 'https://www.linkedin.com/in/nivet2006/', position: 1 },
      { id: 'res-sp-2', stepId: 'li-step-12', label: 'Nithesh V (linkedin.com/in/nitheshvinod)', type: 'link', url: 'https://www.linkedin.com/in/nitheshvinod/', position: 2 }
    ]
  }
];

export const allSeedEvents: EventModel[] = [linkedinEvent, sampleEvent];
export const allSeedSections: EventSection[] = [...linkedinSections, ...sampleSections];
export const allSeedSteps: EventStep[] = [...linkedinSteps, ...sampleSteps];

