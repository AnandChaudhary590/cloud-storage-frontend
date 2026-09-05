"use client";

import { useEffect, useState } from "react";
import api from "../services1/api";

export default function Home() {
  const [message, setMessage] = useState("Testing backend...");

  useEffect(() => {
    const testBackend = async () => {
      try {
        const response = await api.get("/api/health");

        setMessage(
          response.data?.message || "Backend connected successfully!"
        );
      } catch (error) {
        console.error("Backend connection error:", error);
        setMessage("Backend connection failed ❌");
      }
    };

    testBackend();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          Cloud Storage Service
        </h1>

        <p className="mt-4 text-lg">
          {message}
        </p>
      </div>
    </main>
  );
}