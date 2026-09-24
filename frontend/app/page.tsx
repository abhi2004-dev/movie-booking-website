"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";
import { 
  Search, 
  Sparkles, 
  Star, 
  Clock, 
  Calendar, 
  Play, 
  ShieldCheck, 
  Flame, 
  ChevronRight, 
  X,
  Filter,
  Film
} from "lucide-react";

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  overview?: string;
  release_date: string | null;
  vote_average?: number;
  runtime?: number;
  genres?: { id: number; name: string }[];
  genre?: string;
  tagline?: string;
  trailer_key?: string;
}

const GENRES = ["All", "Action", "Sci-Fi", "Adventure", "Animation", "Comedy", "Thriller", "Family"];

export function getPosterUrl(path?: string | null, fallback: string = "/posters/sonic_3.jpg"): string {
  if (!path) return fallback;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/posters/")) {
    return path;
  }
  if (path.includes("sonic") || path.includes("d8duY2VPh1A0G6i5gJ9f0O49xG5")) return "/posters/sonic_3.jpg";
  if (path.includes("deadpool") || path.includes("8cdWjvZQUExUUTzyp4t6EDMubfO")) return "/posters/deadpool.jpg";
  if (path.includes("dune") || path.includes("1pdfLvkbY9ohJlCjQH2CZjjYVvJ")) return "/posters/dune_2.jpg";
  if (path.includes("godzilla") || path.includes("bQ2ywkchIiaKLSEaMrcT6e29f91")) return "/posters/godzilla_kong.jpg";
  if (path.includes("inside") || path.includes("vpnVM9B6NMmQpWeZvzLvDESb2QY")) return "/posters/inside_out_2.jpg";
  if (path.includes("quiet") || path.includes("yrpPYK2qm9Le6J9G5s4o3Qc20xO")) return "/posters/quiet_place.jpg";
  if (path.includes("venom") || path.includes("aosm8Vh9yP6AcWW8QIKS6VWjIY")) return "/posters/venom_3.jpg";
  if (path.includes("wild") || path.includes("wTnV3PCVW5O92JMrvgZ0qj3n51Y")) return "/posters/wild_robot.jpg";
  if (path.includes("spiderman") || path.includes("spider")) return "/posters/spiderman.jpg";
  if (path.startsWith("/")) return path;
  return `/posters/${path}`;
}

