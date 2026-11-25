export type UserProfile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type UpdateProfileInput = {
  full_name: string;
  avatar_url?: string | null;
};
