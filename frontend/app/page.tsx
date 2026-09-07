import Link from "next/link";
import { HoverCard } from "@/components/ui/HoverCard";
import { TextReveal } from "@/components/ui/TextReveal";

async function getMovies() {
  try {
    const res = await fetch("http://127.0.0.1:8000/movies/search", { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    return [];
  }
}

export default async function Home() {
  const movies = await getMovies();

  return (
    <div className="py-12">
      <TextReveal text="Now Showing" className="text-4xl font-bold mb-2 text-primary" />
      <p className="text-secondary mb-8">Browse the latest movies playing near you.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {movies.map((movie: any) => {
          // Capture the correct identifier regardless of backend schema mapping
          const movieId = movie.tmdb_id || movie.id;
          
          return (
            <Link href={`/movies/${movieId}`} key={movieId}>
              <HoverCard className="flex flex-col gap-3 h-full">
                {movie.poster_path ? (
                  <img 
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                    alt={movie.title} 
                    className="w-full h-72 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-72 bg-gray-200 rounded-lg flex items-center justify-center text-secondary text-sm">No Poster</div>
                )}
                <div className="mt-auto">
                  <h2 className="font-bold text-lg leading-tight text-primary line-clamp-1">{movie.title}</h2>
                  <p className="text-sm text-secondary">{movie.release_date ? movie.release_date.split('-')[0] : "TBA"}</p>
                </div>
              </HoverCard>
            </Link>
          );
        })}
        {movies.length === 0 && (
          <div className="col-span-full text-center text-secondary py-12">
            No movies available right now. Is the backend running?
          </div>
        )}
      </div>
    </div>
  );
}