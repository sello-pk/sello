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
  msgTooManyImages,
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
      file.type.startsWith("image/")
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
          `Only ${remainingSlots} more image(s) allowed. Maximum ${MAX_FILES} per listing.`
        );
        validFiles.splice(remainingSlots);
      } else {
        toast.error(
          `Maximum ${MAX_FILES} images per listing. Remove some first.`
        );
        return;
      }
    }

    // Compress before adding — faster upload + stays under 35MB total
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
      // Try to fit as many as possible under cap
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

  // Short progress animation (actual upload happens on submit)
  const simulateUpload = (upload) => {
    const startTime = Date.now();
    const duration = 800;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);

      setUploads((prev) =>
        prev.map((u) => (u.id === upload.id ? { ...u, progress } : u))
      );

      if (progress < 100) {
        requestAnimationFrame(animate);
      } else {
        setUploads((prev) => {
          const updated = prev.map((u) =>
            u.id === upload.id ? { ...u, progress: 100, status: "done" } : u
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

  return (
    <div className="max-w-xl mx-auto rounded-xl overflow-hidden">
      <div
        className={`relative px-4 py-8 transition-all duration-300 ${
          isDragging
            ? "bg-primary-300 ring-4 ring-primary-300 ring-opacity-50"
            : "bg-gray-100"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="box h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 absolute top-6 z-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-md shadow-gray-300"></div>
        <div className="bg-white rounded-xl border-2 border-primary-300 border-dashed h-40 md:h-48 flex items-center justify-center overflow-hidden group relative">
          {activeIndex !== null ? (
            <>
              <img
                src={uploads[activeIndex]?.preview}
                alt="preview"
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
              <button
                type="button"
                onClick={() => removeFile(uploads[activeIndex].id)}
                className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600 shadow"
              >
                Remove
              </button>
            </>
          ) : (
            <div className="text-center p-6">
              <p className="text-primary-500 text-sm">No image uploaded yet</p>
            </div>
          )}
        </div>

        {(isCompressing ||
          uploads.some((u) => u.status === "uploading")) && (
          <div className="mt-4 space-y-2">
            {isCompressing && (
              <div className="bg-white p-3 shadow-sm border rounded text-sm text-gray-600">
                Optimizing images for faster upload…
              </div>
            )}
            {uploads
              .filter((u) => u.status === "uploading")
              .map((upload) => (
                <div
                  key={upload.id}
                  className="bg-white p-3 shadow-sm border rounded"
                >
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-700 truncate pr-2">
                      {upload.file.name}
                    </span>
                    <span className="text-xs text-primary-500 font-semibold">
                      {Math.round(upload.progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-300 transition-all"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        )}

        <div className="mt-4 text-center">
          <div className="text-sm text-gray-600 mb-2">
            Up to {MAX_FILES} photos per listing • {LISTING_MAX_TOTAL_MB}MB total
            (all images combined) • JPG, PNG, WebP
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            id="fileInput"
          />
          <label
            htmlFor="fileInput"
            className="inline-block px-6 py-3 bg-gradient-to-r from-primary-400 to-primary-500 hover:scale-x-110 rounded-lg cursor-pointer hover:bg-gradient-to-l transition"
          >
            Select Images
          </label>
        </div>

        {completedUploads.length > 0 && (
          <div className="flex justify-center mt-6 gap-2">
            {uploads.map(
              (upload, idx) =>
                upload.status === "done" && (
                  <button
                    type="button"
                    key={upload.id}
                    onClick={() => setActiveIndex(idx)}
                    className={`w-3 h-3 rounded-full ${
                      activeIndex === idx
                        ? "bg-gradient-to-r from-primary-400 to-primary-500 shadow"
                        : "bg-gray-400"
                    }`}
                  />
                )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagesUpload;
