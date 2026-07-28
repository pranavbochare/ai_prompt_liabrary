import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Prompt from './models/Prompt.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_prompt_library';

const samples = [
  {
    title: 'React Component Refactor',
    content:
      'Refactor the following React component to use hooks, extract reusable logic into a custom hook, and add TypeScript types:\n\n{{paste component here}}',
    description: 'Cleans up class components into modern, typed function components.',
    category: 'Coding',
    tags: ['react', 'typescript', 'refactor'],
    isFavorite: true,
    isPinned: true,
    order: 0,
  },
  {
    title: 'SQL Query Optimizer',
    content:
      'Analyze this SQL query and suggest indexes, rewrite it for performance, and explain the execution plan changes:\n\n{{paste query here}}',
    description: 'Speeds up slow queries and explains why the fix works.',
    category: 'SQL',
    tags: ['sql', 'performance', 'indexing'],
    isFavorite: false,
    isPinned: false,
    order: 1,
  },
  {
    title: 'Cold Outreach Email',
    content:
      'Write a short, personalized cold outreach email to {{recipient role}} at {{company}} about {{product/service}}. Keep it under 120 words, no fluff, one clear call to action.',
    description: 'Personalized, concise outreach that avoids generic sales tone.',
    category: 'Email',
    tags: ['sales', 'outreach'],
    isFavorite: true,
    isPinned: false,
    order: 2,
  },
  {
    title: 'Resume Bullet Rewriter',
    content:
      'Rewrite these resume bullet points using strong action verbs and quantifiable impact where possible:\n\n{{paste bullets here}}',
    description: 'Turns vague duties into measurable achievements.',
    category: 'Resume',
    tags: ['career', 'resume'],
    isFavorite: false,
    isPinned: false,
    order: 3,
  },
  {
    title: 'Instagram Caption Generator',
    content:
      'Write 3 Instagram caption options for a post about {{topic}}. Tone: {{tone}}. Include 5 relevant hashtags for each.',
    description: 'Quick captions with hashtags, ready to post.',
    category: 'Social Media',
    tags: ['instagram', 'captions'],
    isFavorite: false,
    isPinned: false,
    order: 4,
  },
  {
    title: 'Weekly Planning Assistant',
    content:
      'Given this list of tasks, help me prioritize them using the Eisenhower matrix and suggest a realistic schedule for the week:\n\n{{paste tasks here}}',
    description: 'Turns a messy task list into a prioritized weekly plan.',
    category: 'Productivity',
    tags: ['planning', 'prioritization'],
    isFavorite: false,
    isPinned: false,
    order: 5,
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected. Seeding...');
  await Prompt.deleteMany({});
  await Prompt.insertMany(samples);
  console.log(`Seeded ${samples.length} prompts.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
