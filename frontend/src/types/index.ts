export interface User {
  id: number;
  username: string;
  email: string;
  score: number;
  earned_badges: string[];
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export interface MediaItem {
  id: number;
  user_id: number;
  file_url: string;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  species_ai_prediction: string | null;
  health_status_ai_prediction: string | null;
  ai_confidence_score: number | null;
  ai_processing_status: 'pending' | 'completed' | 'failed';
  validated_species: string | null;
  validated_health_status: string | null;
  is_validated_by_community: boolean;
  created_at: string;
  updated_at: string;
}

export interface MapDataPoint {
    id: number;
    latitude: number;
    longitude: number;
    species_prediction: string | null;
    health_prediction: string | null;
    validated_species: string | null;
    validated_health: string | null;
    file_url: string;
}