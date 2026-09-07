export type AuthUser = {
  id: string;
  phoneNumber: string;
  status: string;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};
