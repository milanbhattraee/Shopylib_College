"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaUser, FaShoppingBag, FaHeart, FaSearch } from "react-icons/fa";
import { FiMenu, FiX, FiChevronDown, FiClock, FiArrowRight, FiTrendingUp } from "react-icons/fi";
import { useAuth } from "@/app/provider/AuthProvider";
import { useLogout } from "@/app/hooks/useAuth";
import { useSearchSuggestions } from "@/app/hooks/useProducts";
import { useCart, useWishlistCount } from "@/app/hooks/useProtected";
import LoginForm from "@/app/auth/components/Login";
import SignupForm from "@/app/auth/components/Signup";
import ForgotPassword from "@/app/auth/components/ForgotPassword";

// ── Recent searches helper ──
const RECENT_KEY = "shopylib_recent_searches";
const MAX_RECENT = 5;
function getRecentSearches() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch { return []; }
}
function addRecentSearch(query) {
  if (typeof window === "undefined" || !query.trim()) return;
  const recent = getRecentSearches().filter((s) => s.toLowerCase() !== query.toLowerCase());
  recent.unshift(query.trim());
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}
function removeRecentSearch(query) {
  if (typeof window === "undefined") return;
  const recent = getRecentSearches().filter((s) => s !== query);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
}

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const logout = useLogout();

  const [mobileMenu, setMobileMenu] = useState(false);
  const [popup, setPopup] = useState(null);
  const [dropdown, setDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const { data: suggestions } = useSearchSuggestions(searchQuery);
  const { data: cartData } = useCart();
  const { data: wishlistData } = useWishlistCount();

  const cartCount = isAuthenticated ? (cartData?.data?.length || 0) : 0;
  const wishlistCount = isAuthenticated ? (wishlistData?.data?.count || 0) : 0;

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

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

  // Build the full list of navigable items
  const suggestionItems = suggestions?.length > 0 ? suggestions : [];
  const showRecent = !searchQuery && recentSearches.length > 0;
  const totalItems = showRecent
    ? recentSearches.length
    : suggestionItems.length + (searchQuery.trim() ? 1 : 0); // +1 for "Search for..." row

  const navigateToSearch = useCallback(
    (query) => {
      if (!query.trim()) return;
      addRecentSearch(query);
      setRecentSearches(getRecentSearches());
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
      setSearchQuery("");
      setHighlightedIndex(-1);
    },
    [router]
  );

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      if (searchQuery.trim()) navigateToSearch(searchQuery);
    },
    [searchQuery, navigateToSearch]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (!showSuggestions) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
      } else if (e.key === "Enter" && highlightedIndex >= 0) {
        e.preventDefault();
        if (showRecent) {
          navigateToSearch(recentSearches[highlightedIndex]);
        } else if (highlightedIndex < suggestionItems.length) {
          // Navigate to product
          const item = suggestionItems[highlightedIndex];
          router.push(`/products/${item.slug}`);
          setShowSuggestions(false);
          setSearchQuery("");
          setHighlightedIndex(-1);
        } else {
          // "Search for..." row
          navigateToSearch(searchQuery);
        }
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    },
    [showSuggestions, highlightedIndex, totalItems, showRecent, recentSearches, suggestionItems, searchQuery, navigateToSearch, router]
  );

  const clearSearch = () => {
    setSearchQuery("");
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const firstLetter = user?.firstName?.charAt(0)?.toUpperCase() || "U";

  const showDropdown = showSuggestions && (showRecent || suggestionItems.length > 0 || searchQuery.trim());

  return (
    <>
      <header className="bg-primary shadow-md sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-white tracking-wide shrink-0">
            Shopylib
          </Link>

          {/* Search Bar - Desktop */}
          <div ref={searchRef} className="hidden md:flex relative flex-1 max-w-xl mx-6">
            <form onSubmit={handleSearch} className="w-full flex bg-white rounded-lg overflow-hidden shadow-sm ring-1 ring-white/20 focus-within:ring-2 focus-within:ring-white/50 transition-all">
              <div className="flex flex-1 items-center">
                <FaSearch className="ml-4 w-3.5 h-3.5 text-gray-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  className="flex-1 px-3 py-2.5 text-gray-800 text-sm outline-none bg-transparent"
                  placeholder="Search for products, brands and more..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                    setHighlightedIndex(-1);
                  }}
                  onFocus={() => {
                    setShowSuggestions(true);
                    setRecentSearches(getRecentSearches());
                  }}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                />
                {searchQuery && (
                  <button type="button" onClick={clearSearch} className="p-1.5 mr-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100">
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button type="submit" className="px-4 text-primary hover:bg-gray-50 transition-colors border-l border-gray-100">
                <FaSearch className="w-4 h-4" />
              </button>
            </form>

            {/* Suggestions / Recent Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[28rem] overflow-y-auto z-50 animate-fadeIn">
                {/* Recent Searches (when input is empty) */}
                {showRecent && (
                  <>
                    <div className="px-4 pt-3 pb-1.5 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recent Searches</span>
                    </div>
                    {recentSearches.map((term, idx) => (
                      <div
                        key={term}
                        role="button"
                        tabIndex={0}
                        className={`flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors cursor-pointer ${
                          highlightedIndex === idx ? "bg-gray-50" : "hover:bg-gray-50"
                        }`}
                        onClick={() => navigateToSearch(term)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        onKeyDown={(e) => { if (e.key === "Enter") navigateToSearch(term); }}
                      >
                        <FiClock className="w-4 h-4 text-gray-300 shrink-0" />
                        <span className="text-sm text-gray-700 flex-1 truncate">{term}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRecentSearch(term);
                            setRecentSearches(getRecentSearches());
                          }}
                          className="p-1 text-gray-300 hover:text-red-400 transition-colors rounded-full"
                        >
                          <FiX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </>
                )}

                {/* Product Suggestions */}
                {!showRecent && suggestionItems.length > 0 && (
                  <>
                    {suggestionItems.map((item, idx) => (
                      <Link
                        key={item.id}
                        href={`/products/${item.slug}`}
                        className={`flex items-center gap-3 px-4 py-2.5 transition-colors border-b border-gray-50 last:border-0 ${
                          highlightedIndex === idx ? "bg-gray-50" : "hover:bg-gray-50"
                        }`}
                        onClick={() => { setShowSuggestions(false); setSearchQuery(""); setHighlightedIndex(-1); }}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                      >
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-gray-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <FaSearch className="w-3 h-3 text-gray-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                          <p className="text-xs text-gray-400 truncate">
                            {item.category && <span>{item.category}</span>}
                            {item.discount > 0 && <span className="text-red-500 font-semibold ml-1.5">-{item.discount}%</span>}
                            {!item.isInStock && <span className="text-red-400 ml-1.5">Out of stock</span>}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-bold text-gray-900">Rs. {item.price?.toLocaleString()}</span>
                          {item.comparePrice && item.comparePrice > item.price && (
                            <p className="text-xs text-gray-400 line-through">Rs. {item.comparePrice?.toLocaleString()}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </>
                )}

                {/* "Search for '...'" row */}
                {!showRecent && searchQuery.trim() && (
                  <button
                    className={`flex items-center gap-3 w-full px-4 py-3 text-left border-t border-gray-100 transition-colors ${
                      highlightedIndex === suggestionItems.length ? "bg-gray-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => navigateToSearch(searchQuery)}
                    onMouseEnter={() => setHighlightedIndex(suggestionItems.length)}
                  >
                    <FiTrendingUp className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm text-gray-600">
                      Search for <span className="font-semibold text-primary">&ldquo;{searchQuery}&rdquo;</span>
                    </span>
                    <FiArrowRight className="w-4 h-4 text-gray-300 ml-auto" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Actions - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {user?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="inline-flex items-center px-3 py-1.5 rounded-md bg-white text-amber-950 text-xs font-semibold hover:bg-amber-200 transition"
                  >
                    Switch to Seller
                  </Link>
                )}
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

        {/* Mobile Menu - Slide-in Overlay */}
        {mobileMenu && (
          <>
            {/* Backdrop */}
            <div className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setMobileMenu(false)} />

            {/* Panel */}
            <div className="md:hidden fixed top-0 right-0 h-full w-[85%] max-w-xs bg-white z-50 shadow-2xl animate-slideInRight flex flex-col">
              {/* Header */}
              <div className="bg-primary px-5 pt-6 pb-5 relative">
                <button onClick={() => setMobileMenu(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition">
                  <FiX className="w-5 h-5" />
                </button>
                {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg ring-2 ring-white/30 flex-shrink-0">
                      {user?.avatar?.url ? (
                        <img src={user.avatar.url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : firstLetter}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{user?.firstName} {user?.lastName}</p>
                      <p className="text-white/60 text-xs truncate">{user?.auth?.email || ""}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <FaUser className="w-5 h-5 text-white/70" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Welcome!</p>
                      <button onClick={() => { setPopup("login"); setMobileMenu(false); }} className="text-white/80 text-xs hover:text-white transition underline underline-offset-2">
                        Login or Sign Up
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Search */}
              <div className="px-4 py-3 border-b border-gray-100">
                <form onSubmit={(e) => { handleSearch(e); setMobileMenu(false); }} className="flex items-center bg-gray-50 rounded-xl overflow-hidden ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-blue-300 transition-all">
                  <FaSearch className="ml-3.5 w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <input type="text" className="flex-1 px-3 py-2.5 bg-transparent text-sm outline-none text-gray-800" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </form>
              </div>

              {/* Nav Links */}
              <nav className="flex-1 overflow-y-auto">
                {isAuthenticated && user?.role === "admin" && (
                  <div className="px-4 py-3 border-b border-gray-100">
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-semibold text-sm transition hover:bg-amber-100"
                      onClick={() => setMobileMenu(false)}
                    >
                      <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 text-sm">🏪</span>
                      Switch to Seller
                    </Link>
                  </div>
                )}

                <div className="py-2">
                  {(isAuthenticated ? [
                    { href: "/profile", icon: <FaUser className="w-4 h-4" />, label: "My Profile", color: "text-blue-500 bg-blue-50" },
                    { href: "/orders", icon: <FaShoppingBag className="w-4 h-4" />, label: "My Orders", color: "text-violet-500 bg-violet-50" },
                    { href: "/cart", icon: <FaShoppingBag className="w-4 h-4" />, label: "Cart", badge: cartCount, color: "text-emerald-500 bg-emerald-50" },
                    { href: "/wishlist", icon: <FaHeart className="w-4 h-4" />, label: "Wishlist", badge: wishlistCount, color: "text-rose-500 bg-rose-50" },
                    { href: "/reviews", icon: <FiTrendingUp className="w-4 h-4" />, label: "My Reviews", color: "text-amber-500 bg-amber-50" },
                  ] : []).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 mx-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setMobileMenu(false)}
                    >
                      <span className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                        {item.icon}
                      </span>
                      <span className="text-sm font-medium flex-1">{item.label}</span>
                      {item.badge > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold min-w-[20px] text-center">{item.badge}</span>
                      )}
                      <FiChevronDown className="w-4 h-4 text-gray-300 -rotate-90" />
                    </Link>
                  ))}
                </div>

                {/* Categories Quick Links */}
                <div className="px-4 py-3 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Browse</p>
                  <div className="space-y-1">
                    {[
                      { href: "/categories", label: "All Categories" },
                      { href: "/search", label: "Search Products" },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 text-sm transition-colors"
                        onClick={() => setMobileMenu(false)}
                      >
                        <FiArrowRight className="w-3.5 h-3.5 text-gray-400" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </nav>

              {/* Footer / Logout */}
              {isAuthenticated && (
                <div className="border-t border-gray-100 p-4">
                  <button
                    onClick={() => { logout.mutate(); setMobileMenu(false); }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </header>

      {/* Auth Popups */}
      {popup === "login" && <LoginForm closePopup={() => setPopup(null)} openSignupPopup={() => setPopup("signup")} forgotPasswordPopup={() => setPopup("forgot")} />}
      {popup === "signup" && <SignupForm closePopup={() => setPopup(null)} openLoginPopup={() => setPopup("login")} />}
      {popup === "forgot" && <ForgotPassword closePopup={() => setPopup(null)} openLoginPopup={() => setPopup("login")} />}
    </>
  );
}
