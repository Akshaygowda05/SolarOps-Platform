import { useSetRecoilState, useRecoilValue } from "recoil";
import { authState, selectedApplicationState } from "../store/authState";
import { useEffect } from "react";

export const useAuthInit = () => {
  const setAuth = useSetRecoilState(authState);
  const auth = useRecoilValue(authState); 

  const setSelectedApplication =
  useSetRecoilState(selectedApplicationState);


  useEffect(() => {
    const stored = localStorage.getItem("auth");
    const applicationId = localStorage.getItem("selectedApplicationId");

    if (applicationId) {
      setSelectedApplication(applicationId);
    }

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
  }, [setAuth, setSelectedApplication]);

  return auth; 
};