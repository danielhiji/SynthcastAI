// @ts-nocheck
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import EmptyState from "@/components/EmptyState";
import LoaderSpinner from "@/components/LoaderSpinner";
import PodcastCard from "@/components/shared/PodcastCard";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { Clock, FileText, Image as ImageIcon, ChevronDown, ChevronUp, Wand2, Play, Headphones } from "lucide-react";
import React, { useEffect, useState } from "react";
import { formatDuration } from "@/lib/utils";
import Image from "next/image";
import { useAudio } from "@/providers/AudioProvider";

const PodcastDetails = ({
  params: { podcastId },
}: {
  params: { podcastId: Id<"podcasts"> };
}) => {
  const podcast = useQuery(api.podcasts.getPodcastById, { podcastId });
  const [isFetching, setIsFetching] = useState(true);
  const [hasIncrementedView, setHasIncrementedView] = useState(false);
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  const incrementViews = useMutation(api.podcasts.incrementPodcastViews);
  const { setAudio } = useAudio();

  const similarPodcasts = useQuery(api.podcasts.getPodcastByVoiceType, {
    podcastId,
  });

  useEffect(() => {
    if (podcast || podcast === null) {
      setIsFetching(false);
      if (podcast && !hasIncrementedView) {
        incrementViews({ podcastId });
        setHasIncrementedView(true);
      }
    }
  }, [podcast, podcastId, incrementViews, hasIncrementedView]);

  const handlePlay = () => {
    if (podcast) {
      setAudio({
        title: podcast.podcastTitle,
        audioUrl: podcast.audioUrl,
        imageUrl: podcast.imageUrl,
        author: podcast.author,
        podcastId: podcast._id,
      });
    }
  };

  const getDisplayedTranscript = (text: string) => {
    if (!text) return "";
    const lines = text.split('\n');
    if (lines.length <= 4 || showFullTranscript) return text;
    return `${lines.slice(0, 4).join('\n')}...`;
  };

  if (isFetching) return <LoaderSpinner />;

  if (!isFetching && !podcast)
    return (
      <div className="flex min-h-screen justify-center items-center">
        <EmptyState title="Podcast not found" />
      </div>
    );

  return (
    <section className="flex w-full flex-col px-4 md:px-6 py-8 max-w-7xl mx-auto">
      <div className="bg-black-1/30 backdrop-blur-md rounded-2xl border border-white-1/10 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="relative w-[250px] h-[250px] flex-shrink-0">
            <Image
              src={podcast.imageUrl}
              alt={podcast.podcastTitle}
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-4">
              <h1 className="text-32 font-extrabold tracking-[-0.32px] text-white-1">
                {podcast.podcastTitle}
              </h1>
              <div className="flex items-center gap-2">
                <h2 className="text-16 font-normal text-white-3">{podcast.author}</h2>
              </div>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[--accent-color]" />
                  <span className="text-white-2">{formatDuration(podcast.audioDuration)}</span>
                </div>
                <div className="w-[1px] h-5 bg-white-2/20" />
                <div className="flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-[--accent-color]" />
                  <span className="text-white-2">{podcast.views} views</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handlePlay}
                className="flex items-center gap-2 bg-gradient-to-r from-[--accent-color] to-purple-500 px-6 py-3 rounded-xl hover:opacity-90 transition-all duration-300 group"
              >
                <Play className="w-5 h-5 text-white-1 transition-transform duration-300 group-hover:scale-110" />
                <span className="text-white-1 font-semibold">Play Podcast</span>
              </button>
            </div>
            <p className="text-white-2 text-lg leading-relaxed">

              {podcast.podcastDescription}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 mb-12">
        <div className="bg-black-1/30 backdrop-blur-sm rounded-xl border border-white-1/10 p-6 transition-all duration-300 hover:border-[--accent-color]/50">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-[--accent-color]" />
            <h2 className="text-xl font-bold text-white-1">Transcription</h2>
          </div>
          <p className="text-white-2 text-base whitespace-pre-line">
            {getDisplayedTranscript(podcast.voicePrompt)}
          </p>
          {podcast.voicePrompt?.split('\n').length > 4 && (
            <button
              type="button"
              onClick={() => setShowFullTranscript(!showFullTranscript)}
              className="mt-4 flex items-center gap-2 text-[--accent-color] hover:text-[--accent-color]/80 transition-colors duration-200"
            >
              {showFullTranscript ? (
                <>
                  Show Less <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Show More <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[--accent-color] to-purple-500 bg-clip-text text-transparent mb-6">
          Similar Podcasts
        </h2>

        {similarPodcasts && similarPodcasts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarPodcasts.map((podcast) => (
              <PodcastCard
                key={podcast._id}
                podcast={podcast}
              />
            ))}
          </div>
        ) : (
          <div className="bg-black-1/20 backdrop-blur-sm rounded-xl border border-white-1/10 p-8">
            <EmptyState
              title="No similar podcasts found"
              buttonLink="/discover"
              buttonText="Discover more podcasts"
            />
          </div>
        )}
      </section>
    </section>
  );
};

export default PodcastDetails;
