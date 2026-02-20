import React from "react";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Shopylib</h2>
            <p className="text-sm leading-relaxed mb-4">
              Your one-stop shop for quality products at competitive prices. Shop with confidence.
            </p>
            <div className="flex gap-3">
              {[FaFacebook, FaInstagram, FaTwitter, FaYoutube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/", label: "Home" },
                { href: "/categories", label: "Categories" },
                { href: "/search", label: "Search Products" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white transition">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-white font-semibold mb-4">My Account</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/profile", label: "Profile" },
                { href: "/orders", label: "My Orders" },
                { href: "/wishlist", label: "Wishlist" },
                { href: "/cart", label: "Cart" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white transition">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <FaMapMarkerAlt className="w-4 h-4 text-primary-light" />
                Kathmandu, Nepal
              </li>
              <li className="flex items-center gap-2">
                <FaPhone className="w-4 h-4 text-primary-light" />
                +977-9800000000
              </li>
              <li className="flex items-center gap-2">
                <FaEnvelope className="w-4 h-4 text-primary-light" />
                support@shopylib.com
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>&copy; {year} Shopylib. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
