import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  getBlog,
  createBlog,
  updateBlog,
  uploadImage,
  resolveImageUrl,
} from "./api";

const emptyPost = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "",
  author: "Eva Skin Clinic",
  date: new Date().toISOString().slice(0, 10),
  featuredImage: "",
  imageAlt: "",
  seoTitle: "",
  metaDescription: "",
  focusKeyword: "",
  status: "draft",
};

export default function BlogForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [post, setPost] = useState(emptyPost);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditing) return;
    (async () => {
      try {
        const data = await getBlog(id);
        setPost(data);
      } catch (err) {
        setError("Could not load this post.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEditing]);

  const update = (field) => (e) => setPost((p) => ({ ...p, [field]: e.target.value }));

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const { url } = await uploadImage(file);
      setPost((p) => ({ ...p, featuredImage: url }));
    } catch (err) {
      setError("Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (statusOverride) => async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...post, status: statusOverride || post.status };
      if (isEditing) {
        await updateBlog(id, payload);
      } else {
        await createBlog(payload);
      }
      navigate("/admin");
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not save this post.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-neutral-500">Loading...</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold mb-6">
        {isEditing ? "Edit Blog Post" : "New Blog Post"}
      </h1>

      <form className="space-y-8">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={post.title} onChange={update("title")} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (leave blank to auto-generate from title)</Label>
              <Input
                id="slug"
                value={post.slug}
                onChange={update("slug")}
                placeholder="auto-generated-from-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt / Short Description</Label>
              <Textarea id="excerpt" value={post.excerpt} onChange={update("excerpt")} rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Full Content</Label>
              <Textarea id="content" value={post.content} onChange={update("content")} rows={14} />
              <p className="text-xs text-neutral-500">Plain text or HTML — rendered as-is on the blog page.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={post.category} onChange={update("category")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input id="author" value={post.author} onChange={update("author")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Publication Date</Label>
                <Input id="date" type="date" value={post.date} onChange={update("date")} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={post.status}
                  onValueChange={(value) => setPost((p) => ({ ...p, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="font-medium">Featured Image</h2>
            <Input type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} />
            {uploading && <p className="text-sm text-neutral-500">Uploading...</p>}
            {post.featuredImage && (
              <img
                src={resolveImageUrl(post.featuredImage)}
                alt={post.imageAlt || post.title}
                className="mt-2 max-h-48 rounded border"
              />
            )}
            <div className="space-y-2">
              <Label htmlFor="imageAlt">Image Alt Text</Label>
              <Input id="imageAlt" value={post.imageAlt} onChange={update("imageAlt")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="font-medium">SEO</h2>
            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input id="seoTitle" value={post.seoTitle} onChange={update("seoTitle")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={post.metaDescription}
                onChange={update("metaDescription")}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="focusKeyword">Focus Keyword</Label>
              <Input id="focusKeyword" value={post.focusKeyword} onChange={update("focusKeyword")} />
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSubmit("draft")} disabled={saving}>
            Save as Draft
          </Button>
          <Button onClick={handleSubmit("published")} disabled={saving}>
            {saving ? "Saving..." : "Publish"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate("/admin")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
