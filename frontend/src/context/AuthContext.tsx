import { createContext, useContext, useState, ReactNode } from "react";
import { post } from "../api/client";

interface User {
  userid: number;
  username: string;
  role: string;
  clientid?: number;
  employeeid?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    branchid: number;
  }) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isAuth: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("token")
  );
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (username: string, password: string) => {
    const res = await post<{ token: string; user: User }>(
      "/api/auth/login",
      { username, password }
    );
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (data: {
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    branchid: number;
  }) => {
    const res = await post<{ token: string; user: User }>(
      "/api/auth/register",
      data
    );
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAdmin: user?.role === "admin",
        isAuth: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
