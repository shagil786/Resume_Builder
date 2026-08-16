import type { TemplateDefinition } from './types';

export const MODERN_PROFESSIONAL: TemplateDefinition = {
  id: 'modern-professional',
  name: 'Modern Professional',
  description: 'Clean two-column layout with a colored sidebar for contact and skills.',
  category: 'PROFESSIONAL',
  page: {
    width: 816,
    height: 1056,
    margins: { top: 40, bottom: 40, left: 50, right: 50 },
  },
  typography: {
    name: { family: 'Helvetica, Arial, sans-serif', size: 22, weight: 700, color: '#1a1a2e', lineHeight: 1.3 },
    heading: { family: 'Helvetica, Arial, sans-serif', size: 14, weight: 600, color: '#1a1a2e', lineHeight: 1.4 },
    sectionTitle: { family: 'Helvetica, Arial, sans-serif', size: 12, weight: 700, color: '#e94560', lineHeight: 1.4 },
    body: { family: 'Helvetica, Arial, sans-serif', size: 10, weight: 400, color: '#333', lineHeight: 1.5 },
    bullet: { family: 'Helvetica, Arial, sans-serif', size: 10, weight: 400, color: '#444', lineHeight: 1.4 },
  },
  colors: {
    primary: '#1a1a2e',
    secondary: '#16213e',
    accent: '#e94560',
    text: '#333',
    muted: '#666',
    background: '#fff',
    divider: '#e0e0e0',
  },
  constraints: {
    maxPages: 2,
    maxExperienceBullets: 6,
    maxProjects: 3,
    maxSkillsPerRow: 4,
    bulletMaxLines: 2,
  },
};

export const CLASSIC_ACADEMIC: TemplateDefinition = {
  id: 'classic-academic',
  name: 'Classic Academic',
  description: 'Traditional single-column layout with serif fonts, suitable for academic and research positions.',
  category: 'ACADEMIC',
  page: {
    width: 816,
    height: 1056,
    margins: { top: 50, bottom: 50, left: 60, right: 60 },
  },
  typography: {
    name: { family: 'Georgia, "Times New Roman", serif', size: 20, weight: 700, color: '#000', lineHeight: 1.3 },
    heading: { family: 'Georgia, "Times New Roman", serif', size: 13, weight: 600, color: '#000', lineHeight: 1.4 },
    sectionTitle: { family: 'Georgia, "Times New Roman", serif', size: 11, weight: 700, color: '#2c3e50', lineHeight: 1.4 },
    body: { family: 'Georgia, "Times New Roman", serif', size: 10, weight: 400, color: '#222', lineHeight: 1.6 },
    bullet: { family: 'Georgia, "Times New Roman", serif', size: 10, weight: 400, color: '#333', lineHeight: 1.5 },
  },
  colors: {
    primary: '#000',
    secondary: '#2c3e50',
    accent: '#2980b9',
    text: '#222',
    muted: '#555',
    background: '#fff',
    divider: '#ccc',
  },
  constraints: {
    maxPages: 2,
    maxExperienceBullets: 8,
    maxProjects: 4,
    maxSkillsPerRow: 5,
    bulletMaxLines: 3,
  },
};

export const MINIMAL_CLEAN: TemplateDefinition = {
  id: 'minimal-clean',
  name: 'Minimal Clean',
  description: 'Sleek minimal layout with generous whitespace and subtle dividers.',
  category: 'MINIMAL',
  page: {
    width: 816,
    height: 1056,
    margins: { top: 45, bottom: 45, left: 55, right: 55 },
  },
  typography: {
    name: { family: 'Inter, -apple-system, sans-serif', size: 24, weight: 300, color: '#111', lineHeight: 1.2 },
    heading: { family: 'Inter, -apple-system, sans-serif', size: 13, weight: 500, color: '#111', lineHeight: 1.4 },
    sectionTitle: { family: 'Inter, -apple-system, sans-serif', size: 11, weight: 600, color: '#555', lineHeight: 1.4 },
    body: { family: 'Inter, -apple-system, sans-serif', size: 10, weight: 400, color: '#333', lineHeight: 1.5 },
    bullet: { family: 'Inter, -apple-system, sans-serif', size: 10, weight: 400, color: '#444', lineHeight: 1.4 },
  },
  colors: {
    primary: '#111',
    secondary: '#333',
    accent: '#888',
    text: '#333',
    muted: '#888',
    background: '#fff',
    divider: '#eee',
  },
  constraints: {
    maxPages: 1,
    maxExperienceBullets: 5,
    maxProjects: 2,
    maxSkillsPerRow: 3,
    bulletMaxLines: 2,
  },
};

export const TEMPLATES: Record<string, TemplateDefinition> = {
  'modern-professional': MODERN_PROFESSIONAL,
  'classic-academic': CLASSIC_ACADEMIC,
  'minimal-clean': MINIMAL_CLEAN,
};
