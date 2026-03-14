import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
    password: string;
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

function decodeToken(t: string | null): User | null {
  if (!t) return null;
  try {
    const payload = JSON.parse(atob(t.split(".")[1]));
    return {
      userid: parseInt(payload.sub),
      username: payload.username,
      role: payload.role,
      clientid: payload.clientid,
      employeeid: payload.employeeid,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<User | null>(() => decodeToken(localStorage.getItem("token")));

  useEffect(() => {
    const decoded = decodeToken(token);
    if (token && !decoded) {
      setToken(null);
      localStorage.removeItem("token");
    }
    setUser(decoded);
  }, [token]);

  const login = async (username: string, password: string) => {
    const res = await post<{ token: string; user: User }>(
      "/api/auth/login",
      { username, password }
    );
    localStorage.setItem("token", res.token);
    setToken(res.token);
  };

  const register = async (data: {
    username: string;
    password: string;
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
    setToken(res.token);
  };

  const logout = () => {
    localStorage.removeItem("token");
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
