"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../services1/api";

interface SharedFile {
  id: string;
  permission: string;
  files?: {
    id: string;
    name: string;
    mime_type: string;
    size_bytes: number;
    created_at: string;
  };
}

export default function SharedFilesPage() {
  const router = useRouter();

  const [shares, setShares] = useState<SharedFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSharedFiles();
  }, []);

  const loadSharedFiles = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await api.get(
        "/file-shares/shared-with-me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setShares(response.data?.shares || []);
    } catch (error: any) {
      console.error("Shared files error:", error);

      if (error.response?.status === 401) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFile = async (fileId: string) => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get(
        `/files/${fileId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type:
          response.headers["content-type"] ||
          "application/octet-stream",
      });

      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000);
    } catch (error) {
      console.error("Open shared file error:", error);
      alert("Unable to open file.");
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 Bytes";

    const units = [
      "Bytes",
           "KB",
      "MB",
      "GB",
    ];

    const index = Math.floor(
      Math.log(bytes) / Math.log(1024)
    );

    return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${
      units[index]
    }`;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Shared With Me
          </h1>

          <p className="mt-2 text-slate-500">
            Files shared with your account
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-slate-500">
              Loading shared files...
            </p>
          </div>
        ) : shares.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="mb-4 text-5xl">📂</div>

            <h2 className="text-xl font-bold text-slate-800">
              No shared files
            </h2>

            <p className="mt-2 text-slate-500">
              Files shared with you will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">

                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                      File
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                      Size
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                      Permission
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {shares.map((share) => (
                    <tr
                      key={share.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-xl">
                            📄
                          </div>

                          <div>
                            <p className="font-semibold text-slate-800">
                              {share.files?.name ||
                                "Unnamed File"}
                            </p>

                            <p className="text-xs text-slate-400">
                              Shared file
                            </p>
                          </div>

                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-500">
                        {formatSize(
                          share.files?.size_bytes || 0
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase text-emerald-600">
                          {share.permission}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() =>
                            share.files &&
                            handleOpenFile(
                              share.files.id
                            )
                          }
                          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}