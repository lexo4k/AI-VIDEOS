export interface User {
  email: string;
  credits: number;
}

export enum VideoStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface GeneratedVideo {
  id: string;
  uri: string;
  prompt: string;
  createdAt: number;
  aspectRatio: string;
  model: string;
}

export interface VideoGenerationConfig {
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
  image?: {
    data: string; // Base64
    mimeType: string;
  };
}