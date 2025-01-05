// @ts-nocheck
/* eslint-disable react-hooks/exhaustive-deps */
import { ActionCtx, action, internalMutation, internalQuery, query } from "./_generated/server";
import { v } from "convex/values";

import OpenAI from "openai";
import { SpeechCreateParams } from "openai/resources/audio/speech.mjs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const generateAudio = action({
  args: { text: v.string(), voice: v.string() },
  handler: async (ctx, { voice, text }) => {
    const audio = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice as SpeechCreateParams["voice"],
      input: text,
    });

    const audioBuffer = await audio.arrayBuffer();
    return audioBuffer;
  },
});

export const createImage = action({
  args: { prompt: v.string() },
  handler: async (ctx, { prompt }) => {
    const image = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    const imageUrl = image.data[0].url;
    if (!imageUrl) throw new Error("Image generation failed");

    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    return buffer;
  },
});

export const generateContent = action({
  args: {
    subject: v.string(),
    length: v.number(),
    style: v.string(),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { subject, length, style, context } = args;

    try {
      const result = await openai.chat.completions.create({
        messages: [{ 
          role: "user", 
          content: `Create a ${length}-minute podcast script about ${subject} in a ${style} style.${context ? ` Additional context: ${context}` : ''}`
        }],
        model: "gpt-4",
        temperature: 0.7,
      });

      const script = result.choices[0].message.content;
      if (!script) throw new Error("Content generation failed");

      return {
        title: "",
        description: "",
        script,
        imagePrompt: "",
      };
    } catch (error) {
      console.error("Content generation error:", error);
      throw new Error("Content generation failed");
    }
  },
});

export const createPodcastAudio = action({
  args: {
    text: v.string(),
    voice: v.union(
      v.literal("voice1"),
      v.literal("voice2"),
      v.literal("voice3"),
      v.literal("voice4"),
      v.literal("voice5"),
      v.literal("voice6")
    ),
  },
  handler: async (ctx, args) => {
    try {
      const audio = await openai.audio.speech.create({
        model: "tts-1",
        voice: args.voice,
        input: args.text,
      });

      const audioBuffer = await audio.arrayBuffer();
      const audioBlob = new Blob([audioBuffer]);
      const storageId = await ctx.storage.store(audioBlob);
      const url = await ctx.storage.getUrl(storageId);

      return { url, storageId };
    } catch (error) {
      console.error("Audio generation error:", error);
      throw new Error("Audio generation failed");
    }
  },
});

export const createPodcastImage = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const image = await openai.images.generate({
        model: "dall-e-3",
        prompt: args.prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid",
      });

      const imageUrl = image.data[0]?.url;
      if (!imageUrl) throw new Error("Image generation failed");

      const response = await fetch(imageUrl);
      const buffer = await response.arrayBuffer();
      const blob = new Blob([buffer]);
      const storageId = await ctx.storage.store(blob);
      const url = await ctx.storage.getUrl(storageId);

      return { url, storageId };
    } catch (error) {
      console.error("Image generation error:", error);
      throw new Error("Image generation failed");
    }
  },
});

export const generateImage = mutation({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const image = await openai.images.generate({
      model: "dall-e-3",
      prompt: args.prompt,
      n: 1,
      size: "1024x1024",
    });

    const url = image.data[0]?.url;
    if (!url) throw new Error("Image generation failed");

    return url;
  },
});

export const generateSpeech = mutation({
  args: {
    content: v.string(),
    voice: v.string(),
  },
  handler: async (ctx, args) => {
    const { content, voice } = args;

    const audio = await openai.audio.speech.create({
      model: "tts",
      voice: voice,
      input: content,
    });

    const buffer = await audio.arrayBuffer();
    const storageId = await ctx.storage.store(Buffer.from(buffer));

    return storageId;
  },
});
