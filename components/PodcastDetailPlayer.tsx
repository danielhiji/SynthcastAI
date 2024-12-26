// @ts-nocheck
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useMutation } from "convex/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/convex/_generated/api";

import { useAudio } from '@/providers/AudioProvider';
import LoaderSpinner from "./LoaderSpinner";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface PodcastDetailPlayerProps {
  audioUrl: string;
  podcastTitle: string;
  author: string;
  imageUrl: string;
  podcastId: string;
  imageStorageId: string;
  audioStorageId: string;
}

const PodcastDetailPlayer = ({
  audioUrl,
  podcastTitle,
  author,
  imageUrl,
  podcastId,
  imageStorageId,
  audioStorageId,
}: PodcastDetailPlayerProps) => {
  const router = useRouter();
  const { setAudio } = useAudio();
  const [isDeleting, setIsDeleting] = useState(false);
  const deletePodcast = useMutation(api.podcasts.deletePodcast);

  const handleDelete = async () => {
    try {
      await deletePodcast({ podcastId, imageStorageId, audioStorageId });
      toast.success("Podcast deleted successfully");
      router.push("/");
    } catch (error) {
      console.error("Error deleting podcast", error);
      toast.error("Failed to delete podcast");
    }
  };

  const handlePlay = () => {
    setAudio({
      title: podcastTitle,
      audioUrl,
      imageUrl,
      author,
      podcastId,
    });
      };

  if (!imageUrl) return <LoaderSpinner />;

  return (
    <div className="mt-6 flex w-full justify-between max-md:justify-center">
      <div className="flex flex-col gap-8 max-md:items-center md:flex-row">
        <div className="relative w-[250px] h-[250px]">
          <Image
            src={imageUrl}
            alt="Podcast image"
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <div className="flex w-full flex-col gap-5 max-md:items-center md:gap-9">
          <article className="flex flex-col gap-2 max-md:items-center">
            <h1 className="text-32 font-extrabold tracking-[-0.32px] text-white-1">
              {podcastTitle}
            </h1>
            <div className="flex cursor-pointer items-center gap-2">
              <h2 className="text-16 font-normal text-white-3">{author}</h2>
            </div>
          </article>

          <Button
            onClick={handlePlay}
            className="text-16 w-full max-w-[250px] bg-[--accent-color] font-extrabold text-white-1"
            >
            <div className="relative w-5 h-5">
              <Image
                src="/icons/Play.svg"
                alt="play"
                fill
                className="object-contain"
              />
            </div>
            &nbsp; Play podcast
          </Button>
          </div>
        </div>
      <div className="relative mt-2">
        <div className="relative w-5 h-[30px]">
          <Image
            src="/icons/three-dots.svg"
            alt="Three dots icon"
            fill
            className="object-contain cursor-pointer"
            onClick={() => setIsDeleting((prev) => !prev)}
          />
      </div>
        {isDeleting && (
          <div
            className="absolute -left-32 -top-2 z-10 flex w-32 cursor-pointer justify-center gap-2 rounded-md bg-black-6 py-1.5 hover:bg-black-2"
              onClick={handleDelete}
            >
            <div className="relative w-4 h-4">
              <Image
                src="/icons/delete.svg"
                alt="Delete icon"
                fill
                className="object-contain"
              />
          </div>
            <h2 className="text-16 font-normal text-white-1">Delete</h2>
        </div>
      )}
      </div>
    </div>
  );
};

export default PodcastDetailPlayer;
