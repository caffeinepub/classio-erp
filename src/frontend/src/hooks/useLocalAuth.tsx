/**
 * Local username/password authentication system.
 * Replaces Internet Identity for faster, simpler login.
 * Credentials are stored in localStorage for session persistence.
 */
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type LocalUser = {
  username: string;
  role: string; // "superadmin" | "schooladmin" | "teacher" | "hr"
  name: string;
};

// Predefined accounts
const ACCOUNTS: Record<
  string,
  { password: string; role: string; name: string }
> = {
  admin: { password: "admin123", role: "superadmin", name: "Super Admin" },
};

const STORAGE_KEY = "classio_auth_user";

export type LocalAuthContext = {
  user: LocalUser | null;
  isInitializing: boolean;
  isAuthenticated: boolean;
  login: (
    username: string,
    password: string,
  ) => { success: boolean; error?: string };
  logout: () => void;
  registerUser: (
    username: string,
    password: string,
    role: string,
    name: string,
  ) => { success: boolean; error?: string };
};

const LocalAuthReactContext = createContext<LocalAuthContext | undefined>(
  undefined,
);

export function LocalAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Load session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as LocalUser;
        // Block students from being restored into an active session
        if (parsed.role !== "student") {
          setUser(parsed);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const login = useCallback(
    (
      username: string,
      password: string,
    ): { success: boolean; error?: string } => {
      // Check built-in accounts first
      const account = ACCOUNTS[username.toLowerCase()];
      if (account && account.password === password) {
        if (account.role === "student") {
          return { success: false, error: "Student login is not available" };
        }
        const loggedInUser: LocalUser = {
          username: username.toLowerCase(),
          role: account.role,
          name: account.name,
        };
        setUser(loggedInUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
        return { success: true };
      }

      // Check dynamically registered users
      try {
        const registeredRaw = localStorage.getItem("classio_registered_users");
        if (registeredRaw) {
          const registered = JSON.parse(registeredRaw) as Record<
            string,
            { password: string; role: string; name: string }
          >;
          const regAccount = registered[username.toLowerCase()];
          if (regAccount && regAccount.password === password) {
            if (regAccount.role === "student") {
              return {
                success: false,
                error: "Student login is not available",
              };
            }
            const loggedInUser: LocalUser = {
              username: username.toLowerCase(),
              role: regAccount.role,
              name: regAccount.name,
            };
            setUser(loggedInUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
            return { success: true };
          }
        }
      } catch {
        // ignore parse errors
      }

      return { success: false, error: "Invalid username or password" };
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const registerUser = useCallback(
    (
      username: string,
      password: string,
      role: string,
      name: string,
    ): { success: boolean; error?: string } => {
      const key = username.toLowerCase();
      if (ACCOUNTS[key]) {
        return { success: false, error: "Username already exists" };
      }
      try {
        const registeredRaw = localStorage.getItem("classio_registered_users");
        const registered = registeredRaw
          ? (JSON.parse(registeredRaw) as Record<
              string,
              { password: string; role: string; name: string }
            >)
          : {};
        if (registered[key]) {
          return { success: false, error: "Username already exists" };
        }
        registered[key] = { password, role, name };
        localStorage.setItem(
          "classio_registered_users",
          JSON.stringify(registered),
        );
        return { success: true };
      } catch {
        return { success: false, error: "Failed to register user" };
      }
    },
    [],
  );

  return (
    <LocalAuthReactContext.Provider
      value={{
        user,
        isInitializing,
        isAuthenticated: !!user,
        login,
        logout,
        registerUser,
      }}
    >
      {children}
    </LocalAuthReactContext.Provider>
  );
}

export function useLocalAuth(): LocalAuthContext {
  const context = useContext(LocalAuthReactContext);
  if (!context) {
    throw new Error(
      "LocalAuthProvider is not present. Wrap your component tree with it.",
    );
  }
  return context;
}
