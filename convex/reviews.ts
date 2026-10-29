import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * 1. 공개 노출 후기 목록 조회 (랜딩페이지용)
 */
export const listVisible = query({
  args: {},
  handler: async (ctx) => {
    const list = await ctx.db
      .query("reviews")
      .withIndex("by_isVisible", (q) => q.eq("isVisible", true))
      .collect();

    return list.sort((a, b) => (a.order || 999) - (b.order || 999));
  },
});

/**
 * 2. 전체 후기 목록 조회 (관리자 대시보드용)
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const list = await ctx.db
      .query("reviews")
      .withIndex("by_order")
      .collect();

    return list;
  },
});

/**
 * 3. 신규 후기 등록 (관리자용)
 */
export const create = mutation({
  args: {
    category: v.string(),
    planBadge: v.string(),
    usedBadge: v.string(),
    verified: v.boolean(),
    rating: v.number(),
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    authorName: v.string(),
    authorRole: v.string(),
    authorMeta: v.string(),
    avatarChar: v.string(),
    avatarColor: v.string(),
    isVisible: v.boolean(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("reviews", {
      ...args,
      createdAt: new Date().toISOString(),
    });
    return { success: true, id: String(id) };
  },
});

/**
 * 4. 후기 노출 여부 토글 (관리자용)
 */
export const toggleVisibility = mutation({
  args: {
    id: v.id("reviews"),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.id);
    if (!review) throw new Error("후기를 찾을 수 없습니다.");
    await ctx.db.patch(args.id, { isVisible: !review.isVisible });
    return { success: true, isVisible: !review.isVisible };
  },
});

/**
 * 5. 후기 상세 정보 수정 (관리자용)
 */
export const update = mutation({
  args: {
    id: v.id("reviews"),
    category: v.optional(v.string()),
    planBadge: v.optional(v.string()),
    usedBadge: v.optional(v.string()),
    verified: v.optional(v.boolean()),
    rating: v.optional(v.number()),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    authorName: v.optional(v.string()),
    authorRole: v.optional(v.string()),
    authorMeta: v.optional(v.string()),
    avatarChar: v.optional(v.string()),
    avatarColor: v.optional(v.string()),
    isVisible: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return { success: true };
  },
});

/**
 * 6. 후기 삭제 (관리자용)
 */
