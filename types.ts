export enum AgentState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  REVIEW_PLAN = 'REVIEW_PLAN',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface BrandAnalysis {
  brandName: string;
  personality: string;
  colorPalette: string[];
  targetAudience: string;
  designStyle: string;
}

export enum AssetType {
  LOGO = 'LOGO',
  SOCIAL_POST = 'SOCIAL_POST',
  STORYBOARD_FRAME = 'STORYBOARD_FRAME',
  COPYWRITING = 'COPYWRITING'
}

export interface PlannedAsset {
  id: string;
  type: AssetType;
  description: string;
  rationale: string;
  imagePrompt?: string; // For image generation
  copyPrompt?: string; // For text generation
  aspectRatio?: string; // "1:1" | "16:9" etc
}

export interface GeneratedAsset extends PlannedAsset {
  status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  imageUrl?: string;
  textContent?: string;
  error?: string;
}

export interface CreativePlan {
  analysis: BrandAnalysis;
  assets: PlannedAsset[];
}

export interface LogEntry {
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}