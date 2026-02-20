import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useHistory } from "react-router-dom";
import { getBranchById } from "./restAPIBranch";

const COOKIE_EXPIRATION_HOURS = 15;
const COOKIE_EXPIRATION_MINUTES = COOKIE_EXPIRATION_HOURS * 60;

interface BranchData {
  branch_id: string;
  branch_name?: string;
  branch_address?: string;
}

export enum Roles {
  admin = "admin",
  owner = "owner",
  manager = "manager",
  kasir = "kasir"
}

const getStoredBranchData = (): BranchData | null => {
  const stored = Cookies.get("branch_data");
  if (!stored) return null;

  try {
    return JSON.parse(stored) as BranchData;
  } catch (error) {
    console.error("Gagal parsing branch_data cookie:", error);
    return null;
  }
};

export const useAuth = () => {
  const [token, setToken] = useState(Cookies.get("token") || null);
  const [role, setRole] = useState(Cookies.get("role") || Roles);
  const [branchID, setBranchID] = useState(Cookies.get("branch_id") || null);
  const [branchData, setBranchData] = useState<BranchData | null>(getStoredBranchData());
  const [username, setUsername] = useState(Cookies.get("username") || null);
  const [idUser, setIdUser] = useState(Cookies.get("id_user") || null);
  const history = useHistory();

  const fetchAndStoreBranchData = async (id: string) => {
    try {
      const data = await getBranchById(id);
      if (!data) return;

      Cookies.set("branch_data", JSON.stringify(data), {
        expires: COOKIE_EXPIRATION_MINUTES / (24 * 60),
      });
      setBranchData(data);
    } catch (error) {
      console.error("Gagal menyimpan data cabang:", error);
    }
  };

  const login = (jwtToken: string) => {
    Cookies.set("token", jwtToken, { expires: COOKIE_EXPIRATION_MINUTES / (24 * 60) });
    const payload = JSON.parse(atob(jwtToken.split(".")[1]));
    Cookies.set("role", payload.data.role, { expires: COOKIE_EXPIRATION_MINUTES / (24 * 60) });
    Cookies.set("username", payload.data.role, { expires: COOKIE_EXPIRATION_MINUTES / (24 * 60) });
    Cookies.set("id_user", payload.data.id, { expires: COOKIE_EXPIRATION_MINUTES / (24 * 60) });
    Cookies.set("branch_id", payload.data.branch_id, { expires: COOKIE_EXPIRATION_MINUTES / (24 * 60) });

    setToken(jwtToken);
    setRole(payload.data.role);
    setUsername(payload.data.username)
    setIdUser(payload.data.id)
    setBranchID(payload.data.branch_id)

    if (payload.data.branch_id) {
      fetchAndStoreBranchData(String(payload.data.branch_id));
    }

    history.push("/student-list");
  };

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("branch_id");
    Cookies.remove("branch_data");
    Cookies.remove("username");
    Cookies.remove("id_user");
    setToken(null);
    setRole( typeof Roles);
    setBranchID(null);
    setBranchData(null);
    setUsername(null);
    setIdUser(null);
  }

  useEffect(() => {
    if (!token) {
      history.replace("/login", { isTokenExpired: true });
    }
  }, [token]);

  useEffect(() => {
    if (branchID && !branchData) {
      fetchAndStoreBranchData(String(branchID));
    }
  }, [branchData, branchID]);

  return { token, role, username, idUser, branchID, branchData, login, logout };
};
