const express = require("express");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const { Pool } = require("pg");
require("dotenv").config({ path: path.join(__dirname, ".env.local") });

const app = express();
const port = Number(process.env.PORT || 8765);
const publicDir = path.join(__dirname, "public");
const accessCode = process.env.SITE_ACCESS_CODE || "";
const cookieName = "recovery_access";
const adminCookieName = "recovery_admin";
const cookieToken = process.env.ACCESS_COOKIE_SECRET || crypto.createHash("sha256").update(accessCode || "open").digest("hex");
const adminPassword = process.env.ADMIN_PASSWORD || "";
const adminToken = crypto.createHash("sha256").update(`${adminPassword || "admin"}:${cookieToken}`).digest("hex");
const aiRequests = new Map();
const dataDir = path.join(__dirname, "data");
const statsPath = path.join(dataDir, "stats.json");
const databaseUrl = process.env.DATABASE_URL || "";
const appTimeZone = process.env.APP_TIMEZONE || "Asia/Shanghai";
const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false }
    })
  : null;
let dbReady = false;

const adminDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: appTimeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

const adminDateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: appTimeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  hourCycle: "h23"
});

app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.setHeader("Cache-Control", "no-store");
  next();
});

function parseCookies(req) {
  return Object.fromEntries(
    (req.headers.cookie || "")
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const index = item.indexOf("=");
        return [item.slice(0, index), decodeURIComponent(item.slice(index + 1))];
      })
  );
}

function loadStats() {
  try {
    return JSON.parse(fs.readFileSync(statsPath, "utf8"));
  } catch {
    return {
      visits: 0,
      assessments: 0,
      aiAnalyses: 0,
      teacherContacts: 0,
      events: []
    };
  }
}

function saveStats(stats) {
  fs.mkdirSync(dataDir, { recursive: true });
  stats.events = (stats.events || []).slice(-300);
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2), "utf8");
}

function compactText(value, max = 120) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function formatParts(formatter, value = new Date()) {
  return Object.fromEntries(
    formatter.formatToParts(new Date(value)).map((part) => [part.type, part.value])
  );
}

