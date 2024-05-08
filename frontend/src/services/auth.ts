import * as jose from "jose";
import { ResFetchToken } from "#/types/ResponseType";
import { BACKEND_URL } from "./constants";

const fetchToken = async (userId?: string): Promise<ResFetchToken> => {
  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  // Create URLSearchParams object
  const params = new URLSearchParams();
  if (userId) {
    params.append("uid", userId);
  }

  // Append params to the URL
  const response = await fetch(`${BACKEND_URL}/api/auth?${params.toString()}`, {
    headers,
  });

  if (response.status !== 200) {
    throw new Error("Get token failed.");
  }
  const data: ResFetchToken = await response.json();
  return data;
};

export const validateToken = (token: string): boolean => {
  try {
    const claims = jose.decodeJwt(token);
    return !(claims.sid === undefined || claims.sid === "");
  } catch (error) {
    return false;
  }
};

const getToken = async (userId?: string): Promise<string> => {
  const token = localStorage.getItem("token") ?? "";
  if (validateToken(token)) {
    return token;
  }

  const data = await fetchToken(userId);
  if (data.token === undefined || data.token === "") {
    throw new Error("Get token failed.");
  }
  const newToken = data.token;
  if (validateToken(newToken)) {
    localStorage.setItem("token", newToken);
    return newToken;
  }
  throw new Error("Token validation failed.");
};

export { getToken, fetchToken };
