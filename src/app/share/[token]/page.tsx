"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "../../../services1/api";
interface SharedFile {
  id: string;
  name: string;
  mime_type: string;
  size_bytes: number;
}

export default function SharedFilePage() {
  const params = useParams();
  const token = params?.token as string;

  const [file, setFile] = useState<SharedFile | null>(null);
  const [signedUrl, setSignedUrl] = useState("");
  const [permission, setPermission] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    const loadSharedFile = async () => {
      try {
        const response = await api.get(
          `/file-shares/public/${token}`
        );

        setFile(response.data.file);
        setSignedUrl(response.data.signed_url);
        setPermission(response.data.permission);
      } catch (err: any) {
        console.error("Shared file error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to access this shared file."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSharedFile();
  }, [token]);

  const isImage = file?.mime_type?.startsWith("image/");
  const isPdf = file?.mime_type === "application/pdf";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-xl font-semibold">
            Loading shared file...
          </div>
          <p className="text-gray-500 mt-2">
            Please wait
          </p>
        </div>
      </div>
    );
  }

  if (error || !file || !signedUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">⚠️</div>

          <h1 className="text-2xl font-bold text-gray-800">
            Shared File Unavailable
          </h1>

          <p className="text-gray-500 mt-3">
            {error || "This shared file could not be accessed."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

          {/* Header */}
          <div className="border-b px-6 py-5">
            <h1 className="text-2xl font-bold text-gray-800">
              Shared File
            </h1>

            <p className="text-gray-500 mt-1">
              Someone shared this file with you
            </p>
          </div>

          {/* File Info */}
          <div className="px-6 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div>
                <h2 className="text-lg font-semibold text-gray-800 break-all">
                  {file.name}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {file.mime_type} •{" "}
                  {(file.size_bytes / 1024 / 1024).toFixed(2)} MB
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Permission:{" "}
                  <span className="font-medium capitalize">
                    {permission}
                  </span>
                </p>
              </div>

              <a
                href={signedUrl}
                download={file.name}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-center items-center px-5 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Download
              </a>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 border-t p-6">

            {isImage && (
              <div className="flex justify-center">
                <img
                  src={signedUrl}
                  alt={file.name}
                  className="max-h-[650px] max-w-full object-contain rounded-lg shadow"
                />
              </div>
            )}

            {isPdf && (
              <iframe
                src={signedUrl}
                title={file.name}
                className="w-full h-[700px] rounded-lg border"
              />
            )}

            {!isImage && !isPdf && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📄</div>

                <h3 className="text-xl font-semibold text-gray-700">
                  Preview not available
                </h3>

                <p className="text-gray-500 mt-2 mb-6">
                  Download the file to open it.
                </p>

                <a
                  href={signedUrl}
                  download={file.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Download File
                </a>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4 text-center text-sm text-gray-400">
            Cloud Storage Service
          </div>

        </div>
      </div>
    </div>
  );
}