export interface Step {
  id: number;
  timeRange: string;
  title: string;
  content: string; // HTML content
}

export const workshopSteps: Step[] = [
  {
    id: 1,
    timeRange: "0:00 – 0:10",
    title: "Opening",
    content: `
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
  },
  {
    id: 2,
    timeRange: "0:10 – 0:20",
    title: "What is No-Code Automation?",
    content: `
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
  },
  {
    id: 3,
    timeRange: "0:20 – 0:30",
    title: "Why Telegram + Make?",
    content: `
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
  },
  {
    id: 4,
    timeRange: "0:30 – 0:45",
    title: "Create Telegram Bot (Live Setup)",
    content: `
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
  {
    id: 5,
    timeRange: "0:45 – 1:05",
    title: "Create Make Account & First Scenario",
    content: `
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
  },
  {
    id: 6,
    timeRange: "1:05 – 1:25",
    title: "Experiment 1 – Simple Auto Reply Bot",
    content: `
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
  },
  {
    id: 7,
    timeRange: "1:25 – 1:35",
    title: "Break",
    content: `
      <div class="flex flex-col items-center justify-center h-64 text-center">
        <h2 class="text-4xl font-accent mb-4">10 Minutes</h2>
        <p class="text-gray-400">Grab a coffee, stretch, or chat with your neighbor.</p>
      </div>
    `
  },
  {
    id: 8,
    timeRange: "1:35 – 2:00",
    title: "Experiment 2 – Weather Forecast Bot",
    content: `
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
  },
  {
    id: 9,
    timeRange: "2:00 – 2:15",
    title: "Understanding the Flow",
    content: `
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
  },
  {
    id: 10,
    timeRange: "2:15 – 2:35",
    title: "Experiment 3 – Reminder Bot",
    content: `
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
  },
  {
    id: 11,
    timeRange: "2:35 – 2:50",
    title: "Mini Challenge",
    content: `
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
  },
  {
    id: 12,
    timeRange: "2:50 – 2:55",
    title: "Deployment & 24/7 Automation",
    content: `
      <p class="mb-4">Explain: Make runs in cloud.</p>
      <div class="flex items-center justify-center p-8">
        <button class="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(5,150,105,0.5)] hover:shadow-[0_0_30px_rgba(5,150,105,0.7)] transition-shadow">
          Turn Scenario ON
        </button>
      </div>
      <p class="text-center text-xl font-accent">"Your bot now works 24/7 without your laptop."</p>
    `
  },
  {
    id: 13,
    timeRange: "2:55 – 3:00",
    title: "Closing",
    content: `
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
];
