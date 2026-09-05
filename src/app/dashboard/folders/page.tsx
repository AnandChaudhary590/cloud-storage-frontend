"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../services1/api";

type Folder = {
  id: string;
  name: string;
  parent_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

export default function FoldersPage() {
  const router = useRouter();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadFolders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await api.get("/folders/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFolders(response.data?.folders || response.data?.data || []);
    } catch (err: any) {
      console.error("Load folders error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load folders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFolders();
  }, []);

  const handleCreateFolder = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!folderName.trim()) {
      setError("Please enter a folder name.");
      return;
    }

    try {
      setCreating(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      await api.post(
        "/folders",
        {
          name: folderName.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFolderName("");
      setMessage("Folder created successfully! ✅");

      await loadFolders();

      setTimeout(() => {
        setMessage("");
      }, 2500);
    } catch (err: any) {
      console.error("Create folder error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to create folder."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleRename = async (folder: Folder) => {
    const newName = window.prompt(
      "Enter new folder name:",
      folder.name
    );

    if (!newName || !newName.trim()) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      await api.patch(
        `/folders/${folder.id}/rename`,
        {
          name: newName.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Folder renamed successfully! ✅");

      await loadFolders();

      setTimeout(() => {
        setMessage("");
      }, 2500);
    } catch (err: any) {
      console.error("Rename folder error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to rename folder."
      );
    }
  };

  const handleDelete = async (folder: Folder) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${folder.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      await api.delete(`/folders/${folder.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage("Folder deleted successfully! ✅");

      await loadFolders();

      setTimeout(() => {
        setMessage("");
      }, 2500);
    } catch (err: any) {
      console.error("Delete folder error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete folder."
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg transition hover:bg-slate-200"
            >
              ←
            </button>

            <div>
              <p className="text-xs font-medium text-slate-400">
                Workspace
              </p>

              <h1 className="text-xl font-bold text-slate-900">
                Folders
              </h1>
            </div>
          </div>

          <button
            onClick={() =>
              router.push("/dashboard/files/upload")
            }
            className="hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg sm:block"
          >
            + Upload File
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">

        {/* HERO */}
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-7 text-white shadow-xl sm:p-9">
          <div className="relative z-10 max-w-2xl">
            <p className="mb-2 text-sm font-medium text-indigo-100">
              File Organization
            </p>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Organize your files
            </h2>

            <p className="mt-3 text-sm leading-6 text-indigo-100 sm:text-base">
              Create folders to keep your documents, photos and
              other files organized in your cloud storage.
            </p>
          </div>

          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-28 right-20 h-72 w-72 rounded-full bg-white/10" />
        </div>

        {/* CREATE FOLDER */}
        <div className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
              📂
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Create New Folder
              </h2>

              <p className="text-sm text-slate-400">
                Add a new folder to your workspace
              </p>
            </div>
          </div>

          <form
            onSubmit={handleCreateFolder}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />

            <button
              type="submit"
              disabled={creating}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? "Creating..." : "+ Create Folder"}
            </button>
          </form>
        </div>

        {/* MESSAGE */}
        {message && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* FOLDER HEADER */}
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              My Folders
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {folders.length} folder
              {folders.length !== 1 ? "s" : ""}
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard/files")}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View Files →
          </button>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-40 animate-pulse rounded-2xl bg-white shadow-sm"
              />
            ))}
          </div>
        ) : folders.length === 0 ? (
          /* EMPTY STATE */
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-4xl">
              📂
            </div>

            <h3 className="mt-6 text-xl font-bold text-slate-900">
              No folders yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              Create your first folder to organize your
              cloud files.
            </p>

            <button
              onClick={() =>
                document
                  .querySelector<HTMLInputElement>(
                    'input[placeholder="Enter folder name..."]'
                  )
                  ?.focus()
              }
              className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-indigo-700"
            >
              Create Your First Folder
            </button>
          </div>
        ) : (
          /* FOLDER GRID */
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-3xl transition group-hover:scale-105">
                    📁
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => handleRename(folder)}
                      title="Rename folder"
                      className="rounded-lg px-2.5 py-2 text-sm text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() => handleDelete(folder)}
                      title="Delete folder"
                      className="rounded-lg px-2.5 py-2 text-sm text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="mt-5">
                  <h3
                    className="truncate text-base font-bold text-slate-800"
                    title={folder.name}
                  >
                    {folder.name}
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Folder
                  </p>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <button
                    onClick={() =>
                      router.push(
                        `/dashboard/files?folder=${folder.id}`
                      )
                    }
                    className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
                  >
                    Open Folder →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FOOTER */}
        <div className="py-10 text-center text-xs text-slate-400">
          CloudDrive • Secure cloud storage
        </div>
      </section>
    </main>
  );
}