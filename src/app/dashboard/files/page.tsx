"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "../../../services1/api";

interface FileItem {
  id: string;
  name: string;
  file_name?: string;
  mime_type?: string;
  size_bytes?: number;
  file_size?: number;
  created_at?: string;
  folder_id?: string | null;
}

interface Folder {
  id: string;
  name: string;
  parent_id?: string | null;
}

export default function MyFilesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const folderId = searchParams.get("folder");

  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ===============================
// SEARCH / FILTER / SORT
// ===============================

const [searchQuery, setSearchQuery] = useState("");
const [searching, setSearching] = useState(false);
const [fileType, setFileType] = useState("all");
const [sortBy, setSortBy] = useState("newest");

  const currentFolder = folders.find(
    (folder) => folder.id === folderId
  );

  const loadFolders = async () => {
    try {
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

      setFolders(
        response.data?.folders ||
          response.data?.data ||
          []
      );
    } catch (err: any) {
      console.error("Load folders error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
      }
    }
  };

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      let response;

      if (folderId) {
        response = await api.get(
          `/files/folder/${folderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        response = await api.get("/files/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      setFiles(response.data?.files || []);
    } catch (err: any) {
      console.error("Load files error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load your files."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===============================
// SEARCH FILES & FOLDERS
// ===============================

const handleSearch = async () => {
  const query = searchQuery.trim();

  // Empty search → load normal files
  if (!query) {
    loadFiles();
    return;
  }

  try {
    setSearching(true);
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const response = await api.get(
      `/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setFiles(response.data?.files || []);
  } catch (err: any) {
    console.error("Search error:", err);

    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
      return;
    }

    setError(
      err.response?.data?.message ||
        "Unable to search files."
    );
  } finally {
    setSearching(false);
  }
};

  useEffect(() => {
    loadFolders();
  }, []);

  useEffect(() => {
    loadFiles();
  }, [folderId]);

  const formatSize = (bytes?: number) => {
    if (!bytes) return "0 Bytes";

    const sizes = [
      "Bytes",
      "KB",
      "MB",
      "GB",
    ];

    const i = Math.floor(
      Math.log(bytes) / Math.log(1024)
    );

    return `${(
      bytes / Math.pow(1024, i)
    ).toFixed(2)} ${sizes[i]}`;
  };

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return "📄";

    if (mimeType.startsWith("image/"))
      return "🖼️";

    if (mimeType.includes("pdf"))
      return "📕";

    if (mimeType.includes("word"))
      return "📝";

    if (
      mimeType.includes("sheet") ||
      mimeType.includes("excel")
    )
      return "📊";

    if (mimeType.includes("zip"))
      return "🗜️";

    if (mimeType.startsWith("video/"))
      return "🎬";

    if (mimeType.startsWith("audio/"))
      return "🎵";

    return "📄";
  };

  // ===============================
// FILTER + SORT
// ===============================

const getFilteredAndSortedFiles = () => {
  let result = [...files];

  // ===============================
  // FILE TYPE FILTER
  // ===============================

  if (fileType !== "all") {
    result = result.filter((file) => {
      const mime = file.mime_type || "";
      const name = (
        file.name ||
        file.file_name ||
        ""
      ).toLowerCase();

      switch (fileType) {
        case "image":
          return (
            mime.startsWith("image/") ||
            /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name)
          );

        case "pdf":
          return (
            mime.includes("pdf") ||
            name.endsWith(".pdf")
          );

        case "document":
          return (
            mime.includes("word") ||
            mime.includes("document") ||
            /\.(doc|docx|txt)$/i.test(name)
          );

        case "video":
          return (
            mime.startsWith("video/") ||
            /\.(mp4|webm|mov|avi|mkv)$/i.test(name)
          );

        case "audio":
          return (
            mime.startsWith("audio/") ||
            /\.(mp3|wav|ogg|m4a)$/i.test(name)
          );

        default:
          return true;
      }
    });
  }

  // ===============================
  // SORT
  // ===============================

  result.sort((a, b) => {
    const nameA = (
      a.name ||
      a.file_name ||
      ""
    ).toLowerCase();

    const nameB = (
      b.name ||
      b.file_name ||
      ""
    ).toLowerCase();

    const sizeA =
      a.size_bytes ||
      a.file_size ||
      0;

    const sizeB =
      b.size_bytes ||
      b.file_size ||
      0;

    const dateA = a.created_at
      ? new Date(a.created_at).getTime()
      : 0;

    const dateB = b.created_at
      ? new Date(b.created_at).getTime()
      : 0;

    switch (sortBy) {
      case "oldest":
        return dateA - dateB;

      case "name-asc":
        return nameA.localeCompare(nameB);

      case "name-desc":
        return nameB.localeCompare(nameA);

      case "largest":
        return sizeB - sizeA;

      case "smallest":
        return sizeA - sizeB;

      case "newest":
      default:
        return dateB - dateA;
    }
  });

  return result;
};

