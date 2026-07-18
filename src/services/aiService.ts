import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (openaiClient) return openaiClient;
  if (!process.env.OPENAI_API_KEY) return null;
  openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
      'X-Title': 'SkillSprint AI',
    },
  });
  return openaiClient;
}

const SYSTEM_PROMPT = `You are a friendly consultant having a real conversation on SkillSprint AI, a skill marketplace.
You must NEVER sound like an AI. Speak like a real person — natural, warm, genuine.
Match the user's language. If they write in Bengali, reply in Bengali. If they write in English, reply in English.
Never switch languages mid-conversation. Be consistent with the user's language.`;

function buildPrompt(type: string, data: Record<string, any>, length: string): string {
  const lengthMap: Record<string, string> = {
    short: '2-3 sentences',
    medium: '1 paragraph (4-6 sentences)',
    long: '2-3 paragraphs',
  };

  const lengthInstr = lengthMap[length] || '1 paragraph';

  if (type === 'generate-service') {
    return `Write a compelling service listing for a skill marketplace. Make it sound like a real person wrote it.

Service Title: ${data.title || 'Untitled Service'}
Category: ${data.category || 'General'}
Target Audience: ${data.targetAudience || 'Professionals looking to upskill'}
Key Points: ${data.bulletPoints || 'Expert guidance, practical learning'}

Write the following (${lengthInstr}), and make it feel human — not like a corporate template:
1. A short description (max 200 chars) that hooks the reader naturally
2. A full description with sections that read like real advice, not marketing fluff
3. 3-5 relevant tags
4. 3 FAQ questions and answers (write the answers like a real mentor would speak)

Format the response as JSON with keys: shortDesc, fullDesc, tags (array), faq (array of {question, answer}).`;
  }

  if (type === 'recommend') {
    return `Based on the following user profile, recommend 3-5 services from our marketplace. Think like a real career advisor who knows the user personally.

User Goals: ${(data.goals || []).join(', ')}
Interested Skills: ${(data.skills || []).join(', ')}
Past Interactions: ${(data.history || []).join(', ')}
Available Categories: ${(data.categories || []).join(', ')}

For each recommendation, write it naturally:
1. Why this service is a good fit (sound genuine, not like an algorithm)
2. Match score (percentage)
3. Which goal it addresses

Format as JSON array with keys: title, reason, matchScore, addressesGoal.`;
  }

  if (type === 'chat') {
    return `You are chatting with a user on SkillSprint AI — a marketplace for micro-services like "1-hour React debugging", "CV review", "UI feedback", "English speaking mock". Mentors also list services here.

User context:
- Name: ${data.userName || 'User'}
- Role: ${data.userRole || 'user'}
- Skills interested: ${(data.skills || []).join(', ')}
- Goals: ${(data.goals || []).join(', ')}

Previous conversation:
${(data.history || []).map((h: any) => `${h.role}: ${h.content}`).join('\n')}

User says: "${data.message || ''}"

Reply in the SAME language the user wrote in. If they wrote in Bengali, reply in Bengali. If English, reply in English.
Be natural, warm, genuine. Ask a follow-up question naturally.
Then suggest 3 short follow-up prompts the user might want to click next (in the same language).

Return valid JSON only with keys: reply (string), suggestions (array of 3 strings).
Never mention you are an AI. Never switch languages.`;
  }

  if (type === 'analyze-document') {
    return `Look over this document like a real career coach would and share your honest thoughts.

Document content:
${(data.content || '').substring(0, 4000)}

Document name: ${data.fileName || 'document'}
Document type: ${data.fileType || 'unknown'}

Write a human-sounding analysis in JSON format with:
- summary: A 2-3 sentence take on what this document says (natural language, not robotic)
- keyPoints: Array of 3-6 things that stand out
- suggestions: Array of 2-4 practical next steps (write them like real advice)
- skills: Array of skills you spot in the content
- topics: Array of main topics covered

Format the response as valid JSON only. Make the text within sound like a person wrote it.`;
  }

  return '';
}

function isBengali(text: string): boolean {
  return /[\u0980-\u09FF]/.test(text);
}

