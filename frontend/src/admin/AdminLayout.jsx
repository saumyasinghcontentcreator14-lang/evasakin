import React from "react";
import { Navigate, Outlet, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { isLoggedIn, logout } from "./api";

export default function AdminLayout() {
  const navigate = useNavigate();

  if (!isLoggedIn()) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/admin" className="font-semibold">
            Eva Skin Clinic — CMS
          </Link>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
