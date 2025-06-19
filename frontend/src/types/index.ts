export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  score: number; // Added score
  badges: string[]; // Renamed from earned_badges for consistency
  created_at: string;
  updated_at: string;
}

export interface MediaItem {
  id: number;
  user_id: number;
  file_url: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  species_ai_prediction: string | null;
  health_status_ai_prediction: string | null;
  ai_confidence_score: number | null;
  ai_model_version: string | null;
  ai_processing_status: 'pending' | 'completed' | 'failed' | 'failed_queue';
  validated_species: string | null;
  validated_health: string | null; // Corrected from validated_health_status
  community_votes_up: number;
  community_votes_down: number;
  is_community_validated: boolean; // Added this field
  created_at: string;
  updated_at: string;
  owner: User; 
}

export interface MapDataPoint {
  id: number;
  latitude: number;
  longitude: number;
  file_url: string;
  species_prediction: string | null;
  health_prediction: string | null;
  validated_species: string | null;
  validated_health: string | null;
}