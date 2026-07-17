import { Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';

function sendToken(res: Response, userId: string, statusCode = 200) {
  const token = generateToken(userId);
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(statusCode).json({ token });
}

export async function register(req: AuthRequest, res: Response) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed });

    sendToken(res, user._id.toString(), 201);
  } catch (err) {
    res.status(500).json({ message: 'Registration failed' });
  }
}

export async function login(req: AuthRequest, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    sendToken(res, user._id.toString());
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
}

export async function demoLogin(req: AuthRequest, res: Response) {
  try {
    let user = await User.findOne({ email: 'demo@skillsprint.ai' });

    if (!user) {
      user = await User.create({
        name: 'Demo User',
        email: 'demo@skillsprint.ai',
        password: await bcrypt.hash('demo123456', 12),
        role: 'mentor',
        skillsInterested: ['React', 'Node.js', 'TypeScript'],
        goals: ['Learn full-stack development', 'Build AI applications'],
      });
    }

    sendToken(res, user._id.toString());
  } catch (err) {
    res.status(500).json({ message: 'Demo login failed' });
  }
}

export async function googleLogin(req: AuthRequest, res: Response) {
  try {
    const { email, name, googleId, avatar } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ message: 'Google credentials required' });
    }

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      user = await User.create({ name, email, googleId, avatar });
    } else if (!user.googleId) {
      user.googleId = googleId;
      if (avatar) user.avatar = avatar;
      await user.save();
    }

    sendToken(res, user._id.toString());
  } catch (err) {
    res.status(500).json({ message: 'Google login failed' });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  res.json({ user: req.user });
}

export async function logout(_req: AuthRequest, res: Response) {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
}
