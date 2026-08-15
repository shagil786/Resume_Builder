export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  slug: string;
  previewImageUrl?: string;
  category: 'PROFESSIONAL' | 'CREATIVE' | 'MINIMAL' | 'ACADEMIC';
  page: {
    width: number;
    height: number;
    margins: { top: number; bottom: number; left: number; right: number };
  };
  typography: {
    name: FontStyle;
    heading: FontStyle;
    body: FontStyle;
  };
  sections: TemplateSection[];
  constraints: {
    pages: 1 | 2;
    maxExperienceBullets: number;
    maxProjects: number;
  };
  createdAt: Date;
  isActive: boolean;
}

export interface FontStyle {
  family: string;
  size: number;
  weight?: number;
  color?: string;
  lineHeight?: number;
}

export interface TemplateSection {
  id: string;
  type: 'SUMMARY' | 'EXPERIENCE' | 'PROJECT' | 'SKILL' | 'EDUCATION' | 'CERTIFICATION' | 'CUSTOM';
  title: string;
  order: number;
  maxItems?: number;
  maxLength?: number;
}
