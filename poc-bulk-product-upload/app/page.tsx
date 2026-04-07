"use client";

import { useState } from "react";

const HomePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState("");

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/bulk-upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setResult(JSON.stringify(data, null, 2));
  };

  return (
    <main style={{ padding: "24px" }}>
      <h1>Bulk Product Upload POC</h1>

      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={handleUpload}
        style={{ marginLeft: "12px", padding: "8px 12px" }}
      >
        Upload
      </button>

      <pre style={{ marginTop: "24px", whiteSpace: "pre-wrap" }}>
        {result}
      </pre>
    </main>
  );
};

export default HomePage;