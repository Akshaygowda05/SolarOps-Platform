import { atom } from "recoil";

export interface User{
    name: string;
    role: 'ADMIN' | 'USER' | undefined;
    token: string | undefined;
    siteName?: string;
    initialized: boolean;
}

export const authState = atom<User>({
    key: 'authState',
    default: { initialized: false, name: '', role: undefined, siteName: undefined, token: undefined },
});

export const selectedApplicationState = atom<string | null>({
  key: "selectedApplicationState",
  default: localStorage.getItem("selectedApplicationId"),
});