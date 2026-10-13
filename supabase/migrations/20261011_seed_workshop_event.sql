-- =============================================================================
-- EventFlow Seed Migration: 13-Step Make.com + Telegram Sample Workshop
-- =============================================================================

DO $$
DECLARE
    v_event_id UUID := 'a0000000-0000-0000-0000-000000000001'::UUID;
    v_sec1_id UUID := 'b0000000-0000-0000-0000-000000000001'::UUID;
    v_sec2_id UUID := 'b0000000-0000-0000-0000-000000000002'::UUID;
    v_sec3_id UUID := 'b0000000-0000-0000-0000-000000000003'::UUID;
    v_sec4_id UUID := 'b0000000-0000-0000-0000-000000000004'::UUID;
    v_quiz_id UUID := 'c0000000-0000-0000-0000-000000000001'::UUID;
BEGIN
    -- 1. Insert Event (Idempotent ON CONFLICT)
    INSERT INTO public.events (
        id, title, slug, description, timezone, status, access_code, access_policy, theme, published_version
    ) VALUES (
        v_event_id,
        'No-Code Automation with Make.com & Telegram',
        'nocode-automation-workshop',
        'Interactive hands-on workshop guide for building real automation systems without code using Make.com and Telegram.',
        'Asia/Kolkata',
        'published',
        'NIVET2006',
        'code',
        '{"palette": "dark", "accentColor": "#10b981", "badge": "NIVET2006"}'::jsonb,
        1
    ) ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        access_code = EXCLUDED.access_code,
        status = EXCLUDED.status;

    -- 2. Insert Sections
    INSERT INTO public.event_sections (id, event_id, title, description, position)
    VALUES
        (v_sec1_id, v_event_id, 'Part 1: Introduction & Fundamentals', 'Setting the stage and core automation concepts', 1),
        (v_sec2_id, v_event_id, 'Part 2: Setup & Your First Bot', 'BotFather setup, Make scenarios, and auto-reply', 2),
        (v_sec3_id, v_event_id, 'Part 3: Advanced Automations', 'Weather API connections and time-delayed reminder bots', 3),
        (v_sec4_id, v_event_id, 'Part 4: Mini Challenge & Cloud Deployment', 'Interactive challenge, 24/7 activation, and wrap-up', 4)
    ON CONFLICT (id) DO NOTHING;

    -- 3. Insert Steps (13 original steps)
    -- Step 1
    INSERT INTO public.event_steps (
        id, event_id, section_id, type, title, time_range, position, duration_minutes, summary, content
    ) VALUES (
        'd0000000-0000-0000-0000-000000000001'::UUID, v_event_id, v_sec1_id, 'instruction', 'Opening', '0:00 – 0:10', 1, 10,
        'Welcome and workshop mission overview',
        '{"html": "<p class=\"mb-4\">\"Good morning everyone.</p><p class=\"mb-4\">Today we are building real automation systems — without writing code.</p><p class=\"mb-4\">By the end of this session, you will:</p><ul class=\"list-disc pl-5 mb-6 space-y-2\"><li>Create a Telegram bot</li><li>Connect it to APIs using Make</li><li>Build weather alerts and reminder automation</li></ul><p class=\"mb-4 font-bold\">No coding. Pure logic.\"</p><blockquote class=\"border-l-2 border-white pl-4 italic text-gray-400 my-6\">\"Automation is a skill every engineer must know.\"</blockquote>"}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- Step 2
    INSERT INTO public.event_steps (
        id, event_id, section_id, type, title, time_range, position, duration_minutes, summary, content
    ) VALUES (
        'd0000000-0000-0000-0000-000000000002'::UUID, v_event_id, v_sec1_id, 'instruction', 'What is No-Code Automation?', '0:10 – 0:20', 2, 10,
        'Understanding Trigger -> Action -> Output architecture',
        '{"html": "<p class=\"mb-4\">\"Automation means making systems work automatically.</p><p class=\"mb-6\">No-code means:<br/>You connect blocks visually instead of writing programs.\"</p><div class=\"bg-zinc-900 p-6 rounded-lg border border-zinc-800 mb-6 font-mono text-sm\"><span class=\"text-emerald-400\">Trigger</span> &rarr; <span class=\"text-blue-400\">Action</span> &rarr; <span class=\"text-purple-400\">Output</span></div><p class=\"mb-2 font-bold\">Example:</p><p class=\"mb-4\">Message received &rarr; Fetch weather &rarr; Send reply</p><p class=\"italic text-gray-500\">(Draw flow on board)</p>"}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- Step 3
    INSERT INTO public.event_steps (
        id, event_id, section_id, type, title, time_range, position, duration_minutes, summary, content
    ) VALUES (
        'd0000000-0000-0000-0000-000000000003'::UUID, v_event_id, v_sec1_id, 'instruction', 'Why Telegram + Make?', '0:20 – 0:30', 3, 10,
        'Why this pairing empowers instant serverless workflows',
        '{"html": "<div class=\"grid grid-cols-1 md:grid-cols-2 gap-6 mb-8\"><div class=\"p-6 border border-zinc-800 rounded-xl bg-zinc-900/50\"><h4 class=\"text-xl font-accent mb-4 text-blue-400\">Why Telegram?</h4><ul class=\"list-disc pl-5 space-y-2 text-gray-300\"><li>Free Bot API</li><li>Instant deployment</li><li>Used in startups</li></ul></div><div class=\"p-6 border border-zinc-800 rounded-xl bg-zinc-900/50\"><h4 class=\"text-xl font-accent mb-4 text-purple-400\">Why Make?</h4><ul class=\"list-disc pl-5 space-y-2 text-gray-300\"><li>Drag-and-drop interface</li><li>Connects 1000+ apps</li><li>Real-time execution</li></ul></div></div><p class=\"text-xl font-medium text-center\">\"A Telegram bot + Make scenario = powerful automation.\"</p>"}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- Step 4
    INSERT INTO public.event_steps (
        id, event_id, section_id, type, title, time_range, position, duration_minutes, summary, content
    ) VALUES (
        'd0000000-0000-0000-0000-000000000004'::UUID, v_event_id, v_sec2_id, 'checklist', 'Create Telegram Bot (Live Setup)', '0:30 – 0:45', 4, 15,
        'Hands-on bot token creation with BotFather',
        '{"html": "<p class=\"mb-4\">\"Open Telegram.\"</p><div class=\"space-y-4 mb-8\"><div class=\"flex items-start gap-4\"><div class=\"bg-zinc-800 text-white px-2 py-1 rounded font-mono text-xs mt-1\">SEARCH</div><p>Search for <strong>BotFather</strong></p></div><div class=\"flex items-start gap-4\"><div class=\"bg-zinc-800 text-white px-2 py-1 rounded font-mono text-xs mt-1\">COMMAND</div><p>Type <code class=\"bg-zinc-800 px-1 rounded\">/start</code></p></div><div class=\"flex items-start gap-4\"><div class=\"bg-zinc-800 text-white px-2 py-1 rounded font-mono text-xs mt-1\">COMMAND</div><p>Type <code class=\"bg-zinc-800 px-1 rounded\">/newbot</code></p></div><div class=\"flex items-start gap-4\"><div class=\"bg-zinc-800 text-white px-2 py-1 rounded font-mono text-xs mt-1\">INPUT</div><p>Give it a name</p></div><div class=\"flex items-start gap-4\"><div class=\"bg-zinc-800 text-white px-2 py-1 rounded font-mono text-xs mt-1\">INPUT</div><p>Give it a username ending with \"bot\"</p></div></div><div class=\"bg-red-900/20 border border-red-900/50 p-4 rounded text-red-200 mb-4\"><strong>Important:</strong> Copy the token. Keep this token safe.</div><p class=\"italic text-gray-500\">Pause until everyone finishes.</p>"}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- Tasks for Step 4
    INSERT INTO public.step_tasks (step_id, title, position)
    VALUES
        ('d0000000-0000-0000-0000-000000000004'::UUID, 'Search @BotFather on Telegram', 1),
        ('d0000000-0000-0000-0000-000000000004'::UUID, 'Run /newbot and choose name', 2),
        ('d0000000-0000-0000-0000-000000000004'::UUID, 'Copy the HTTP Bot Token safely', 3)
    ON CONFLICT DO NOTHING;

    -- Step 5
    INSERT INTO public.event_steps (
        id, event_id, section_id, type, title, time_range, position, duration_minutes, summary, content
    ) VALUES (
        'd0000000-0000-0000-0000-000000000005'::UUID, v_event_id, v_sec2_id, 'instruction', 'Create Make Account & First Scenario', '0:45 – 1:05', 5, 20,
        'Connecting Make.com with Telegram Watch Updates',
        '{"html": "<p class=\"mb-4\">Open: <strong>make.com</strong></p><ol class=\"list-decimal pl-5 space-y-4 mb-8\"><li>Create account</li><li>Click <strong>\"Create Scenario\"</strong></li><li>Add <strong>Telegram</strong> module</li><li>Choose <strong>\"Watch Updates\"</strong></li><li>Paste Bot Token</li><li>Click <strong>Run Once</strong></li></ol><div class=\"p-4 bg-zinc-900 rounded border border-zinc-800 mb-4\"><p class=\"font-bold mb-2\">Test:</p><p>Send a message to your bot on Telegram.</p></div><p class=\"mb-2\">When it detects message:</p><p class=\"text-xl font-accent mb-4\">\"This is your trigger.\"</p><p class=\"text-sm text-gray-400\">Explain: Trigger = event listener.</p>"}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- Step 6
    INSERT INTO public.event_steps (
        id, event_id, section_id, type, title, time_range, position, duration_minutes, summary, content
    ) VALUES (
        'd0000000-0000-0000-0000-000000000006'::UUID, v_event_id, v_sec2_id, 'activity', 'Experiment 1 – Simple Auto Reply Bot', '1:05 – 1:25', 6, 20,
        'Adding Send Message action and data mapping',
        '{"html": "<div class=\"mb-8\"><h4 class=\"text-lg font-bold mb-4\">Add Module:</h4><div class=\"flex items-center gap-2 font-mono text-sm bg-zinc-900 p-3 rounded border border-zinc-800\"><span>Telegram</span><span class=\"text-gray-500\">&rarr;</span><span>\"Send a Message\"</span></div></div><div class=\"mb-8\"><h4 class=\"text-lg font-bold mb-4\">Map Data:</h4><ul class=\"list-disc pl-5 space-y-2\"><li><strong>Chat ID:</strong> Map from trigger</li><li><strong>Text:</strong> \"Hello from Make Automation!\"</li></ul></div><div class=\"p-4 bg-emerald-900/20 border border-emerald-900/50 rounded mb-6\"><p class=\"font-bold text-emerald-400 mb-2\">Action:</p><p>Run scenario. Send message to bot.</p></div><p class=\"mb-4\">When reply comes:</p><p class=\"text-2xl font-accent mb-6\">\"You just built automation without code.\"</p><div class=\"text-sm text-gray-400 border-t border-zinc-800 pt-4\"><p class=\"font-bold text-gray-300 mb-1\">Concepts:</p><ul class=\"list-disc pl-5\"><li>Data mapping</li><li>Trigger &rarr; Action flow</li></ul></div>"}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- Step 7
    INSERT INTO public.event_steps (
        id, event_id, section_id, type, title, time_range, position, duration_minutes, summary, content
    ) VALUES (
        'd0000000-0000-0000-0000-000000000007'::UUID, v_event_id, v_sec3_id, 'break', 'Break', '1:25 – 1:35', 7, 10,
        'Short 10-minute break for participants',
        '{"html": "<div class=\"flex flex-col items-center justify-center h-64 text-center\"><h2 class=\"text-4xl font-accent mb-4\">10 Minutes</h2><p class=\"text-gray-400\">Grab a coffee, stretch, or chat with your neighbor.</p></div>"}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- Step 8
    INSERT INTO public.event_steps (
        id, event_id, section_id, type, title, time_range, position, duration_minutes, summary, content
    ) VALUES (
        'd0000000-0000-0000-0000-000000000008'::UUID, v_event_id, v_sec3_id, 'activity', 'Experiment 2 – Weather Forecast Bot', '1:35 – 2:00', 8, 25,
        'Real-world API integration using HTTP GET & JSON parsing',
        '{"html": "<p class=\"text-xl mb-6\">\"Now we connect to real-world data.\"</p><p class=\"mb-4\">Use API: <strong>OpenWeather</strong></p><div class=\"space-y-6 mb-8\"><div class=\"border-l-2 border-blue-500 pl-4\"><h5 class=\"font-bold mb-1\">Step 1</h5><p>Create free API key</p></div><div class=\"border-l-2 border-blue-500 pl-4\"><h5 class=\"font-bold mb-1\">Step 2</h5><p>Add <strong>HTTP</strong> module in Make</p></div><div class=\"border-l-2 border-blue-500 pl-4\"><h5 class=\"font-bold mb-1\">Step 3</h5><p>Configure <strong>GET</strong> request</p></div><div class=\"border-l-2 border-blue-500 pl-4\"><h5 class=\"font-bold mb-1\">Step 4</h5><p>Use city from Telegram message</p></div></div><p class=\"mb-4 text-gray-300\">Explain: Map message text &rarr; API parameter</p><div class=\"bg-zinc-900 p-4 rounded border border-zinc-800 mb-6\"><p class=\"mb-2\">Add another Telegram <strong>\"Send Message\"</strong> module.</p><p>Extract temperature from JSON response.</p></div><p class=\"font-bold mb-2\">Test:</p><p class=\"mb-6\">Send city name</p><p class=\"text-xl font-accent\">\"This bot is now connected to global servers.\"</p>"}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- Step 9
    INSERT INTO public.event_steps (
        id, event_id, section_id, type, title, time_range, position, duration_minutes, summary, content
    ) VALUES (
        'd0000000-0000-0000-0000-000000000009'::UUID, v_event_id, v_sec3_id, 'instruction', 'Understanding the Flow', '2:00 – 2:15', 9, 15,
        'Architecture deep-dive: Client-Server & Data Transformation',
        '{"html": "<div class=\"flex flex-wrap items-center justify-center gap-4 font-mono text-xs md:text-sm mb-8 p-6 bg-zinc-900 rounded-xl border border-zinc-800\"><div class=\"bg-black px-3 py-2 rounded border border-zinc-700\">User</div><span class=\"text-gray-500\">&rarr;</span><div class=\"bg-blue-900/30 px-3 py-2 rounded border border-blue-800 text-blue-300\">Telegram</div><span class=\"text-gray-500\">&rarr;</span><div class=\"bg-purple-900/30 px-3 py-2 rounded border border-purple-800 text-purple-300\">Make</div><span class=\"text-gray-500\">&rarr;</span><div class=\"bg-orange-900/30 px-3 py-2 rounded border border-orange-800 text-orange-300\">Weather API</div><span class=\"text-gray-500\">&rarr;</span><div class=\"bg-purple-900/30 px-3 py-2 rounded border border-purple-800 text-purple-300\">Make</div><span class=\"text-gray-500\">&rarr;</span><div class=\"bg-black px-3 py-2 rounded border border-zinc-700\">User</div></div><h4 class=\"font-bold mb-4\">Key Concepts:</h4><ul class=\"list-disc pl-5 space-y-2 text-gray-300\"><li>Client–Server architecture</li><li>Triggers</li><li>Data transformation</li></ul>"}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- Step 10
    INSERT INTO public.event_steps (
        id, event_id, section_id, type, title, time_range, position, duration_minutes, summary, content
    ) VALUES (
        'd0000000-0000-0000-0000-000000000010'::UUID, v_event_id, v_sec3_id, 'activity', 'Experiment 3 – Reminder Bot', '2:15 – 2:35', 10, 20,
        'Time-based automations using Tools -> Sleep delays',
        '{"html": "<p class=\"mb-6 text-gray-400\">Time Automation</p><div class=\"space-y-4 mb-8\"><div class=\"flex items-center gap-4\"><div class=\"w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-mono\">1</div><div>Add module: <strong>Telegram &rarr; Watch Updates</strong></div></div><div class=\"flex items-center gap-4\"><div class=\"w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-mono\">2</div><div>Use text format: <code class=\"bg-zinc-900 px-2 py-1 rounded ml-2\">10 Meeting</code></div></div><div class=\"flex items-center gap-4\"><div class=\"w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-mono\">3</div><div>Add: <strong>Tools &rarr; Sleep</strong></div></div><div class=\"flex items-center gap-4\"><div class=\"w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-mono\">4</div><div>Map first number as delay.</div></div><div class=\"flex items-center gap-4\"><div class=\"w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-mono\">5</div><div>Add: <strong>Telegram &rarr; Send Message</strong> (Send reminder text)</div></div></div><div class=\"p-4 bg-zinc-900 border border-zinc-800 rounded mb-6\"><p class=\"font-bold mb-2\">Test:</p><p>Test with 10 seconds.</p></div><p class=\"mb-4\">When reminder appears:</p><p class=\"text-xl font-accent mb-6\">\"This is time-based automation.\"</p><div class=\"text-sm text-gray-400\"><p class=\"font-bold text-gray-300 mb-1\">Real-world uses:</p><ul class=\"list-disc pl-5\"><li>Exam alerts</li><li>Payment reminders</li><li>Scheduling</li></ul></div>"}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- Step 11
    INSERT INTO public.event_steps (
        id, event_id, section_id, type, title, time_range, position, duration_minutes, summary, content
    ) VALUES (
        'd0000000-0000-0000-0000-000000000011'::UUID, v_event_id, v_sec4_id, 'challenge', 'Mini Challenge', '2:35 – 2:50', 11, 15,
        'Hands-on student challenge: Quote, Joke, College, or News Bot',
        '{"html": "<h3 class=\"text-2xl font-bold mb-6\">Students build one:</h3><div class=\"grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8\"><div class=\"p-4 border border-zinc-700 hover:border-white transition-colors rounded cursor-default group\"><h4 class=\"font-bold group-hover:text-emerald-400 transition-colors\">Quote Bot</h4><p class=\"text-sm text-gray-500 mt-1\">Use public quote API</p></div><div class=\"p-4 border border-zinc-700 hover:border-white transition-colors rounded cursor-default group\"><h4 class=\"font-bold group-hover:text-yellow-400 transition-colors\">Joke Bot</h4><p class=\"text-sm text-gray-500 mt-1\">Tell me a joke</p></div><div class=\"p-4 border border-zinc-700 hover:border-white transition-colors rounded cursor-default group\"><h4 class=\"font-bold group-hover:text-blue-400 transition-colors\">College Announcement Bot</h4><p class=\"text-sm text-gray-500 mt-1\">Broadcast updates</p></div><div class=\"p-4 border border-zinc-700 hover:border-white transition-colors rounded cursor-default group\"><h4 class=\"font-bold group-hover:text-red-400 transition-colors\">News Bot</h4><p class=\"text-sm text-gray-500 mt-1\">Latest headlines</p></div></div><p class=\"italic text-gray-400 mb-4\">Walk around and assist.</p><p class=\"font-bold\">Encourage logic thinking: Trigger &rarr; Process &rarr; Output</p>"}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- Step 12
    INSERT INTO public.event_steps (
        id, event_id, section_id, type, title, time_range, position, duration_minutes, summary, content
    ) VALUES (
        'd0000000-0000-0000-0000-000000000012'::UUID, v_event_id, v_sec4_id, 'instruction', 'Deployment & 24/7 Automation', '2:50 – 2:55', 12, 5,
        'Activating scenarios in cloud for uninterrupted operation',
        '{"html": "<p class=\"mb-4\">Explain: Make runs in cloud.</p><div class=\"flex items-center justify-center p-8\"><button class=\"bg-emerald-600 text-white px-8 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(5,150,105,0.5)] hover:shadow-[0_0_30px_rgba(5,150,105,0.7)] transition-shadow\">Turn Scenario ON</button></div><p class=\"text-center text-xl font-accent\">\"Your bot now works 24/7 without your laptop.\"</p>"}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- Step 13
    INSERT INTO public.event_steps (
        id, event_id, section_id, type, title, time_range, position, duration_minutes, summary, content
    ) VALUES (
        'd0000000-0000-0000-0000-000000000013'::UUID, v_event_id, v_sec4_id, 'instruction', 'Closing', '2:55 – 3:00', 13, 5,
        'Recap, future project inspiration, and wrap-up',
        '{"html": "<p class=\"mb-6\">\"Today you built:\"</p><ul class=\"list-disc pl-5 space-y-2 mb-8 text-lg\"><li>Reply Bot</li><li>Weather Automation</li><li>Reminder System</li></ul><p class=\"text-xl font-bold mb-2\">All without coding.</p><p class=\"text-2xl font-accent mb-8\">\"Automation is not about syntax. It is about logic.\"</p><div class=\"border-t border-zinc-800 pt-6\"><p class=\"mb-4 text-gray-400\">Encourage them to build:</p><div class=\"flex flex-wrap gap-2\"><span class=\"px-3 py-1 bg-zinc-900 rounded-full text-sm border border-zinc-800\">Attendance Bot</span><span class=\"px-3 py-1 bg-zinc-900 rounded-full text-sm border border-zinc-800\">Quiz Bot</span><span class=\"px-3 py-1 bg-zinc-900 rounded-full text-sm border border-zinc-800\">File Sharing Bot</span><span class=\"px-3 py-1 bg-zinc-900 rounded-full text-sm border border-zinc-800\">Placement Alert Bot</span></div></div><p class=\"mt-8 text-center text-gray-500 italic\">\"Start small. Build big.\"</p>"}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- 4. Sample Reusable Quiz
    INSERT INTO public.quizzes (
        id, event_id, title, description, settings, theme, status
    ) VALUES (
        v_quiz_id,
        v_event_id,
        'No-Code Automation Mastery Quiz',
        'Test your understanding of triggers, actions, APIs, and Webhooks.',
        '{"timeLimitSeconds": 30, "pointsPerQuestion": 100, "speedBonus": true, "negativeMarking": false, "revealAnswerMode": "after_each", "leaderboardMode": "top3_and_me"}'::jsonb,
        '{"name": "dark", "accent": "#10b981"}'::jsonb,
        'published'
    ) ON CONFLICT (id) DO NOTHING;

    -- Quiz Questions
    INSERT INTO public.quiz_questions (
        quiz_id, type, prompt, options, correct_answer_keys, explanation, points, time_limit_seconds, position
    ) VALUES
    (
        v_quiz_id,
        'single_choice',
        'In No-Code automation, what is the role of a "Trigger"?',
        '["It transforms data into a new format", "It is an event listener that initiates the scenario", "It stores credentials securely in the cloud", "It terminates execution after an error"]'::jsonb,
        '["It is an event listener that initiates the scenario"]'::jsonb,
        'A trigger listens for specific events (like a message received or a webhook payload) and kicks off the automation flow.',
        100,
        30,
        1
    ),
    (
        v_quiz_id,
        'true_false',
        'Once a Make.com scenario is turned ON, it runs 24/7 in the cloud without requiring your laptop to be active.',
        '["True", "False"]'::jsonb,
        '["True"]'::jsonb,
        'Make scenarios run on cloud servers, so they operate continuously regardless of your local machine state.',
        100,
        20,
        2
    ),
    (
        v_quiz_id,
        'multiple_select',
        'Which of the following are valid real-world use cases for webhook/time-based automation?',
        '["Weather condition alerts", "Automated payment reminders", "College event notifications", "Direct human telepathy"]'::jsonb,
        '["Weather condition alerts", "Automated payment reminders", "College event notifications"]'::jsonb,
        'Automated notifications, alerts, and time-based scheduling are prime applications of no-code automation.',
        150,
        35,
        3
    ) ON CONFLICT DO NOTHING;

    -- Link the quiz to Step 11 or as sample
    UPDATE public.event_steps
    SET attached_quiz_id = v_quiz_id
    WHERE id = 'd0000000-0000-0000-0000-000000000011'::UUID;

END $$;
