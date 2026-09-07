import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Starpass",
  description: "Movie Booking Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="max-w-7xl mx-auto p-4 flex justify-between items-center">
          <div className="font-bold text-2xl tracking-tight lowercase text-primary">starpass</div>
          <div className="flex space-x-1 bg-white rounded-full shadow-sm p-1 border border-gray-100">
            <button className="px-5 py-2 rounded-full bg-accent text-white font-medium text-sm transition-colors">Movies</button>
            <button className="px-5 py-2 rounded-full text-secondary hover:bg-gray-50 font-medium text-sm transition-colors">Theatres</button>
            <button className="px-5 py-2 rounded-full text-secondary hover:bg-gray-50 font-medium text-sm transition-colors">Profile</button>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  );
}