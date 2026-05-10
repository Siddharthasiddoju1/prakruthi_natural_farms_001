import { createContext, useContext, useMemo, useState } from "react";
import { LoginResponse } from "../lib/api";

interface AuthState {
  token: string | null;
  customer: LoginResponse["customer"] | null;
  login: (data: LoginResponse) => void;
  logout: () => void;
}

const TOKEN_KEY = "prakruthi_access_token";
const CUSTOMER_KEY = "prakruthi_customer";

const AuthContext = createContext<AuthState | undefined>(undefined);

function readStoredCustomer(): LoginResponse["customer"] | null {
  const raw = localStorage.getItem(CUSTOMER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LoginResponse["customer"];
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [customer, setCustomer] = useState<LoginResponse["customer"] | null>(() => readStoredCustomer());

  const value = useMemo<AuthState>(
    () => ({
      token,
      customer,
      login: (data) => {
        setToken(data.accessToken);
        setCustomer(data.customer);
        localStorage.setItem(TOKEN_KEY, data.accessToken);
        localStorage.setItem(CUSTOMER_KEY, JSON.stringify(data.customer));
      },
      logout: () => {
        setToken(null);
        setCustomer(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(CUSTOMER_KEY);
      }
    }),
    [token, customer]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
