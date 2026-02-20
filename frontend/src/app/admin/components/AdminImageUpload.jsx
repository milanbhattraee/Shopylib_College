"use client";
import React, { useState, useCallback } from "react";
import { IoCloudUpload, IoClose } from "react-icons/io5";

export default function AdminImageUpload({ label = "Upload Image", onChange, multiple = false, preview = null, className = "" }) {
  const [previews, setPreviews] = useState(preview ? (Array.isArray(preview) ? preview : [preview]) : []);

  const handleChange = useCallback(
    (e) => {
      const files = Array.from(e.target.files);
      if (!files.length) return;

      const urls = files.map((f) => URL.createObjectURL(f));
      setPreviews(multiple ? (prev) => [...prev, ...urls] : urls);
      onChange?.(multiple ? files : files[0]);
    },
    [multiple, onChange]
  );

  const removePreview = useCallback(
    (idx) => {
      setPreviews((prev) => prev.filter((_, i) => i !== idx));
    },
    []
  );

  return (
    <div className={`mb-3 ${className}`}>
      <p className="text-sm text-cyan-500 font-medium mb-1.5">{label}</p>
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-cyan-400 rounded-lg cursor-pointer hover:border-cyan-500 hover:bg-cyan-50/30 transition-all">
        <IoCloudUpload className="text-3xl text-cyan-500 mb-1" />
        <span className="text-sm text-gray-500">Click to upload</span>
        <input type="file" className="hidden" accept="image/*" multiple={multiple} onChange={handleChange} />
      </label>
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {previews.map((src, i) => (
            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePreview(i)}
                className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5"
              >
                <IoClose size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
