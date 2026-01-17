export interface UserInfo {
  id: string;
  avatarUrl?: string | null;
  email: string;
  provider: string;
  accessToken: string;
  refreshToken?: string;
}
