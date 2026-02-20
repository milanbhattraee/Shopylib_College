"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaUser, FaShoppingBag, FaHeart, FaSearch } from "react-icons/fa";
import { FiMenu, FiX, FiChevronDown } from "react-icons/fi";
import { useAuth } from "@/app/provider/AuthProvider";
import { useLogout } from "@/app/hooks/useAuth";
import { useSearchSuggestions } from "@/app/hooks/useProducts";
import { useCart, useWishlistCount } from "@/app/hooks/useProtected";
import LoginForm from "@/app/auth/components/Login";
import SignupForm from "@/app/auth/components/Signup";
import ForgotPassword from "@/app/auth/components/ForgotPassword";

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const logout = useLogout();

  const [mobileMenu, setMobileMenu] = useState(false);
  const [popup, setPopup] = useState(null); // "login" | "signup" | "forgot" | "reset" | null
  const [dropdown, setDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const { data: suggestions } = useSearchSuggestions(searchQuery);
  const { data: cartData } = useCart();
  const { data: wishlistData } = useWishlistCount();

  const cartCount = isAuthenticated ? (cartData?.data?.length || 0) : 0;
  const wishlistCount = isAuthenticated ? (wishlistData?.data?.count || 0) : 0;

  // Close dropdown/suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdown(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Check URL for login param
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("login") === "true" && !isAuthenticated) setPopup("login");
    }
  }, [isAuthenticated]);

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setShowSuggestions(false);
        setSearchQuery("");
      }
    },
    [searchQuery, router]
  );

  const firstLetter = user?.firstName?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      <header className="bg-primary shadow-md sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-white tracking-wide">
            Shopylib
          </Link>

          {/* Search Bar - Desktop */}
          <div ref={searchRef} className="hidden md:flex relative flex-1 max-w-xl mx-6">
            <form onSubmit={handleSearch} className="w-full flex bg-white rounded-lg overflow-hidden">
              <input
                type="text"
                className="flex-1 px-4 py-2 text-gray-800 text-sm outline-none"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => searchQuery && setShowSuggestions(true)}
              />
              <button type="submit" className="px-4 text-primary hover:text-primary-dark transition">
                <FaSearch />
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions?.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border max-h-80 overflow-y-auto z-50">
                {suggestions.map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.slug}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition border-b last:border-0"
                    onClick={() => { setShowSuggestions(false); setSearchQuery(""); }}
                  >
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.category} {item.discount && <span className="text-red-500 font-semibold ml-1">-{item.discount}%</span>}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary">Rs. {item.price}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Actions - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/wishlist" className="relative text-white hover:text-gray-200 transition">
                  <FaHeart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{wishlistCount}</span>
                  )}
                </Link>
                <Link href="/cart" className="relative text-white hover:text-gray-200 transition">
                  <FaShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>
                  )}
                </Link>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdown(!dropdown)}
                    className="flex items-center gap-1 text-white"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                      {user?.avatar?.url ? (
                        <img src={user.avatar.url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : firstLetter}
                    </div>
                    <FiChevronDown className="w-4 h-4" />
                  </button>
                  {dropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border animate-fadeIn z-50">
                      <div className="px-4 py-3 border-b">
                        <p className="text-sm font-semibold text-gray-800">{user?.firstName} {user?.lastName}</p>
                      </div>
                      <ul className="py-1">
                        {[
                          { href: "/profile", label: "My Profile" },
                          { href: "/orders", label: "Orders" },
                          { href: "/wishlist", label: "Wishlist" },
                          { href: "/reviews", label: "Reviews" },
                        ].map((item) => (
                          <li key={item.href}>
                            <Link href={item.href} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition" onClick={() => setDropdown(false)}>
                              {item.label}
                            </Link>
                          </li>
                        ))}
                        <li className="border-t">
                          <button onClick={() => { logout.mutate(); setDropdown(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition">
                            Logout
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button onClick={() => setPopup("login")} className="flex items-center gap-1 text-white text-sm font-semibold hover:text-gray-200 transition">
                <FaUser className="w-4 h-4" /> Login
              </button>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-white" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="md:hidden bg-white border-t shadow-lg animate-slideUp">
            <div className="px-4 py-3">
              <form onSubmit={handleSearch} className="flex bg-gray-100 rounded-lg overflow-hidden">
                <input type="text" className="flex-1 px-4 py-2 bg-transparent text-sm outline-none" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <button type="submit" className="px-4 text-primary"><FaSearch /></button>
              </form>
            </div>
            <div className="border-t">
              {isAuthenticated ? (
                <>
                  <Link href="/profile" className="block px-4 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenu(false)}>My Profile</Link>
                  <Link href="/orders" className="block px-4 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenu(false)}>Orders</Link>
                  <Link href="/cart" className="block px-4 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenu(false)}>Cart ({cartCount})</Link>
                  <Link href="/wishlist" className="block px-4 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenu(false)}>Wishlist ({wishlistCount})</Link>
                  <button onClick={() => { logout.mutate(); setMobileMenu(false); }} className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 border-t">Logout</button>
                </>
              ) : (
                <button onClick={() => { setPopup("login"); setMobileMenu(false); }} className="w-full text-left px-4 py-3 text-primary font-semibold hover:bg-gray-50">Login / Sign Up</button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Popups */}
      {popup === "login" && <LoginForm closePopup={() => setPopup(null)} openSignupPopup={() => setPopup("signup")} forgotPasswordPopup={() => setPopup("forgot")} />}
      {popup === "signup" && <SignupForm closePopup={() => setPopup(null)} openLoginPopup={() => setPopup("login")} />}
      {popup === "forgot" && <ForgotPassword closePopup={() => setPopup(null)} openLoginPopup={() => setPopup("login")} />}
    </>
  );
}
