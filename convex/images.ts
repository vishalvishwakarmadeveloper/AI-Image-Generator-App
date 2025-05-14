import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import OpenAI from "openai";
import { Id } from "./_generated/dataModel";

export const generateImage = action({
  args: {
    prompt: v.string(),
    style: v.string(),
    size: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if we have a custom OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Please set up your OpenAI API key in the environment variables");
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Convert size to supported DALL-E format
    let dalleSize: "1024x1024" | "1024x1792" | "1792x1024" = "1024x1024";
    if (args.size === "1024x1792") {
      dalleSize = "1024x1792";
    } else if (args.size === "1792x1024") {
      dalleSize = "1792x1024";
    }

    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `${args.prompt} in ${args.style} style`,
        size: dalleSize,
        n: 1,
        quality: "standard",
      });

      if (!response.data?.[0]?.url) {
        throw new Error("No image URL in response");
      }

      const imageUrl = response.data[0].url;
      
      await ctx.runMutation(api.images.saveImage, {
        userId: args.userId,
        prompt: args.prompt,
        imageUrl: imageUrl,
        style: args.style,
        size: args.size,
      });

      return imageUrl;
    } catch (error) {
      console.error("OpenAI API error:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to generate image: ${error.message}`);
      }
      throw new Error("Failed to generate image");
    }
  },
});

export const saveImage = mutation({
  args: {
    userId: v.id("users"),
    prompt: v.string(),
    imageUrl: v.string(),
    style: v.string(),
    size: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("images", args);
  },
});

export const getUserImages = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) return [];

    return await ctx.db
      .query("images")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});
