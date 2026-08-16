import type { ResumeContent } from '@resume-builder/domain';

export interface PageConfig {
  width: number;
  height: number;
  margins: { top: number; bottom: number; left: number; right: number };
}

export interface FontStyle {
  family: string;
  size: number;
  weight?: number;
  color?: string;
  lineHeight?: number;
}

export interface Typography {
  name: FontStyle;
  heading: FontStyle;
  sectionTitle: FontStyle;
  body: FontStyle;
  bullet: FontStyle;
}

export interface TemplateColors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  muted: string;
  background: string;
  divider: string;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  category: 'PROFESSIONAL' | 'CREATIVE' | 'MINIMAL' | 'ACADEMIC';
  page: PageConfig;
  typography: Typography;
  colors: TemplateColors;
  constraints: {
    maxPages: 1 | 2;
    maxExperienceBullets: number;
    maxProjects: number;
    maxSkillsPerRow: number;
    bulletMaxLines: number;
  };
}

export interface RenderContext {
  template: TemplateDefinition;
  content: ResumeContent;
}

export interface OverflowResult {
  fits: boolean;
  estimatedPages: number;
  estimatedPixels: number;
  overflowPixels: number;
  overflowSection?: string;
}
