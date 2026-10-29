import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ==========================================
// 1. 상담 신청 관련 (/api/consult)
// ==========================================

// POST /api/consult
http.route({
  path: "/api/consult",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { name, phone, plan, interests, combo, consent } = body;

      if (!name || !phone || !consent) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "이름, 연락처, 개인정보 수집 동의는 필수 항목입니다.",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
          }
        );
      }

      const result = await ctx.runMutation(api.consultations.create, {
        name,
        phone,
        plan: plan || "undecided",
        interests: Array.isArray(interests) ? interests : [],
        combo: combo || null,
        consent: true,
      });

      return new Response(JSON.stringify(result), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
      });
    } catch (e: any) {
      return new Response(
        JSON.stringify({
          success: false,
          message: e.message || "Convex 처리 중 오류가 발생했습니다.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
        }
      );
    }
  }),
});

// OPTIONS /api/consult
http.route({
  path: "/api/consult",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }),
});

// GET /api/consult (최근 100건 조회)
http.route({
  path: "/api/consult",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const list = await ctx.runQuery(api.consultations.list, {});
    return new Response(JSON.stringify(list), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
    });
  }),
});

// ==========================================
// 2. 실제 후기 관련 (/api/reviews)
// ==========================================

// OPTIONS /api/reviews
http.route({
  path: "/api/reviews",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }),
});

// GET /api/reviews
http.route({
  path: "/api/reviews",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const showAll = url.searchParams.get("all") === "true";
    const reviews = showAll
      ? await ctx.runQuery(api.reviews.listAll, {})
      : await ctx.runQuery(api.reviews.listVisible, {});

    return new Response(JSON.stringify({ success: true, reviews }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
    });
  }),
});

// POST /api/reviews (후기 시딩 또는 신규 등록)
http.route({
  path: "/api/reviews",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      if (body.seed === true) {
        const result = await ctx.runMutation(api.reviews.seed, {});
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
        });
      }

      const result = await ctx.runMutation(api.reviews.create, body);
      return new Response(JSON.stringify(result), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
      });
    } catch (e: any) {
      return new Response(
        JSON.stringify({ success: false, message: e.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
        }
      );
    }
  }),
});

export default http;
