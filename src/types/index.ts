// Core application types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  photoUrl?: string; // New photo field
  gender?: 'male' | 'female' | 'other';
  lookingFor?: 'male' | 'female' | 'both';
  bio?: string;
  skills: string[];
  techStack: string[]; // Backend uses techStack
  interests: string[];
  experience: string;
  experienceLevel?: 'junior' | 'mid' | 'senior'; // Backend uses experienceLevel
  location?: string;
  age?: number;
  githubUsername?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  isAvailable: boolean;
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  id: string;
  userId: string;
  matchedUserId: string;
  compatibilityScore: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Chat {
  id: string;
  participants: string[];
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  name: string;
}

export interface ProfileFormData {
  name: string;
  bio: string;
  skills: string[];
  interests: string[];
  experience: string;
  location: string;
  githubUsername: string;
  linkedinUrl: string;
  portfolioUrl: string;
  isAvailable: boolean;
}

// UI State types
export interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
