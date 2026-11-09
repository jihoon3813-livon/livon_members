import { useRef, useState } from "react";
import { ArrowUpRight, ArrowRight, Check, Heart, HeartHandshake, UsersRound, Stethoscope, CalendarDays, ShieldCheck, CircleCheck, Plus, Menu, X, Copy, Download, ChevronDown, Leaf, Phone, ClipboardCheck, Hospital, MessageCircle, Bell, Activity, MapPin, FileHeart, HeartPulse } from "lucide-react";
const plans = [
  { name: "LITE", ko: "라이트", days: 7, line: "필요한 돌봄의 시작", color: "lite" },
  { name: "SPECIAL", ko: "스페셜", days: 15, line: "조금 더 여유로운 돌봄", color: "special" },
  { name: "PREMIUM", ko: "프리미엄", days: 30, line: "더 긴 시간 함께하는 돌봄", color: "premium" },
];
const healthServices = [
  {
    id: "everyday-health", number: "01", label: "EVERYDAY HEALTH", name: "평상시 건강관리", tone: "daily", icon: HeartPulse,
    title: <>건강이 궁금할 때,<br/>물어볼 곳이 있다는 든든함.</>,
    intro: "건강상담부터 진료를 준비하는 과정까지, 필요한 정보를 함께 살핍니다.",
    features: [
      { icon: Phone, title: "간호사와 건강상담", text: "임상 경험을 갖춘 간호사에게 건강 관련 궁금증을 상담합니다." },
      { icon: Hospital, title: "병원·의료진 정보 안내", text: "질환에 맞춰 진료받을 곳과 의료진 정보를 안내합니다." },
      { icon: CalendarDays, title: "진료 일정 예약 지원", text: "진료협력센터를 통해 필요한 진료의 예약을 돕습니다." },
      { icon: Bell, title: "예약 안내까지 차근차근", text: "예약 후 문자 안내로 진료 준비를 돕습니다." },
    ],
  },
  {
    id: "family-health", number: "02", label: "FAMILY HEALTH", name: "가족건강관리", tone: "family", icon: UsersRound,
    title: <>가족의 건강검진,<br/>선택부터 결과 상담까지.</>,
    intro: "어떤 검진을 선택할지 고민될 때, 가족의 건강을 위한 준비를 도와드립니다.",
    features: [
      { icon: ClipboardCheck, title: "검진 항목 맞춤 상담", text: "필요한 검진 항목을 상담하며 검진 계획을 세웁니다." },
      { icon: Heart, title: "제휴 검진 우대혜택", text: "제휴 기관의 검진 패키지 이용 혜택을 안내합니다." },
      { icon: MapPin, title: "검진 기관 예약 연계", text: "전국 제휴 병원·검진센터의 예약을 도와드립니다." },
      { icon: FileHeart, title: "검진 결과 관련 상담", text: "검진 이후 결과에 대한 궁금한 내용을 상담합니다." },
    ],
  },
  {
    id: "treatment-support", number: "03", label: "TREATMENT SUPPORT", name: "주요질병 치료지원", tone: "treatment", icon: Stethoscope,
    title: <>중요한 진료 앞에서,<br/>함께하는 사람이 있도록.</>,
    intro: "주요질병 진단 후 병원 방문과 치료 과정에 필요한 도움을 연결합니다.",
    features: [
      { icon: HeartHandshake, title: "간호사와 외래 진료 동행", text: "대상 조건에 따라 간호사가 병원에서 만나 진료에 동행합니다." },
      { icon: Stethoscope, title: "치료 과정의 이해 지원", text: "치료·수술·관리 과정에서 필요한 안내를 돕습니다." },
      { icon: MessageCircle, title: "이어서 살피는 건강상담", text: "진료 이후에도 건강에 관한 상담을 이어갑니다." },
      { icon: Heart, title: "마음까지 살피는 케어", text: "정서적 지지를 통해 치료 과정에 함께합니다." },
    ],
  },
];
const faqs = [
  ["리본케어 멤버십은 어떤 서비스인가요?", "평상시 건강관리, 가족건강관리, 주요질병 치료지원과 리본케어의 간병인 지원을 함께 구성한 멤버십입니다. 건강상담과 검진, 병원동행 등 건강관리 3종은 교보다솜케어와 제휴 예정입니다."],
  ["어떤 멤버십을 선택하면 좋을까요?", "건강관리 3종은 LITE·SPECIAL·PREMIUM에 동일하게 구성됩니다. 간병 지원의 최대 일수는 각각 7일·15일·30일이므로 준비하고 싶은 돌봄의 범위를 기준으로 선택해 주세요. 서비스 제공 시기와 간병 이용 조건은 아래 이용 안내에서 확인할 수 있습니다."],
  ["가족건강관리와 간병인 지원은 어떻게 다른가요?", "가족건강관리는 검진 항목 상담, 제휴 검진 우대혜택, 예약 및 결과 상담을 중심으로 구성됩니다. 간병인 지원은 돌봄이 필요한 대상자에게 제공하는 별도의 서비스입니다. 각 서비스의 이용 대상과 범위는 가입 전 확인해 주세요."],
  ["건강관리 서비스의 자세한 항목은 어디에서 확인하나요?", "위 상세 혜택은 교보다솜케어의 공식 서비스 안내를 바탕으로 소개한 제휴 예정 구성입니다. 리본케어 멤버십에 적용되는 세부 항목, 이용 대상과 횟수 등은 제휴 확정 후 안내합니다."],
];
export default function App() {
  const [navOpen, setNavOpen] = useState(false);
  const [interest, setInterest] = useState(1);
  const [target, setTarget] = useState("부모님");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  function openGuide(index = 1) { setInterest(index); setCopied(false); setCopyError(false); setNavOpen(false); dialog.current?.showModal(); }
  function summary() {
    return `리본케어 멤버십 상담 준비\n\n관심 멤버십: ${plans[interest].name} (${plans[interest].ko})\n간병 지원: 최장 ${plans[interest].days}일 / 멤버십 전체 기간 중 총 1회\n지정 희망 대상: ${target}\n서비스 제공 기간: 가입 후 2년 경과 시점부터 6년간 (최초 2년은 서비스 제공 전 기간)\n\n확인할 내용\n- 가입 시 간병 대상자 사전 지정\n- 한 번의 간병 이용 종료 시 잔여일 소멸\n- 최대 지원일 초과분 별도 부담\n- 제공 지역, 1일 기준 시간, 신청 및 배정 조건\n- 제휴 서비스의 세부 범위와 가족 이용 기준\n\n이 문서는 상담 준비용이며 가입 또는 상담 신청 접수가 아닙니다.`;
  }
  async function copySummary() { try { await navigator.clipboard.writeText(summary()); setCopied(true); setCopyError(false); } catch { setCopyError(true); } }
  function downloadSummary() { const url = URL.createObjectURL(new Blob(["\ufeff", summary()], { type: "text/plain;charset=utf-8" })); const link = document.createElement("a"); link.href = url; link.download = "리본케어_상담준비.txt"; link.click(); URL.revokeObjectURL(url); }
  return <>
    <a href="#main" className="skip-link">본문으로 바로가기</a>
    <header className="site-header"><div className="container header-inner">
      <a href="#" className="brand" aria-label="리본케어 멤버십 홈"><img src={`${import.meta.env.BASE_URL}images/logo.webp`} alt="LivOn care membership" width="196" height="65" /></a>
      <nav className={navOpen ? "nav open" : "nav"} aria-label="주 메뉴">{[["services","케어 서비스"],["membership","멤버십 안내"],["health-care","건강관리 혜택"],["faq","자주 묻는 질문"]].map(([id,label])=><a key={id} href={`#${id}`} onClick={()=>setNavOpen(false)}>{label}</a>)}</nav>
      <button className="button button-small header-cta" onClick={() => openGuide()}>상담 준비하기 <ArrowUpRight size={15}/></button>
      <button className="menu-toggle" onClick={() => setNavOpen(!navOpen)} aria-label={navOpen ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={navOpen}>{navOpen ? <X/> : <Menu/>}</button>
    </div></header>
    <main id="main">
      <section className="hero"><div className="container hero-grid">
        <div className="hero-copy"><p className="eyebrow"><span/> LIVON CARE MEMBERSHIP</p><h1>평소의 건강부터,<br/>돌봄이 필요한<br/><em>그 순간까지.</em></h1><p className="hero-description">평소의 건강관리와 가족의 치료지원,<br/>그리고 꼭 필요한 순간의 간병까지.<br className="mobile-break"/> 리본케어가 함께합니다.</p><div className="hero-actions"><a className="button" href="#membership">나에게 맞는 멤버십 보기 <ArrowUpRight size={18}/></a><a className="text-link" href="#services">서비스 살펴보기 <ArrowRight size={16}/></a></div><div className="hero-note"><ShieldCheck size={16}/> 간병 지원은 리본케어가 직접 제공합니다.</div></div>
        <div className="hero-visual"><img className="hero-photo" src={`${import.meta.env.BASE_URL}images/care-hero.webp`} alt="밝은 공간에서 어르신의 일상을 돕는 간병인의 모습을 표현한 연출 이미지" width="960" height="1200" fetchPriority="high"/><div className="photo-top-note"><span className="small-dot"/> A LITTLE MORE CARE, EVERY DAY</div><div className="photo-card"><span className="heart-circle"><HeartHandshake size={26}/></span><div><small>소중한 사람을 위한 준비</small><strong>당신의 마음에, 돌봄을 더하다.</strong></div></div><span className="image-caption">서비스 이해를 위한 연출 이미지</span></div>
      </div><div className="container"><div className="quick-overview"><div className="overview-intro"><span>일상부터 필요한 순간까지</span><strong>하나의 멤버십으로 이어지는 케어</strong></div><div className="overview-item"><Phone/><div><strong>건강상담 · 진료예약</strong><small>평소 건강이 궁금할 때</small></div></div><div className="overview-item"><UsersRound/><div><strong>가족 건강검진 케어</strong><small>검진 선택이 고민될 때</small></div></div><div className="overview-item"><HeartHandshake/><div><strong>병원동행 · 간병 지원</strong><small>곁에서 도움이 필요할 때</small></div></div></div></div></section>

      <section id="services" className="section services"><div className="container"><div className="section-heading"><p className="eyebrow">CARE FOR YOUR LIFE</p><h2>건강을 챙기는 일도,<br/>가족을 돌보는 일도.</h2><p>평소의 작은 궁금증부터 중요한 진료, 꼭 필요한 간병까지.<br/>가족을 위해 준비하고 싶은 케어를 하나의 멤버십에 담았습니다.</p></div><div className="service-layout">
        <article className="direct-care"><div className="direct-care-top"><span className="pill">리본케어 직접 제공</span><HeartHandshake size={36} strokeWidth={1.35}/></div><p className="service-number">LIVON CARE / CAREGIVING</p><h3>돌봄이 필요한 순간,<br/>리본케어의 간병 지원.</h3><p>소중한 가족을 돌보는 마음에<br/>리본케어의 간병 서비스를 더하세요.</p><div className="care-days"><strong>7<span>일</span></strong><i/><strong>15<span>일</span></strong><i/><strong>30<span>일</span></strong></div><small>멤버십별 최대 지원일</small><a href="#membership">내게 맞는 멤버십 살펴보기 <ArrowUpRight size={17}/></a></article>
        <article className="care-story"><div className="care-story-top"><span className="pill">건강관리 3종 + 간병인 지원</span><HeartPulse size={36} strokeWidth={1.35}/></div><p className="service-number">HEALTH CARE / 3 SERVICES</p><h3>일상을 챙기는 케어에서<br/>곁을 지키는 돌봄까지.</h3><p>건강이 궁금한 날에는 상담으로,<br/>가족의 검진을 준비할 때는 맞춤 안내로,<br/>중요한 진료 앞에서는 간호사의 동행으로.</p><div className="care-services-badges"><span>평상시 건강관리</span><i/><span>가족건강관리</span><i/><span>주요질병 치료지원</span></div><small>교보다솜케어 제휴 예정 · 전 멤버십 공통</small><div className="care-story-bottom"><Heart size={18}/><p>필요한 순간마다 떠올릴 수 있는<br/><strong>가족의 케어 파트너를 준비하세요.</strong></p></div><a href="#health-care">건강관리 혜택 자세히 보기 <ArrowUpRight size={17}/></a></article>
      </div></div></section>

      <section id="health-care" className="section health-care"><div className="container"><div className="section-heading centered"><p className="eyebrow">MORE CARE, MORE PEACE OF MIND</p><h2>상담 한 통에서 병원동행까지,<br/>가족에게 필요한 도움을 더 가까이.</h2><p>건강관리 3종은 모든 멤버십에 동일하게 구성됩니다.</p></div><div className="partner-intro"><span><CircleCheck size={17}/> 교보다솜케어 제휴 예정 구성</span><p>아래 내용은 제휴사의 공식 서비스 안내를 바탕으로 구성했습니다.<br/>실제 적용 항목과 이용 조건은 제휴 확정 후 안내합니다.</p></div>
        <div className="health-panels">{healthServices.map(service=><article className={`health-panel ${service.tone}`} id={service.id} key={service.id}><div className="health-panel-intro"><div className="health-panel-kicker"><span>{service.number} / {service.label}</span><service.icon size={29} strokeWidth={1.3}/></div><span className="service-name">{service.name}</span><h3>{service.title}</h3><p>{service.intro}</p><div className="health-panel-seal"><service.icon size={42} strokeWidth={1.1}/><span>HEALTH CARE<br/><strong>FOR YOUR FAMILY</strong></span></div></div><div className="health-feature-grid">{service.features.map(feature=><div className="health-feature" key={feature.title}><span className="health-feature-icon"><feature.icon size={23} strokeWidth={1.4}/></span><h4>{feature.title}</h4><p>{feature.text}</p></div>)}</div></article>)}</div>
        <div className="health-source"><span>상담부터 검진, 치료지원까지 연결되는 케어를 준비하세요.</span><a href="https://www.kyobodasomcare.com/HCCT0010M.do" target="_blank" rel="noopener noreferrer">제휴 예정 서비스 참고 <ArrowUpRight size={14}/></a></div>
      </div></section>

      <section id="membership" className="section membership"><div className="container"><div className="section-heading centered"><p className="eyebrow">CHOOSE YOUR MEMBERSHIP</p><h2>같은 건강관리,<br className="mobile-break"/> 간병 지원 기간은 내게 맞게.</h2><p>세 멤버십의 제휴 서비스는 동일합니다.<br/>필요에 따라 간병 지원의 최대 일수를 선택하세요.</p></div><div className="plan-grid">{plans.map((plan,index)=><article className={`plan-card ${plan.color}`} key={plan.name}><div className="plan-top"><span className="plan-korean">{plan.ko}</span><Leaf size={23} strokeWidth={1.3}/></div><h3>{plan.name}</h3><p className="plan-line">{plan.line}</p><div className="plan-days"><span>간병인 지원 최장</span><strong>{plan.days}<small>일</small></strong></div><ul><li><Check/> 평소 건강상담과 진료예약 지원</li><li><Check/> 가족 건강검진 상담과 우대혜택</li><li><Check/> 주요질병 진료 동행·치료지원</li></ul><button className={`button ${index===1?"":"button-outline"}`} onClick={()=>openGuide(index)}>{plan.ko} 상담 준비하기 <ArrowUpRight size={17}/></button></article>)}</div><div className="common-benefits"><span><CircleCheck size={18}/> 세 멤버십 공통</span><p>평상시 건강관리 <i/> 가족건강관리 <i/> 주요질병 치료지원</p><small>교보다솜케어 제휴 예정</small></div><p className="membership-footnote">서비스는 가입 후 2년 경과 시점부터 6년간 제공됩니다. 간병은 지정 대상자에게 총 1회, 상품별 한도 내에서 지원합니다. <a href="#care-rules">이용 안내 확인 <ArrowUpRight size={13}/></a></p></div></section>

      <section id="faq" className="section faq-section"><div className="container faq-layout"><div className="section-heading"><p className="eyebrow">FAQ</p><h2>궁금한 점을<br/>먼저 확인하세요.</h2><p>우리 가족에게 맞는 케어를 고를 때<br/>궁금한 내용을 모았습니다.</p><div className="faq-side-note"><HeartHandshake size={32} strokeWidth={1.3}/><span>건강한 일상을 위한 선택,<br/>리본케어와 함께 준비하세요.</span></div></div><div className="faq-list">{faqs.map(([q,a])=><details key={q}><summary><span className="q-mark">Q.</span><h3>{q}</h3><Plus size={19}/></summary><div className="faq-answer">{a}</div></details>)}</div></div></section>
      <section className="closing"><div className="container closing-inner"><div><p className="eyebrow">A LITTLE CARE, A BIG DIFFERENCE</p><h2>소중한 사람을 위한 준비,<br/>리본케어와 함께 시작하세요.</h2><p>관심 멤버십과 상담 시 확인할 내용을 미리 정리해 보세요.</p></div><button className="button" onClick={()=>openGuide()}>내 멤버십 상담 준비하기 <ArrowUpRight size={19}/></button><div className="closing-flower" aria-hidden="true"><HeartHandshake strokeWidth={0.7}/></div></div></section>
      <section id="care-rules" className="service-notice"><div className="container"><div className="notice-title"><ShieldCheck size={20}/><h2>서비스 이용 안내</h2></div><ul><li><strong>제공 시기</strong><span>가입 후 2년이 경과한 시점부터 6년간 제공합니다. 가입일부터 최초 2년 동안은 서비스가 제공되지 않습니다.</span></li><li><strong>간병 지원 대상·횟수</strong><span>가입 시 사전 지정한 대상자에게 서비스 제공 기간 중 총 1회 지원합니다.</span></li><li><strong>지원 한도</strong><span>LITE 최장 7일 · SPECIAL 최장 15일 · PREMIUM 최장 30일. 한 번의 간병 이용이 종료되면 잔여일은 소멸하며, 분할·이월·양도되지 않습니다. 최대 지원일 초과분은 별도 부담합니다.</span></li><li><strong>세부 제공 조건</strong><span>건강관리 3종은 교보다솜케어 제휴 예정입니다. 세부 항목·이용 대상·횟수, 간병 제공 지역·1일 기준 시간·신청 및 배정 조건은 확정 안내와 가입 시 적용 기준을 확인해 주세요.</span></li></ul></div></section>
    </main>
    <footer><div className="container"><div className="footer-top"><a className="brand" href="#" aria-label="맨 위로"><img src={`${import.meta.env.BASE_URL}images/logo.webp`} width="176" height="59" alt="LivOn care membership"/></a><p>당신의 일상에 더 가까운 돌봄.</p><a href="#care-rules">서비스 이용 안내 <ArrowUpRight size={14}/></a></div><div className="footer-notes"><p>리본케어 멤버십 · LITE / SPECIAL / PREMIUM</p><p>간병인 지원: 리본케어 직접 제공 · 건강관리 3종: 교보다솜케어 제휴 예정</p><p>이 페이지는 상품 구성 안내입니다. 제휴 서비스 세부 범위 및 간병 신청·배정 조건은 확정된 안내와 가입 시 적용 기준을 확인해 주세요.</p></div><div className="footer-bottom"><span>© LivOn care. All rights reserved.</span><span>CARE FOR YOUR LIFE</span></div></div></footer>
    <div className="mobile-sticky"><a href="#membership">멤버십 비교</a><button onClick={()=>openGuide()}>상담 준비하기 <ArrowUpRight size={16}/></button></div>
    <dialog ref={dialog} aria-labelledby="consult-title" className="consult-dialog" onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close();}}><div className="dialog-content"><button className="dialog-close" aria-label="상담 준비 닫기" onClick={()=>dialog.current?.close()}><X size={22}/></button><p className="eyebrow">MY MEMBERSHIP</p><h2 id="consult-title">상담 전에,<br/>나의 선택을 정리해 보세요.</h2><p className="dialog-description">관심 상품과 확인할 내용을 저장해 두고<br/>멤버십 상담 시 활용해 보세요.</p><label htmlFor="interest-plan">관심 멤버십</label><div className="select-wrap"><select id="interest-plan" value={interest} onChange={e=>{setInterest(Number(e.target.value));setCopied(false);}}>{plans.map((p,i)=><option value={i} key={p.name}>{p.name} · 간병 최장 {p.days}일</option>)}</select><ChevronDown size={18}/></div><label htmlFor="care-target">누구를 위한 준비인가요?</label><div className="select-wrap"><select id="care-target" value={target} onChange={e=>{setTarget(e.target.value);setCopied(false);}}>{["부모님","배우자","나 자신","그 외 가족","아직 정하지 않았어요"].map(t=><option key={t}>{t}</option>)}</select><ChevronDown size={18}/></div><div className="dialog-checklist"><strong>상담 시 함께 확인해 주세요</strong><p><Check size={16}/> 가입 2년 경과 후 6년간 서비스 제공</p><p><Check size={16}/> 지정 대상자 간병 1회 · 이용 종료 시 잔여일 소멸</p><p><Check size={16}/> 제공 지역 · 이용 시간 · 신청 절차</p><p><Check size={16}/> 제휴 서비스의 상세 범위와 가족 이용 기준</p></div><div className="dialog-actions"><button className="button" onClick={copySummary}>{copied?<Check size={17}/>:<Copy size={17}/>} {copied?"준비 내용 복사 완료":"준비 내용 복사"}</button><button className="button button-outline" onClick={downloadSummary}><Download size={17}/> 파일 저장</button></div><p role="status" className="copy-status">{copyError?"복사를 사용할 수 없는 환경입니다. 파일 저장을 이용해 주세요.":copied?"복사한 내용을 메모나 상담 메시지에 붙여 넣을 수 있습니다.":"선택 내용은 서버로 전송되지 않으며, 상담 신청이 접수되지는 않습니다."}</p></div></dialog>
  </>;
}
