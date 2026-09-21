import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthContext } from "./authContextObject.js";
import {
  getMeRequest,
  loginRequest,
  logoutRequest,
  registerRequest,
} from "../api/authApi.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // "loading" covers the initial session check on page load - until it
  // resolves, we don't know yet whether the person is logged in.
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await getMeRequest();
      setUser(res.data.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check for an existing session (cookie) once, on first load
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials) => {
    const res = await loginRequest(credentials);
    setUser(res.data.data);
    return res.data.data;
  };

  const register = async (details) => {
    const res = await registerRequest(details);
    setUser(res.data.data);
    return res.data.data;
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch (error) {
      // Even if the network call fails, clear local state so the UI
      // doesn't get stuck thinking the person is still logged in.
      toast.error(getErrorMessage(error, "Logout request failed, but you've been signed out locally."));
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
