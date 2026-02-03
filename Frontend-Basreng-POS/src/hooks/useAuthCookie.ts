import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useHistory } from "react-router-dom";

const COOKIE_EXPIRATION_HOURS = 15;
const COOKIE_EXPIRATION_MINUTES = COOKIE_EXPIRATION_HOURS * 60;

export const useAuth = () => {
  const [token, setToken] = useState(Cookies.get("token") || null);
  const [role, setRole] = useState(Cookies.get("role") || null);
  const [branchID, setBranchID] = useState(Cookies.get("branch_id") || null);
  const [username, setUsername] = useState(Cookies.get("username") || null);
  const [idUser, setIdUser] = useState(Cookies.get("id_user") || null);
  const history = useHistory();

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

    history.push("/student-list");
  };

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    setToken(null);
    setRole(null);
  }

  useEffect(() => {
    if (!token) {
      history.replace("/login", { isTokenExpired: true });
    }
  }, [token]);

  return { token, role, username, idUser, branchID, login, logout };
};
