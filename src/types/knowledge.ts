export interface ProjectKnowledge {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  techStack: string[];
  metrics: Record<string, string>;
  specs: { label: string; value: string }[];
  challenges: { problem: string; solution: string }[];
}

export interface EducationKnowledge {
  institution: string;
  degree: string;
  specialization: string;
  period: string;
  location: string;
  details: string;
  highlights: string[];
}

export interface CertificationKnowledge {
  title: string;
  issuer: string;
  date: string;
  category: string;
  skills: string[];
  verificationUrl?: string;
  authority?: string;
}

export interface ExperienceKnowledge {
  title: string;
  company: string;
  period: string;
  location: string;
  description: string;
  highlights: string[];
}

export interface SkillItemKnowledge {
  name: string;
  proficiency: number;
}

export interface SkillCategoryKnowledge {
  id: string;
  name: string;
  skills: SkillItemKnowledge[];
}

export interface JourneyStageKnowledge {
  phase: string;
  title: string;
  note: string;
}

export interface PortfolioKnowledgeBase {
  about: {
    name: string;
    role: string;
    location: string;
    email: string;
    bio: string;
    specialties: string[];
    summaryText: string;
  };
  projects: ProjectKnowledge[];
  education: EducationKnowledge[];
  certifications: CertificationKnowledge[];
  skills: SkillCategoryKnowledge[];
  journey: JourneyStageKnowledge[];
  downloadableAssets: { id: string; name: string; type: string; size: string; description: string }[];
  achievements: { category: string; title: string; desc: string }[];
  techStackSummary: { name: string; rating: string }[];
}
