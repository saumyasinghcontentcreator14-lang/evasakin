import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import BlogListing from "@/blog/BlogListing";
import BlogPost from "@/blog/BlogPost";

// NOTE: The existing Eva Skin Clinic website (homepage, service pages, and
// the static /blog/*.html articles) lives entirely as static HTML in
// frontend/public and is served directly -- this React app previously
// rendered nothing (`return null`) and did not touch any of those pages.
//
// This file ONLY adds a CMS-powered public blog surface (/insights,
// /insights/:slug) for posts written through the Decap CMS admin panel at
// /admin (a separate static page, not part of this React app). The path
// "/insights" was chosen so it does not collide with the existing static
// frontend/public/blog/ folder -- nothing there was renamed or modified.
function App() {
  return (
    <BrowserRouter>
      <Routes>
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