const DEFAULT_MOVIES: Movie[] = [
  {
    id: 939243,
    title: "Sonic the Hedgehog 3",
    overview: "Sonic, Knuckles, and Tails reunite against a powerful new adversary, Shadow, a mysterious villain with powers unlike anything they have faced before.",
    poster_path: "/posters/sonic_3.jpg",
    backdrop_path: "/posters/sonic_3.jpg",
    release_date: "2024-12-20",
    vote_average: 7.8,
    runtime: 110,
    genres: [{ id: 28, name: "Action" }, { id: 12, name: "Adventure" }, { id: 878, name: "Sci-Fi" }],
    tagline: "Try to keep up.",
    trailer_key: "qSu6i2iFMO0"
  },
  {
    id: 533535,
    title: "Deadpool & Wolverine",
    overview: "A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again.",
    poster_path: "/posters/deadpool.jpg",
    backdrop_path: "/posters/deadpool.jpg",
    release_date: "2024-07-26",
    vote_average: 8.1,
    runtime: 128,
    genres: [{ id: 28, name: "Action" }, { id: 35, name: "Comedy" }, { id: 878, name: "Sci-Fi" }],
    tagline: "Come together.",
    trailer_key: "73_1biulkYk"
  },
  {
    id: 693134,
    title: "Dune: Part Two",
    overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.",
    poster_path: "/posters/dune_2.jpg",
    backdrop_path: "/posters/dune_2.jpg",
    release_date: "2024-03-01",
    vote_average: 8.5,
    runtime: 166,
    genres: [{ id: 878, name: "Sci-Fi" }, { id: 12, name: "Adventure" }],
    tagline: "Long live the fighters.",
    trailer_key: "Way9Dexny3w"
  },
  {
    id: 823464,
    title: "Godzilla x Kong: The New Empire",
    overview: "Following their explosive showdown, Godzilla and Kong must reunite against a colossal undiscovered threat hidden within our world, challenging their very existence.",
    poster_path: "/posters/godzilla_kong.jpg",
    backdrop_path: "/posters/godzilla_kong.jpg",
    release_date: "2024-03-29",
    vote_average: 7.3,
    runtime: 115,
    genres: [{ id: 28, name: "Action" }, { id: 878, name: "Sci-Fi" }, { id: 12, name: "Adventure" }],
    tagline: "Rise together or fall alone.",
    trailer_key: "lV1OOlGwExM"
  },
  {
    id: 1022789,
    title: "Inside Out 2",
    overview: "Teenager Riley's mind headquarters is undergoing a sudden demolition to make room for something entirely unexpected: new Emotions! Joy, Sadness, Anger, Fear and Disgust face Anxiety and company.",
    poster_path: "/posters/inside_out_2.jpg",
    backdrop_path: "/posters/inside_out_2.jpg",
    release_date: "2024-06-14",
    vote_average: 7.9,
    runtime: 96,
    genres: [{ id: 16, name: "Animation" }, { id: 10751, name: "Family" }, { id: 35, name: "Comedy" }],
    tagline: "Make room for new emotions.",
    trailer_key: "LEjhY15eCx0"
  },
  {
    id: 762441,
    title: "A Quiet Place: Day One",
    overview: "As New York City is invaded by alien creatures with ultrasonic hearing, a woman named Sam must fight to survive alongside an unlikely companion and her cat Frodo.",
    poster_path: "/posters/quiet_place.jpg",
    backdrop_path: "/posters/quiet_place.jpg",
    release_date: "2024-06-28",
    vote_average: 7.1,
    runtime: 99,
    genres: [{ id: 27, name: "Horror" }, { id: 878, name: "Sci-Fi" }, { id: 53, name: "Thriller" }],
    tagline: "Hear how it all began.",
    trailer_key: "YPY7J-flzE8"
  },
  {
    id: 912649,
    title: "Venom: The Last Dance",
    overview: "Eddie and Venom are on the run. Hunted by both of their worlds and with the net closing in, the duo are forced into a devastating decision that will bring the curtains down on their final dance.",
    poster_path: "/posters/venom_3.jpg",
    backdrop_path: "/posters/venom_3.jpg",
    release_date: "2024-10-25",
    vote_average: 7.4,
    runtime: 109,
    genres: [{ id: 28, name: "Action" }, { id: 878, name: "Sci-Fi" }],
    tagline: "Till death do them part.",
    trailer_key: "__2bjWbetsA"
  },
  {
    id: 1184918,
    title: "The Wild Robot",
    overview: "After a shipwreck, an intelligent robot named Roz is stranded on an uninhabited island. To survive the harsh environment, Roz bonds with the island's animals and cares for an orphaned baby goose.",
    poster_path: "/posters/wild_robot.jpg",
    backdrop_path: "/posters/wild_robot.jpg",
    release_date: "2024-09-27",
    vote_average: 8.4,
    runtime: 102,
    genres: [{ id: 16, name: "Animation" }, { id: 878, name: "Sci-Fi" }, { id: 10751, name: "Family" }],
    tagline: "Discover your true nature.",
    trailer_key: "67vbA5ZJb3s"
  }
];

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>(DEFAULT_MOVIES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedSort, setSelectedSort] = useState<"rating" | "popular" | "date">("popular");
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [trailerModalKey, setTrailerModalKey] = useState<string | null>(null);

  useEffect(() => {
    async function loadMovies() {
      try {
        const res = await fetch(getApiUrl("/movies/search"));
        if (res && res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setMovies(data);
          }
        }
      } catch (err) {
        console.warn("Using fallback catalog:", err);
      }
    }
    loadMovies();
  }, []);


  // Filter and sort movies
  const filteredMovies = useMemo(() => {
    return movies
      .filter((movie) => {
        const matchesQuery = searchQuery.trim() === "" || 
          movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (movie.overview && movie.overview.toLowerCase().includes(searchQuery.toLowerCase()));

        const movieGenres = movie.genres?.map(g => g.name) || (movie.genre ? movie.genre.split(", ") : []);
        const matchesGenre = selectedGenre === "All" || movieGenres.includes(selectedGenre);

        return matchesQuery && matchesGenre;
      })
      .sort((a, b) => {
        if (selectedSort === "rating") {
          return (b.vote_average || 0) - (a.vote_average || 0);
        }
        if (selectedSort === "date") {
          return (b.release_date || "").localeCompare(a.release_date || "");
        }
        return (b.vote_average || 0) * 10 - (a.vote_average || 0) * 10;
      });
  }, [movies, searchQuery, selectedGenre, selectedSort]);

  const heroMovies = movies.slice(0, 4);
  const currentHero = heroMovies[activeHeroIndex] || movies[0];

  // Auto-rotate hero spotlight
  useEffect(() => {
    if (heroMovies.length <= 1) return;
    const interval = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % heroMovies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroMovies.length]);

  return (
    <div className="pb-24">
      {/* 1. Cinematic Hero Spotlight Section */}
      {currentHero && (
        <section className="relative w-full min-h-[560px] lg:min-h-[640px] flex items-center justify-center overflow-hidden border-b border-white/[0.06]">
          {/* Backdrop Image with Gradient Blends */}
          <div className="absolute inset-0 z-0">
            {currentHero.backdrop_path ? (
              <img
                src={getPosterUrl(currentHero.backdrop_path)}
                alt={currentHero.title}
                onError={(e) => {
                  e.currentTarget.src = "/posters/sonic_3.jpg";
                }}
                className="w-full h-full object-cover object-center scale-105 transition-all duration-1000 filter brightness-[0.38] contrast-125"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-[#090B10] via-[#101526] to-[#182038]"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090B10] via-[#090B10]/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#090B10] via-[#090B10]/80 to-transparent"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 w-full flex flex-col md:flex-row items-center justify-between gap-10">
            
            {/* Left Column: Hero Content */}
            <div className="max-w-2xl space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold tracking-wide">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Spotlight Premiere</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                {currentHero.title}
              </h1>

              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {currentHero.vote_average?.toFixed(1) || "8.4"}/10
                </span>

                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08]">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  {currentHero.runtime || 120} Mins
                </span>

                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08]">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  {currentHero.release_date?.split("-")[0] || "2024"}
                </span>

                <span className="px-3 py-1 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 uppercase text-[11px] font-bold">
                  IMAX 3D & Dolby Atmos
                </span>
              </div>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-3 max-w-xl">
                {currentHero.overview}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href={`/movies/${currentHero.id}`}
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:opacity-90 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/40 flex items-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <Film className="w-4 h-4" />
                  <span>Book Tickets Now</span>
                </Link>

                {currentHero.trailer_key && (
                  <button
                    onClick={() => setTrailerModalKey(currentHero.trailer_key || null)}
                    className="px-6 py-3.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-white font-bold text-sm flex items-center gap-2 transition-all"
                  >
                    <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>Watch Trailer</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Hero Poster Preview */}
            <div className="hidden md:block shrink-0">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-amber-500 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition duration-500"></div>
                <img
                  src={getPosterUrl(currentHero.poster_path)}
                  alt={currentHero.title}
                  onError={(e) => {
                    e.currentTarget.src = "/posters/sonic_3.jpg";
                  }}
                  className="relative w-56 lg:w-64 rounded-2xl shadow-2xl object-cover border border-white/10"
                />
              </div>
            </div>
          </div>

          {/* Carousel Selector Indicators */}
          {heroMovies.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {heroMovies.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveHeroIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeHeroIndex === idx ? "w-8 bg-indigo-500" : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 2. Search & Filter Bar Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 relative z-20">
        <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-white/10 shadow-2xl space-y-4">
          
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies by title, actor, or keyword..."
                className="w-full pl-12 pr-10 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 self-end md:self-auto shrink-0 w-full md:w-auto">
              <span className="text-xs font-semibold text-slate-400">Sort By:</span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value as any)}
                className="px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white text-xs font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="popular" className="bg-[#12182B] text-white">Most Popular</option>
                <option value="rating" className="bg-[#12182B] text-white">Highest Rated</option>
                <option value="date" className="bg-[#12182B] text-white">Release Date</option>
              </select>
            </div>
          </div>

          {/* Genre Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-xs font-semibold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-indigo-400" /> Genre:
            </span>
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                  selectedGenre === g
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Movie Catalog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Now Showing in Theatres</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold">
                {filteredMovies.length} Available
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Book tickets with real-time seat locks across IMAX, Dolby Cinema, and VIP Lounges
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="rounded-2xl bg-white/[0.03] border border-white/5 aspect-[2/3] animate-pulse"></div>
            ))}
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="py-24 text-center glass-panel rounded-3xl border border-white/10 p-8">
            <Film className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No Movies Found</h3>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or genre filter.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedGenre("All");
              }}
              className="mt-4 px-5 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => {
              const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "7.5";
              const year = movie.release_date ? movie.release_date.split("-")[0] : "2024";

              return (
                <Link
                  key={movie.id}
                  href={`/movies/${movie.id}`}
                  className="group flex flex-col rounded-2xl bg-[#101524] border border-white/[0.06] hover:border-indigo-500/40 p-3 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-950/50"
                >
                  {/* Poster Thumbnail */}
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-slate-900 mb-3 border border-white/5">
                    <img
                      src={getPosterUrl(movie.poster_path)}
                      alt={movie.title}
                      onError={(e) => {
                        e.currentTarget.src = "/posters/sonic_3.jpg";
                      }}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Top Overlay Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-amber-400 text-[11px] font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {rating}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-950/80 backdrop-blur-md border border-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase">
                        IMAX
                      </span>
                    </div>

                    {/* Quick Book Hover CTA */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold text-center shadow-lg shadow-indigo-600/40 flex items-center justify-center gap-1.5">
                        <span>Book Seats</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>

                  {/* Movie Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-white truncate group-hover:text-indigo-400 transition-colors">
                        {movie.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {movie.genres?.map(g => g.name).join(", ") || movie.genre || "Action, Sci-Fi"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-white/[0.04]">
                      <span>{year}</span>
                      <span className="text-indigo-300 font-semibold">{movie.runtime || 120}m</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Trailer Modal */}
      {trailerModalKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="relative w-full max-w-3xl aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10">
            <button
              onClick={() => setTrailerModalKey(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${trailerModalKey}?autoplay=1`}
              title="Official Trailer"
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