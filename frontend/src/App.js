import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminLogin from "@/admin/AdminLogin";
import AdminLayout from "@/admin/AdminLayout";
import AdminDashboard from "@/admin/AdminDashboard";
import BlogForm from "@/admin/BlogForm";

import BlogListing from "@/blog/BlogListing";
import BlogPost from "@/blog/BlogPost";

// NOTE: The existing Eva Skin Clinic website (homepage, service pages, and
// the static /blog/*.html articles) lives entirely as static HTML in
// frontend/public and is served directly -- this React app previously
// rendered nothing (`return null`) and did not touch any of those pages.
//
// This file ONLY adds the CMS admin panel (/admin/*) and a new,
// CMS-powered public blog surface (/insights, /insights/:slug) for posts
// created through the CMS. The path "/insights" was chosen specifically so
// it does not collide with the existing static frontend/public/blog/
// folder -- nothing there was renamed, moved, or modified.
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* CMS admin panel */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="blog/new" element={<BlogForm />} />
          <Route path="blog/edit/:id" element={<BlogForm />} />
        </Route>

        {/* Public, CMS-powered blog (new -- does not touch /blog/*.html) */}
        <Route path="/insights" element={<BlogListing />} />
        <Route path="/insights/:slug" element={<BlogPost />} />

        {/* Everything else continues to be served as static HTML from
            frontend/public (existing behavior, unchanged). */}
        <Route path="*" element={null} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
