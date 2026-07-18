import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { generateContent } from '../services/aiService';
import AIEvent from '../models/AIEvent';
import Service from '../models/Service';
import User from '../models/User';
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export { upload };

export async function generateServiceContent(req: AuthRequest, res: Response) {
  try {
    const { title, category, bulletPoints, targetAudience, length } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const result = await generateContent('generate-service', {
      title,
      category: category || 'General',
      bulletPoints: bulletPoints || '',
      targetAudience: targetAudience || '',
    }, length || 'medium');

    res.json(result);
  } catch (err) {
    console.error('AI generate error:', err);
    res.status(500).json({ message: 'AI generation failed', error: String(err) });
  }
}

export async function getRecommendations(req: AuthRequest, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const fullUser = await User.findById(user._id);
    const categories = await Service.distinct('category');

    const history = await AIEvent.find({ userId: user._id })
      .sort('-createdAt')
      .limit(20)
      .lean();

    const historySummaries = history.map(h => {
      if (h.type === 'service_view') return `Viewed: ${h.payload.title || 'service'}`;
      if (h.type === 'search_query') return `Searched: ${h.payload.query || 'something'}`;
      if (h.type === 'tag_preference') return `Interested in: ${h.payload.tag || ''}`;
      return '';
    }).filter(Boolean);

    const aiResult = await generateContent('recommend', {
      goals: fullUser?.goals || [],
      skills: fullUser?.skillsInterested || [],
      history: historySummaries,
      categories,
    }, 'medium');

    const recommendations = Array.isArray(aiResult) ? aiResult : [];

    await AIEvent.create({
      userId: user._id,
      type: 'recommendation_click',
      payload: { count: recommendations.length },
    });

    const topServices = await Service.find({ category: { $in: fullUser?.skillsInterested || [] } })
      .sort('-ratingAvg')
      .limit(6)
      .populate('mentorId', 'name avatar');

    res.json({ recommendations, topServices });
  } catch (err) {
    res.status(500).json({ message: 'Recommendation failed' });
  }
}

export async function chatWithAI(req: AuthRequest, res: Response) {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const user = req.user;
    const fullUser = user ? await User.findById(user._id).lean() : null;

    const result = await generateContent('chat', {
      message,
      history: history || [],
      userName: fullUser?.name || 'User',
      userRole: fullUser?.role || 'user',
      skills: fullUser?.skillsInterested || [],
      goals: fullUser?.goals || [],
    }, 'medium');

    res.json(result);
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ message: 'Chat failed', error: String(err) });
  }
}

export async function analyzeDocument(req: AuthRequest, res: Response) {
  try {
    const { content, fileName, fileType } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Document content is required' });
    }

    const result = await generateContent('analyze-document', {
      content,
      fileName: fileName || 'document',
      fileType: fileType || 'text',
    }, 'medium');

    await AIEvent.create({
      userId: req.user?._id,
      type: 'document_analysis',
      payload: { fileName, fileType },
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Document analysis failed' });
  }
}

export async function analyzeUploadedDocument(req: AuthRequest, res: Response) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const content = file.buffer.toString('utf-8');
    const fileName = file.originalname;
    const fileType = file.mimetype;

    const result = await generateContent('analyze-document', {
      content,
      fileName,
      fileType,
    }, 'medium');

    await AIEvent.create({
      userId: req.user?._id,
      type: 'document_analysis',
      payload: { fileName, fileType },
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Document analysis failed' });
  }
}

export async function trackEvent(req: AuthRequest, res: Response) {
  try {
    const { type, payload } = req.body;

    if (!type) {
      return res.status(400).json({ message: 'Event type is required' });
    }

    await AIEvent.create({
      userId: req.user?._id,
      type,
      payload: payload || {},
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to track event' });
  }
}
