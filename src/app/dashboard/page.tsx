"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* ================= SIDEBAR ================= */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-200 bg-white lg:block">

        <div className="flex h-full flex-col">

          {/* Logo */}
          <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-2xl shadow-lg">
              ☁️
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">
                CloudDrive
              </h1>

              <p className="text-xs text-slate-400">
                Secure Storage
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 py-6">

            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Workspace
            </p>

            <button
              onClick={() => router.push("/dashboard")}
              className="mb-2 flex w-full items-center gap-3 rounded-xl bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700"
            >
              <span className="text-lg">⌂</span>
              Dashboard
            </button>

            <button
              onClick={() => router.push("/dashboard/files")}
              className="mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
            >
              <span className="text-lg">📁</span>
              My Files
            </button>

            <button
              onClick={() => router.push("/dashboard/folders")}
              className="mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
            >
              <span className="text-lg">📂</span>
              Folders
            </button>

            <button
              onClick={() => router.push("/dashboard/shared")}
              className="mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
            >
              <span className="text-lg">🔗</span>
              Shared Files
            </button>

            <button
              onClick={() => router.push("/dashboard/trash")}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
            >
              <span className="text-lg">🗑️</span>
              Trash
            </button>

          </div>

          {/* Storage */}
          <div className="mx-4 mb-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-4 text-white shadow-lg">

            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold">
                Storage
              </span>

              <span className="text-xs text-indigo-100">
                0%
              </span>
            </div>

            <div className="mb-2 h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-[5%] rounded-full bg-white" />
            </div>

            <p className="text-xs text-indigo-100">
              Your cloud storage
            </p>

          </div>

          {/* User */}
          <div className="border-t border-slate-100 p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {user?.name || "User"}
                </p>

                <p className="truncate text-xs text-slate-400">
                  {user?.email || "Account"}
                </p>
              </div>

            </div>

          </div>

        </div>

      </aside>

      {/* ================= MAIN ================= */}
      <div className="lg:ml-64">

        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">

          <div className="flex items-center justify-between px-5 py-4 sm:px-8">

            <div>
              <p className="text-xs font-medium text-slate-400">
                Workspace
              </p>

              <h1 className="text-xl font-bold text-slate-900">
                Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-3">

              <button
                onClick={() => router.push("/dashboard/files/upload")}
                className="hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg sm:block"
              >
                + Upload File
              </button>

              <button
                onClick={handleLogout}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-50"
              >
                Logout
              </button>

            </div>

          </div>

        </header>

        {/* Content */}
        <section className="px-5 py-7 sm:px-8">

          {/* Welcome Banner */}
          <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-7 text-white shadow-xl sm:p-9">

            <div className="relative z-10">

              <p className="mb-2 text-sm font-medium text-indigo-100">
                Welcome back 👋
              </p>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {user?.name || "Cloud Storage User"}
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">
                Manage, organize and securely share your files
                from one simple workspace.
              </p>

              <button
                onClick={() => router.push("/dashboard/files")}
                className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-600 shadow-md transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Open My Files →
              </button>

            </div>

            {/* Decorative circles */}
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-28 right-20 h-72 w-72 rounded-full bg-white/10" />

          </div>

          {/* Statistics */}
          <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            {/* Files */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-400">
                    My Files
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    —
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
                  📁
                </div>

              </div>

              <button
                onClick={() => router.push("/dashboard/files")}
                className="mt-4 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View files →
              </button>

            </div>

            {/* Folders */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-400">
                    Folders
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    —
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-2xl">
                  📂
                </div>

              </div>

              <button
                onClick={() => router.push("/dashboard/folders")}
                className="mt-4 text-xs font-semibold text-purple-600 hover:text-purple-800"
              >
                Manage folders →
              </button>

            </div>

            {/* Shared */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-400">
                    Shared
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    —
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 text-2xl">
                  🔗
                </div>

              </div>

              <button
                onClick={() => router.push("/dashboard/shared")}
                className="mt-4 text-xs font-semibold text-pink-600 hover:text-pink-800"
              >
                View shared →
              </button>

            </div>

            {/* Trash */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-400">
                    Trash
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    —
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-2xl">
                  🗑️
                </div>

              </div>

              <button
                onClick={() => router.push("/dashboard/trash")}
                className="mt-4 text-xs font-semibold text-red-500 hover:text-red-700"
              >
                Open trash →
              </button>

            </div>

          </div>

          {/* Quick Actions */}
          <div className="mb-8">

            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900">
                Quick Actions
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Get things done faster
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              <button
                onClick={() => router.push("/dashboard/files/upload")}
                className="group rounded-2xl border border-slate-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
              >

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl transition group-hover:scale-110">
                  ⬆️
                </div>

                <h3 className="font-bold text-slate-900">
                  Upload File
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Upload documents, images and other files.
                </p>

                <p className="mt-4 text-sm font-semibold text-indigo-600">
                  Upload now →
                </p>

              </button>

              <button
                onClick={() => router.push("/dashboard/folders")}
                className="group rounded-2xl border border-slate-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl"
              >

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-2xl transition group-hover:scale-110">
                  📂
                </div>

                <h3 className="font-bold text-slate-900">
                  Create Folder
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Organize your files into folders.
                </p>

                <p className="mt-4 text-sm font-semibold text-purple-600">
                  Create folder →
                </p>

              </button>

              <button
                onClick={() => router.push("/dashboard/shared")}
                className="group rounded-2xl border border-slate-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-pink-200 hover:shadow-xl"
              >

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 text-2xl transition group-hover:scale-110">
                  🔗
                </div>

                <h3 className="font-bold text-slate-900">
                  Shared Files
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Access files shared with you.
                </p>

                <p className="mt-4 text-sm font-semibold text-pink-600">
                  View shared →
                </p>

              </button>

            </div>

          </div>

          {/* Account Information */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                👤
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Account Information
                </h2>

                <p className="text-xs text-slate-400">
                  Your profile details
                </p>
              </div>

            </div>

            <div className="grid gap-5 sm:grid-cols-2">

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Name
                </p>

                <p className="mt-2 font-semibold text-slate-800">
                  {user?.name || "Cloud Storage User"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Email
                </p>

                <p className="mt-2 font-semibold text-slate-800">
                  {user?.email || "Logged in user"}
                </p>
              </div>

            </div>

          </div>

          {/* Footer */}
          <div className="py-8 text-center text-xs text-slate-400">
            CloudDrive • Secure cloud storage
          </div>

        </section>

      </div>

    </main>
  );
}