export const remove = mutation({
  args: {
    id: v.id("reviews"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

/**
 * 7. 초기 6대 공식 후기 자동 시딩 (초기화용)
 */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("reviews").collect();
    if (existing.length > 0) {
      return { success: true, message: `이미 ${existing.length}건의 후기가 존재합니다.`, count: existing.length };
    }

    const initialReviews = [
      {
        category: "care",
        planBadge: "라이프케어 320",
        usedBadge: "24시간 병원 간병 5일",
        verified: true,
        rating: 5,
        title: "어머니 급성 골절로 눈앞이 캄캄했는데, 당일 바로 베테랑 간병사님이 오셔서 살았습니다.",
        content: "직장 근무 중에 갑자기 어머니가 낙상으로 고관절 골절 수술을 받게 되셨어요. 병원에서는 간병인을 바로 구해야 한다는데 요즘 간병 구하기가 하늘의 별따기라 발만 동동 굴렀습니다. 다행히 가입해 둔 리본케어에 전화하니 전담 코디네이터분이 2시간 만에 바로 병원 배정부터 절차를 끝내주셨습니다. 오신 간병사님이 친어머니처럼 세심하게 체위 변경과 식사 보조를 해주시고, 매일 진행 상황을 문자로 꼼꼼히 남겨주셔서 직장에서도 안심하고 일할 수 있었습니다.",
        tags: ["#당일긴급매칭", "#친어머니처럼돌봄", "#직장인안심리포트"],
        authorName: "김*진 님",
        authorRole: "보호자 (47세·직장인)",
        authorMeta: "서울 송파구 · 2026.04",
        avatarChar: "김",
        avatarColor: "rose",
        isVisible: true,
        order: 1,
        createdAt: "2026-04-15T09:30:00.000Z"
      },
      {
        category: "smart escort",
        planBadge: "라이프케어 160",
        usedBadge: "스마트 홈케어 5년 + 병원 동행",
        verified: true,
        rating: 5,
        title: "지방에 홀로 계신 어머니 댁에 태블릿과 센서를 설치해 드렸더니 온 가족 불안이 사라졌어요.",
        content: "서울-부산 장거리라 늘 어머니 혼자 계신 게 마음에 걸렸습니다. 스마트 홈케어 5년 패키지를 신청해 케어비전 태블릿과 동작 센서를 댁에 설치해드렸더니, 아침 기상 여부와 활동 패턴이 앱으로 확인되어 너무 든든합니다. 특히 지난달 정기 진료 때는 간호사 동행 서비스를 함께 신청했는데, 병원 이동부터 진료실 동행, 의사 선생님 처방 설명까지 깔끔하게 정리해 보내주셔서 멀리서도 곁에 있는 기분이었습니다.",
        tags: ["#스마트홈케어5년", "#원격안부확인", "#간호사진료동행"],
        authorName: "박*현 님",
        authorRole: "보호자 (42세·장거리 자녀)",
        authorMeta: "부산 수영구 · 2026.05",
        avatarChar: "박",
        avatarColor: "mint",
        isVisible: true,
        order: 2,
        createdAt: "2026-05-10T14:20:00.000Z"
      },
      {
        category: "escort",
        planBadge: "라이프케어 160",
        usedBadge: "차량 에스코트 + 병원 동행 3회",
        verified: true,
        rating: 5,
        title: "휠체어 타시는 아버님 상급종합병원 외래 진료, 이젠 연차 안 내고도 모십니다.",
        content: "대형병원 외래는 접수부터 검사, 대기, 진료, 수납까지 4~5시간이 훌쩍 걸려 매번 맞벌이 부부가 번갈아 휴가를 내야 했습니다. 리본케어 차량 에스코트와 병원 동행 매니저님을 이용해봤는데 정말 신세계였어요. 집 문앞부터 휠체어 안전 이동, 검사실 길 찾기, 처방약 수령까지 완벽하게 전담해 주셨습니다. 진료 브리핑 리포트도 상세해서 연차 부담 없이 아버님 건강을 챙겨드리고 있습니다.",
        tags: ["#도어투도어이동", "#연차부담해결", "#전문외래동행"],
        authorName: "최*원 님",
        authorRole: "보호자 (39세·맞벌이 부부)",
        authorMeta: "경기 성남시 분당구 · 2026.06",
        avatarChar: "최",
        avatarColor: "gold",
        isVisible: true,
        order: 3,
        createdAt: "2026-06-03T11:15:00.000Z"
      },
      {
        category: "daily",
        planBadge: "라이프케어 160",
        usedBadge: "가사도우미 4회 + 정리수납 1회",
        verified: true,
        rating: 5,
        title: "무릎 인공관절 수술 후 집안일이 막막했는데, 덕분에 오롯이 회복에만 전념했어요.",
        content: "수술 후 퇴원하고 집에 돌아오니 보행기를 잡고 화장실 가는 것조차 버거워 청소나 식사는 엄두도 못 냈습니다. 0.5회 차감으로 가사도우미 서비스를 이용했는데, 주방 위생부터 영양 죽 준비, 세탁까지 깔끔하게 도와주셨습니다. 특히 정리수납 서비스로 휠체어와 보행기 동선에 걸리는 물건들을 싹 정리해 주셔서 집 안에서 넘어질 염려 없이 편안하게 회복할 수 있었습니다.",
        tags: ["#퇴원후회복돌봄", "#보행동선정리", "#가사부담완화"],
        authorName: "윤*자 님",
        authorRole: "본인 이용 (68세)",
        authorMeta: "인천 연수구 · 2026.07",
        avatarChar: "윤",
        avatarColor: "mint",
        isVisible: true,
        order: 4,
        createdAt: "2026-07-18T16:40:00.000Z"
      },
      {
        category: "care",
        planBadge: "라이프케어 320",
        usedBadge: "24시간 병원 간병 7일 + 검진 혜택",
        verified: true,
        rating: 5,
        title: "웃돈 요구나 식대 시비 없이 투명하고 정직해서 가족 모두 크게 만족했습니다.",
        content: "예전에 사설 소개소에서 간병인을 썼을 땐 식대비 별도 요구, 주말 웃돈, 야간 할증 때문에 간병인 눈치 보느라 스트레스가 이만저만이 아니었습니다. 리본케어는 멤버십 횟수로 투명하게 정산되고 추가 비용 갈등이 전혀 없어 마음이 정말 편했습니다. 여기에 멤버십 무료 혜택인 건강검진 우대 예약으로 아내와 부모님 검진까지 알뜰하게 챙겨서 일석이조였습니다.",
        tags: ["#투명한정찰정산", "#추가비용갈등NO", "#종합건강검진우대"],
        authorName: "정*훈 님",
        authorRole: "보호자 (51세·자영업)",
        authorMeta: "대구 수성구 · 2026.08",
        avatarChar: "정",
        avatarColor: "rose",
        isVisible: true,
        order: 5,
        createdAt: "2026-08-22T10:05:00.000Z"
      },
      {
        category: "smart care",
        planBadge: "라이프케어 320",
        usedBadge: "스마트홈 5년 + 단기 간병 2일",
        verified: true,
        rating: 5,
        title: "평소엔 스마트 기기로 안부 챙기고, 아프실 땐 바로 간병으로 전환되니 든든합니다.",
        content: "스마트 홈케어 5년 무상 패키지로 5회를 차감하고, 남은 횟수를 킵해두고 있었어요. 그런데 얼마 전 아버님이 폐렴 초기 증세로 3일간 입원하셨을 때 남겨둔 한도로 간병 서비스를 요청하니 즉시 배정되었습니다. 평소엔 안심홈으로 일상을 지키고, 급할 땐 진짜 간병으로 이어지는 이 '자유로운 전환' 구조가 리본케어의 진짜 가치라고 생각합니다.",
        tags: ["#자유로운전환케어", "#단기입원간병", "#5년무상홈케어"],
        authorName: "이*경 님",
        authorRole: "보호자 (45세·공무원)",
        authorMeta: "대전 유성구 · 2026.09",
        avatarChar: "이",
        avatarColor: "gold",
        isVisible: true,
        order: 6,
        createdAt: "2026-09-14T13:50:00.000Z"
      }
    ];

    for (const r of initialReviews) {
      await ctx.db.insert("reviews", r);
    }

    return { success: true, count: initialReviews.length, message: "초기 6건의 공식 후기가 성공적으로 등록되었습니다." };
  },
});
