// src/admin/api.js
// Axios client for the CMS admin panel. Reuses the same backend the rest
// of the app talks to (REACT_APP_BACKEND_URL), scoped under /api/admin.

import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
const API = `${BACKEND_URL}/api`;

const TOKEN_KEY = "eva_cms_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return Boolean(getToken());
}

const client = axios.create({ baseURL: API });

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearToken();
      if (typeof window !== "undefined" && !window.location.pathname.includes("/admin/login")) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(err);
  }
);

export async function login(username, password) {
  const res = await axios.post(`${API}/admin/login`, { username, password });
  setToken(res.data.token);
  return res.data;
}

export function logout() {
  clearToken();
}

export async function listBlogs() {
  const res = await client.get("/admin/blogs");
  return res.data;
}

export async function getBlog(id) {
  const res = await client.get(`/admin/blogs/${id}`);
  return res.data;
}

export async function createBlog(payload) {
  const res = await client.post("/admin/blogs", payload);
  return res.data;
}

export async function updateBlog(id, payload) {
  const res = await client.put(`/admin/blogs/${id}`, payload);
  return res.data;
}

export async function deleteBlog(id) {
  const res = await client.delete(`/admin/blogs/${id}`);
  return res.data;
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await client.post("/admin/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data; // { url }
}

export function resolveImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${BACKEND_URL}${url}`;
}
