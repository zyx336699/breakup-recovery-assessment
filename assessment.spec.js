const { test, expect } = require("playwright/test");

const url = "http://localhost:8765/index.html";
const reportTimeout = 15000;

async function selectScenario(page, values) {
  for (const [name, label] of Object.entries(values)) {
    await page.locator(`select[name="${name}"]`).selectOption({ label });
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:8765/login");
  const codeInput = page.locator("#code");
  if (await codeInput.isVisible().catch(() => false)) {
    await codeInput.fill("520520");
    await page.getByRole("button", { name: "进入测评系统" }).click();
  }
});

test("high repair scenario produces a measured high-window report", async ({ page }) => {
  await page.goto(url);
  await selectScenario(page, {
    relationshipStage: "稳定恋爱，双方朋友或家人知道关系",
    duration: "3年以上，彼此生活高度交织",
    quality: "大多数时间稳定，近期矛盾集中爆发",
    cause: "冲动型争吵、误会、压力下情绪化决定",
    attitude: "愿意平静沟通，偶尔主动联系",
    newPartner: "没有明显新关系",
    connection: "有共同事务、朋友或现实交集，互动可自然发生",
    behavior: "尊重边界，能控制联系频率",
    stability: "能睡眠、工作/学习，能复盘问题",
    change: "能说清自己要改什么，并愿意用行动验证",
    time: "3周-3个月，适合低压复联与验证改变",
    solvability: "具体、可沟通、可验证",
    lastTalk: "能听完彼此，虽难过但不攻击"
  });
  await page.getByRole("button", { name: "生成测评报告" }).click();
  await expect(page.locator("#analysisProcess")).toContainText("正在匹配知识库与真实案例共性", { timeout: reportTimeout });
  await expect(page.locator("#result")).toBeVisible({ timeout: reportTimeout });
  await expect(page.locator("#resultTitle")).toContainText("高修复窗口期");
  await expect(page.locator("#probability")).toContainText("高窗口");
  await expect(page.locator("#actionList")).toContainText("不要急着把关系恢复到分手前的强度");
  await expect(page.locator("#recoveryStageList")).toContainText(/直接复联|复合约会|高姿态/);
  await expect(page.locator("#toolFitList")).toContainText("见面");
  await expect(page.locator("#resistanceList")).toContainText("不排斥期");
});

test("low pressure and unstable behavior reduce the recommendation", async ({ page }) => {
  await page.goto(url);
  await selectScenario(page, {
    relationshipStage: "暧昧/短择/刚确定关系不久，关系定义不够稳",
    proposer: "没有明确仪式，是慢慢淡掉/默认结束",
    breakupCount: "多次分分合合，对方已经对承诺和道歉免疫",
    livingBinding: "地下恋/短择/关系身份不稳定，承诺基础弱",
    duration: "3个月内，关系仍较浅",
    quality: "长期消耗，快乐明显少于痛苦",
    cause: "价值观、未来规划、异地、家庭阻力",
    attitude: "冷淡、回避，不愿谈关系",
    newPartner: "已经稳定进入新关系",
    connection: "几乎只有线上联系",
    offlineMeet: "对方明确拒绝见面，或者一提见面就防御",
    behavior: "频繁发消息、求证明、情绪拉扯",
    stability: "明显失控、反复冲动联系",
    change: "主要想让对方回来，暂时没想修复根因",
    time: "6个月以上，更多取决于新生活状态",
    solvability: "长期重复，过去多次承诺无效",
    lastTalk: "互相指责、防御、冷暴力",
    breakupType: "价值错位型：人生规划、婚育观、消费观、亲密需求差异大",
    contactStatus: "全面拉黑或断联，只能通过共同朋友/现实交集间接触达",
    conflictPattern: "长期冷战、拉黑、分手威胁、互相消耗",
    attachmentMode: "一失联就崩溃，容易连续发消息或做冲动事",
    specialScenario: "对方已经进入稳定新关系",
    goalType: "想证明自己没输，想让对方后悔",
    reconciliationWillingness: "更多是不甘心、失控或害怕失去，并没想清楚未来",
    dailyTime: "几乎没有时间：先做止损和情绪稳定，不适合复杂操作"
  });
  await page.getByRole("button", { name: "生成测评报告" }).click();
  await expect(page.locator("#result")).toBeVisible({ timeout: reportTimeout });
  await expect(page.locator("#resultTitle")).toContainText("基础修复期");
  await expect(page.locator("#actionList")).toContainText("零加压");
  await expect(page.locator("#pitfallList")).toContainText("联系频率和情绪强度过高");
  await expect(page.locator("#recoveryStageList")).toContainText("情绪急救期");
  await expect(page.locator("#stageActionList")).toContainText("冷却动作");
  await expect(page.locator("#resistanceList")).toContainText(/排斥期|极度排斥期/);
});

test("red flags override score and stop recovery guidance", async ({ page }) => {
  await page.goto(url);
  await page.locator('input[value="reputationHarm"]').check();
  await page.getByRole("button", { name: "生成测评报告" }).click();
  await expect(page.locator("#result")).toBeVisible({ timeout: reportTimeout });
  await expect(page.locator("#resultTitle")).toContainText("安全暂停期");
  await expect(page.locator("#probability")).toContainText("先止损");
  await expect(page.locator("#scriptAdvice")).toContainText("不建议发送挽回话术");
  await expect(page.locator("#toolFitList")).toContainText("暂不适合");
  await expect(page.locator("#resistanceList")).toContainText("安全红线型排斥");
});

test("report includes professional source notes and removes mentor wechat", async ({ page }) => {
  await page.goto(url);
  await page.getByRole("button", { name: "生成测评报告" }).click();
  await expect(page.locator("#result")).toBeVisible({ timeout: reportTimeout });
  await expect(page.locator("#sourceList")).toContainText("Gottman");
  await expect(page.locator("#sourceList")).toContainText("挽回爱情33堂课");
  await expect(page.locator("#sourceList")).toContainText("直播笔记");
  await expect(page.locator("#insightList")).toContainText("挽回不是追回一个人");
  await expect(page.getByRole("link", { name: "点击联系老师" })).toHaveAttribute("href", "https://work.weixin.qq.com/ca/cawcde5f657b767c07");
  await expect(page.locator("body")).not.toContainText("老师微信");
});

test("mobile layout keeps primary controls visible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url);
  await expect(page.getByRole("heading", { name: "分手挽回自测评估系统" })).toBeVisible();
  await expect(page.getByRole("button", { name: "生成测评报告" })).toBeVisible();
});

test("admin dashboard requires login and shows stats", async ({ page }) => {
  await page.goto("http://localhost:8765/admin");
  await expect(page.getByRole("heading", { name: "专属后台" })).toBeVisible();
  await page.locator("#password").fill("admin520");
  await page.getByRole("button", { name: "进入后台" }).click();
  await expect(page.getByRole("heading", { name: "专属后台" })).toBeVisible();
  await expect(page.locator("body")).toContainText("总访问次数");
  await expect(page.locator("body")).toContainText("完成测评次数");
  await expect(page.locator("body")).toContainText("测评转化率");
  await expect(page.locator("body")).toContainText("测评结果分布");
  await expect(page.locator("body")).toContainText("学员基础信息");
});
