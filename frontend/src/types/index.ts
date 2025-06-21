export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  score: number; // Added score
  earned_badges: string[]; // This now matches the backend model
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
  validated_health_status: string | null; // This now matches the backend model
  validation_score: number; // This now matches the backend model
  is_validated_by_community: boolean; // This now matches the backend model
  created_at: string;
  updated_at: string;
  owner: User; 
}

export interface MapDataPoint {
  id: number;
  latitude: number;
  longitude: number;
  file_url: string;
  species_prediction: string | null; // This is a legacy/simplified name for the map
  health_prediction: string | null; // This is a legacy/simplified name for the map
  validated_species: string | null;
  validated_health: string | null; // Corrected from validated_health_status for map component
}