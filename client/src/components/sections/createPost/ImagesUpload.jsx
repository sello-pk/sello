// src/components/createPost/ImagesUpload.js
import React, { useState, useRef } from "react";
import toast from "react-hot-toast";
import { compressImageFiles } from "../../../utils/imageCompress";
import {
  LISTING_MAX_IMAGES as MAX_FILES,
  LISTING_MAX_TOTAL_MB,
  LISTING_MAX_FILE_MB,
  MSG_INVALID_TYPE,
  msgFileTooLarge,
  msgTotalExceeded,
  MSG_FITTED_PARTIAL,
} from "../../../constants/listingImages";

const MAX_TOTAL_BYTES = LISTING_MAX_TOTAL_MB * 1024 * 1024;
const MAX_SINGLE_BYTES = LISTING_MAX_FILE_MB * 1024 * 1024;

const ImagesUpload = ({ onImagesChange }) => {
  const [uploads, setUploads] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    processFiles(files);
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (files.length > 0) processFiles(files);
  };

  const processFiles = async (files) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    const validFiles = files.filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(MSG_INVALID_TYPE);
        return false;
      }
      if (file.size > MAX_SINGLE_BYTES) {
        toast.error(msgFileTooLarge(file.name));
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const currentCount = uploads.length;
    if (currentCount + validFiles.length > MAX_FILES) {
      const remainingSlots = MAX_FILES - currentCount;
      if (remainingSlots > 0) {
        toast.error(
          `Only ${remainingSlots} more image(s) allowed. Maximum ${MAX_FILES} per listing.`,
        );
        validFiles.splice(remainingSlots);
      } else {
        toast.error(
          `Maximum ${MAX_FILES} images per listing. Remove some first.`,
        );
        return;
      }
    }

    // Compress before adding so the live API is less likely to reject the payload size.
    setIsCompressing(true);
    let processedFiles;
    try {
      processedFiles = await compressImageFiles(validFiles);
    } catch {
      processedFiles = validFiles;
    } finally {
      setIsCompressing(false);
    }

    const totalExisting = uploads.reduce((s, u) => s + (u.file?.size || 0), 0);
    const totalNew = processedFiles.reduce((s, f) => s + (f.size || 0), 0);
    if (totalExisting + totalNew > MAX_TOTAL_BYTES) {
      toast.error(msgTotalExceeded());
      let acc = totalExisting;
      const fitted = [];
      for (const f of processedFiles) {
        if (acc + f.size <= MAX_TOTAL_BYTES) {
          fitted.push(f);
          acc += f.size;
        }
      }
      if (fitted.length === 0) return;
      processedFiles = fitted;
      if (fitted.length < validFiles.length) {
        toast.error(MSG_FITTED_PARTIAL);
      }
    }

    const newUploads = processedFiles.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: "uploading",
    }));

    setUploads((prev) => {
      const updated = [...prev, ...newUploads];
      if (onImagesChange) {
        onImagesChange(updated.map((u) => u.file));
      }
      return updated;
    });

    newUploads.forEach((upload) => simulateUpload(upload));
  };

  const simulateUpload = (upload) => {
    const startTime = Date.now();
    const duration = 800;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);

      setUploads((prev) =>
        prev.map((u) => (u.id === upload.id ? { ...u, progress } : u)),
      );

      if (progress < 100) {
        requestAnimationFrame(animate);
      } else {
        setUploads((prev) => {
          const updated = prev.map((u) =>
            u.id === upload.id ? { ...u, progress: 100, status: "done" } : u,
          );
          if (activeIndex === null) {
            const newIndex = updated.findIndex((u) => u.id === upload.id);
            setActiveIndex(newIndex);
          }
          return updated;
        });
      }
    };

    requestAnimationFrame(animate);
  };

  const removeFile = (id) => {
    setUploads((prev) => {
      const indexToRemove = prev.findIndex((u) => u.id === id);
      if (indexToRemove === -1) return prev;

      URL.revokeObjectURL(prev[indexToRemove].preview);
      const newUploads = prev.filter((u) => u.id !== id);

      if (onImagesChange) {
        onImagesChange(newUploads.map((u) => u.file));
      }

      if (newUploads.length === 0) {
        setActiveIndex(null);
      } else if (activeIndex === indexToRemove) {
        setActiveIndex(0);
      } else if (activeIndex > indexToRemove) {
        setActiveIndex((prevIndex) => prevIndex - 1);
      }

      return newUploads;
    });
  };

  const completedUploads = uploads.filter((u) => u.status === "done");
  const openFileInput = () => fileInputRef.current?.click();

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleImageUpload}
          className="hidden"
          id="imagesFileInput"
        />

        <div
          role="button"
          tabIndex={0}
          onClick={openFileInput}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openFileInput();
            }
          }}
          className={`relative min-h-[200px] md:min-h-[220px] rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors cursor-pointer select-none ${
            isDragging
              ? "border-primary-300 bg-primary-30/50"
              : "border-gray-300 bg-white"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {activeIndex !== null && uploads[activeIndex]?.preview ? (
            <>
              <img
                src={uploads[activeIndex].preview}
                alt="preview"
                className="w-full h-full min-h-[200px] object-contain transition-transform duration-500 group-hover:scale-105"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(uploads[activeIndex].id);
                }}
                className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600 shadow"
              >
                Remove
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-8 px-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary-500">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-700 text-sm text-center">
                Drop your images here. or{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openFileInput();
                  }}
                  className="text-primary-400 font-medium hover:text-primary-500 hover:underline focus:outline-none"
                >
                  browse
                </button>
              </p>
            </div>
          )}
        </div>

        {(isCompressing || uploads.some((u) => u.status === "uploading")) && (
          <div className="px-4 py-3 space-y-2 border-t border-gray-100">
            {isCompressing && (
              <p className="text-sm text-gray-600">
                Optimizing images for faster upload...
              </p>
            )}
            {uploads
              .filter((u) => u.status === "uploading")
              .map((upload) => (
                <div key={upload.id} className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 truncate pr-2">
                      {upload.file.name}
                    </span>
                    <span className="text-primary-500 font-medium shrink-0">
                      {Math.round(upload.progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-primary-500 transition-all"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        )}

        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-500 text-center">
            Up to {MAX_FILES} photos, {LISTING_MAX_TOTAL_MB}MB total, JPG, PNG,
            WebP. Tip: Use 4-6 photos and smaller images to avoid upload
            errors.
          </p>
        </div>

        {completedUploads.length > 0 && (
          <div className="flex justify-center py-3 gap-2 flex-wrap">
            {uploads.map(
              (upload, idx) =>
                upload.status === "done" && (
                  <button
                    type="button"
                    key={upload.id}
                    onClick={() => setActiveIndex(idx)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      activeIndex === idx
                        ? "bg-primary-300 ring-2 ring-primary-300 ring-offset-1"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ),
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagesUpload;