const displayedFiles = getFilteredAndSortedFiles();

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to move this file to Trash?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/files/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFiles((current) =>
        current.filter((file) => file.id !== id)
      );
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          "Failed to delete file."
      );
    }
  };

 const handleShare = async (id: string) => {
  const email = window.prompt(
    "Enter recipient email address:"
  );

  if (!email || !email.trim()) return;

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const response = await api.post(
      `/file-shares/${id}/share`,
      {
        email: email.trim().toLowerCase(),
        permission: "view",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data?.email_sent) {
      alert(
        `File shared successfully!\n\nShare email sent to:\n${email.trim()}`
      );
    } else {
      alert(
        response.data?.message ||
          "File share created, but email could not be sent."
      );
    }
  } catch (err: any) {
    console.error("Share error:", err);

    alert(
      err.response?.data?.message ||
        "Failed to share file."
    );
  }
};

const handlePublicShare = async (id: string) => {
  const email = window.prompt(
    "Enter recipient email address:"
  );

  if (!email || !email.trim()) return;

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const response = await api.post(
      `/file-shares/${id}/share`,
      {
        email: email.trim().toLowerCase(),
        permission: "view",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const shareLink =
      response.data?.share?.share_link;

    if (!shareLink) {
      alert("Public link could not be generated.");
      return;
    }

    try {
      await navigator.clipboard.writeText(shareLink);
    } catch (clipboardError) {
      console.warn(
        "Clipboard copy failed:",
        clipboardError
      );
    }

    if (response.data?.email_sent) {
      alert(
        `Public link generated and email sent successfully!\n\nRecipient:\n${email.trim()}\n\nLink copied:\n${shareLink}`
      );
    } else {
      alert(
        `Public link generated.\n\n${shareLink}\n\nEmail could not be sent.`
      );
    }
  } catch (err: any) {
    console.error(
      "Public share error:",
      err
    );

    alert(
      err.response?.data?.message ||
        "Failed to generate public link."
    );
  }
};
  const handleRename = async (id: string, currentName: string) => {
  const newName = window.prompt(
    "Enter new file name:",
    currentName
  );

  if (!newName || !newName.trim()) return;

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const response = await api.patch(
      `/files/${id}/rename`,
      {
        name: newName.trim(),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setFiles((current) =>
      current.map((file) =>
        file.id === id
          ? {
              ...file,
              name:
                response.data?.file?.name ||
                response.data?.name ||
                newName.trim(),
            }
          : file
      )
    );
  } catch (err: any) {
    console.error("Rename error:", err);

    alert(
      err.response?.data?.message ||
        "Failed to rename file."
    );
  }
};

  const handlePreview = async (id: string) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await api.get(
        `/files/${id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob(
        [response.data],
        {
          type:
            response.headers["content-type"] ||
            "application/octet-stream",
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      window.open(url, "_blank");

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000);
    } catch (err: any) {
      console.error("Preview error:", err);

      alert(
        err.response?.data?.message ||
          "Unable to preview file."
      );
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await api.get(
        `/files/${id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob(
        [response.data],
        {
          type:
            response.headers["content-type"] ||
            "application/octet-stream",
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      const file = files.find(
        (item) => item.id === id
      );

      link.download =
        file?.name ||
        file?.file_name ||
        "download";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Download error:", err);

      alert(
        err.response?.data?.message ||
          "Unable to download file."
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
              onClick={() =>
                router.push("/dashboard")
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl transition hover:bg-indigo-50 hover:text-indigo-600"
            >
              ←
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-xl shadow-md">
              📁
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
                {currentFolder
                  ? currentFolder.name
                  : "My Files"}
              </h1>

              <p className="text-xs text-slate-400">
                {currentFolder
                  ? "Folder contents"
                  : "Your cloud storage"}
              </p>
            </div>

          </div>

          <button
            onClick={() =>
              router.push(
                folderId
                  ? `/dashboard/files/upload?folder=${folderId}`
                  : "/dashboard/files/upload"
              )
            }
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg sm:px-6"
          >
            <span className="sm:hidden">
              + Upload
            </span>

            <span className="hidden sm:inline">
              + Upload File
            </span>
          </button>

        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">

        {/* BREADCRUMB */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">

          <button
            onClick={() =>
              router.push("/dashboard/files")
            }
            className="font-semibold text-indigo-600 hover:text-indigo-800"
          >
            My Files
          </button>

          {currentFolder && (
            <>
              <span className="text-slate-300">
                /
              </span>

              <span className="font-semibold text-slate-700">
                📁 {currentFolder.name}
              </span>
            </>
          )}

        </div>

        {/* TITLE */}
        <div className="mb-7">

          <p className="text-sm font-medium text-indigo-600">
            CloudDrive
          </p>

          <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            {currentFolder
              ? currentFolder.name
              : "All Files"}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {currentFolder
              ? "Files stored inside this folder."
              : "Manage and organize everything stored in your cloud."}
          </p>

        </div>

        {/* SEARCH / FILTER / SORT */}

<div className="mb-8 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
  <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto]">

    {/* SEARCH */}

    <div className="flex gap-2">
      <div className="relative flex-1">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
          🔍
        </span>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) =>
            setSearchQuery(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          placeholder="Search files and folders..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <button
        onClick={handleSearch}
        disabled={searching}
        className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {searching ? "Searching..." : "Search"}
      </button>
    </div>

    {/* TYPE FILTER */}

    <select
      value={fileType}
      onChange={(e) =>
        setFileType(e.target.value)
      }
      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
    >
      <option value="all">
        All Types
      </option>

      <option value="image">
        Images
      </option>

      <option value="pdf">
        PDF
      </option>

      <option value="document">
        Documents
      </option>

      <option value="video">
        Videos
      </option>

      <option value="audio">
        Audio
      </option>
    </select>

    {/* SORT */}

    <select
      value={sortBy}
      onChange={(e) =>
        setSortBy(e.target.value)
      }
      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
    >
      <option value="newest">
        Newest First
      </option>

      <option value="oldest">
        Oldest First
      </option>

      <option value="name-asc">
        Name A-Z
      </option>

      <option value="name-desc">
        Name Z-A
      </option>

      <option value="largest">
        Largest First
      </option>

      <option value="smallest">
        Smallest First
      </option>
    </select>
  </div>

  {/* CLEAR SEARCH */}

  {(searchQuery || fileType !== "all") && (
    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
      <p className="text-xs text-slate-400">
        {displayedFiles.length} result
        {displayedFiles.length !== 1 ? "s" : ""} found
      </p>

      <button
        onClick={() => {
          setSearchQuery("");
          setFileType("all");
          loadFiles();
        }}
        className="text-xs font-bold text-red-500 hover:text-red-700"
      >
        Clear Search & Filters
      </button>
    </div>
  )}
</div>

        {/* STATS */}
        <div className="mb-8 grid gap-5 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-400">
              Files
            </p>

            <p className="mt-2 text-3xl font-bold">
              {files.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-400">
              Storage Used
            </p>

            <p className="mt-2 text-3xl font-bold">
              {formatSize(
                files.reduce(
                  (total, file) =>
                    total +
                    (file.size_bytes ||
                      file.file_size ||
                      0),
                  0
                )
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-400">
              Status
            </p>

            <p className="mt-2 text-xl font-bold text-green-600">
              🔒 Secure
            </p>
          </div>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="rounded-3xl bg-white p-16 text-center shadow-sm">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />

            <p className="font-semibold text-slate-700">
              Loading files...
            </p>
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          displayedFiles.length === 0 &&
          !error && (
            <div className="rounded-3xl border border-slate-100 bg-white px-6 py-16 text-center shadow-sm">

              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-50 text-5xl">
                📂
              </div>

              <h3 className="mt-6 text-2xl font-bold">
                {currentFolder
                  ? "This folder is empty"
                  : "No files yet"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                {currentFolder
                  ? "Upload a file to this folder to get started."
                  : "Upload your first file and start managing your cloud storage."}
              </p>

              <button
                onClick={() =>
                  router.push(
                    folderId
                      ? `/dashboard/files/upload?folder=${folderId}`
                      : "/dashboard/files/upload"
                  )
                }
                className="mt-7 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-7 py-3 font-bold text-white shadow-lg"
              >
                ⬆️ Upload File
              </button>

            </div>
          )}

        {/* FILE LIST */}
        {!loading &&
          displayedFiles.length > 0 && (
            <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-5 py-5 sm:px-7">

                <h3 className="font-bold text-slate-900">
                  {currentFolder
                    ? "Folder Files"
                    : "Your Files"}
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  {files.length} file
                  {files.length !== 1
                    ? "s"
                    : ""}{" "}
                  available
                </p>

              </div>

              {/* DESKTOP */}
              <div className="hidden overflow-x-auto md:block">

                <table className="w-full">

                  <thead className="border-b border-slate-100 bg-slate-50">
                    <tr>

                      <th className="px-7 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                        File
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                        Type
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                        Size
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                        Date
                      </th>

                      <th className="px-7 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-400">
                        Actions
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {displayedFiles.map((file) => (
                      <tr
                        key={file.id}
                        className="transition hover:bg-slate-50"
                      >

                        <td className="px-7 py-5">

                          <div className="flex items-center gap-4">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                              {getFileIcon(
                                file.mime_type
                              )}
                            </div>

                            <div className="min-w-0">

                              <button
                                onClick={() =>
                                  handlePreview(
                                    file.id
                                  )
                                }
                                className="max-w-xs truncate text-left font-semibold text-slate-800 hover:text-indigo-600 hover:underline"
                              >
                                {file.name ||
                                  file.file_name ||
                                  "Unnamed File"}
                              </button>

                              <p className="mt-1 text-xs text-slate-400">
                                CloudDrive
                              </p>

                            </div>

                          </div>

                        </td>

                        <td className="px-5 py-5 text-sm text-slate-500">
                          {file.mime_type ||
                            "Unknown"}
                        </td>

                        <td className="px-5 py-5 text-sm font-medium text-slate-600">
                          {formatSize(
                            file.size_bytes ||
                              file.file_size
                          )}
                        </td>

                        <td className="px-5 py-5 text-sm text-slate-500">
                          {file.created_at
                            ? new Date(
                                file.created_at
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        <td className="px-7 py-5">


                          <div className="flex justify-end gap-2">

                            <button
  onClick={() =>
    handleRename(
      file.id,
      file.name ||
        file.file_name ||
        "Unnamed File"
    )
  }
  className="rounded-lg px-3 py-2 text-sm font-semibold text-purple-600 transition hover:bg-purple-50"
>
  Rename
</button>

<button
  onClick={() => handleShare(file.id)}
  className="rounded-lg px-3 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-50"
>
  Share
</button>
<button
  onClick={() => handlePublicShare(file.id)}
  className="rounded-lg px-3 py-2 text-sm font-semibold text-amber-600 hover:bg-amber-50"
>
  Public Link
</button>

                            <button
                              onClick={() =>
                                handleDownload(
                                  file.id
                                )
                              }
                              className="rounded-lg px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
                            >
                              Download
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(
                                  file.id
                                )
                              }
                              className="rounded-lg px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50"
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>

              {/* MOBILE */}
              <div className="divide-y divide-slate-100 md:hidden">

                {displayedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-5"
                  >

                    <div className="flex items-start gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
                        {getFileIcon(
                          file.mime_type
                        )}
                      </div>

                      <div className="min-w-0 flex-1">

                        <button
                          onClick={() =>
                            handlePreview(
                              file.id
                            )
                          }
                          className="truncate text-left font-semibold text-slate-800 hover:text-indigo-600 hover:underline"
                        >
                          {file.name ||
                            file.file_name ||
                            "Unnamed File"}
                        </button>

                        <p className="mt-1 text-xs text-slate-400">
                          {file.mime_type ||
                            "Unknown"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatSize(
                            file.size_bytes ||
                              file.file_size
                          )}
                        </p>

                      </div>

                    </div>

                    <div className="mt-4 flex gap-2">

                      <button
                        onClick={() =>
                          handleDownload(
                            file.id
                          )
                        }
                        className="flex-1 rounded-xl bg-indigo-50 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-100"
                      >
                        ⬇️ Download
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            file.id
                          )
                        }
                        className="flex-1 rounded-xl bg-red-50 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-100"
                      >
                        🗑️ Delete
                      </button>

                    </div>

                  </div>
                ))}

              </div>

            </div>
          )}

      </section>

    </main>
  );
}