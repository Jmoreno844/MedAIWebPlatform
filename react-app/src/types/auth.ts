export interface User {
  id: string;
  email: string;
  role: "MEDICO" | "ADMIN";
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