function generateMockResponse(type: string, data: Record<string, any>, _length: string) {
  if (type === 'chat') {
    const message = (data.message || '').toLowerCase();
    const bn = isBengali(message);
    const name = data.userName || 'there';

    if (bn) {
      const bnSkills = (data.skills || ['পেশাদার উন্নয়ন']);
      if (message.includes('সেবা') || message.includes('খোজ') || message.includes('service') || message.includes('find')) {
        return {
          reply: `বাহ! দারুণ শুরু! আপনার প্রোফাইল দেখে বুঝতে পারছি আপনি ${bnSkills.join(', ')} নিয়ে আগ্রহী — এই ক্যাটাগরিতে সত্যিই কিছু ভালো সার্ভিস আছে। Explore পেজে গিয়ে ক্যাটাগরি, দাম দিয়ে ফিল্টার করে নিতে পারেন। আরও কমিয়ে দিতে পারি?`,
          suggestions: ['ওয়েব ডেভেলপমেন্ট সার্ভিস দেখুন', 'AI সার্ভিস কী কী?', 'কিভাবে বুক করব?'],
        };
      }
      if (message.includes('বুক') || message.includes('অর্ডার')) {
        return {
          reply: `বুকিং খুবই সহজ। যেকোনো সার্ভিস পেজে "Book Now" বাটনে ক্লিক করুন। সব বুকিং Orders পেজে পাবেন। আগে কোনো সার্ভিস খুঁজে দিতে সাহায্য করব?`,
          suggestions: ['আমার অর্ডার দেখুন', 'সার্ভিস ব্রাউজ করুন', 'বুকিং বাতিল করুন'],
        };
      }
      if (message.includes('মেন্টর') || message.includes('শেখা')) {
        return {
          reply: `মেন্টরিং নিয়ে ভাবছেন, দারুণ! Add Service পেজ থেকে সার্ভিস লিস্ট করতে পারবেন। আর আমাদের AI Content Generator আপনার সার্ভিসের বর্ণনা নিজেই লিখে দেয় — অনেক সময় বাঁচে!`,
          suggestions: ['নতুন সার্ভিস যোগ করুন', 'AI কন্টেন্ট জেনারেটর', 'আমার সার্ভিস ম্যানেজ করুন'],
        };
      }
      if (message.includes('হ্যালো') || message.includes('নমস্কার') || message.includes('কেমন')) {
        const greetings = [`হ্যালো ${name}!`, `কেমন আছেন ${name}?`, `নমস্কার ${name}!`];
        return {
          reply: `${greetings[Math.floor(Math.random() * greetings.length)]} SkillSprint AI-তে স্বাগতম! সার্ভিস খোঁজা, প্ল্যাটফর্ম বোঝা বা কোনো গাইডেন্স দরকার — আমি আছি। আজকে কী নিয়ে ভাবছেন?`,
          suggestions: ['আমার জন্য সার্ভিস খুঁজুন', 'প্ল্যাটফর্ম কিভাবে কাজ করে?', 'আমি মেন্টর হতে চাই'],
        };
      }
      return {
        reply: `আমি সার্ভিস খুঁজতে, প্ল্যাটফর্ম বুঝতে, বা মেন্টর হতে সাহায্য করতে পারি। এখনকার মতো কোনটা সবচেয়ে কাজে লাগবে?`,
        suggestions: ['সার্ভিস এক্সপ্লোর করুন', 'ড্যাশবোর্ড দেখুন', 'সাপোর্টে যোগাযোগ'],
      };
    }

    // English responses
    const skills = (data.skills || ['professional development']);
    if (message.includes('service') || message.includes('find') || message.includes('recommend')) {
      return {
        reply: `Great question! Based on your interest in ${skills.join(', ')}, head over to the Explore page. You can filter by category, price, or rating. Want me to narrow it down?`,
        suggestions: ['Show web development services', 'What AI services are available?', 'How do I book?'],
      };
    }
    if (message.includes('book') || message.includes('order') || message.includes('pay')) {
      return {
        reply: `Booking is simple. Go to any service page, hit "Book Now", and you're all set. Your bookings are in the Orders page. Need help finding a service first?`,
        suggestions: ['View my orders', 'Browse services', 'Cancel a booking'],
      };
    }
    if (message.includes('mentor') || message.includes('teach') || message.includes('list')) {
      return {
        reply: `Love that you're thinking about mentoring! List your services from the Add Service page. The AI Content Generator can write descriptions for you — saves a ton of time!`,
        suggestions: ['Add a new service', 'AI content generator', 'Manage my services'],
      };
    }
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return {
        reply: `Hey ${name}! Welcome to SkillSprint AI! I'm here to help you find services, understand the platform, or get guidance. What's on your mind?`,
        suggestions: ['Find services for me', 'How does this platform work?', 'I want to be a mentor'],
      };
    }
    return {
      reply: `I can help with finding services, understanding the platform, or becoming a mentor. What sounds most useful to you right now?`,
      suggestions: ['Explore services', 'Dashboard overview', 'Contact support'],
    };
  }

  if (type === 'analyze-document') {
    const content = (data.content || '').toLowerCase();
    const detectedSkills = [];
    if (content.includes('react') || content.includes('javascript') || content.includes('typescript') || content.includes('node')) detectedSkills.push('Web Development');
    if (content.includes('python') || content.includes('data') || content.includes('machine learning') || content.includes('ai')) detectedSkills.push('Data Science / AI');
    if (content.includes('design') || content.includes('ui') || content.includes('ux') || content.includes('figma')) detectedSkills.push('UI/UX Design');
    if (content.includes('devops') || content.includes('cloud') || content.includes('docker') || content.includes('aws')) detectedSkills.push('DevOps & Cloud');
    if (content.includes('mobile') || content.includes('android') || content.includes('ios') || content.includes('swift')) detectedSkills.push('Mobile Development');

    const summaries = [
      `Nice document! I can see you've got experience in ${detectedSkills.join(', ') || 'a range of professional areas'}. Your background looks solid — there are some great opportunities on SkillSprint that could be a good fit.`,
      `Thanks for sharing! After reading through it, your strengths are in ${detectedSkills.join(', ') || 'several professional areas'}. That aligns really well with what we offer.`,
    ];

    return {
      summary: summaries[Math.floor(Math.random() * summaries.length)],
      keyPoints: [
        `Strong background in ${detectedSkills.slice(0, 2).join(' and ') || 'professional development'}`,
        'Skills that match marketplace categories',
        'Good potential for both learning and teaching',
        'Solid professional experience documented',
      ],
      suggestions: [
        `Check out services in ${detectedSkills[0] || 'your area'} — mentors can help you go further`,
        'Update your profile with these skills for better recommendations',
        'Consider becoming a mentor — you have expertise to share',
        'Browse the Explore page for matching services',
      ],
      skills: detectedSkills.length > 0 ? detectedSkills : ['Professional Development'],
      topics: ['Career Development', 'Professional Skills', 'Mentorship Opportunities'],
    };
  }
  if (type === 'generate-service') {
    const title = data.title || 'Professional Service';
    const category = data.category || 'General';
    return {
      shortDesc: `Get practical, hands-on help with ${title.toLowerCase()} from someone who's been in your shoes. No fluff, just real guidance that works.`,
      fullDesc: `## What This Is About\n\nThis isn't a cookie-cutter session. I'll work on ${category.toLowerCase()} based on where you actually are — whether you're starting out or looking to level up.\n\n## What We'll Cover\n\n- What actually matters in practice\n- Real-world approaches that work\n- Getting unstuck when things get tricky\n- Tips I've picked up along the way\n\n## Who This Is For\n\n- Anyone wanting to get better at ${category.toLowerCase()}\n- People who learn better with guidance\n- Teams wanting to level up together\n\n## What You'll Need\n\n- Willingness to ask questions (the more the better)\n- Anything specific you're working on`,
      tags: [category.toLowerCase(), 'mentorship', 'hands-on', 'practical'],
      faq: [
        { question: 'Do I need any special materials?', answer: "Nope! Just bring your questions and something to take notes. I'll let you know if anything specific is needed beforehand." },
        { question: 'Will I get a recording?', answer: "Absolutely. I record every session and share it afterward so you can revisit anytime." },
        { question: 'Is this okay for beginners?', answer: "Totally. I tailor every session to your current level. Beginners are more than welcome." },
      ],
    };
  }

  if (type === 'recommend') {
    const skills = data.skills || ['Web Development'];
    return skills.slice(0, 4).map((skill: string, i: number) => ({
      title: `${skill} Mentorship Session`,
      reason: `Since you're interested in ${skill}, I think you'd really click with this one. Practical focus on real-world skills, not just theory.`,
      matchScore: 95 - i * 10,
      addressesGoal: `Level up your ${skill.toLowerCase()} skills`,
    }));
  }

  return null;
}

export async function generateContent(
  type: string,
  data: Record<string, any>,
  length: string = 'medium'
) {
  const client = getOpenAIClient();
  if (!client) {
    console.warn('OPENAI_API_KEY not set — using mock response');
    return generateMockResponse(type, data, length);
  }

  const userContent = buildPrompt(type, data, length);

  try {
    const completion = await client.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      temperature: type === 'chat' ? 0.95 : 0.8,
      max_tokens: type === 'chat' ? 500 : length === 'short' ? 300 : length === 'long' ? 1000 : 600,
    });

    const text = completion.choices[0]?.message?.content || '';
    try {
      return JSON.parse(text);
    } catch (parseErr) {
      console.error('Failed to parse AI response as JSON:', text, parseErr);
      return generateMockResponse(type, data, length);
    }
  } catch (apiErr) {
    console.error('OpenRouter API call failed:', apiErr);
    return generateMockResponse(type, data, length);
  }
}
