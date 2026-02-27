import React, { useState } from "react";
import axios from "axios";

const LandingPage = () => {
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get API URL from environment or use default
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Validate URL format
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleShorten = async () => {
    setErrorMessage("");
    setShortUrl("");

    if (!longUrl.trim()) {
      setErrorMessage("Please enter a URL.");
      return;
    }

    if (!isValidUrl(longUrl)) {
      setErrorMessage("Please enter a valid URL (e.g., https://example.com).");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/shorten`, {
        original_url: longUrl,
      }, {
        timeout: 10000,
        headers: { "Content-Type": "application/json" }
      });
      setShortUrl(res.data.short_url);
      setLongUrl("");
    } catch (err) {
      console.error("Error shortening URL:", err);
      if (err.response?.status === 400) {
        setErrorMessage(err.response.data.error || "Invalid URL format.");
      } else if (err.response?.status === 500) {
        setErrorMessage("Server error. Please try again later.");
      } else if (err.code === "ECONNABORTED") {
        setErrorMessage("Request timeout. Please try again.");
      } else {
        setErrorMessage("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setErrorMessage("Failed to copy to clipboard.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      handleShorten();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-r from-blue-100 to-sky-200 p-4">
      <div className="text-center mb-8">
        <h1 className="text-5xl md:text-6xl font-extrabold text-blue-900 mb-2">
          TinyLink
        </h1>
        <p className="text-2xl text-blue-800 font-medium">
          Fast & Simple URL Shortener
        </p>
      </div>

      <div className="flex w-full max-w-2xl bg-white rounded-full shadow-lg overflow-hidden">
        <input
          type="text"
          placeholder="Paste your URL here (e.g., https://example.com)"
          value={longUrl}
          onChange={(e) => {
            setLongUrl(e.target.value);
            setErrorMessage("");
          }}
          onKeyPress={handleKeyPress}
          disabled={loading}
          className="flex-1 px-6 py-4 text-lg border-none focus:outline-none placeholder-gray-400 disabled:bg-gray-100"
          aria-label="Enter URL to shorten"
        />
        <button
          onClick={handleShorten}
          disabled={loading || !longUrl.trim()}
          className={`${
            loading || !longUrl.trim()
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white font-semibold text-lg px-8 py-4 transition duration-300`}
          aria-label="Shorten URL"
        >
          {loading ? "Processing..." : "Shorten"}
        </button>
      </div>

      {errorMessage && (
        <div
          className="text-red-600 mt-4 text-center bg-red-50 px-4 py-2 rounded border border-red-200"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      {shortUrl && (
        <div className="mt-8 w-full max-w-2xl bg-white p-6 rounded-lg shadow-lg">
          <p className="text-gray-600 mb-4">
            <span className="font-semibold text-gray-800">Original URL:</span>
            <br />
            <span className="text-sm break-all text-gray-700">{longUrl}</span>
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-blue-600 text-lg font-semibold truncate underline hover:text-blue-800"
            >
              {shortUrl}
            </a>
            <button
              onClick={handleCopy}
              className={`${
                copied
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              } font-medium py-2 px-6 rounded-full transition duration-300 whitespace-nowrap`}
              aria-label="Copy short URL"
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}

      <footer className="mt-16 text-center text-gray-600">
        <p>Made with ❤️ for sharing quick links</p>
      </footer>
    </div>
  );
};

export default LandingPage;
