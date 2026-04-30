import { createContext, useContext } from "react";

export interface BranchData {
  branch_id: string;
  branch_name?: string;
  branch_address?: string;
}

interface AuthContextType {
  token: string | null;
  role: string | null;
  username: string | null;
  idUser: string | null;
  branchID: string | null;
  branchData: BranchData | null;
  isAuthReady: boolean;
  login: (jwt: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus dipakai di dalam AuthProvider");
  }
  return context;
};

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useHistory } from "react-router-dom";
import { getBranchById } from "../hooks/restAPIBranch";

const COOKIE_EXPIRATION_HOURS = 15;
const COOKIE_EXPIRATION_MINUTES = COOKIE_EXPIRATION_HOURS * 60;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const history = useHistory();
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [token, setToken] = useState<string | null>(
    Cookies.get("token") || null,
  );
  const [role, setRole] = useState<string | null>(Cookies.get("role") || null);
  const [username, setUsername] = useState<string | null>(
    Cookies.get("username") || null,
  );
  const [idUser, setIdUser] = useState<string | null>(
    Cookies.get("id_user") || null,
  );
  const [branchID, setBranchID] = useState<string | null>(
    Cookies.get("branch_id") || null,
  );
  const [branchData, setBranchData] = useState<BranchData | null>(
    Cookies.get("branch_data") ? JSON.parse(Cookies.get("branch_data")!) : null,
  );

  const fetchBranchData = async (id: string) => {
    const data = await getBranchById(id);
    if (!data) return;

    Cookies.set("branch_data", JSON.stringify(data), {
      expires: COOKIE_EXPIRATION_MINUTES / (24 * 60),
    });

    setBranchData(data);
  };

  const login = (jwtToken: string) => {
    const payload = JSON.parse(atob(jwtToken.split(".")[1]));

    Cookies.set("token", jwtToken);
    Cookies.set("role", payload.data.role);
    Cookies.set("username", payload.data.username); // ✅ fix bug
    Cookies.set("id_user", payload.data.id);
    Cookies.set("branch_id", payload.data.branch_id);

    setToken(jwtToken);
    setRole(payload.data.role);
    setUsername(payload.data.username);
    setIdUser(payload.data.id);
    setBranchID(payload.data.branch_id);

    if (payload.data.branch_id) {
      fetchBranchData(payload.data.branch_id);
    }
  };

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("username");
    Cookies.remove("id_user");
    Cookies.remove("branch_id");
    Cookies.remove("branch_data");

    setToken(null);
    setRole(null);
    setUsername(null);
    setIdUser(null);
    setBranchID(null);
    setBranchData(null);

    history.replace("/login");
  };

  useEffect(() => {
    if (branchID && !branchData) {
      fetchBranchData(branchID);
    }
  }, [branchID]);

  useEffect(() => {
    const initAuth = async () => {
      // kalau tidak ada login sama sekali
      if (!token) {
        setIsAuthReady(true);
        return;
      }

      // kalau ada branch tapi belum ada data
      if (branchID && !branchData) {
        await fetchBranchData(branchID);
      }

      setIsAuthReady(true);
    };

    initAuth();
  }, [token, branchID]);

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        username,
        idUser,
        branchID,
        branchData,
        isAuthReady,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
