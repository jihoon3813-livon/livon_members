import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * 1. 신규 상담 신청 접수 (Mutation)
 */
export const create = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    plan: v.string(),
    interests: v.array(v.string()),
    combo: v.optional(v.union(v.string(), v.null())),
    consent: v.boolean(),
  },
  handler: async (ctx, args) => {
    const consultationId = await ctx.db.insert("consultations", {
      name: args.name.trim(),
      phone: args.phone.trim(),
      plan: args.plan,
      interests: args.interests,
      combo: args.combo || null,
      consent: args.consent,
      status: "접수대기",
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      consultationId: String(consultationId),
      message: "상담 신청이 Convex에 정상 접수되었습니다. 전문 상담사가 확인 후 순차적으로 연락드리겠습니다.",
    };
  },
});

/**
 * 2. 전체 상담 목록 조회 (Query - 관리자/대시보드용)
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("consultations")
      .withIndex("by_createdAt")
      .order("desc")
      .take(100);
  },
});

/**
 * 3. 상담 상태 변경 (Mutation - 접수대기 -> 상담중 -> 완료 등)
 */
export const updateStatus = mutation({
  args: {
    id: v.id("consultations"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
    return { success: true };
  },
});
