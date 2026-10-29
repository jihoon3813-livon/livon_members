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

  // 실제 고객 생생 후기 테이블
  reviews: defineTable({
    category: v.string(),                     // care, escort, smart, daily 등
    planBadge: v.string(),                    // 라이프케어 320, 라이프케어 160 등
    usedBadge: v.string(),                    // 24시간 병원 간병 5일 등
    verified: v.boolean(),                    // 실이용 인증 여부
    rating: v.number(),                       // 평점 (1~5)
    title: v.string(),                        // 후기 제목
    content: v.string(),                      // 후기 본문
    tags: v.array(v.string()),                // 해시태그 목록
    authorName: v.string(),                   // 작성자 이름 (김*진 님 등)
    authorRole: v.string(),                   // 작성자 역할/나이
    authorMeta: v.string(),                   // 지역/날짜
    avatarChar: v.string(),                   // 아바타 글자
    avatarColor: v.string(),                  // 아바타 색상
    isVisible: v.boolean(),                   // 웹사이트 노출 여부
    order: v.number(),                        // 노출 순서 (1, 2, 3...)
    createdAt: v.string(),                    // 작성 일시
  })
    .index("by_order", ["order"])
    .index("by_isVisible", ["isVisible"])
    .index("by_createdAt", ["createdAt"]),
});
