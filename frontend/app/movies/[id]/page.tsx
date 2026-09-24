"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Star, 
  Clock, 
  Calendar as CalendarIcon, 
  MapPin, 
  Play, 
  ArrowLeft, 
  Film, 
  Sparkles, 
  ChevronRight, 
  X,
  Volume2,
  Tv
} from "lucide-react";
import { getPosterUrl } from "@/app/page";
import { getApiUrl } from "@/lib/api";

interface ShowTime {
  id: number;
  time: string;
  date: string;
  screen_id: number;
  screen_name: string;
  format: string;
  base_price: number;
  language: string;
}

interface TheatreShows {
  theatre_id: number;
  theatre_name: string;
  city: string;
  address: string;
  screen_name: string;
  shows: ShowTime[];
}

interface MovieDetail {
  id: number;
  title: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  vote_average?: number;
  runtime?: number;
  genres?: { id: number; name: string }[];
  genre?: string;
  tagline?: string;
  language?: string;
  trailer_key?: string;
}

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = params.id as string;

  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [theatres, setTheatres] = useState<TheatreShows[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedFormat, setSelectedFormat] = useState<string>("All");
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);

  // Generate 6 upcoming days for the interactive date picker
  const dates = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dayName: i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" }),
      dateNum: d.getDate(),
      month: d.toLocaleDateString("en-US", { month: "short" }),
      fullDateStr: d.toISOString().split("T")[0],
    };
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [movieRes, showsRes] = await Promise.all([
          fetch(getApiUrl(`/movies/${movieId}`)),
          fetch(getApiUrl(`/movies/${movieId}/shows`))
        ]);

        if (movieRes && movieRes.ok) {
          const mData = await movieRes.json();
          setMovie(mData);
        }
        if (showsRes && showsRes.ok) {
          const sData = await showsRes.json();
          setTheatres(sData);
        }
      } catch (err) {
        console.error("Failed to load movie details:", err);
      } finally {
        setLoading(false);
      }
    }
    if (movieId) {
      fetchData();
    }
  }, [movieId]);

  if (loading) {
    return (
      <div className="py-24 max-w-7xl mx-auto px-4 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400 font-semibold text-sm">Loading movie details & showtimes...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="py-24 max-w-md mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Movie Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">We couldn't retrieve the showtimes for this title.</p>
        <Link href="/" className="px-6 py-2.5 rounded-full bg-indigo-600 text-white text-xs font-bold">
          Back to Movies
        </Link>
      </div>
    );
  }

  const movieGenres = movie.genres?.map(g => g.name).join(", ") || movie.genre || "Action, Adventure, Sci-Fi";

  return (
    <div className="pb-32">
      
      {/* 1. Backdrop Hero Header */}
      <section className="relative w-full min-h-[460px] lg:min-h-[520px] flex items-end overflow-hidden border-b border-white/[0.06]">
        {/* Backdrop image */}
        <div className="absolute inset-0 z-0">
          {movie.backdrop_path ? (
            <img
              src={getPosterUrl(movie.backdrop_path)}
              alt={movie.title}
              onError={(e) => {
                e.currentTarget.src = "/posters/sonic_3.jpg";
              }}
              className="w-full h-full object-cover object-center filter brightness-[0.32] contrast-125 scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-[#090B10] via-[#101526] to-[#182038]"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090B10] via-[#090B10]/70 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#090B10] via-[#090B10]/90 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full">
          {/* Back button */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-slate-300 hover:text-white transition-colors mb-6 backdrop-blur-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Now Showing</span>
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
            {/* Poster Card */}
            <div className="relative shrink-0 group">
              <img
                src={getPosterUrl(movie.poster_path)}
                alt={movie.title}
                onError={(e) => {
                  e.currentTarget.src = "/posters/sonic_3.jpg";
                }}
                className="w-44 sm:w-56 rounded-2xl shadow-2xl object-cover border border-white/10"
              />
              {movie.trailer_key && (
                <button
                  onClick={() => setTrailerModalOpen(true)}
                  className="absolute inset-0 bg-black/50 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-1.5 text-white font-bold text-xs"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 fill-white text-white translate-x-0.5" />
                  </div>
                  <span>Play Trailer</span>
                </button>
              )}
            </div>

            {/* Movie Info */}
            <div className="space-y-4 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 text-xs font-bold uppercase">
                  Now Booking
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {movie.vote_average ? movie.vote_average.toFixed(1) : "8.2"}/10
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {movie.title}
              </h1>

              {movie.tagline && (
                <p className="text-sm font-medium italic text-indigo-300">
                  "{movie.tagline}"
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  {movie.runtime || 120} Minutes
                </span>
                <span>•</span>
                <span>{movieGenres}</span>
                <span>•</span>
                <span>{movie.language || "English"}</span>
                <span>•</span>
                <span>{movie.release_date?.split("-")[0] || "2024"}</span>
              </div>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
                {movie.overview}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Date Selector Toolbar */}
      <section className="sticky top-20 z-40 w-full glass-panel border-b border-white/[0.06] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Dates Row */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 no-scrollbar">
            {dates.map((d, idx) => (
              <button
                key={d.fullDateStr}
                onClick={() => setSelectedDateIndex(idx)}
                className={`flex flex-col items-center px-4 py-2 rounded-2xl text-center shrink-0 transition-all ${
                  selectedDateIndex === idx
                    ? "bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 scale-105 border border-indigo-400/30"
                    : "bg-white/[0.03] text-slate-300 hover:bg-white/[0.07] border border-white/[0.06]"
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-slate-400">{d.dayName}</span>
                <span className="text-base font-extrabold text-white leading-none my-0.5">{d.dateNum}</span>
                <span className="text-[10px] font-semibold text-slate-400">{d.month}</span>
              </button>
            ))}
          </div>

          {/* Format Filter */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <span className="text-xs font-semibold text-slate-400">Format:</span>
            {["All", "IMAX 3D", "Dolby Atmos"].map((fmt) => (
              <button
                key={fmt}
                onClick={() => setSelectedFormat(fmt)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedFormat === fmt
                    ? "bg-indigo-600/30 border border-indigo-500 text-indigo-200"
                    : "bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-white"
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Theatres & Showtimes Listing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Available Theatres & Showtimes
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Showing schedules for <span className="text-indigo-400 font-semibold">{dates[selectedDateIndex].dayName}, {dates[selectedDateIndex].month} {dates[selectedDateIndex].dateNum}</span>
          </p>
        </div>

        {theatres.length === 0 ? (
          <div className="p-12 text-center glass-panel rounded-3xl border border-white/10">
            <Film className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-white">No Shows Scheduled</h3>
            <p className="text-xs text-slate-400 mt-1">Please check upcoming dates or select a different cinema venue.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {theatres.map((theatre) => {
              // Filter shows by format if selected
              const visibleShows = theatre.shows.filter(show => 
                selectedFormat === "All" || show.format.includes(selectedFormat)
              );

              if (visibleShows.length === 0) return null;

              return (
                <div
                  key={theatre.theatre_id}
                  className="rounded-3xl bg-[#101524] border border-white/[0.06] p-6 sm:p-7 shadow-xl space-y-5 transition-all hover:border-indigo-500/20"
                >
                  {/* Theatre Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/[0.06]">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                        <span>{theatre.theatre_name}</span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          M-Ticket Available
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{theatre.address}, {theatre.city}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Tv className="w-3.5 h-3.5 text-indigo-400" /> 4K Laser Projection
                      </span>
                      <span className="flex items-center gap-1">
                        <Volume2 className="w-3.5 h-3.5 text-amber-400" /> Dolby Atmos 7.1
                      </span>
                    </div>
                  </div>

                  {/* Showtimes Grid */}
                  <div>
                    <p className="text-[11px] uppercase font-bold text-slate-400 mb-3 tracking-wider">
                      Select Showtime to Pick Seats:
                    </p>
                    
                    <div className="flex flex-wrap gap-3.5">
                      {visibleShows.map((show) => (
                        <Link
                          key={show.id}
                          href={`/shows/${show.id}`}
                          className="group p-3.5 rounded-2xl bg-white/[0.03] hover:bg-indigo-600 border border-white/[0.08] hover:border-indigo-500 text-center transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-indigo-600/30 min-w-[130px]"
                        >
                          <p className="font-extrabold text-base text-white group-hover:text-white transition-colors">
                            {show.time}
                          </p>
                          <p className="text-[10px] font-bold text-indigo-300 group-hover:text-indigo-100 uppercase tracking-wide mt-0.5">
                            {show.format}
                          </p>
                          <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-white">
                            <span>From</span>
                            <span className="font-bold text-emerald-400 group-hover:text-white">${show.base_price.toFixed(0)}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Trailer Modal */}
      {trailerModalOpen && movie.trailer_key && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="relative w-full max-w-3xl aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10">
            <button
              onClick={() => setTrailerModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${movie.trailer_key}?autoplay=1`}
              title="Official Movie Trailer"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}