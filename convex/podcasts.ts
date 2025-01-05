import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

type UserProfile = {
  id: string;
  emailAddress: string;
  avatarUrl: string;
  userId: string;
  displayName: string;
  membershipId?: string;
  expiryDate?: number;
  membershipTier?: string;
  episodeCount: number;
};

// Create new episode
export const createEpisode = mutation({
  args: {
    audioId: v.id("_storage"), 
    title: v.string(),
    description: v.string(),
    audioPath: v.string(),
    thumbnailUrl: v.string(),
    thumbnailId: v.id("_storage"),
    voiceStyle: v.string(),
    creator: v.string(),
    playCount: v.number(),
    length: v.number(),
  },
  handler: async (ctx, args) => {
    const episode = await ctx.db.insert("podcasts", {
      audioId: args.audioId,
      title: args.title,
      description: args.description,
      audioPath: args.audioPath,
      thumbnailUrl: args.thumbnailUrl,
      thumbnailId: args.thumbnailId,
      creator: args.creator,
      voiceStyle: args.voiceStyle,
      playCount: args.playCount,
      length: args.length,
    });

    return episode;
  }
});

// Get storage URL
export const getStorageUrl = mutation({
  args: {
    fileId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.fileId);
  },
});

// Find related episodes
export const getRelatedEpisodes = query({
  args: {
    episodeId: v.id("podcasts"),
  },
  handler: async (ctx, args) => {
    const episode = await ctx.db.get(args.episodeId);

    return await ctx.db
      .query("podcasts")
      .filter((q) =>
        q.and(
          q.eq(q.field("voiceStyle"), episode?.voiceStyle),
          q.neq(q.field("_id"), args.episodeId)
        )
      )
      .collect();
  },
});

// Get episode feed
export const getEpisodeFeed = query({
  handler: async (ctx) => {
    return await ctx.db.query("podcasts").order("desc").collect();
  },
});

// Get single episode
export const getEpisode = query({
  args: {
    episodeId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const episode = await ctx.db.get(args.episodeId as Id<"podcasts">);

      if (!episode) {
        throw new Error("Episode not found");
      }

      return episode;
    } catch (error) {
      throw new Error("Episode not found");
    }
  },
});

// Get popular episodes
export const getPopularEpisodes = query({
  handler: async (ctx) => {
    const episodes = await ctx.db.query("podcasts").collect();
    return episodes.sort((a, b) => b.playCount - a.playCount).slice(0, 8);
  },
});

// Track play count
export const trackPlay = mutation({
  args: {
    episodeId: v.id("podcasts"),
  },
  handler: async (ctx, args) => {
    const episode = await ctx.db.get(args.episodeId);

    if (!episode) {
      throw new ConvexError("Episode not found");
    }

    return await ctx.db.patch(args.episodeId, {
      playCount: episode.playCount + 1,
    });
  },
});

// Search episodes
export const searchEpisodes = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.query === "") {
      return await ctx.db.query("podcasts").order("desc").collect();
    }

    const titleMatches = await ctx.db
      .query("podcasts")
      .withSearchIndex("search_title", (q) =>
        q.search("title", args.query)
      )
      .take(10);

    if (titleMatches.length > 0) {
      return titleMatches;
    }

    return await ctx.db
      .query("podcasts")
      .withSearchIndex("search_body", (q) =>
        q.search("description", args.query)
      )
      .take(10);
  },
});

// Remove episode
export const removeEpisode = mutation({
  args: {
    episodeId: v.id("podcasts"),
    thumbnailId: v.id("_storage"),
    audioId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const episode = await ctx.db.get(args.episodeId);

    if (!episode) {
      throw new ConvexError("Episode not found");
    }

    await ctx.storage.delete(args.thumbnailId);
    await ctx.storage.delete(args.audioId);
    return await ctx.db.delete(args.episodeId);
  },
});
