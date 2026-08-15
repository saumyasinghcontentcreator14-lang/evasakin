from fastapi import FastAPI, APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import logging
import shutil
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Literal, Optional
import uuid
from datetime import datetime, timezone

from auth import (
    verify_admin_credentials,
    create_access_token,
    get_current_admin,
)


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Uploads directory (for blog featured images)
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

# Create the main app without a prefix
app = FastAPI()

# Serve uploaded images at /uploads/<filename>
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# ─────────────────────────────────────────────────────────────────────────
# CMS / Blog Management
# ─────────────────────────────────────────────────────────────────────────

def slugify(text: str) -> str:
    text = text.strip().lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text.strip("-")


class BlogPost(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    excerpt: str = ""
    content: str = ""
    category: str = ""
    author: str = "Eva Skin Clinic"
    date: str = Field(default_factory=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%d"))
    featuredImage: str = ""
    imageAlt: str = ""
    seoTitle: str = ""
    metaDescription: str = ""
    focusKeyword: str = ""
    status: Literal["draft", "published"] = "draft"
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updatedAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class BlogPostCreate(BaseModel):
    title: str
    slug: Optional[str] = None
    excerpt: str = ""
    content: str = ""
    category: str = ""
    author: str = "Eva Skin Clinic"
    date: Optional[str] = None
    featuredImage: str = ""
    imageAlt: str = ""
    seoTitle: str = ""
    metaDescription: str = ""
    focusKeyword: str = ""
    status: Literal["draft", "published"] = "draft"


class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    author: Optional[str] = None
    date: Optional[str] = None
    featuredImage: Optional[str] = None
    imageAlt: Optional[str] = None
    seoTitle: Optional[str] = None
    metaDescription: Optional[str] = None
    focusKeyword: Optional[str] = None
    status: Optional[Literal["draft", "published"]] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    token: str
    username: str


async def unique_slug(base_slug: str, exclude_id: Optional[str] = None) -> str:
    slug = base_slug or "post"
    counter = 1
    while True:
        query = {"slug": slug}
        if exclude_id:
            query["id"] = {"$ne": exclude_id}
        existing = await db.blogs.find_one(query, {"_id": 0, "id": 1})
        if not existing:
            return slug
        counter += 1
        slug = f"{base_slug}-{counter}"


# ── Auth ─────────────────────────────────────────────────────────────────

@api_router.post("/admin/login", response_model=LoginResponse)
async def admin_login(payload: LoginRequest):
    if not verify_admin_credentials(payload.username, payload.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = create_access_token(payload.username)
    return LoginResponse(token=token, username=payload.username)


@api_router.get("/admin/me")
async def admin_me(admin: str = Depends(get_current_admin)):
    return {"username": admin}


# ── Admin: Blog CRUD (protected) ────────────────────────────────────────

@api_router.get("/admin/blogs", response_model=List[BlogPost])
async def admin_list_blogs(admin: str = Depends(get_current_admin)):
    posts = await db.blogs.find({}, {"_id": 0}).sort("createdAt", -1).to_list(1000)
    return posts


@api_router.get("/admin/blogs/{post_id}", response_model=BlogPost)
async def admin_get_blog(post_id: str, admin: str = Depends(get_current_admin)):
    post = await db.blogs.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return post


@api_router.post("/admin/blogs", response_model=BlogPost)
async def admin_create_blog(payload: BlogPostCreate, admin: str = Depends(get_current_admin)):
    base_slug = slugify(payload.slug or payload.title)
    slug = await unique_slug(base_slug)

    post = BlogPost(**{**payload.model_dump(), "slug": slug})
    if payload.date:
        post.date = payload.date

    doc = post.model_dump()
    await db.blogs.insert_one(doc)
    return post


@api_router.put("/admin/blogs/{post_id}", response_model=BlogPost)
async def admin_update_blog(post_id: str, payload: BlogPostUpdate, admin: str = Depends(get_current_admin)):
    existing = await db.blogs.find_one({"id": post_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Blog post not found")

    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}

    if "slug" in updates or "title" in updates:
        base_slug = slugify(updates.get("slug") or updates.get("title") or existing["slug"])
        updates["slug"] = await unique_slug(base_slug, exclude_id=post_id)

    updates["updatedAt"] = datetime.now(timezone.utc).isoformat()

    await db.blogs.update_one({"id": post_id}, {"$set": updates})
    updated = await db.blogs.find_one({"id": post_id}, {"_id": 0})
    return updated


@api_router.delete("/admin/blogs/{post_id}")
async def admin_delete_blog(post_id: str, admin: str = Depends(get_current_admin)):
    result = await db.blogs.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return {"success": True}


@api_router.post("/admin/upload")
async def admin_upload_image(file: UploadFile = File(...), admin: str = Depends(get_current_admin)):
    allowed_ext = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
    ext = Path(file.filename or "").suffix.lower()
    if ext not in allowed_ext:
        raise HTTPException(status_code=400, detail="Only jpg, jpeg, png, webp, gif images are allowed")

    filename = f"{uuid.uuid4().hex}{ext}"
    dest = UPLOADS_DIR / filename
    with dest.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    return {"url": f"/uploads/{filename}"}


# ── Public: Blog read endpoints (no auth) ───────────────────────────────

@api_router.get("/blogs", response_model=List[BlogPost])
async def public_list_blogs(category: Optional[str] = None):
    query = {"status": "published"}
    if category:
        query["category"] = category
    posts = await db.blogs.find(query, {"_id": 0}).sort("date", -1).to_list(1000)
    return posts


@api_router.get("/blogs/{slug}", response_model=BlogPost)
async def public_get_blog(slug: str):
    post = await db.blogs.find_one({"slug": slug, "status": "published"}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return post


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()