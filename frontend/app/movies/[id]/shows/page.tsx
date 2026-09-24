import React from "react";
import Link from "next/link";
import { TextReveal } from "@/components/ui/TextReveal";

interface ShowTime {
  id: number;
  time: string;
  language: string;
}

interface TheatreShows {
  theatre_name: string;
  screen_name: string;
  shows: ShowTime[];
}

async function getShows(id: string) {
  const res = await fetch(`http://127.0.0.1:8000/movies/${id}/shows`, { cache: 'no-store' });
  if (!res.ok) {
    return [];
  }
  return res.json();
}

export default async function ShowsSelectionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const theatres: TheatreShows[] = await getShows(resolvedParams.id);

  return (
    <div className="py-12 max-w-5xl mx-auto px-4">
      <TextReveal text="Select Theatre & Time" className="text-3xl font-bold text-gray-900 mb-8" />
      
      {theatres.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No shows available for this movie right now.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {theatres.map((theatre, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">{theatre.theatre_name}</h2>
                <p className="text-sm text-gray-500">{theatre.screen_name}</p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                {theatre.shows.map((show) => (
                  <Link 
                    key={show.id}
                    href={`/shows/${show.id}`}
                    className="px-6 py-2 border border-purple-200 text-purple-700 font-medium rounded-full hover:bg-purple-50 transition-colors text-center"
                  >
                    <span className="block text-lg">{show.time}</span>
                    <span className="block text-xs text-purple-400 mt-0.5">{show.language}</span>
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