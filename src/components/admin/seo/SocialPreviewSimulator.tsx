"use client";

import { useState } from "react";
import { Monitor, Smartphone } from "lucide-react";

interface SocialPreviewSimulatorProps {
  title: string;
  description: string;
  image: string;
  url: string;
  twitterHandle: string;
  twitterCardType: string;
  linkedinImage: string;
  fbAppId: string;
}

function truncate(text: string, maxLen: number): string {
  if (!text) return "";
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "...";
}

function extractDomain(url: string): string {
  if (!url) return "example.com";
  try {
    const parsed = new URL(
      url.startsWith("http") ? url : `https://${url}`
    );
    return parsed.hostname.toUpperCase();
  } catch {
    return url.toUpperCase().slice(0, 30);
  }
}

function ImagePreview({
  src,
  alt,
  aspectRatio,
  placeholderText,
}: {
  src: string;
  alt: string;
  aspectRatio: string;
  placeholderText: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (src && !error) {
    return (
      <div
        className="relative w-full overflow-hidden bg-gray-100 dark:bg-gray-800"
        style={{ aspectRatio }}
      >
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 text-xs"
      style={{ aspectRatio }}
    >
      {placeholderText}
    </div>
  );
}

function FacebookPreviewCard({
  title,
  description,
  image,
  url,
  isMobile,
}: {
  title: string;
  description: string;
  image: string;
  url: string;
  isMobile: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 ${
        isMobile ? "max-w-[320px]" : "max-w-[500px]"
      }`}
    >
      <div className="px-3 pt-3 pb-1 flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">f</span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          Facebook
        </span>
      </div>
      <ImagePreview
        src={image}
        alt="Facebook share preview"
        aspectRatio="1.91/1"
        placeholderText="1200 x 630px recommended"
      />
      <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2.5">
        <p
          className={`text-gray-500 dark:text-gray-400 uppercase tracking-wide ${
            isMobile ? "text-[10px]" : "text-[11px]"
          }`}
        >
          {truncate(extractDomain(url), isMobile ? 25 : 35)}
        </p>
        <p
          className={`font-semibold text-gray-800 dark:text-gray-200 mt-0.5 ${
            isMobile ? "text-xs line-clamp-2" : "text-sm line-clamp-2"
          }`}
        >
          {truncate(title, isMobile ? 40 : 60) || "Page Title"}
        </p>
        <p
          className={`text-gray-500 dark:text-gray-400 mt-0.5 ${
            isMobile ? "text-[11px] line-clamp-1" : "text-xs line-clamp-2"
          }`}
        >
          {truncate(description, isMobile ? 50 : 100) ||
            "Page description will appear here"}
        </p>
      </div>
    </div>
  );
}

function TwitterPreviewCard({
  title,
  description,
  image,
  url,
  twitterCardType,
  isMobile,
}: {
  title: string;
  description: string;
  image: string;
  url: string;
  twitterCardType: string;
  isMobile: boolean;
}) {
  const isLargeCard = twitterCardType === "summary_large_image";

  return (
    <div
      className={`overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 ${
        isMobile ? "max-w-[320px]" : "max-w-[500px]"
      }`}
    >
      <div className="px-3 pt-3 pb-1 flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-black dark:bg-white flex items-center justify-center">
          <span className="text-white dark:text-black text-[10px] font-bold">
            X
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          Twitter / X
        </span>
      </div>
      {isLargeCard ? (
        <>
          <ImagePreview
            src={image}
            alt="Twitter share preview"
            aspectRatio="2/1"
            placeholderText="1200 x 600px recommended"
          />
          <div className="px-3 py-2.5">
            <p
              className={`font-semibold text-gray-800 dark:text-gray-200 ${
                isMobile ? "text-xs line-clamp-2" : "text-sm line-clamp-2"
              }`}
            >
              {truncate(title, isMobile ? 40 : 70) || "Page Title"}
            </p>
            <p
              className={`text-gray-500 dark:text-gray-400 mt-0.5 ${
                isMobile ? "text-[11px] line-clamp-1" : "text-xs line-clamp-2"
              }`}
            >
              {truncate(description, isMobile ? 50 : 100) ||
                "Page description will appear here"}
            </p>
            <p
              className={`text-gray-400 dark:text-gray-500 mt-1 ${
                isMobile ? "text-[10px]" : "text-[11px]"
              }`}
            >
              {truncate(extractDomain(url), 30).toLowerCase() || "example.com"}
            </p>
          </div>
        </>
      ) : (
        <div className="flex px-3 py-2.5 gap-3">
          <div className="flex-1">
            <p
              className={`font-semibold text-gray-800 dark:text-gray-200 ${
                isMobile ? "text-xs line-clamp-2" : "text-sm line-clamp-2"
              }`}
            >
              {truncate(title, isMobile ? 40 : 70) || "Page Title"}
            </p>
            <p
              className={`text-gray-500 dark:text-gray-400 mt-0.5 ${
                isMobile ? "text-[11px] line-clamp-1" : "text-xs line-clamp-2"
              }`}
            >
              {truncate(description, isMobile ? 50 : 100) ||
                "Page description will appear here"}
            </p>
            <p
              className={`text-gray-400 dark:text-gray-500 mt-1 ${
                isMobile ? "text-[10px]" : "text-[11px]"
              }`}
            >
              {truncate(extractDomain(url), 30).toLowerCase() || "example.com"}
            </p>
          </div>
          {image && (
            <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
              <img
                src={image}
                alt="Twitter summary thumbnail"
                className="h-full w-full object-cover"
              />
            </div>
          )}
          {!image && (
            <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-[8px]">
              No image
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LinkedInPreviewCard({
  title,
  description,
  image,
  linkedinImage,
  url,
  isMobile,
}: {
  title: string;
  description: string;
  image: string;
  linkedinImage: string;
  url: string;
  isMobile: boolean;
}) {
  const previewImage = linkedinImage || image;

  return (
    <div
      className={`overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 ${
        isMobile ? "max-w-[320px]" : "max-w-[500px]"
      }`}
    >
      <div className="px-3 pt-3 pb-1 flex items-center gap-2">
        <div className="w-5 h-5 rounded-sm bg-[#0A66C2] flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">in</span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          LinkedIn
        </span>
      </div>
      <ImagePreview
        src={previewImage}
        alt="LinkedIn share preview"
        aspectRatio="1.91/1"
        placeholderText={
          linkedinImage
            ? "LinkedIn image: 1200 x 627px"
            : "1200 x 627px recommended"
        }
      />
      <div className="bg-[#f3f2ef] dark:bg-gray-800 px-3 py-2.5">
        <p
          className={`font-semibold text-gray-800 dark:text-gray-200 ${
            isMobile ? "text-xs line-clamp-2" : "text-sm line-clamp-2"
          }`}
        >
          {truncate(title, isMobile ? 40 : 60) || "Page Title"}
        </p>
        <p
          className={`text-gray-500 dark:text-gray-400 mt-0.5 ${
            isMobile ? "text-[11px] line-clamp-1" : "text-xs line-clamp-2"
          }`}
        >
          {truncate(description, isMobile ? 50 : 100) ||
            "Page description will appear here"}
        </p>
        <p
          className={`text-gray-400 dark:text-gray-500 mt-1 ${
            isMobile ? "text-[10px]" : "text-[11px]"
          }`}
        >
          {truncate(extractDomain(url), 30).toLowerCase() || "example.com"}
        </p>
      </div>
    </div>
  );
}

export default function SocialPreviewSimulator({
  title,
  description,
  image,
  url,
  twitterHandle,
  twitterCardType,
  linkedinImage,
  fbAppId,
}: SocialPreviewSimulatorProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Suppress unused variable warnings (props available for future use)
  void twitterHandle;
  void fbAppId;

  return (
    <div className="space-y-4">
      {/* Mobile / Desktop Toggle */}
      <div className="flex items-center justify-end gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1 w-fit ml-auto">
        <button
          type="button"
          onClick={() => setIsMobile(false)}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            !isMobile
              ? "bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          Desktop
        </button>
        <button
          type="button"
          onClick={() => setIsMobile(true)}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            isMobile
              ? "bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          Mobile
        </button>
      </div>

      {/* Preview Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-2">
          <FacebookPreviewCard
            title={title}
            description={description}
            image={image}
            url={url}
            isMobile={isMobile}
          />
        </div>
        <div className="space-y-2">
          <TwitterPreviewCard
            title={title}
            description={description}
            image={image}
            url={url}
            twitterCardType={twitterCardType}
            isMobile={isMobile}
          />
        </div>
        <div className="space-y-2">
          <LinkedInPreviewCard
            title={title}
            description={description}
            image={image}
            linkedinImage={linkedinImage}
            url={url}
            isMobile={isMobile}
          />
        </div>
      </div>
    </div>
  );
}
