import React from "react";
import Link from "next/link";
import { TextReveal } from "@/components/ui/TextReveal";

async function getMovieDetails(id: string) {
  const res = await fetch(`http://127.0.0.1:8000/movies/${id}`, { 
    next: { revalidate: 3600 } 
  });
  if (!res.ok) throw new Error("Failed to fetch movie details");
  return res.json();
}

export default async function MovieDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const movie = await getMovieDetails(resolvedParams.id);

  return (
    <div className="py-12 max-w-5xl mx-auto px-6">
      <div className="flex flex-col md:flex-row gap-12 items-start">
        {movie.poster_path ? (
          <img 
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
            alt={movie.title} 
            className="w-full md:w-1/3 rounded-2xl shadow-xl border border-gray-100"
          />
        ) : (
          <div className="w-full md:w-1/3 aspect-[2/3] bg-gray-200 rounded-2xl flex items-center justify-center text-secondary">
            No Poster
          </div>
        )}
        
        <div className="flex-1">
          <TextReveal text={movie.title} className="text-4xl md:text-5xl font-extrabold text-primary mb-6" />
          
          <div className="flex gap-4 mb-6 text-sm font-medium text-secondary">
            <span className="bg-gray-100 px-3 py-1 rounded-full">{movie.release_date?.split('-')[0] || "TBA"}</span>
            <span className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1">
              ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : "NR"}
            </span>
          </div>

          <p className="text-lg text-secondary leading-relaxed mb-10">
            {movie.overview || "No synopsis available for this title."}
          </p>
          
          {/* Hardcoded to show 2 to connect to our MVP seeded data */}
          <Link 
            href="/shows/2" 
            className="px-10 py-4 bg-accent text-white rounded-full font-bold text-lg shadow-md transition-all hover:shadow-lg hover:scale-105 inline-block"
          >
            Check Available Shows
          </Link>
        </div>
      </div>
    </div>
  );
}