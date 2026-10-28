import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 멤버십 상담 접수 내역 테이블
  consultations: defineTable({
    name: v.string(),
    phone: v.string(),
    plan: v.string(),                         // 160, 320, smart, undecided
    interests: v.array(v.string()),           // 간병, 병원 동행, 스마트 홈케어 등
    combo: v.optional(v.union(v.string(), v.null())), // 계산기 선택 조합 문자열
    consent: v.boolean(),                     // 개인정보 수집 및 이용 동의 여부
    status: v.string(),                       // 접수대기, 상담중, 완료, 보류
    createdAt: v.string(),                    // ISO 타임스탬프
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_status", ["status"]),
});
