"use client"

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import PodcastCard from "@/components/shared/PodcastCard";
import { Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Discover() {
  const [search, setSearch] = useState("");
  const podcasts = useQuery(api.podcasts.getPodcastBySearch, { search });

  return (
    <div className="min-h-screen bg-gradient-to-b from-black-1 to-black-2">


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="relative max-w-2xl mx-auto mb-12">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search podcasts by title, description, or voice type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 bg-black-1/50 border-black-4 text-white-1 placeholder:text-gray-500 h-12 text-lg focus:ring-[--accent-color] focus:border-[--accent-color]"
          />
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Results Count */}
          {podcasts && (
            <div className="text-gray-400 text-sm">
              Found {podcasts.length} podcast{podcasts.length !== 1 ? 's' : ''}
              {search && ` for "${search}"`}
            </div>
          )}

          {/* Grid */}
          <div className={cn(
            "grid gap-6",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          )}>
            {podcasts?.map((podcast) => (
              <PodcastCard key={podcast._id} podcast={podcast} />
            ))}
          </div>

          {/* Empty State */}
          {podcasts?.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-black-4 flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-white-1 text-lg font-semibold mb-1">
                No podcasts found
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {search
                  ? `We couldn't find any podcasts matching "${search}". Try a different search term.`
                  : "Start by searching for a podcast or check back later for new content."}
              </p>
            </div>
          )}
        </div>

        {/* Loading State */}
        {!podcasts && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-black-1/30 rounded-lg border border-black-4 h-[300px] animate-pulse"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}