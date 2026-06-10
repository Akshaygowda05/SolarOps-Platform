import { useSetRecoilState, useRecoilValue } from "recoil";
import { authState } from "../store/authState";
import { useEffect } from "react";

export const useAuthInit = () => {
  const setAuth = useSetRecoilState(authState);
  const auth = useRecoilValue(authState); 

  useEffect(() => {
    const stored = localStorage.getItem("auth");

    if (stored) {
      const { token, name, role, siteName } = JSON.parse(stored);

      setAuth({
        token,
        name,
        role,
        siteName,
        initialized: true,
      });
    } else {
      setAuth((prev) => ({ ...prev, initialized: true }));
    }
  }, [setAuth]);

  return auth; 
};