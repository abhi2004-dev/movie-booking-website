import { TextReveal } from "@/components/ui/TextReveal";
import Link from "next/link";

async function getMovieDetails(id: string) {
  const res = await fetch(`http://127.0.0.1:8000/movies/${id}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch movie");
  return res.json();
}

export default async function MovieDetails({ params }: { params: { id: string } }) {
  const movie = await getMovieDetails(params.id);

  return (
    <div className="py-8 max-w-5xl mx-auto">
      <Link href="/" className="inline-block mb-6 px-4 py-2 rounded-full bg-gray-100 text-sm font-medium text-primary hover:bg-gray-200 transition-colors">
        ← Back to Movies
      </Link>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 shrink-0">
          {movie.poster_path ? (
            <img 
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
              alt={movie.title} 
              className="w-full rounded-xl shadow-sm"
            />
          ) : (
            <div className="w-full aspect-[2/3] bg-gray-200 rounded-xl"></div>
          )}
        </div>
        
        <div className="w-full md:w-2/3 flex flex-col justify-center">
          <TextReveal text={movie.title} className="text-4xl md:text-5xl font-bold text-primary mb-4" />
          
          <div className="flex flex-wrap gap-2 mb-6">
            {movie.genres?.map((g: any) => (
              <span key={g.id} className="px-3 py-1 bg-gray-100 text-secondary rounded-full text-sm font-medium">
                {g.name}
              </span>
            ))}
            {movie.runtime && (
              <span className="px-3 py-1 bg-gray-100 text-secondary rounded-full text-sm font-medium">
                {movie.runtime} min
              </span>
            )}
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-bold text-primary mb-2">Synopsis</h3>
            <p className="text-secondary leading-relaxed">{movie.overview}</p>
          </div>
          
          <div className="mt-auto p-6 bg-accent/5 rounded-xl border border-accent/10">
            <h3 className="text-lg font-bold text-primary mb-2">Book Tickets</h3>
            <p className="text-secondary mb-4 text-sm">Select a date and theatre to view available seats.</p>
            <button className="px-6 py-3 bg-accent text-white rounded-full font-bold shadow-sm hover:opacity-90 transition-opacity w-full sm:w-auto">
              View Showtimes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}