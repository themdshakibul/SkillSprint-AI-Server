import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const SYSTEM_PROMPT = `You are a friendly, warm AI assistant for SkillSprint AI, a skill marketplace platform.
You help mentors create compelling service descriptions and help learners find the right services.
Speak naturally like a human consultant — be conversational, encouraging, and use varied language.
Avoid robotic phrases. Use occasional casual expressions. Keep it professional but personable.`;

function buildPrompt(type: string, data: Record<string, any>, length: string): string {
  const lengthMap: Record<string, string> = {
    short: '2-3 sentences',
    medium: '1 paragraph (4-6 sentences)',
    long: '2-3 paragraphs',
  };

  const lengthInstr = lengthMap[length] || '1 paragraph';

  if (type === 'generate-service') {
    return `Generate a professional service listing for a skill marketplace.

Service Title: ${data.title || 'Untitled Service'}
Category: ${data.category || 'General'}
Target Audience: ${data.targetAudience || 'Professionals looking to upskill'}
Key Points: ${data.bulletPoints || 'Expert guidance, practical learning'}

Generate the following (${lengthInstr}):
1. A short description (max 200 chars)
2. A full description with structured sections
3. 3-5 relevant tags
4. 3 FAQ questions and answers

Format the response as JSON with keys: shortDesc, fullDesc, tags (array), faq (array of {question, answer}).`;
  }

  if (type === 'recommend') {
    return `Based on the following user profile, recommend 3-5 relevant services from our marketplace.

User Goals: ${(data.goals || []).join(', ')}
Interested Skills: ${(data.skills || []).join(', ')}
Past Interactions: ${(data.history || []).join(', ')}
Available Categories: ${(data.categories || []).join(', ')}

For each recommendation, provide:
1. Why this service fits the user
2. Match score (percentage)
3. Which goal it addresses

Format as JSON array with keys: title, reason, matchScore, addressesGoal.`;
  }

  if (type === 'chat') {
    return `You are a helpful AI assistant for SkillSprint AI, a skill marketplace where users can find micro-services (e.g., "1-hour React debugging", "CV review", "UI feedback", "English speaking mock") and mentors can list services.

User context:
- Name: ${data.userName || 'User'}
- Role: ${data.userRole || 'user'}
- Skills interested: ${(data.skills || []).join(', ')}
- Goals: ${(data.goals || []).join(', ')}

Previous conversation:
${(data.history || []).map((h: any) => `${h.role}: ${h.content}`).join('\n')}

User message: ${data.message || ''}

Provide a helpful, concise response. If they ask about finding services, suggest relevant categories. If they ask about platform features, explain them. Keep responses friendly and professional.`;
  }

  if (type === 'analyze-document') {
    return `Analyze the following document content and provide insights.

Document content:
${(data.content || '').substring(0, 4000)}

Document name: ${data.fileName || 'document'}
Document type: ${data.fileType || 'unknown'}

Generate a comprehensive analysis in JSON format with the following keys:
- summary: A 2-3 sentence summary of the document
- keyPoints: Array of 3-6 key bullet points from the document
- suggestions: Array of 2-4 actionable suggestions based on the content
- skills: Array of skills mentioned or inferred from the content
- topics: Array of main topics covered

Format the response as valid JSON only.`;
  }

  return '';
}

