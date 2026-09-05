"use client";

import { ChangeEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "../../../../services1/api";

export default function UploadFilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
const folderId = searchParams.get("folder");

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    setFile(selectedFile);
    setMessage("");
    setError("");
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";

    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const formData = new FormData();

formData.append("file", file);

if (folderId) {
  formData.append("folder_id", folderId);
}

      await api.post("/files/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage("File uploaded successfully! ✅");

      setTimeout(() => {
  router.push(
    folderId
      ? `/dashboard/files?folder=${folderId}`
      : "/dashboard/files"
  );
}, 1000);
    } catch (err: any) {
      console.error("Upload error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "File upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard/files")}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg transition hover:bg-slate-200"
            >
              ←
            </button>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Upload File
              </h1>

              <p className="text-xs text-slate-400">
                Add a new file to your cloud storage
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Dashboard
          </button>

        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-3xl px-5 py-10 sm:px-8">

        {/* Main Card */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl sm:p-10">

          {/* Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-4xl shadow-lg">
            ☁️
          </div>

          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Upload your file
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Select a file from your computer and securely upload it.
            </p>
          </div>

          {/* File Drop Area */}
          <label
            htmlFor="file-upload"
            className="group block cursor-pointer rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50 sm:p-12"
          >

            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm transition group-hover:scale-105">
              📤
            </div>

            <h3 className="mt-5 font-bold text-slate-800">
              Click to select a file
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Choose any file from your computer
            </p>

            <p className="mt-4 text-xs font-medium text-indigo-500">
              Your file will be securely stored in CloudDrive
            </p>

          </label>

          {/* Selected File */}
          {file && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-2xl">
                  📄
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-800">
                    {file.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {formatSize(file.size)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50"
                >
                  Remove
                </button>

              </div>

            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          {/* Success */}
          {message && (
            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-600">
              {message}
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="mt-7 w-full rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-6 py-4 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "⬆️ Upload File"}
          </button>

          {/* Security Info */}
          <div className="mt-7 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
            <span>🔒</span>
            <span>
              Your file is protected with secure authentication.
            </span>
          </div>

        </div>

        {/* Back */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/dashboard/files")}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            ← Back to My Files
          </button>
        </div>

      </section>

    </main>
  );
}