/**
 * Local username/password authentication system.
 * Credentials for dynamically-created accounts are stored in the backend canister.
 * The active session (logged-in user object) is still kept in localStorage for fast
 * UI initialisation, but the source of truth for credentials is the backend.
 */
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createActorWithConfig } from "../config";

export type LocalUser = {
  username: string;
  role: string; // "superadmin" | "schooladmin" | "teacher" | "hr"
  name: string;
};

// Predefined built-in accounts (never stored in the backend)
const ACCOUNTS: Record<
  string,
  { password: string; role: string; name: string }
> = {
  admin: { password: "admin123", role: "superadmin", name: "Super Admin" },
};

const STORAGE_KEY = "classio_auth_user";
const MIGRATION_KEY = "classio_ls_migrated_v1";

export type LocalAuthContext = {
  user: LocalUser | null;
  isInitializing: boolean;
  isAuthenticated: boolean;
  login: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  registerUser: (
    username: string,
    password: string,
    role: string,
    name: string,
  ) => Promise<{ success: boolean; error?: string }>;
};

const LocalAuthReactContext = createContext<LocalAuthContext | undefined>(
  undefined,
);

export function LocalAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  // Keep a lazily-created actor for auth operations (anonymous actor is fine)
  const actorRef = useRef<Awaited<
    ReturnType<typeof createActorWithConfig>
  > | null>(null);

  const getActor = useCallback(async () => {
    if (!actorRef.current) {
      actorRef.current = await createActorWithConfig();
    }
    return actorRef.current;
  }, []);

  // Load session from localStorage on mount and run one-time localStorage migration
  useEffect(() => {
    const init = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as LocalUser;
          if (parsed.role !== "student") {
            setUser(parsed);
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        }

        // One-time migration: move classio_registered_users from localStorage to backend
        const alreadyMigrated = localStorage.getItem(MIGRATION_KEY);
        if (!alreadyMigrated) {
          try {
            const raw = localStorage.getItem("classio_registered_users");
            if (raw) {
              const map = JSON.parse(raw) as Record<
                string,
                { password: string; role: string; name: string }
              >;
              const accounts = Object.entries(map).map(([username, data]) => ({
                username,
                password: data.password,
                role: data.role,
                name: data.name,
              }));
              if (accounts.length > 0) {
                const actor = await getActor();
                await actor.importUserAccounts(accounts);
              }
            }
          } catch {
            // Migration failure is non-fatal; will retry next time until flagged
          }
          localStorage.setItem(MIGRATION_KEY, "1");
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsInitializing(false);
      }
    };
    void init();
  }, [getActor]);

  const login = useCallback(
    async (
      username: string,
      password: string,
    ): Promise<{ success: boolean; error?: string }> => {
      const key = username.toLowerCase();

      // 1. Check built-in accounts first (no backend call needed)
      const account = ACCOUNTS[key];
      if (account && account.password === password) {
        if (account.role === "student") {
          return { success: false, error: "Student login is not available" };
        }
        const loggedInUser: LocalUser = {
          username: key,
          role: account.role,
          name: account.name,
        };
        setUser(loggedInUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
        return { success: true };
      }

      // 2. Validate against backend canister (source of truth for dynamic accounts)
      try {
        const actor = await getActor();
        const result = await actor.validateUserAccount(key, password);
        if (result) {
          if (result.role === "student") {
            return { success: false, error: "Student login is not available" };
          }
          const loggedInUser: LocalUser = {
            username: result.username,
            role: result.role,
            name: result.name,
          };
          setUser(loggedInUser);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
          return { success: true };
        }
      } catch {
        // Backend unreachable – fall through to legacy localStorage check
      }

      // 3. Legacy fallback: check localStorage (for offline/degraded scenarios)
      try {
        const registeredRaw = localStorage.getItem("classio_registered_users");
        if (registeredRaw) {
          const registered = JSON.parse(registeredRaw) as Record<
            string,
            { password: string; role: string; name: string }
          >;
          const regAccount = registered[key];
          if (regAccount && regAccount.password === password) {
            if (regAccount.role === "student") {
              return {
                success: false,
                error: "Student login is not available",
              };
            }
            const loggedInUser: LocalUser = {
              username: key,
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
    [getActor],
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const registerUser = useCallback(
    async (
      username: string,
      password: string,
      role: string,
      name: string,
    ): Promise<{ success: boolean; error?: string }> => {
      const key = username.toLowerCase();
      if (ACCOUNTS[key]) {
        return { success: false, error: "Username already exists" };
      }
      try {
        const actor = await getActor();
        const created = await actor.createUserAccount(
          key,
          password,
          role,
          name,
        );
        if (!created) {
          return { success: false, error: "Username already exists" };
        }
        // Also write to legacy localStorage so offline fallback still works
        try {
          const registeredRaw = localStorage.getItem(
            "classio_registered_users",
          );
          const registered = registeredRaw
            ? (JSON.parse(registeredRaw) as Record<
                string,
                { password: string; role: string; name: string }
              >)
            : {};
          registered[key] = { password, role, name };
          localStorage.setItem(
            "classio_registered_users",
            JSON.stringify(registered),
          );
        } catch {
          // non-fatal
        }
        return { success: true };
      } catch {
        return {
          success: false,
          error: "Failed to register user. Please try again.",
        };
      }
    },
    [getActor],
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