function generateMockResponse(type: string, data: Record<string, any>, _length: string) {
  if (type === 'chat') {
    const message = (data.message || '').toLowerCase();
    const name = data.userName || 'there';
    const greetings = [`Hey ${name}!`, `Hi ${name}!`, `Hello ${name}!`];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    if (message.includes('service') || message.includes('find') || message.includes('recommend')) {
      const replies = [
        `Great question! Based on what I know about you — especially your interest in ${(data.skills || ['professional development']).join(', ')} — I'd suggest heading over to the Explore page. You can browse services by category like Web Development, AI, Design, and more. Want me to point you toward something specific?`,
        `So you're looking for services? Awesome. With your background in ${(data.skills || ['professional development']).join(', ')}, there's plenty to choose from. The Explore page lets you filter by category, price, and rating. Anything particular you're hoping to learn?`,
      ];
      return {
        reply: replies[Math.floor(Math.random() * replies.length)],
        suggestions: ['Show me web development services', 'What AI services are available?', 'How do I book a session?'],
      };
    }
    if (message.includes('book') || message.includes('order') || message.includes('pay')) {
      return {
        reply: `Booking is pretty straightforward! Just head to any service page, hit "Book Now", and you're all set. You can keep track of everything in your Orders page. Need help finding the right service first?`,
        suggestions: ['View my orders', 'Browse services', 'Cancel a booking'],
      };
    }
    if (message.includes('mentor') || message.includes('teach') || message.includes('list')) {
      return {
        reply: `Love that you're thinking about mentoring! You can list your services from the Add Service page in your dashboard. And here's the cool part — our AI Content Generator can write your service descriptions for you. Pretty neat, right?`,
        suggestions: ['Add a new service', 'AI content generator', 'Manage my services'],
      };
    }
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return {
        reply: `${greeting} Welcome to SkillSprint AI! I'm here to help you find services, understand how things work, or just point you in the right direction. What's on your mind?`,
        suggestions: ['Find services for me', 'How does this platform work?', 'I want to become a mentor'],
      };
    }
    const catchAll = [
      `Hmm, that's a good one! I can help with finding services, understanding the platform, or becoming a mentor. What sounds most useful to you right now?`,
      `I'd love to help with that! I know my way around SkillSprint pretty well — services, mentoring, bookings, you name it. What are you curious about?`,
    ];
    return {
      reply: catchAll[Math.floor(Math.random() * catchAll.length)],
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
      `Nice document! I can see you've got experience in ${detectedSkills.join(', ') || 'a range of professional areas'}. Your background looks solid and there are some great opportunities for you on SkillSprint.`,
      `Thanks for sharing! After looking through your document, I'd say your strengths lie in ${detectedSkills.join(', ') || 'several professional areas'}. That's a great fit for what we offer on the platform.`,
    ];

    return {
      summary: summaries[Math.floor(Math.random() * summaries.length)],
      keyPoints: [
        `Strong background in ${detectedSkills.slice(0, 2).join(' and ') || 'professional development'}`,
        'Skills that match our marketplace categories',
        'Good potential for both learning and mentoring',
        'Clear professional experience documented',
      ],
      suggestions: [
        `Check out services in ${detectedSkills[0] || 'your area'} — there are mentors who can help you go even further`,
        'Update your profile with these skills so our AI can give you better recommendations',
        'Ever thought about becoming a mentor? You clearly have expertise to share',
        'Browse the Explore page to see what matches your skill set',
      ],
      skills: detectedSkills.length > 0 ? detectedSkills : ['Professional Development'],
      topics: ['Career Development', 'Professional Skills', 'Mentorship Opportunities'],
    };
  }
  if (type === 'generate-service') {
    const title = data.title || 'Professional Service';
    const category = data.category || 'General';
    return {
      shortDesc: `Expert ${title.toLowerCase()} service tailored to your needs. Get hands-on guidance, practical solutions, and actionable insights from an experienced professional.`,
      fullDesc: `## About This Service\n\nThis ${category.toLowerCase()} service provides comprehensive, hands-on guidance to help you achieve your goals. Whether you are a beginner looking to get started or an experienced professional seeking to level up, this session is designed to deliver real results.\n\n## What You Will Learn\n\n- Core concepts and best practices\n- Practical, real-world techniques\n- Problem-solving strategies\n- Industry insights and tips\n\n## Who This Is For\n\n- Professionals looking to upskill\n- Students wanting practical knowledge\n- Teams needing expert guidance\n\n## Prerequisites\n\n- Basic understanding of the topic\n- Willingness to learn and ask questions`,
      tags: [category.toLowerCase(), 'mentorship', 'hands-on', 'practical'],
      faq: [
        { question: 'What materials do I need?', answer: 'Just a notebook and your questions. Any specific requirements will be communicated before the session.' },
        { question: 'Can I get a recording?', answer: 'Yes, sessions are recorded and shared with you for future reference.' },
        { question: 'Is this suitable for beginners?', answer: 'Absolutely! The session is tailored to your current skill level.' },
      ],
    };
  }

  if (type === 'recommend') {
    const skills = data.skills || ['Web Development'];
    return skills.slice(0, 4).map((skill: string, i: number) => ({
      title: `${skill} Mentorship Session`,
      reason: `Based on your interest in ${skill}, this personalized session will help you build practical skills with expert guidance.`,
      matchScore: 95 - i * 10,
      addressesGoal: `Advance your ${skill.toLowerCase()} expertise`,
    }));
  }

  return null;
}

export async function generateContent(
  type: string,
  data: Record<string, any>,
  length: string = 'medium'
) {
  if (!openai) {
    return generateMockResponse(type, data, length);
  }

  const prompt = buildPrompt(type, data, length);
  const userContent = `Data: ${JSON.stringify(data)}\n\nType: ${type}\n\n${prompt}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      temperature: 0.7,
      max_tokens: length === 'short' ? 300 : length === 'long' ? 1000 : 600,
    });

    const text = completion.choices[0]?.message?.content || '';
    try {
      return JSON.parse(text);
    } catch {
      return generateMockResponse(type, data, length);
    }
  } catch {
    return generateMockResponse(type, data, length);
  }
}
