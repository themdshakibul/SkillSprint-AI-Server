import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI!);

  const User = (await import('./models/User')).default;
  const Service = (await import('./models/Service')).default;
  const Review = (await import('./models/Review')).default;

  await User.deleteMany({});
  await Service.deleteMany({});
  await Review.deleteMany({});

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@skillsprint.ai',
    password: await bcrypt.hash('admin123', 12),
    role: 'admin',
    skillsInterested: [],
    goals: [],
  });

  const mentor = await User.create({
    name: 'Alex Mentor',
    email: 'mentor@skillsprint.ai',
    password: await bcrypt.hash('mentor123', 12),
    role: 'mentor',
    skillsInterested: ['React', 'Node.js', 'Python'],
    goals: ['Help others learn'],
  });

  const mentor2 = await User.create({
    name: 'Sarah Coach',
    email: 'sarah@skillsprint.ai',
    password: await bcrypt.hash('coach123', 12),
    role: 'mentor',
    skillsInterested: ['UI/UX', 'Figma', 'Design'],
    goals: ['Share design expertise'],
  });

  const services = await Service.insertMany([
    {
      title: 'React Component Debugging',
      shortDesc: 'Get your React components working perfectly. I will debug, refactor, and optimize your code.',
      fullDesc: 'Detailed debugging session for React components. We will go through your codebase, identify issues, fix bugs, and optimize performance. Perfect for developers stuck on complex component logic.',
      category: 'Web Development',
      price: 50,
      duration: 60,
      ratingAvg: 4.8,
      ratingCount: 24,
      images: ['https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600'],
      approved: true,
      mentorId: mentor._id,
      tags: ['react', 'debugging', 'javascript', 'frontend'],
    },
    {
      title: 'CV Review & Career Coaching',
      shortDesc: 'Professional CV review with actionable feedback to land your dream tech job.',
      fullDesc: 'Comprehensive CV review session. I will analyze your resume structure, content, and impact. Get personalized suggestions to make your application stand out to top tech companies.',
      category: 'Career',
      price: 35,
      duration: 45,
      ratingAvg: 4.9,
      ratingCount: 56,
      images: ['https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600'],
      approved: true,
      mentorId: mentor._id,
      tags: ['career', 'cv', 'resume', 'job-search'],
    },
    {
      title: 'UI Design Review & Feedback',
      shortDesc: 'Expert UI/UX feedback on your designs. Improve usability and visual appeal.',
      fullDesc: 'Get detailed design critique from an experienced UI/UX professional. I will review your Figma files, provide actionable feedback on layout, typography, color theory, and user experience patterns.',
      category: 'Design & UI/UX',
      price: 45,
      duration: 60,
      ratingAvg: 4.7,
      ratingCount: 31,
      images: ['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600'],
      approved: true,
      mentorId: mentor2._id,
      tags: ['ui', 'ux', 'figma', 'design'],
    },
    {
      title: 'Python Data Analysis Help',
      shortDesc: 'Stuck with data analysis? I will help you with pandas, numpy, and visualization.',
      fullDesc: 'One-on-one session to help you with Python data analysis. We can work on pandas data manipulation, numpy arrays, data visualization with matplotlib/seaborn, or any data science problem you are facing.',
      category: 'Data Science',
      price: 55,
      duration: 60,
      ratingAvg: 4.6,
      ratingCount: 18,
      images: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600'],
      approved: true,
      mentorId: mentor._id,
      tags: ['python', 'data-analysis', 'pandas', 'numpy'],
    },
    {
      title: 'API Development with Node.js',
      shortDesc: 'Build robust REST APIs with Express, TypeScript, and MongoDB.',
      fullDesc: 'Hands-on session covering API design principles, Express.js setup, MongoDB integration, authentication, validation, and deployment. You will leave with a production-ready API template.',
      category: 'Web Development',
      price: 65,
      duration: 90,
      ratingAvg: 4.9,
      ratingCount: 42,
      images: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600'],
      approved: true,
      mentorId: mentor._id,
      tags: ['nodejs', 'api', 'express', 'mongodb'],
    },
    {
      title: 'Figma to React Integration',
      shortDesc: 'Learn how to convert Figma designs into clean, responsive React code.',
      fullDesc: 'Step-by-step guidance on translating Figma designs to React components. Covering CSS architecture, responsive design patterns, component composition, and design system implementation.',
      category: 'Design & UI/UX',
      price: 50,
      duration: 60,
      ratingAvg: 4.8,
      ratingCount: 27,
      images: ['https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=600'],
      approved: true,
      mentorId: mentor2._id,
      tags: ['figma', 'react', 'css', 'frontend'],
    },
    {
      title: 'English Speaking Mock Interview',
      shortDesc: 'Practice technical interviews in English with real-time feedback.',
      fullDesc: 'Simulated technical interview session conducted in English. I will ask real interview questions, evaluate your communication skills, and provide detailed feedback on clarity, structure, and technical accuracy.',
      category: 'Career',
      price: 40,
      duration: 45,
      ratingAvg: 4.7,
      ratingCount: 63,
      images: ['https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=600'],
      approved: true,
      mentorId: mentor._id,
      tags: ['interview', 'english', 'communication', 'career'],
    },
    {
      title: 'Machine Learning Project Guidance',
      shortDesc: 'Get expert help with ML models, training, and deployment strategies.',
      fullDesc: 'End-to-end ML project guidance. From data preprocessing and feature engineering to model selection, training, evaluation, and deployment. Suitable for students and professionals building ML projects.',
      category: 'AI & Machine Learning',
      price: 70,
      duration: 90,
      ratingAvg: 4.9,
      ratingCount: 35,
      images: ['https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600'],
      approved: true,
      mentorId: mentor._id,
      tags: ['machine-learning', 'ai', 'python', 'data-science'],
    },
    {
      title: 'Mobile App UI with React Native',
      shortDesc: 'Build beautiful cross-platform mobile apps with React Native.',
      fullDesc: 'Learn React Native from scratch or level up your skills. Cover navigation, state management, animations, native modules, and app store deployment. Perfect for web developers going mobile.',
      category: 'Mobile Development',
      price: 60,
      duration: 60,
      ratingAvg: 4.6,
      ratingCount: 21,
      images: ['https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600'],
      approved: true,
      mentorId: mentor2._id,
      tags: ['react-native', 'mobile', 'ios', 'android'],
    },
    {
      title: 'Docker & DevOps Setup',
      shortDesc: 'Containerize your apps and set up CI/CD pipelines like a pro.',
      fullDesc: 'Practical DevOps session covering Docker containerization, Docker Compose, CI/CD with GitHub Actions, cloud deployment (AWS/Azure), and monitoring. Bring your project and we will set it up together.',
      category: 'DevOps & Cloud',
      price: 75,
      duration: 90,
      ratingAvg: 4.8,
      ratingCount: 29,
      images: ['https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=600'],
      approved: true,
      mentorId: mentor._id,
      tags: ['docker', 'devops', 'ci-cd', 'cloud'],
    },
  ]);

  const reviewData = [
    { userId: mentor._id, serviceId: services[0]._id, rating: 5, comment: 'Amazing debugging session! Fixed my React issue in minutes.' },
    { userId: mentor2._id, serviceId: services[0]._id, rating: 4, comment: 'Very helpful and thorough explanation.' },
    { userId: mentor._id, serviceId: services[2]._id, rating: 5, comment: 'Great design feedback! My UI looks much better now.' },
  ];

  await Review.insertMany(reviewData);

  for (const service of services) {
    const reviews = await Review.find({ serviceId: service._id });
    if (reviews.length > 0) {
      const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      service.ratingAvg = Math.round(avg * 10) / 10;
      service.ratingCount = reviews.length;
      await service.save();
    }
  }

  console.log('Seed data created successfully');
  console.log(`  - 2 mentors`);
  console.log(`  - ${services.length} services`);
  console.log(`  - ${reviewData.length} reviews`);

  await mongoose.disconnect();
}

seed().catch(console.error);
