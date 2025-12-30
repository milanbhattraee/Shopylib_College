"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {  FaShoppingBag, FaShoppingBasket, FaUser } from "react-icons/fa";
import { FcMenu } from "react-icons/fc";
import { RxCross1 } from "react-icons/rx";
import LoginForm from "../../../auth/components/Login";
import SignupForm from "../../../auth/components/Signup";
import OtpForm from "../../../auth/components/OtpForm";
import ForgotPassword from "../../../auth/components/ForgotPassword";
import ResetPassword from "../../../auth/components/ResetPassword";



const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState("login");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState(null);

  const dropdownRef = useRef(null);

  const firstLetter = user?.displayName?.charAt(0).toUpperCase() || "U";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setTimeout(() => setIsDropdownOpen(false), 100); // Small delay for better UX
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    closePopup();
    setIsDropdownOpen(false);
    setIsLogin(false);
    setUser(null);
  };

  const closePopup = () => setShowPopup(false);

  const openLoginPopup = () => {
    setPopupType("login");
    setShowPopup(true);
  };

  const openSignupPopup = () => {
    setPopupType("signup");
    setShowPopup(true);
  };

  const openOtpPopup = () => {
    setPopupType("verifyOtp");
    setShowPopup(true);
  };
  const forgotPasswordPopup = () => {
    setPopupType("forgotPassword");
    setShowPopup(true);
  };
  const openResetPasswordPopup = () => {
    setPopupType("resetPassword");
    setShowPopup(true);
  };

  const SearchBar = ({ mobile = false }) => (
    <div className={`${mobile ? "" : "hidden md:flex bg-white rounded-md grow mx-4"}`}>
      <input
        type="text"
        className="w-full outline-none px-4 py-2 bg-transparent text-gray-800"
        placeholder="Search products..."
      />
      <button className="px-4 text-primary font-semibold hover:text-primary-dark transition">
        Search
      </button>
    </div>
  );

  return (
    <>
      <header className="bg-primary backdrop-blur-md shadow-md sticky top-0 z-50 w-full px-10">
        <div className="container mx-auto px-4 flex items-center justify-between py-4">
          <div className="text-xl font-bold text-white">Shopylib</div>

          <SearchBar />

          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <Link
                href={
                  user.role === "customer"
                    ? "/vendor/register"
                    : "/dashboard/store"
                }
                className="text-sm font-semibold text-white"
              >
                {user.role === "customer" ? "Become a Seller" : "My Store"}
              </Link>
            )}

            {!isLogin ? (
              <Link
                href="#"
                onClick={openLoginPopup}
                className="text-sm font-semibold text-white flex items-center"
              >
                <FaUser  className="h-5 w-5 mr-1" /> Login
              </Link>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <div
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-center w-10 h-10 cursor-pointer bg-green-500 rounded-full text-white font-bold text-xl"
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={`${user.name}'s profile`}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    firstLetter
                  )}
                </div>
                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-4 w-48 glass-strong shadow-xl rounded-xl">
                    <ul className="py-2">
                      <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer transition">
                        <Link href="/dashboard/account" className="text-gray-700 font-medium">My Profile</Link>
                      </li>
                      <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer transition">
                        <Link href="/dashboard/orders" className="text-gray-700 font-medium">Orders</Link>
                      </li>
                      <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer transition">
                        <Link href="/dashboard/wishlists" className="text-gray-700 font-medium">Wishlist</Link>
                      </li>
                      <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer transition">
                        <Link href="/dashboard/reviews" className="text-gray-700 font-medium">Reviews</Link>
                      </li>
                      <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer transition">
                        <Link href="/dashboard/returns" className="text-gray-700 font-medium">My Returns</Link>
                      </li>
                      <li className="border-t border-gray-300"></li>
                      <li
                        onClick={handleLogout}
                        className="px-4 py-2 hover:bg-red-100 cursor-pointer transition text-red-600 font-medium"
                      >
                        Logout
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            <button>
              <FaShoppingBag className="h-6 w-6 text-white" />
            </button>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? (
                <RxCross1   className="h-6 w-6 text-gray-600" />
              ) : (
                <FcMenu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden px-4 py-3 glass-secondary shadow-lg">
            <div className="flex flex-col space-y-3">
              {/* Search bar for mobile */}
              <SearchBar mobile />
              {user !== null && (
                <button className="text-sm font-semibold text-primary hover:text-primary-dark transition py-2">
                  Become a Seller
                </button>
              )}
              {!isLogin && (
                <button
                  onClick={openLoginPopup}
                  className="text-sm font-semibold text-white bg-primary hover:bg-primary-dark py-2 rounded-lg transition"
                >
                  Login
                </button>
              )}
              <button className="flex items-center justify-start text-primary hover:text-primary-dark font-medium py-2 transition">
                <FaShoppingBasket className="h-5 w-5 mr-2" />
                Cart
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Login or Signup Popup */}
      {showPopup && popupType === "login" && (
        <LoginForm
          closePopup={closePopup}
          openSignupPopup={openSignupPopup}
          openOtpPopup={openOtpPopup}
          forgotPasswordPopup={forgotPasswordPopup}
        />
      )}
      {showPopup && popupType === "signup" && (
        <SignupForm
          closePopup={closePopup}
          openLoginPopup={openLoginPopup}
          openOtpPopup={openOtpPopup}
        />
      )}
      {showPopup && popupType === "verifyOtp" && (
        <OtpForm closePopup={closePopup} />
      )}
      {showPopup && popupType === "forgotPassword" && (
        <ForgotPassword
          closePopup={closePopup}
          openResetPasswordPopup={openResetPasswordPopup}
        />
      )}
      {showPopup && popupType === "resetPassword" && (
        <ResetPassword closePopup={closePopup} />
      )}
    </>
  );
};

export default Header;
