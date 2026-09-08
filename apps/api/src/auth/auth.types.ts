export type AuthUser = {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string;
  status: string;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};
