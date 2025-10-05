// Minimal tech stack data for picker UI
// Add more as needed
export type TechCategory = 'language' | 'database' | 'framework' | 'tool' | 'other';

export interface TechItem {
  id: string;
  name: string;
  category: TechCategory;
  icon: string; // simple-icons slug
}

export const TECH_STACK: TechItem[] = [
  { id: 'typescript', name: 'TypeScript', category: 'language', icon: 'typescript' },
  { id: 'javascript', name: 'JavaScript', category: 'language', icon: 'javascript' },
  { id: 'python', name: 'Python', category: 'language', icon: 'python' },
  { id: 'postgresql', name: 'PostgreSQL', category: 'database', icon: 'postgresql' },
  { id: 'mysql', name: 'MySQL', category: 'database', icon: 'mysql' },
  { id: 'mongodb', name: 'MongoDB', category: 'database', icon: 'mongodb' },
  { id: 'nextjs', name: 'Next.js', category: 'framework', icon: 'nextdotjs' },
  { id: 'react', name: 'React', category: 'framework', icon: 'react' },
  { id: 'supabase', name: 'Supabase', category: 'tool', icon: 'supabase' },
  { id: 'jest', name: 'Jest', category: 'tool', icon: 'jest' },
  { id: 'cypress', name: 'Cypress', category: 'tool', icon: 'cypress' },
  { id: 'docker', name: 'Docker', category: 'tool', icon: 'docker' },
];