function localDateKey(value = new Date()) {
  const parts = formatParts(adminDateFormatter, value);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function formatAdminTime(value) {
  const parts = formatParts(adminDateTimeFormatter, value);
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

function getBasic(req, key) {
  return compactText(req.body?.basicInfo?.[key]);
}

async function initDb() {
  if (!pool || dbReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id BIGSERIAL PRIMARY KEY,
      type TEXT NOT NULL,
      time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      ip TEXT,
      user_agent TEXT,
      stage TEXT,
      window_label TEXT,
      score TEXT,
      source TEXT,
      campaign TEXT,
      referrer TEXT,
      user_gender TEXT,
      target_gender TEXT,
      age TEXT,
      relationship_stage TEXT,
      duration TEXT,
      breakup_type TEXT,
      contact_status TEXT,
      special_scenario TEXT,
      goal_type TEXT,
      reconciliation_willingness TEXT,
      daily_time TEXT,
      red_flag_count INTEGER DEFAULT 0
    )
  `);
  dbReady = true;
}

async function recordEvent(type, req, extra = {}) {
  const event = {
    type,
    time: new Date().toISOString(),
    ip: req.headers["cf-connecting-ip"] || req.ip || "",
    userAgent: req.headers["user-agent"] || "",
    stage: compactText(extra.stage),
    window: compactText(extra.window),
    score: compactText(extra.score),
    source: compactText(req.body?.source || extra.source || "direct"),
    campaign: compactText(req.body?.campaign || extra.campaign),
    referrer: compactText(req.body?.referrer || extra.referrer, 300),
    userGender: getBasic(req, "userGender"),
    targetGender: getBasic(req, "targetGender"),
    age: getBasic(req, "age"),
    relationshipStage: getBasic(req, "relationshipStage"),
    duration: getBasic(req, "duration"),
    breakupType: getBasic(req, "breakupType"),
    contactStatus: getBasic(req, "contactStatus"),
    specialScenario: getBasic(req, "specialScenario"),
    goalType: getBasic(req, "goalType"),
    reconciliationWillingness: getBasic(req, "reconciliationWillingness"),
    dailyTime: getBasic(req, "dailyTime"),
    redFlagCount: Number(extra.redFlagCount || req.body?.redFlagCount || 0)
  };

  if (pool) {
    try {
      await initDb();
      await pool.query(
        `INSERT INTO analytics_events (
          type, time, ip, user_agent, stage, window_label, score, source, campaign, referrer,
          user_gender, target_gender, age, relationship_stage, duration, breakup_type,
          contact_status, special_scenario, goal_type, reconciliation_willingness, daily_time, red_flag_count
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22
        )`,
        [
          event.type, event.time, event.ip, event.userAgent, event.stage, event.window, event.score,
          event.source, event.campaign, event.referrer, event.userGender, event.targetGender, event.age,
          event.relationshipStage, event.duration, event.breakupType, event.contactStatus, event.specialScenario,
          event.goalType, event.reconciliationWillingness, event.dailyTime, event.redFlagCount
        ]
      );
      return;
    } catch (error) {
      console.error("analytics db write failed:", error.message);
    }
  }

  const stats = loadStats();
  if (type === "visit") stats.visits += 1;
  if (type === "assessment") stats.assessments += 1;
  if (type === "ai") stats.aiAnalyses += 1;
  if (type === "teacher_contact") stats.teacherContacts = Number(stats.teacherContacts || 0) + 1;
  stats.events.push(event);
  saveStats(stats);
}

function hasAccess(req) {
  if (!accessCode) return true;
  return parseCookies(req)[cookieName] === cookieToken;
}

function hasAdmin(req) {
  if (!adminPassword) return false;
  return parseCookies(req)[adminCookieName] === adminToken;
}

function loginPage(message = "") {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>分手挽回自测评估系统 - 访问验证</title>
  <style>
    *{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f4f0ea;color:#1d2526;font-family:"Microsoft YaHei","PingFang SC",Arial,sans-serif}.box{width:min(440px,calc(100% - 32px));padding:30px;border:1px solid #d9d1c5;border-radius:10px;background:#fffaf3;box-shadow:0 22px 60px rgba(53,45,34,.14)}h1{margin:0 0 10px;font-size:28px}p{margin:0 0 18px;color:#5d6866;line-height:1.7}label{display:block;margin-bottom:8px;font-weight:700}input{width:100%;height:46px;padding:0 12px;border:1px solid #d9d1c5;border-radius:6px;font:inherit}button{width:100%;height:46px;margin-top:14px;border:0;border-radius:6px;background:#2f7d73;color:#fff;font-weight:800;font:inherit;cursor:pointer}.error{color:#9f3434;font-weight:700}
  </style>
</head>
<body>
  <main class="box">
    <h1>访问验证</h1>
    <p>这是内部测评系统。请输入老师提供的访问口令后继续。</p>
    ${message ? `<p class="error">${message}</p>` : ""}
    <form method="post" action="/access">
      <label for="code">访问口令</label>
      <input id="code" name="code" autocomplete="off" required>
      <button type="submit">进入测评系统</button>
    </form>
  </main>
</body>
</html>`;
}

function adminLoginPage(message = "") {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>系统后台 - 登录</title>
  <style>
    *{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f4f0ea;color:#1d2526;font-family:"Microsoft YaHei","PingFang SC",Arial,sans-serif}.box{width:min(440px,calc(100% - 32px));padding:30px;border:1px solid #d9d1c5;border-radius:10px;background:#fffaf3;box-shadow:0 22px 60px rgba(53,45,34,.14)}h1{margin:0 0 10px;font-size:28px}p{margin:0 0 18px;color:#5d6866;line-height:1.7}label{display:block;margin-bottom:8px;font-weight:700}input{width:100%;height:46px;padding:0 12px;border:1px solid #d9d1c5;border-radius:6px;font:inherit}button{width:100%;height:46px;margin-top:14px;border:0;border-radius:6px;background:#2f7d73;color:#fff;font-weight:800;font:inherit;cursor:pointer}.error{color:#9f3434;font-weight:700}
  </style>
</head>
<body>
  <main class="box">
    <h1>专属后台</h1>
    <p>请输入后台口令查看访问和测评数据。</p>
    ${message ? `<p class="error">${message}</p>` : ""}
    <form method="post" action="/admin/login">
      <label for="password">后台口令</label>
      <input id="password" name="password" type="password" autocomplete="current-password" required>
      <button type="submit">进入后台</button>
    </form>
  </main>
</body>
</html>`;
}

function countBy(events, key, limit = 8) {
  const map = new Map();
  events.forEach((event) => {
    const value = compactText(event[key]) || "未记录";
    map.set(value, (map.get(value) || 0) + 1);
  });
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

function percent(part, total) {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

function normalizeDbEvent(row) {
  return {
    type: row.type,
    time: new Date(row.time).toISOString(),
    ip: row.ip || "",
    userAgent: row.user_agent || "",
    stage: row.stage || "",
    window: row.window_label || "",
    score: row.score || "",
    source: row.source || "",
    campaign: row.campaign || "",
    referrer: row.referrer || "",
    userGender: row.user_gender || "",
    targetGender: row.target_gender || "",
    age: row.age || "",
    relationshipStage: row.relationship_stage || "",
    duration: row.duration || "",
    breakupType: row.breakup_type || "",
    contactStatus: row.contact_status || "",
    specialScenario: row.special_scenario || "",
    goalType: row.goal_type || "",
    reconciliationWillingness: row.reconciliation_willingness || "",
    dailyTime: row.daily_time || "",
    redFlagCount: Number(row.red_flag_count || 0)
  };
}

async function getAnalytics() {
  if (pool) {
    try {
      await initDb();
      const totals = await pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE type='visit')::int AS visits,
          COUNT(*) FILTER (WHERE type='assessment')::int AS assessments,
          COUNT(*) FILTER (WHERE type='ai')::int AS ai_analyses,
          COUNT(*) FILTER (WHERE type='teacher_contact')::int AS teacher_contacts
        FROM analytics_events
      `);
      const eventsResult = await pool.query("SELECT * FROM analytics_events ORDER BY time DESC LIMIT 500");
      const stats = totals.rows[0] || { visits: 0, assessments: 0, ai_analyses: 0 };
      return {
        storage: "database",
        visits: Number(stats.visits || 0),
        assessments: Number(stats.assessments || 0),
        aiAnalyses: Number(stats.ai_analyses || 0),
        teacherContacts: Number(stats.teacher_contacts || 0),
        events: eventsResult.rows.map(normalizeDbEvent).reverse()
      };
    } catch (error) {
      console.error("analytics db read failed:", error.message);
    }
  }

  const fileStats = loadStats();
  return {
    storage: "file",
    visits: Number(fileStats.visits || 0),
    assessments: Number(fileStats.assessments || 0),
    aiAnalyses: Number(fileStats.aiAnalyses || 0),
    teacherContacts: Number(fileStats.teacherContacts || 0),
    events: fileStats.events || []
  };
}

