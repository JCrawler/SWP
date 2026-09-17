export interface Profile {
  id: string;
  nickname: string;
  created_at?: string;
}

export interface Portfolio {
  id: string;
  owner_id: string;
  title: string;
  html_code: string;
  css_code: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserSession {
  userId: string;
  email: string;
  nickname: string;
}
