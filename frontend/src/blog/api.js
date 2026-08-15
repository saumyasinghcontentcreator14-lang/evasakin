// src/blog/api.js
// Read-only client for the public blog pages powered by the CMS.

import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
const API = `${BACKEND_URL}/api`;

export async function listPublishedBlogs() {
  const res = await axios.get(`${API}/blogs`);
  return res.data;
}

export async function getPublishedBlog(slug) {
  const res = await axios.get(`${API}/blogs/${slug}`);
  return res.data;
}

export function resolveImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${BACKEND_URL}${url}`;
}
