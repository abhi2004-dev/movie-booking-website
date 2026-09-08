import React from "react";
import Link from "next/link";
import { TextReveal } from "@/components/ui/TextReveal";

async function getMovies() {
  // Fetching the movie catalog from our backend search route
  const res = await fetch(`http://127.0.0.1:8000/movies/search`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch movies catalog");
  return res.json();
}

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string | null;
}

export default async function HomePage() {
  const movies: Movie[] = await getMovies();

  return (
    <div className="py-12 max-w-7xl mx-auto px-4">
      <TextReveal text="Now Showing" className="text-4xl font-bold text-primary mb-8" />
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <Link key={movie.id} href={`/movies/${movie.id}`} className="group flex flex-col gap-2">
            <div className="overflow-hidden rounded-xl shadow-sm border border-gray-100 transition-transform group-hover:-translate-y-1 group-hover:shadow-md">
              {movie.poster_path ? (
                <img 
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                  alt={movie.title}
                  className="w-full h-auto aspect-[2/3] object-cover"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-gray-200 flex items-center justify-center text-gray-400">
                  No Poster
                </div>
              )}
            </div>
            <h3 className="font-bold text-primary truncate group-hover:text-accent transition-colors">
              {movie.title}
            </h3>
            {movie.release_date && (
              <p className="text-sm text-secondary">{movie.release_date.split("-")[0]}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}