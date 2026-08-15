import React from "react";
import { Link } from "react-router-dom";
import posts from "@/generated/blogPosts.json";

export default function BlogListing() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold mb-8">Eva Skin Clinic Blog</h1>

      {posts.length === 0 && (
        <p className="text-neutral-500">No blog posts published yet.</p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link
            key={post.slug}
            to={`/insights/${post.slug}`}
            className="block rounded-lg border overflow-hidden hover:shadow-md transition-shadow bg-white"
          >
            {post.featuredImage && (
              <img
                src={post.featuredImage}
                alt={post.alt || post.title}
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
