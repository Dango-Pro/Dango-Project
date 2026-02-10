export interface User {
  id: number;
  username: string;
  roles: string[];
  dailyLimit: number;
  reviewLimit: number;
  timezone: string;
  nickname?: string;
  name?: string;
  email?: string;
  phone?: string;
  birthdate?: string;
  gender?: string;
}
