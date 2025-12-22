import { useNavigate } from "react-router-dom";

export function useLogout() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("token"); 
    navigate("/login");
  }

  return logout;
}
