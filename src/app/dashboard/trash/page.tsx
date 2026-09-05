"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../services1/api";

interface FileItem {
  id: string;
  name: string;
  mime_type?: string;
  size_bytes?: number;
  file_size?: number;
  created_at?: string;
  updated_at?: string;
}

export default function TrashPage() {
  const router = useRouter();

  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTrash = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await api.get("/files/my", {
        params: {
          deleted: true,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFiles(response.data?.files || []);
    } catch (err: any) {
      console.error("Trash error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load trash files."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrash();
  }, []);

  const handleRestore = async (id: string) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      await api.patch(
        `/files/${id}/restore`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("File restored successfully.");
      loadTrash();
    } catch (err: any) {
      console.error("Restore error:", err);

      alert(
        err.response?.data?.message ||
          "Failed to restore file."
      );
    }
  };

  const formatSize = (bytes = 0) => {
    if (bytes === 0) return "0 Bytes";

    const units = [
      "Bytes",
      "KB",
      "MB",
      "GB",
      "TB",
    ];

    const index = Math.floor(
      Math.log(bytes) / Math.log(1024)
    );

    return `${(
      bytes / Math.pow(1024, index)
    ).toFixed(2)} ${units[index]}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Trash
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Deleted files are stored here.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-slate-500">
              Loading trash...
            </p>
          </div>
        ) : files.length === 0 ? (
          /* Empty */
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="mb-4 text-5xl">
              🗑️
            </div>

            <h2 className="text-xl font-bold text-slate-800">
              Trash is empty
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Deleted files will appear here.
            </p>
          </div>
        ) : (
          /* Files */
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-6 py-4">
              <p className="text-sm font-semibold text-slate-700">
                {files.length} deleted file
                {files.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
                >
                  {/* File Info */}
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl">
                      📄
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-slate-800">
                        {file.name}
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatSize(
                          file.size_bytes ||
                            file.file_size ||
                            0
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Restore */}
                  <button
                    onClick={() =>
                      handleRestore(file.id)
                    }
                    className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}