"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { getApiUrl } from "@/lib/api";
import { 
  Film, 
  MapPin, 
  Ticket, 
  User as UserIcon, 
  LogOut, 
  ChevronDown, 
  Sparkles, 
  ShieldCheck, 
  Zap,
  Menu,
  X
} from "lucide-react";

const CITIES = [
  { name: "New York", state: "NY", theatres: 3 },
  { name: "San Francisco", state: "CA", theatres: 2 },
  { name: "Los Angeles", state: "CA", theatres: 2 },
  { name: "Chicago", state: "IL", theatres: 1 },
  { name: "Austin", state: "TX", theatres: 1 },
  { name: "London", state: "UK", theatres: 2 },
];

export function Navbar() {
  const { user, isAuthenticated, logout, demoLogin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [selectedCity, setSelectedCity] = useState("New York");
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiOnline, setApiOnline] = useState(true);

  // Check API status periodically
  useEffect(() => {
    fetch(getApiUrl("/health"))
      .then((res) => res && res.ok ? setApiOnline(true) : setApiOnline(false))
      .catch(() => setApiOnline(false));
  }, []);

  const navLinks = [
    { name: "Movies", href: "/" },
    { name: "My Tickets", href: "/profile" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 p-[1.5px] shadow-lg shadow-indigo-600/30 group-hover:shadow-indigo-500/50 transition-all duration-300">
                <div className="w-full h-full bg-[#0A0D15] rounded-[10px] flex items-center justify-center">
                  <Film className="w-5 h-5 text-indigo-400 group-hover:text-amber-300 transition-colors" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent lowercase leading-none">
                  starpass
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-400/90 flex items-center gap-1 mt-0.5">
                  Cinema Club <Sparkles className="w-2.5 h-2.5" />
                </span>
              </div>
            </Link>

            {/* City Selector Pill */}
            <button
              onClick={() => setCityModalOpen(true)}
              className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-300 hover:text-white transition-all"
            >
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>{selectedCity}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          {/* Center Navigation Links (Pill Style from District Spec) */}
          <nav className="hidden md:flex items-center bg-white/[0.03] p-1.5 rounded-full border border-white/[0.08] shadow-inner">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/30"
                      : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Menu: API Status & User Controls */}
          <div className="flex items-center gap-3">
            {/* Live Concurrency Status Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-Double-Book Engine</span>
            </div>

            {/* Auth Buttons / User Profile */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] text-xs font-semibold text-white transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-amber-400 flex items-center justify-center text-[#0A0D15] font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#141A2E] border border-white/10 shadow-2xl p-2 z-50 animate-[slideUp_0.15s_ease-out]">
                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-semibold text-amber-400">
                        <Sparkles className="w-2.5 h-2.5" /> Starpass VIP Tier
                      </div>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-white/[0.08] transition-colors"
                    >
                      <Ticket className="w-4 h-4 text-indigo-400" />
                      <span>My Tickets & Bookings</span>
                    </Link>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                        router.push("/");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    await demoLogin();
                    router.push("/profile");
                  }}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all shadow-sm"
                  title="Instant 1-click test login"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>1-Click Demo</span>
                </button>

                <Link
                  href="/login"
                  className="px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-white/[0.05] text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-6 border-t border-white/5 bg-[#0C101C] flex flex-col gap-3">
            <button
              onClick={() => {
                setCityModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.04] text-xs font-medium text-slate-200"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span>City: {selectedCity}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] text-sm font-semibold text-slate-200"
              >
                {link.name}
              </Link>
            ))}

            {!isAuthenticated && (
              <button
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await demoLogin();
                  router.push("/profile");
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-xs"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Instant 1-Click Demo Login</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* City Selection Modal */}
      {cityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#12182B] border border-white/10 p-6 shadow-2xl animate-[slideUp_0.2s_ease-out]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-lg text-white">Select Your City</h3>
              </div>
              <button
                onClick={() => setCityModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-6">
              Select a city to discover Starpass IMAX and Dolby Cinema showtimes near you.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {CITIES.map((city) => (
                <button
                  key={city.name}
                  onClick={() => {
                    setSelectedCity(city.name);
                    setCityModalOpen(false);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    selectedCity === city.name
                      ? "bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-300 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <p className="font-bold text-sm">{city.name}</p>
                  <p className="text-[11px] text-slate-400">{city.theatres} Premium Venues</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
