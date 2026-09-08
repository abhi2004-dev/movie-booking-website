import React from "react";
import Link from "next/link";
import { TextReveal } from "@/components/ui/TextReveal";

async function getMovieDetails(id: string) {
  const res = await fetch(`http://127.0.0.1:8000/movies/${id}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch movie");
  return res.json();
}

export default async function MovieDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const movie = await getMovieDetails(resolvedParams.id);

  return (
    <div className="py-12 max-w-5xl mx-auto px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <img 
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
          alt={movie.title} 
          className="w-full md:w-1/3 rounded-xl shadow-lg"
        />
        <div className="flex flex-col justify-center">
          <TextReveal text={movie.title} className="text-4xl font-bold text-primary mb-4" />
          <p className="text-secondary text-lg mb-6">{movie.overview}</p>
          <div className="flex gap-4 mb-8">
            <span className="px-3 py-1 bg-gray-100 text-sm font-medium rounded-full">⭐ {movie.vote_average}/10</span>
            <span className="px-3 py-1 bg-gray-100 text-sm font-medium rounded-full">{movie.release_date}</span>
          </div>
          <Link 
            href={`/movies/${resolvedParams.id}/shows`}
            className="w-fit px-8 py-3 bg-accent text-white rounded-full font-bold hover:opacity-90 transition-opacity"
          >
            Book Tickets
          </Link>
        </div>
      </div>
    </div>
  );
}