function renderDistribution(title, items) {
  const rows = items.map((item) => `
    <tr>
      <td>${escapeHtml(item.label)}</td>
      <td>${item.count}</td>
    </tr>
  `).join("");
  return `
    <section class="section">
      <h2>${title}</h2>
      <table class="mini-table">
        <tbody>${rows || "<tr><td colspan='2'>暂无记录</td></tr>"}</tbody>
      </table>
    </section>
  `;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function adminPage() {
  const stats = await getAnalytics();
  const today = localDateKey();
  const todayEvents = stats.events.filter((event) => localDateKey(event.time) === today);
  const todayVisits = todayEvents.filter((event) => event.type === "visit").length;
  const todayAssessments = todayEvents.filter((event) => event.type === "assessment").length;
  const todayAi = todayEvents.filter((event) => event.type === "ai").length;
  const todayTeacherContacts = todayEvents.filter((event) => event.type === "teacher_contact").length;
  const conversionRate = percent(stats.assessments, stats.visits);
  const aiUsageRate = percent(stats.aiAnalyses, stats.assessments);
  const teacherContactRate = percent(stats.teacherContacts, stats.assessments);
  const assessmentEvents = stats.events.filter((event) => event.type === "assessment");
  const rows = stats.events.slice(-80).reverse().map((event) => `
    <tr>
      <td>${escapeHtml(formatAdminTime(event.time))}</td>
      <td>${escapeHtml(event.type)}</td>
      <td>${escapeHtml(event.stage || event.window || "")}</td>
      <td>${escapeHtml(event.score || "")}</td>
      <td>${escapeHtml(event.source || "")}</td>
      <td>${escapeHtml(event.ip || "")}</td>
    </tr>
  `).join("");
  const studentRows = assessmentEvents.slice(-80).reverse().map((event) => `
    <tr>
      <td>${escapeHtml(formatAdminTime(event.time))}</td>
      <td>${escapeHtml(event.userGender)}</td>
      <td>${escapeHtml(event.targetGender)}</td>
      <td>${escapeHtml(event.age)}</td>
      <td>${escapeHtml(event.breakupType)}</td>
      <td>${escapeHtml(event.contactStatus)}</td>
      <td>${escapeHtml(event.stage)}</td>
      <td>${escapeHtml(event.score)}</td>
    </tr>
  `).join("");

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="30">
  <title>分手挽回自测评估系统 - 后台</title>
  <style>
    *{box-sizing:border-box}body{margin:0;background:#f4f0ea;color:#1d2526;font-family:"Microsoft YaHei","PingFang SC",Arial,sans-serif}.wrap{width:min(1180px,calc(100% - 32px));margin:0 auto;padding:34px 0 60px}h1{margin:0 0 8px;font-size:34px}.muted{color:#697170;margin:0 0 22px}.cards{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:14px;margin-bottom:24px}.card{padding:20px;border:1px solid #d9d1c5;border-radius:8px;background:#fffaf3;box-shadow:0 16px 42px rgba(53,45,34,.1)}.card span{display:block;color:#697170;font-weight:700}.card strong{display:block;margin-top:8px;color:#1e5b54;font-size:34px;line-height:1}.dashboard-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-bottom:16px}.section{margin-bottom:16px;padding:20px;border:1px solid #d9d1c5;border-radius:8px;background:#fffaf3;overflow:auto}table{width:100%;border-collapse:collapse;min-width:760px}th,td{padding:10px;border-bottom:1px solid #e6ded3;text-align:left;font-size:14px;vertical-align:top}th{color:#1e5b54}.mini-table{min-width:0}.mini-table td:last-child{width:80px;font-weight:800;color:#1e5b54}.badge{display:inline-block;margin-left:8px;padding:3px 8px;border-radius:99px;background:#e5f1ed;color:#1e5b54;font-size:12px;font-weight:800}a{color:#1e5b54;font-weight:700}@media(max-width:1100px){.cards{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:900px){.cards,.dashboard-grid{grid-template-columns:1fr}table{min-width:760px}}
  </style>
</head>
<body>
  <main class="wrap">
    <p class="muted"><span class="badge">Asia/Shanghai</span><span class="badge">30s auto refresh</span></p>
    <h1>专属后台</h1>
    <p class="muted">这里只统计访问、测评和基础画像，不保存用户填写的详细自述文本。<span class="badge">${stats.storage === "database" ? "数据库存储" : "本地文件存储"}</span></p>
    <div class="cards">
      <div class="card"><span>总访问次数</span><strong>${stats.visits}</strong><small>今日 ${todayVisits}</small></div>
      <div class="card"><span>完成测评次数</span><strong>${stats.assessments}</strong><small>今日 ${todayAssessments}</small></div>
      <div class="card"><span>AI 分析次数</span><strong>${stats.aiAnalyses}</strong><small>今日 ${todayAi}</small></div>
      <div class="card"><span>测评转化率</span><strong>${conversionRate}</strong><small>测评 / 访问</small></div>
      <div class="card"><span>AI 使用率</span><strong>${aiUsageRate}</strong><small>AI / 测评</small></div>
      <div class="card"><span>联系老师点击率</span><strong>${teacherContactRate}</strong><small>${stats.teacherContacts || 0} 次，今日 ${todayTeacherContacts}</small></div>
    </div>
    <div class="dashboard-grid">
      ${renderDistribution("测评结果分布", countBy(assessmentEvents, "stage"))}
      ${renderDistribution("用户来源分布", countBy(stats.events, "source"))}
      ${renderDistribution("分手类型分布", countBy(assessmentEvents, "breakupType"))}
      ${renderDistribution("联系状态分布", countBy(assessmentEvents, "contactStatus"))}
      ${renderDistribution("年龄段分布", countBy(assessmentEvents, "age"))}
      ${renderDistribution("每日可投入时间", countBy(assessmentEvents, "dailyTime"))}
    </div>
    <section class="section">
      <h2>学员基础信息</h2>
      <table>
        <thead><tr><th>时间</th><th>本人</th><th>对方</th><th>年龄</th><th>分手类型</th><th>联系状态</th><th>结果阶段</th><th>分数</th></tr></thead>
        <tbody>${studentRows || "<tr><td colspan='8'>暂无测评记录</td></tr>"}</tbody>
      </table>
    </section>
    <section class="section">
      <h2>最近记录</h2>
      <table>
        <thead><tr><th>时间</th><th>类型</th><th>窗口/阶段</th><th>分数</th><th>来源</th><th>IP</th></tr></thead>
        <tbody>${rows || "<tr><td colspan='6'>暂无记录</td></tr>"}</tbody>
      </table>
    </section>
  </main>
</body>
</html>`;
}

app.get("/login", (req, res) => {
  res.type("html").send(loginPage());
});

app.post("/access", express.urlencoded({ extended: false }), (req, res) => {
  if (!accessCode || req.body.code === accessCode) {
    res.setHeader("Set-Cookie", `${cookieName}=${encodeURIComponent(cookieToken)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800`);
    res.redirect("/");
    return;
  }
  res.status(401).type("html").send(loginPage("口令不正确，请重新输入。"));
});

app.get("/admin", async (req, res) => {
  if (!adminPassword) {
    res.status(503).type("html").send(adminLoginPage("后台还没有配置 ADMIN_PASSWORD。"));
    return;
  }
  if (!hasAdmin(req)) {
    res.redirect("/admin/login");
    return;
  }
  res.type("html").send(await adminPage());
});

app.get("/admin/login", (req, res) => {
  res.type("html").send(adminLoginPage());
});

app.post("/admin/login", express.urlencoded({ extended: false }), (req, res) => {
  if (adminPassword && req.body.password === adminPassword) {
    res.setHeader("Set-Cookie", `${adminCookieName}=${encodeURIComponent(adminToken)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800`);
    res.redirect("/admin");
    return;
  }
  res.status(401).type("html").send(adminLoginPage("后台口令不正确。"));
});

app.use((req, res, next) => {
  if (
    req.path === "/robots.txt" ||
    req.path === "/favicon.ico" ||
    req.path === "/g2rBn6iFZI.txt" ||
    req.path.startsWith("/admin")
  ) return next();
  if (hasAccess(req)) return next();
  if (req.path.startsWith("/api/")) {
    res.status(401).json({ error: "请先输入访问口令" });
    return;
  }
  res.redirect("/login");
});

app.post("/api/track", async (req, res) => {
  const type = req.body?.type;
  if (!["visit", "assessment", "teacher_contact"].includes(type)) {
    res.status(400).json({ error: "无效统计类型" });
    return;
  }
  await recordEvent(type, req, {
    stage: req.body?.stage || "",
    window: req.body?.window || "",
    score: req.body?.score || "",
    redFlagCount: req.body?.redFlagCount || 0
  });
  res.json({ ok: true });
});

app.use(express.static(publicDir, {
  dotfiles: "deny",
  extensions: ["html"],
  index: "index.html"
}));

function buildPrompt(payload) {
  return `
你是一位成熟、克制、有实战经验的亲密关系修复顾问。你的用户是被分手后想挽回的人。

请基于以下测评数据，输出专业但不装腔的中文分析。原则：
1. 一定要给希望，但不要承诺必然复合。
2. 不要恐吓用户，不要说“没机会了”。低窗口要解释为“现在不能硬冲，还有长期修复可能”。
3. 不要鼓励骚扰、威胁、跟踪、自伤要挟、介入新关系、找亲友施压。
4. 建议要具体、现实、能执行，不要只讲依恋理论、原生家庭、吸引力法则。
5. 面向被分手者：共情对方痛苦，但要提醒其稳定情绪和尊重边界。

输出结构：
【一句话结论】
【关系窗口判断】
【当前挽回流程阶段】
说明现在更接近：情绪急救期、抽离降压期、间接复联期、直接复联期、复合约会期、高姿态推进期或安全止损期，并解释为什么。
【抽离/复联/写信/见面适配】
分别判断是否适合抽离、间接复联、直接复联、种子信/成长信/结果信、见面；每一项都要给出“能做/暂缓/禁止”和理由。
【排斥度与开口策略】
判断现在是不排斥期、排斥期、极度排斥期或安全红线型排斥；说明该不该开口、怎么开口、什么时候撤退。强调消失只能降低排斥，不能自动复合。
【朋友圈展示方向】
告诉用户现在朋友圈或社交动态该展示什么、不该展示什么，避免刺激嫉妒、卖惨、阴阳怪气。
【对方现在最可能的心理】
【你现在最该做的三件事】
【未来7天行动计划】
【第一条复联消息方向】
【最容易踩的坑】
【什么时候需要老师人工介入】
【最后提醒】请用户将本次测评报告和AI分析截图发给老师，方便老师结合具体聊天记录继续判断。

测评数据：
${JSON.stringify(payload, null, 2)}
`;
}

app.post("/api/deepseek-analysis", async (req, res) => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "DeepSeek API key 未配置" });
    return;
  }

  const ip = req.headers["cf-connecting-ip"] || req.ip || "unknown";
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const history = (aiRequests.get(ip) || []).filter((time) => now - time < windowMs);
  if (history.length >= 20) {
    res.status(429).json({ error: "AI 分析请求过于频繁，请稍后再试" });
    return;
  }
  history.push(now);
  aiRequests.set(ip, history);
  await recordEvent("ai", req, {
    stage: req.body?.stage || "",
    window: req.body?.window || "",
    score: req.body?.score || ""
  });

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
        temperature: 0.55,
        max_tokens: 1800,
        messages: [
          {
            role: "system",
            content: "你负责生成分手挽回测评后的深度分析，语言要像有经验的老师，不夸大、不PUA、不制造焦虑。"
          },
          {
            role: "user",
            content: buildPrompt(req.body)
          }
        ]
      })
    });

    const body = await response.json();
    if (!response.ok) {
      res.status(response.status).json({ error: body.error?.message || "DeepSeek 请求失败" });
      return;
    }

    res.json({ analysis: body.choices?.[0]?.message?.content || "AI 没有返回有效分析，请稍后再试。" });
  } catch (error) {
    res.status(500).json({ error: error.message || "AI 分析服务异常" });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(port, () => {
  console.log(`分手挽回自测评估系统已启动：http://localhost:${port}`);
});
