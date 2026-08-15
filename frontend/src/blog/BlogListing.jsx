import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listPublishedBlogs, resolveImageUrl } from "./api";

export default function BlogListing() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPublishedBlogs()
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold mb-8">Eva Skin Clinic Blog</h1>

      {loading && <p className="text-neutral-500">Loading posts...</p>}

      {!loading && posts.length === 0 && (
        <p className="text-neutral-500">No blog posts published yet.</p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/insights/${post.slug}`}
            className="block rounded-lg border overflow-hidden hover:shadow-md transition-shadow bg-white"
          >
            {post.featuredImage && (
              <img
                src={resolveImageUrl(post.featuredImage)}
                alt={post.imageAlt || post.title}
                className="w-full h-44 object-cover"
              />
            )}
            <div className="p-4">
              {post.category && (
                <span className="text-xs uppercase tracking-wide text-pink-600 font-medium">
                  {post.category}
                </span>
              )}
              <h2 className="text-lg font-semibold mt-1">{post.title}</h2>
              <p className="text-sm text-neutral-600 mt-2 line-clamp-3">{post.excerpt}</p>
              <p className="text-xs text-neutral-400 mt-3">{post.date}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
