// interfaces.ts
export interface Feature {
  title: string;
  description: string;
  features: string[];
}

export interface UserFlow {
  name: string;
  description: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface SectionProps {
  darkMode: boolean;
}

export interface ToggleFaqProps {
  openFaqIndex: number | null;
  toggleFaq: (index: number) => void;
}

export interface ToggleDarkModeProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export interface HeaderSectionProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  showThemeToggle?: boolean; // Optional prop to show/hide theme toggle
}

export interface CompanyProfile {
  name: string;
  description: string;
  industry: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  logo?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  university: string;
  major: string;
  skills: string[];
  location: string;
  interests: string[];
  experience: string[];
  education: string[];
  resume?: string;
  portfolio?: string;
  avatar?: string;
}