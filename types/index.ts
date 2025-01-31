import type { Dispatch, SetStateAction } from "react";
import type { Id } from "@/convex/_generated/dataModel";

// Base interfaces
interface User {
  id: Id<"users">;
  email: string;
  name: string;
  imageUrl: string;
  clerkId: string;
  createdAt: number;
}

interface Podcast {
  id: Id<"podcasts">;
  createdAt: number;
  title: string;
  description: string;
  audio: {
    url: string | null;
    storageId: Id<"_storage"> | null;
    duration: number;
  };
  image: {
    url: string | null; 
    storageId: Id<"_storage"> | null;
  };
  author: {
    id: string;
    name: string;
    imageUrl: string;
  };
  generation: {
    voicePrompt: string;
    imagePrompt: string | null;
    voiceType: string;
  };
  stats: {
    views: number;
  };
  userId: Id<"users">;
}

// Component props interfaces
interface EmptyStateProps {
  title: string;
  search?: boolean;
  button?: {
    text: string;
    link: string;
  };
}

interface PodcastCreatorProps {
  audio: {
    url: string;
    setUrl: Dispatch<SetStateAction<string>>;
    setStorageId: Dispatch<SetStateAction<Id<"_storage"> | null>>;
    setDuration: Dispatch<SetStateAction<number>>;
  };
  voice: {
    type: string;
    prompt: string;
    setPrompt: Dispatch<SetStateAction<string>>;
  };
}

interface ThumbnailGeneratorProps {
  image: {
    url: string;
    setUrl: Dispatch<SetStateAction<string>>;
    setStorageId: Dispatch<SetStateAction<Id<"_storage"> | null>>;
  };
  prompt: {
    value: string;
    setValue: Dispatch<SetStateAction<string>>;
  };
}

interface PodcastCardProps {
  variant: 'default' | 'latest';
  data: {
    id: Id<"podcasts">;
    title: string;
    description?: string;
    imageUrl: string;
    duration?: string;
    audioUrl: string;
    author: string;
    views?: number;
    index?: number;
  };
}

interface PodcastPlayerProps {
  podcast: Podcast;
  isOwner: boolean;
}

interface AudioPlayerContextState {
  currentTrack?: {
    title: string;
    audioUrl: string;
    author: string;
    authorId: string;
    imageUrl: string;
    podcastId: string;
  };
  setCurrentTrack: Dispatch<SetStateAction<AudioPlayerContextState['currentTrack']>>;
}

interface LoadingContextState {
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

interface CarouselProps {
  topCreators: User[];
}

interface ProfileProps {
  user: {
    id: string;
    firstName: string;
    imageUrl: string;
  };
  stats: {
    podcasts: Podcast[];
    listenerCount: number;
  };
}

interface CarouselControlProps {
  currentIndex: number;
  snapPoints: number[];
  onSnapToPoint: (index: number) => void;
}
