import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const SYSTEM_PROMPT = `You are an expert AI assistant for SkillSprint AI, a skill marketplace platform.
You help mentors create compelling service descriptions and help learners find the right services.
Be professional, concise, and practical.`;

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

  return '';
}

function generateMockResponse(type: string, data: Record<string, any>, _length: string) {
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
