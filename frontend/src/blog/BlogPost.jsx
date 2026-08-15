import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublishedBlog, resolveImageUrl } from "./api";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setPost(null);
    setNotFound(false);
    getPublishedBlog(slug)
      .then(setPost)
      .catch(() => setNotFound(true));
  }, [slug]);

  useEffect(() => {
    if (!post) return;
    document.title = post.seoTitle || post.title;

    const setMeta = (name, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", post.metaDescription || post.excerpt);
    setMeta("keywords", post.focusKeyword);
  }, [post]);

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold mb-4">Post not found</h1>
        <Link to="/insights" className="text-pink-600 hover:underline">
          ← Back to blog
        </Link>
      </div>
    );
  }

  if (!post) {
    return <div className="max-w-2xl mx-auto px-4 py-24 text-neutral-500">Loading...</div>;
  }

  return (
    <article className="max-w-2xl mx-auto px-4 py-16">
      <Link to="/insights" className="text-sm text-pink-600 hover:underline">
        ← Back to blog
      </Link>

      {post.category && (
        <p className="text-xs uppercase tracking-wide text-pink-600 font-medium mt-6">
          {post.category}
        </p>
      )}
      <h1 className="text-3xl font-semibold mt-2">{post.title}</h1>
      <p className="text-sm text-neutral-400 mt-2">
        {post.author} · {post.date}
      </p>

      {post.featuredImage && (
        <img
          src={resolveImageUrl(post.featuredImage)}
          alt={post.imageAlt || post.title}
          className="w-full rounded-lg mt-6 mb-8"
        />
      )}

      <div
        className="max-w-none leading-relaxed text-neutral-800 [&_p]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_a]:text-pink-600 [&_a]:underline"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
