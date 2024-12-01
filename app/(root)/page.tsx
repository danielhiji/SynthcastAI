// @ts-nocheck
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import PodcastCard from '@/components/PodcastCard'
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import LoaderSpinner from '@/components/LoaderSpinner';
import { motion } from 'framer-motion';
import { TrendingUp, Play } from 'lucide-react';
import Link from 'next/link';

const Home = () => {
  const trendingPodcasts = useQuery(api.podcasts.getTrendingPodcasts);

  if(!trendingPodcasts) return <LoaderSpinner />

  return (
    <div className="min-h-screen pt-8">
      {/* Trending Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black-2/40 border border-black-4/50 backdrop-blur-sm">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Trending Podcasts</h2>
          </div>
          <div className="h-[2px] flex-1 bg-gradient-to-r from-cyan-500/50 to-transparent" />
        </div>

        {/* Podcast Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {trendingPodcasts?.map(({ _id, podcastTitle, podcastDescription, imageUrl }, index) => (
            <motion.div
              key={_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="group relative"
            >
              <Link href={`/podcasts/${_id}`}>
                <div className="relative overflow-hidden rounded-xl">
                  {/* Image */}
                  <div className="relative aspect-square">
                    <img 
                      src={imageUrl as string} 
                      alt={podcastTitle}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black-1 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div 
                          initial={{ scale: 0 }}
                          whileHover={{ scale: 1.1 }}
                          className="w-16 h-16 rounded-full bg-cyan-400/80 flex items-center justify-center backdrop-blur-sm"
                        >
                          <Play className="w-8 h-8 text-white fill-current" />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black-1 to-transparent">
                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{podcastTitle}</h3>
                    <p className="text-sm text-gray-300 line-clamp-2">{podcastDescription}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  )
}

export default Home