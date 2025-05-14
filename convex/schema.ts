import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const applicationTables = {
  images: defineTable({
    userId: v.id("users"),
    prompt: v.string(),
    imageUrl: v.string(),
    style: v.string(),
    size: v.string(),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
