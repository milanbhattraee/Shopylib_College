"use client";
import React from "react";
import { FiMinus, FiPlus } from "react-icons/fi";

export default function QuantitySelector({ quantity = 1, onChange, min = 1, max = 99 }) {
  return (
    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => quantity > min && onChange(quantity - 1)}
        disabled={quantity <= min}
        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition"
      >
        <FiMinus className="w-3 h-3" />
      </button>
      <span className="w-10 h-8 flex items-center justify-center text-sm font-medium border-x border-gray-200">
        {quantity}
      </span>
      <button
        onClick={() => quantity < max && onChange(quantity + 1)}
        disabled={quantity >= max}
        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition"
      >
        <FiPlus className="w-3 h-3" />
      </button>
    </div>
  );
}
