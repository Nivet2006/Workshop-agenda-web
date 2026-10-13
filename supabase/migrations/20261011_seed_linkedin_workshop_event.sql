-- =============================================================================
-- EventFlow Seed Migration: LinkedIn Profile Building Workshop (11 Steps)
-- =============================================================================

DO $$
DECLARE
    v_event_id UUID := 'e1000000-0000-0000-0000-000000000001'::UUID;
    v_sec1_id UUID := 'e2000000-0000-0000-0000-000000000001'::UUID;
    v_sec2_id UUID := 'e2000000-0000-0000-0000-000000000002'::UUID;
    v_sec3_id UUID := 'e2000000-0000-0000-0000-000000000003'::UUID;
    v_sec4_id UUID := 'e2000000-0000-0000-0000-000000000004'::UUID;
BEGIN
    -- 1. Insert Event
    INSERT INTO public.events (
        id, title, slug, description, timezone, status, access_code, access_policy, theme, published_version
    ) VALUES (
        v_event_id,
        'LinkedIn Profile Building Workshop',
        'linkedin-profile-building-workshop',
        'Interactive hands-on guide to building a professional LinkedIn presence, optimizing visibility, networking with peers, and publishing an event reflection.',
        'Asia/Kolkata',
        'published',
        'LINKEDIN',
        'code',
        '{"palette": "dark", "accentColor": "#0077b5", "badge": "LINKEDIN"}'::jsonb,
        1
    ) ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        access_code = EXCLUDED.access_code,
        status = EXCLUDED.status;

    -- 2. Insert Sections
    INSERT INTO public.event_sections (id, event_id, title, description, position)
    VALUES
        (v_sec1_id, v_event_id, 'Part 1: Account & Identity Setup', 'Account access and customized vanity URL configuration', 1),
        (v_sec2_id, v_event_id, 'Part 2: Profile Core & Visual Branding', 'Header introduction, professional photo, and customized banner', 2),
        (v_sec3_id, v_event_id, 'Part 3: Professional Narrative & Credentials', 'About story, practical experience, academic background, and skills', 3),
        (v_sec4_id, v_event_id, 'Part 4: Engagement & Networking Challenge', 'Live event post publishing, profile submission, and peer networking', 4)
    ON CONFLICT (id) DO NOTHING;

    -- 3. Insert Steps (11 Steps)
    -- Step 1
    INSERT INTO public.event_steps (
        id, event_id, section_id, type, title, time_range, position, duration_minutes, summary, objective, content
    ) VALUES (
        'e3000000-0000-0000-0000-000000000001'::UUID, v_event_id, v_sec1_id, 'instruction', 'Login / Sign Up', '0:00 – 0:15', 1, 15,
        'Ensure every attendee can access their LinkedIn account',
        'Ensure every attendee can access LinkedIn and verify account functionality.',
        '{"html": "<p class=\"mb-4 text-base\">Welcome to the <strong>LinkedIn Profile Building Workshop</strong>.</p><p class=\"mb-4\">Today you will transform your LinkedIn profile into a compelling, recruiter-ready professional asset.</p><div class=\"p-5 bg-zinc-900 border border-zinc-800 rounded-2xl mb-6\"><h4 class=\"font-bold text-white mb-2 text-sm uppercase tracking-wider font-mono\">Action Instructions:</h4><ol class=\"list-decimal pl-5 space-y-2 text-zinc-300 text-sm\"><li>Open LinkedIn using the official website (linkedin.com) or mobile app.</li><li>Sign in using your existing account, or click <strong>Join now</strong> to create a new profile.</li><li>Complete any required two-factor or email/phone verification.</li><li>Confirm that your home feed and profile page are loaded and accessible before proceeding.</li></ol></div><div class=\"p-4 bg-blue-950/30 border border-blue-800/50 rounded-xl text-blue-200 text-xs\"><strong>Tip:</strong> If you are creating a new account, use your primary personal email address that you will keep access to throughout your college and professional career.</div>"}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- Step 2
    INSERT INTO public.event_steps (
        id, event_id, section_id, type, title, time_range, position, duration_minutes, summary, objective, content
    ) VALUES (
        'e3000000-0000-0000-0000-000000000002'::UUID, v_event_id, v_sec1_id, 'instruction', 'Custom Username Setup', '0:15 – 0:30', 2, 15,
        'Create a clean, professional, personalized LinkedIn profile URL',
        'Create a professional, personalized vanity LinkedIn profile URL.',
        '{"html": "<p class=\"mb-4\">By default, LinkedIn assigns random numbers to your URL. Clean this up into a concise, branded link suitable for resumes and email signatures.</p><div class=\"p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-sm mb-6\"><h5 class=\"font-bold text-white mb-2 font-mono\">How to edit your Public Profile URL:</h5><ol class=\"list-decimal pl-5 space-y-1.5 text-zinc-300\"><li>Click your profile picture icon at the top right labeled <strong>\"Me\"</strong> &rarr; <strong>View Profile</strong>.</li><li>On the right side of your profile page, click <strong>\"Public profile & URL\"</strong>.</li><li>Under <strong>\"Edit your custom URL\"</strong>, click the pencil icon next to your link.</li><li>Type your preferred handle based on your name, such as <code>firstname-lastname</code>.</li><li>Avoid unnecessary numbers, nicknames, or unprofessional phrasing.</li><li>Click <strong>Save</strong> and copy your new URL.</li></ol></div><div class=\"p-4 bg-emerald-950/30 border border-emerald-800/50 rounded-xl text-emerald-200 text-xs\"><strong>Recommended Format:</strong> linkedin.com/in/firstname-lastname</div>", "submissionType": "url", "submissionLabel": "Paste your custom profile URL below", "submissionPlaceholder": "https://www.linkedin.com/in/your-name"}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- Step 3
    INSERT INTO public.event_steps (
        id, event_id, section_id, type, title, time_range, position, duration_minutes, summary, objective, content
    ) VALUES (
        'e3000000-0000-0000-0000-000000000003'::UUID, v_event_id, v_sec2_id, 'checklist', 'Edit Intro', '0:30 – 0:50', 3, 20,
        'Complete the core introduction fields shown at the top of your profile',
        'Complete the basic information displayed at the top of the LinkedIn profile.',
        '{"html": "<p class=\"mb-4\">The top card of your profile is the first thing recruiters and peers see. Review and personalize each field carefully.</p><div class=\"p-5 bg-zinc-900 border border-zinc-800 rounded-xl mb-6\"><h4 class=\"font-bold text-white mb-2 text-sm\">Professional Headline Guidelines</h4><p class=\"text-zinc-400 text-xs mb-3\">Your headline should accurately represent your current status, skills, or professional aspirations. Personalize it rather than using a forced generic line.</p><div class=\"p-3 bg-black rounded-lg border border-zinc-700 font-mono text-xs text-emerald-400\">Example: Computer Science Engineering Student at Gopalan College of Engineering and Management (GCEM), Bengaluru | Aspiring Software Developer</div></div><div class=\"p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs text-zinc-300 space-y-2 mb-4\"><p><strong>Education Example:</strong> Gopalan College of Engineering and Management (GCEM), Bengaluru. (Lake Montfort School as previous education where relevant).</p><p><strong>Organization:</strong> Use your actual organization, company, or student chapter if applicable.</p><p><strong>Note on Variations:</strong> Pronouns and additional name are optional.</p></div>", "sampleHeadline": "Computer Science Engineering Student at Gopalan College of Engineering and Management (GCEM), Bengaluru | Aspiring Software Developer"}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- Step 4
    INSERT INTO public.event_steps (
        id, event_id, section_id, type, title, time_range, position, duration_minutes, summary, objective, content
    ) VALUES (
        'e3000000-0000-0000-0000-000000000004'::UUID, v_event_id, v_sec2_id, 'activity', 'Profile Picture Generation and Upload', '0:50 – 1:10', 4, 20,
        'Upload a clear, well-lit, professional headshot photo',
        'Create a professional and recognizable profile image.',
        '{"html": "<p class=\"mb-4\">Profiles with professional pictures receive up to <strong>21x more views</strong> and <strong>9x more connection requests</strong>.</p><div class=\"grid grid-cols-1 md:grid-cols-2 gap-4 mb-6\"><div class=\"p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-xs space-y-2\"><h5 class=\"font-bold text-emerald-400 font-mono uppercase\">Characteristics of a Great Photo:</h5><ul class=\"list-disc pl-4 space-y-1 text-zinc-300\"><li>Clear focus and high resolution.</li><li>Front-facing headshot (face occupies ~60% of frame).</li><li>Good natural or soft lighting without harsh shadows.</li><li>Neutral, uncluttered, or solid background.</li><li>Friendly, professional expression.</li></ul></div><div class=\"p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-xs space-y-2\"><h5 class=\"font-bold text-purple-400 font-mono uppercase\">AI & Editing Guidance:</h5><ul class=\"list-disc pl-4 space-y-1 text-zinc-300\"><li>If using AI tools, ensure the image remains a <strong>realistic, recognizable likeness of you</strong>.</li><li>Avoid over-stylized, cartoonish, or heavily altered avatars.</li><li>An authentic smartphone photo with good lighting is completely suitable.</li></ul></div></div>"}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- Step 5
    INSERT INTO public.event_steps (
        id, event_id, section_id, type, title, time_range, position, duration_minutes, summary, objective, content
    ) VALUES (
        'e3000000-0000-0000-0000-000000000005'::UUID, v_event_id, v_sec2_id, 'activity', 'Custom Banner Design and Upload', '1:10 – 1:30', 5, 20,
        'Design and upload a customized profile background banner',
        'Personalize the LinkedIn profile with a professional banner.',
        '{"html": "<p class=\"mb-4\">The profile banner (cover photo) is your personal billboard. It visually establishes your domain, interests, and professional aspirations.</p><div class=\"p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-xs space-y-2 mb-6\"><h5 class=\"font-bold text-white font-mono uppercase\">Banner Design Best Practices:</h5><ul class=\"list-disc pl-4 space-y-1.5 text-zinc-300\"><li><strong>Recommended Dimensions:</strong> 1584 &times; 396 pixels (4:1 aspect ratio).</li><li><strong>Keep Left Clear:</strong> Your circular profile picture overlaps the bottom-left portion. Keep text and logos toward the right or center.</li><li><strong>Content Ideas:</strong> Tech stack icons, domain keywords, portfolio link, or a clean minimalist gradient with your personal motto.</li></ul></div>"}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- Step 6
    INSERT INTO public.event_steps (
        id, event_id, section_id, type, title, time_range, position, duration_minutes, summary, objective, content
    ) VALUES (
        'e3000000-0000-0000-0000-000000000006'::UUID, v_event_id, v_sec3_id, 'instruction', 'About Section', '1:30 – 1:55', 6, 25,
        'Craft a compelling narrative communicating who you are and where you are headed',
        'Write a concise, authentic professional introduction.',
        '{"html": "<p class=\"mb-4\">Your <strong>About</strong> section is your elevator pitch in written form. It turns a list of qualifications into a coherent story.</p><div class=\"p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-xs space-y-2 mb-6\"><h5 class=\"font-bold text-white font-mono uppercase\">Suggested 6-Part Framework:</h5><ol class=\"list-decimal pl-4 space-y-1.5 text-zinc-300\"><li><strong>Who you are:</strong> Introduce yourself and your current degree or role.</li><li><strong>Current focus:</strong> Mention your primary technical or domain interests.</li><li><strong>Projects & highlights:</strong> Briefly describe 1–2 practical projects, hackathons, or learning milestones.</li><li><strong>Non-technical strengths:</strong> Teamwork, problem-solving, community involvement.</li><li><strong>Career vision:</strong> What kind of engineering or professional challenges excite you.</li><li><strong>Call to action:</strong> Invite connections, mentorship, and collaboration.</li></ol></div><div class=\"p-5 bg-zinc-950 border border-zinc-800 rounded-xl mb-6\"><h5 class=\"font-bold text-emerald-400 font-mono text-xs mb-2 uppercase\">Sample Template:</h5><blockquote class=\"text-xs text-zinc-300 leading-relaxed font-sans italic bg-zinc-900/50 p-4 rounded border-l-2 border-emerald-500\">\"I am a Computer Science Engineering student at Gopalan College of Engineering and Management (GCEM), Bengaluru, with a deep interest in software engineering and cloud systems.<br/><br/>Currently, I am building full-stack web applications and exploring scalable backend architectures.<br/><br/>Feel free to reach out to exchange ideas or discuss software projects!\"</blockquote></div>"}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- Step 7
    INSERT INTO public.event_steps (
        id, event_id, section_id, type, title, time_range, position, duration_minutes, summary, objective, content
    ) VALUES (
        'e3000000-0000-0000-0000-000000000007'::UUID, v_event_id, v_sec3_id, 'checklist', 'Experience', '1:55 – 2:15', 7, 20,
        'Document internships, student leadership, volunteer work, or project involvement',
        'Represent relevant practical experience and involvement accurately.',
        '{"html": "<p class=\"mb-4\">Experience on LinkedIn includes any role where you took responsibility and delivered results.</p><div class=\"p-4 bg-red-950/20 border border-red-900/50 rounded-xl text-red-200 text-xs mb-6\"><strong>Integrity Rule:</strong> If you do not have formal work experience yet, <strong>do not invent jobs</strong>. Instead, document genuine student club roles, open-source work, hackathons, or leave the section for future roles.</div><div class=\"space-y-3 mb-6 text-xs text-zinc-300\"><p class=\"font-bold text-white\">Applicable Experience Types to Add:</p><ul class=\"list-disc pl-5 space-y-1 text-zinc-400\"><li>Internships, apprenticeships, student leadership, club committees, volunteering, major hackathon positions.</li></ul></div>"}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- Step 8
    INSERT INTO public.event_steps (
        id, event_id, section_id, type, title, time_range, position, duration_minutes, summary, objective, content
    ) VALUES (
        'e3000000-0000-0000-0000-000000000008'::UUID, v_event_id, v_sec3_id, 'instruction', 'Education', '2:15 – 2:30', 8, 15,
        'Present your college, degree, and academic milestones clearly',
        'Present academic qualifications clearly and accurately.',
        '{"html": "<p class=\"mb-4\">Your education section links you to your college alumni network—one of the highest-converting sources for job referrals.</p><div class=\"p-5 bg-zinc-900 border border-zinc-800 rounded-xl mb-6 text-xs space-y-3\"><h5 class=\"font-bold text-white font-mono uppercase\">Key Details to Include:</h5><ul class=\"list-disc pl-5 space-y-2 text-zinc-300\"><li><strong>School / College:</strong> Select official institution (e.g. <em>Gopalan College of Engineering and Management (GCEM), Bengaluru</em>).</li><li><strong>Degree:</strong> Bachelor of Engineering (B.E.), B.Tech, etc.</li><li><strong>Field of Study:</strong> Computer Science and Engineering, etc.</li><li><strong>Start & Expected End Year:</strong> e.g. 2022 – 2026.</li><li><strong>Previous Education:</strong> High school (e.g. Lake Montfort School) if relevant.</li></ul></div>"}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- Step 9
    INSERT INTO public.event_steps (
        id, event_id, section_id, type, title, time_range, position, duration_minutes, summary, objective, content
    ) VALUES (
        'e3000000-0000-0000-0000-000000000009'::UUID, v_event_id, v_sec3_id, 'checklist', 'Licenses & Certifications and Skills', '2:30 – 2:50', 9, 20,
        'Highlight verifiable certificates and select top searchable skills',
        'Highlight verifiable credentials and relevant capabilities.',
        '{"html": "<div class=\"space-y-6 mb-6\"><div class=\"p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-xs space-y-2\"><h5 class=\"font-bold text-blue-400 font-mono uppercase\">A. Licenses & Certifications</h5><p class=\"text-zinc-300\">Add genuine credentials. Include credential name, issuing body, issue date, and verification URL/ID. Do not invent certificates.</p></div><div class=\"p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-xs space-y-2\"><h5 class=\"font-bold text-purple-400 font-mono uppercase\">B. Skills Selection</h5><p class=\"text-zinc-300\">Add at least 5 technical skills and 3 professional competencies. Pin the top 3 most relevant skills.</p></div></div>"}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- Step 10
    INSERT INTO public.event_steps (
        id, event_id, section_id, type, title, time_range, position, duration_minutes, summary, objective, content
    ) VALUES (
        'e3000000-0000-0000-0000-000000000010'::UUID, v_event_id, v_sec4_id, 'activity', 'Create a LinkedIn Post About the Current Event', '2:50 – 3:15', 10, 25,
        'Publish a reflection post tagging the One Percent Club and using event hashtags',
        'Publish a professional post reflecting on the workshop experience.',
        '{"html": "<p class=\"mb-4\">Publishing an insightful post demonstrates initiative, communication skills, and continuous learning to your network.</p><div class=\"p-5 bg-zinc-900 border border-zinc-800 rounded-xl mb-6 text-xs space-y-3\"><h5 class=\"font-bold text-white font-mono uppercase\">Posting Requirements:</h5><ul class=\"list-disc pl-5 space-y-1.5 text-zinc-300\"><li><strong>Mention Official Account:</strong> Tag the official <strong>One Percent Club</strong> LinkedIn page in your post.</li><li><strong>Include Event Hashtags:</strong> Use the approved tags specified by organizers.</li><li><strong>Attach Event Photos:</strong> Use the workshop photos provided by facilitators.</li><li><strong>Publish & Submit:</strong> Publish on your personal profile and submit the link below.</li></ul></div>", "officialAccountMention": "@One Percent Club", "officialAccountUrl": "https://www.linkedin.com/in/theonepercentclub/", "requiredHashtags": ["#LinkedInWorkshop", "#OnePercentClub", "#ProfessionalBranding", "#CareerGrowth", "#Networking"], "samplePostText": "Just completed an insightful LinkedIn Profile Building Workshop organized by the One Percent Club! 🚀\\n\\nTop takeaways from today:\\n1. Personalized headline and custom vanity URL for discoverability.\\n2. Authentic About section that tells a compelling professional story.\\n3. Leveraging LinkedIn for meaningful professional connections.\\n\\nHuge thanks to the One Percent Club mentors!\\n\\n#LinkedInWorkshop #OnePercentClub #ProfessionalBranding #CareerGrowth #Networking", "submissionType": "url", "submissionLabel": "Submit Your Published LinkedIn Post URL", "submissionPlaceholder": "https://www.linkedin.com/posts/..."}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- Step 11
    INSERT INTO public.event_steps (
        id, event_id, section_id, type, title, time_range, position, duration_minutes, summary, objective, content
    ) VALUES (
        'e3000000-0000-0000-0000-000000000011'::UUID, v_event_id, v_sec4_id, 'challenge', 'Share Your Profile and Build Your Network', '3:15 – 3:30', 11, 15,
        'Submit your completed profile URL and begin professional networking',
        'Help attendees begin using LinkedIn for professional networking and complete workshop.',
        '{"html": "<p class=\"mb-4\">Congratulations! You have transformed your profile into a polished, professional hub. The final step is to put it to work.</p><div class=\"grid grid-cols-1 md:grid-cols-2 gap-4 mb-6\"><div class=\"p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-xs space-y-2\"><h5 class=\"font-bold text-white font-mono uppercase\">Networking Action Items:</h5><ul class=\"list-disc pl-4 space-y-1.5 text-zinc-300\"><li>Submit your profile URL below for mentor review.</li><li>Send connection requests to fellow workshop peers with personalized notes.</li><li>Follow the <strong>One Percent Club</strong> and key leaders in your target domain.</li></ul></div><div class=\"p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-xs space-y-2\"><h5 class=\"font-bold text-emerald-400 font-mono uppercase\">Professional vs Casual Networking:</h5><p class=\"text-zinc-300\">LinkedIn is built around <strong>value, mutual support, and career advancement</strong>, distinct from casual social media.</p></div></div>", "submissionType": "url", "submissionLabel": "Submit Your Final Profile URL for Review", "submissionPlaceholder": "https://www.linkedin.com/in/your-custom-handle"}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- 4. Insert Step Tasks for Step 3, 7, 9, 10, 11
    INSERT INTO public.step_tasks (step_id, title, position) VALUES
    ('e3000000-0000-0000-0000-000000000003'::UUID, 'First name', 1),
    ('e3000000-0000-0000-0000-000000000003'::UUID, 'Last name', 2),
    ('e3000000-0000-0000-0000-000000000003'::UUID, 'Additional name (optional)', 3),
    ('e3000000-0000-0000-0000-000000000003'::UUID, 'Pronouns (optional)', 4),
    ('e3000000-0000-0000-0000-000000000003'::UUID, 'Professional headline (Personalized current role / aspiration)', 5),
    ('e3000000-0000-0000-0000-000000000003'::UUID, 'Country / Region', 6),
    ('e3000000-0000-0000-0000-000000000003'::UUID, 'City', 7),
    ('e3000000-0000-0000-0000-000000000003'::UUID, 'Organization (Actual workplace or student community, where applicable)', 8),
    ('e3000000-0000-0000-0000-000000000003'::UUID, 'Education institution (e.g. GCEM Bengaluru)', 9),
    ('e3000000-0000-0000-0000-000000000003'::UUID, 'Industry', 10),
    ('e3000000-0000-0000-0000-000000000003'::UUID, 'Contact information', 11),
    ('e3000000-0000-0000-0000-000000000003'::UUID, 'Custom LinkedIn profile URL verified', 12)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.step_tasks (step_id, title, position) VALUES
    ('e3000000-0000-0000-0000-000000000010'::UUID, 'Review key takeaways from the workshop', 1),
    ('e3000000-0000-0000-0000-000000000010'::UUID, 'Draft personalized reflection text', 2),
    ('e3000000-0000-0000-0000-000000000010'::UUID, 'Tag official One Percent Club LinkedIn account', 3),
    ('e3000000-0000-0000-0000-000000000010'::UUID, 'Include required event hashtags (#LinkedInWorkshop #OnePercentClub)', 4),
    ('e3000000-0000-0000-0000-000000000010'::UUID, 'Attach approved workshop photo and publish post', 5),
    ('e3000000-0000-0000-0000-000000000010'::UUID, 'Submit published post URL in verification box', 6)
    ON CONFLICT DO NOTHING;

END $$;
