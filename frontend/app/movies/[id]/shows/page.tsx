import React from "react";
import Link from "next/link";
import { TextReveal } from "@/components/ui/TextReveal";

// Fetching actual schedules from our PostgreSQL database via FastAPI
async function getMovieShows(movieId: string) {
  const res = await fetch(`http://127.0.0.1:8000/movies/${movieId}/shows`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch shows");
  return res.json();
}

// Define TypeScript interfaces for our expected backend response
interface Show {
  id: number;
  time: string;
  language: string;
}

interface TheatreShows {
  theatre_name: string;
  screen_name: string;
  shows: Show[];
}

export default async function ShowsSelection({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const theatres: TheatreShows[] = await getMovieShows(resolvedParams.id);

  return (
    <div className="py-12 max-w-4xl mx-auto px-4">
      <TextReveal text="Select Theatre & Show" className="text-3xl font-bold text-primary mb-8 text-center" />
      
      {theatres.length === 0 ? (
        <p className="text-center text-secondary">No shows currently scheduled for this movie.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {theatres.map((theatre, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-primary mb-1">{theatre.theatre_name}</h2>
              <p className="text-sm text-secondary mb-4">{theatre.screen_name}</p>
              
              <div className="flex flex-wrap gap-4">
                {theatre.shows.map(show => (
                  <Link 
                    key={show.id} 
                    href={`/shows/${show.id}`}
                    className="px-6 py-2 border-2 border-accent text-accent rounded-md font-medium hover:bg-accent hover:text-white transition-colors"
                  >
                    {show.time}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}