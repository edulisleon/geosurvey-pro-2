
export interface MetaLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  timestamp: number;
}

export interface SurveyQuestion {
  id: number;
  text: string;
  options: string[]; // Array of 5 options
}

export interface SurveyConfig {
  title: string;
  questions: SurveyQuestion[];
}

export interface SurveyResponses {
  citizenName: string;
  comments: string;
  // Map question ID to selected answer string
  dynamicAnswers: Record<number, string>;
}

export interface SurveyRecord {
  id: string;
  userId: string;
  startLocation: MetaLocation;
  endLocation: MetaLocation;
  route: MetaLocation[];
  startTime: number;
  endTime: number;
  durationSeconds: number;
  distanceMeters: number;
  responses: SurveyResponses;
  isSuspicious: boolean;
  suspiciousReason?: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  VOLUNTEER = 'VOLUNTEER',
}

export interface User {
  username: string;
  password: string; 
  role: UserRole;
  fullName: string;
  isFirstLogin: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string; // username
  recipient: string; // username
  text: string;
  timestamp: number;
  read: boolean;
}

export interface VolunteerStatus {
  username: string;
  fullName: string;
  lastLocation: { lat: number, lng: number };
  lastUpdate: number;
  status: 'IDLE' | 'ACTIVE' | 'OFFLINE';
}

export enum AppView {
  LOGIN = 'LOGIN',
  HOME = 'HOME',
  SURVEY = 'SURVEY',
  DASHBOARD = 'DASHBOARD',
  ADMIN_PANEL = 'ADMIN_PANEL',
  USER_GUIDE = 'USER_GUIDE',
}

export const GPS_ACCURACY_THRESHOLD_METERS = 15;
export const MIN_DURATION_SECONDS = 10;
export const MAX_DISTANCE_METERS = 500;
