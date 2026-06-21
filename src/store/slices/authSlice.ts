import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Role } from "@/types";

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  role: Role | null;
  mustChangePassword: boolean;
  etudiantId: string | null;
  numeroInscription: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  userId: null,
  role: null,
  mustChangePassword: false,
  etudiantId: null,
  numeroInscription: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<Omit<AuthState, "isAuthenticated">>) {
      state.isAuthenticated = true;
      state.userId = action.payload.userId;
      state.role = action.payload.role;
      state.mustChangePassword = action.payload.mustChangePassword;
      state.etudiantId = action.payload.etudiantId;
      state.numeroInscription = action.payload.numeroInscription;
    },
    clearAuth(state) {
      Object.assign(state, initialState);
    },
    setMustChangePassword(state, action: PayloadAction<boolean>) {
      state.mustChangePassword = action.payload;
    },
  },
});

export const { setAuth, clearAuth, setMustChangePassword } = authSlice.actions;
export default authSlice.reducer;