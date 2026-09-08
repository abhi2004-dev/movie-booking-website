import React from "react";
import Link from "next/link";
import { TextReveal } from "@/components/ui/TextReveal";

// Simulating fetching shows for a specific movie from the backend
async function getMovieShows(movieId: string) {
  // In a full implementation, you would fetch from: /movies/${movieId}/shows
  // For the MVP, we are hardcoding the successful seed data (Show ID 2)
  return [
    {
      theatre_name: "Starpass Multiplex",
      screen_name: "Screen 1",
      shows: [
        { id: 2, time: "06:00 PM", language: "English" },
      ]
    }
  ];
}

export default async function ShowsSelection({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const theatres = await getMovieShows(resolvedParams.id);

  return (
    <div className="py-12 max-w-4xl mx-auto px-4">
      <TextReveal text="Select Theatre & Show" className="text-3xl font-bold text-primary mb-8 text-center" />
      
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
    </div>
  );
}