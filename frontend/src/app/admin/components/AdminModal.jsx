"use client";
import React from "react";
import { IoMdClose } from "react-icons/io";

export default function AdminModal({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
      <div className={`bg-white relative rounded-2xl shadow-xl p-8 w-full ${maxWidth} max-h-[90vh] overflow-y-auto animate-fadeIn`}>
        <IoMdClose
          className="absolute right-8 top-8 text-3xl text-blue-600 cursor-pointer transform transition-transform duration-300 hover:rotate-90"
          onClick={onClose}
        />
        <h2 className="text-2xl font-bold text-blue-700 mb-6">{title}</h2>
        {children}
      </div>
    </div>
  );
}
