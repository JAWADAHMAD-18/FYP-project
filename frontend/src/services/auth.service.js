import api from "../api/Api.js";

export const forgotPasswordApi = async (email) => {
  const res = await api.post("/user/auth/forgot-password", { email });
  return res.data;
};

export const resetPasswordApi = async (token, newPassword) => {
  const res = await api.post(
    `/user/auth/reset-password?token=${encodeURIComponent(token)}`,
    { newPassword }
  );
  return res.data;
};
