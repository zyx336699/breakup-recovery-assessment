const form = document.querySelector("#assessment");
const calculateButton = document.querySelector("#calculate");
const result = document.querySelector("#result");
const liveScore = document.querySelector("#liveScore");
const resultTitle = document.querySelector("#resultTitle");
const probability = document.querySelector("#probability");
const barFill = document.querySelector("#barFill");
const actionList = document.querySelector("#actionList");
const pitfallList = document.querySelector("#pitfallList");
const maintenanceList = document.querySelector("#maintenanceList");
const scriptAdvice = document.querySelector("#scriptAdvice");
const profileList = document.querySelector("#profileList");
const diagnosisList = document.querySelector("#diagnosisList");
const insightList = document.querySelector("#insightList");
const sourceList = document.querySelector("#sourceList");
const mindList = document.querySelector("#mindList");
const planList = document.querySelector("#planList");
const recoveryStageList = document.querySelector("#recoveryStageList");
const stageActionList = document.querySelector("#stageActionList");
const toolFitList = document.querySelector("#toolFitList");
const resistanceList = document.querySelector("#resistanceList");
const socialDisplayList = document.querySelector("#socialDisplayList");
const analysisProcess = document.querySelector("#analysisProcess");
const analysisPercent = document.querySelector("#analysisPercent");
const analysisFill = document.querySelector("#analysisFill");
const analysisSteps = document.querySelector("#analysisSteps");
const aiAnalyzeButton = document.querySelector("#aiAnalyze");
const aiOutput = document.querySelector("#aiOutput");
const teacherHelpList = document.querySelector("#teacherHelpList");
const teacherMessage = document.querySelector("#teacherMessage");
const copyTeacherMessage = document.querySelector("#copyTeacherMessage");
const copyReportPackage = document.querySelector("#copyReportPackage");
const captureStatus = document.querySelector("#captureStatus");
const reportImagePreview = document.querySelector("#reportImagePreview");
const followupPrompt = document.querySelector("#followupPrompt");
const closeFollowup = document.querySelector("#closeFollowup");
const screenshotFirst = document.querySelector("#screenshotFirst");

const maxScore = 111;
const teacherContactUrl = "https://work.weixin.qq.com/ca/cawcde5f657b767c07";
const douyinGroupUrl = "https://v.douyin.com/group/582208105630";
const isDouyinMiniApp = new URLSearchParams(window.location.search).get("source") === "douyin_miniapp" ||
  /toutiaomicroapp|bytedance|douyin|aweme/i.test(navigator.userAgent || "");
const fieldGroups = {
  relation: ["relationshipStage", "duration", "quality", "cause", "breakupType", "proposer", "breakupCount", "livingBinding"],
  signal: ["attitude", "newPartner", "connection", "contactStatus", "specialScenario", "offlineMeet"],
  self: ["behavior", "stability", "change", "impulse", "attachmentMode", "goalType", "reconciliationWillingness", "dailyTime"],
  timing: ["time", "solvability", "lastTalk", "lastWords", "conflictPattern"]
};
const scoredFields = [
  "relationshipStage",
  "proposer",
  "breakupCount",
  "livingBinding",
  "duration",
  "quality",
  "cause",
  "attitude",
  "newPartner",
  "connection",
  "behavior",
  "stability",
  "change",
  "time",
  "solvability",
  "lastTalk",
  "lastWords",
  "impulse",
  "breakupType",
  "contactStatus",
  "offlineMeet",
  "conflictPattern",
  "attachmentMode",
  "specialScenario",
  "goalType",
  "reconciliationWillingness",
  "dailyTime"
];
let latestReportPayload = null;
let latestFormData = null;
let latestReportImageBlob = null;
let visitTracked = false;
let analysisTimer = null;

const stages = [
  {
    min: 0,
    max: 64,
    title: "基础修复期：机会还在，但现在不能硬追",
    range: "长期可修复",
    width: 22,
    actions: [
      "先把目标从“马上复合”改成“停止扣分、恢复可沟通形象”。很多低窗口关系不是没机会，而是被错误动作继续推远。",
      "暂停主动复联 10-21 天，只保留必要事务沟通；这不是放弃，而是给对方的防御系统降温。",
      "把分手原因拆成四栏：对方真正不满什么、你做过什么、哪些能改、怎么让对方看见改变。",
      "先恢复睡眠、工作/学习和日常节奏。被分手后越崩，越容易做出让对方确认“分开是对的”的行为。"
    ],
    pitfalls: [
      "不要把“我真的很爱你”当作核心策略。对方分手通常不是不知道你爱，而是觉得继续相处太累或看不到改变。",
      "不要找共同朋友传话、晒惨、刺激嫉妒或打听行踪。",
      "不要长篇小作文、连续道歉、深夜情绪输出，这通常会被理解成压力而不是诚意。",
      "不要因为当前窗口低就绝望。低窗口最怕急，真正有效的是先让关系停止恶化。"
    ],
    script: "如果必须沟通，只发短消息：承认边界、停止争辩、说明你会先处理自己的问题。不要要求回复，不追问感受，不把消息包装成复合谈判。"
  },
  {
    min: 65,
    max: 83,
    title: "观察复联期：有窗口，但要先降低防御",
    range: "中等窗口",
    width: 46,
    actions: [
      "保持 7-14 天低频、低情绪浓度互动，先让对方体验到你不会再把聊天变成压力。",
      "复联内容从现实小事、共同记忆里的轻话题或低负担求助开始，不急着谈复合。",
      "观察三个信号：回复速度是否变自然、是否愿意多说一句、是否不再明显抗拒你的存在。",
      "准备一份具体改变清单：过去哪里伤人、现在怎么处理、未来如何预防复发。改变必须能被看见，不能只停留在承诺。",
      "一旦对方冷淡或后撤，立即降频，而不是加码解释。"
    ],
    pitfalls: [
      "不要刚有回复就追问“你还爱不爱我”。",
      "不要把复盘变成审判会；你可以承担自己的部分，但不能逼对方承认他的部分。",
      "不要用朋友圈、礼物、突然出现制造存在感。"
    ],
    script: "适合用轻量、具体、无索取的话开口，例如围绕共同事务、近况或一个对方不需要情绪劳动的小问题。关系话题要等对方有稳定回应后再进入。"
  },
  {
    min: 84,
    max: 98,
    title: "可推进修复期：可以设计一次关键沟通",
    range: "较高窗口",
    width: 64,
    actions: [
      "选择一个双方情绪稳定的时间，提出一次 30-60 分钟的复盘沟通。",
      "沟通顺序建议是：先听对方体验，再说你理解到的问题，最后提出可验证的相处方案。",
      "把“复合”拆成试运行：恢复联系、短期相处规则、冲突暂停机制，而不是一步到位。",
      "给对方选择权，允许对方需要时间，不用一次谈话逼出答案。",
      "你的优势在于关系还有可修复空间，但真正决定成败的是后续 2-4 周是否能稳定执行新模式。"
    ],
    pitfalls: [
      "不要用过去的付出要求对方回来。",
      "不要把短期好转误判成彻底修复；旧问题复发才是最大风险。",
      "不要承诺自己做不到的改变，例如永远不生气、永远秒回。"
    ],
    script: "可以表达：我不是来争输赢的，我想确认自己理解得准不准。如果你愿意，我想听听你最累的部分，也说说我准备怎么具体调整。"
  },
  {
    min: 99,
    max: 120,
    title: "高修复窗口期：希望很大，重点是稳住节奏",
    range: "高窗口",
    width: 78,
    actions: [
      "不要急着把关系恢复到分手前的强度，先建立新的互动规则。",
      "把复合谈成一个共同项目：边界、频率、冲突处理、未来计划都需要重新确认。",
      "安排轻松见面比反复线上谈心更有效，但见面必须尊重对方节奏。",
      "复合后前 30 天重点观察旧模式是否复燃，而不是沉迷补偿式甜蜜。"
    ],
    pitfalls: [
      "不要因为概率高就松懈，真正的考验在复合后的稳定期。",
      "不要让愧疚变成讨好，也不要让被挽回的一方拥有无限审判权。",
      "不要跳过根因处理，只靠想念复合。"
    ],
    script: "可以进入更清晰的关系协商：我想重新开始，但不是回到旧模式。我们能不能先约定遇到冲突时怎么停、怎么说、怎么修复？"
  }
];

const redFlagAdvice = {
  title: "安全暂停期：先保留长期机会，停止直接挽回",
  range: "先止损",
  width: 8,
  actions: [
    "先暂停一切直接挽回动作。红线状态不是永远没机会，而是继续靠近会让对方把你和“风险、麻烦、失控”绑定在一起。",
    "如果出现暴力、威胁、造谣、曝光隐私、持续骚扰等情况，先停止伤害，必要时向可信亲友、专业人士或法律渠道求助。",
    "把短期目标从“让对方回来”改成“让局面停止恶化”。只有先恢复基本安全感，后面才可能重新建立连接。",
    "至少 30 天内不做关系推进，先处理情绪失控、名誉伤害、隐私边界和现实风险。"
  ],
  pitfalls: [
    "不要把伤害解释成“我只是太爱了”。对方感到被威胁、被羞辱或被公开处刑时，任何靠近都会变成二次伤害。",
    "不要用自伤、曝光隐私、找单位/学校/家人、发小作文控诉等方式逼对方回应。",
    "不要购买所谓必成话术。红线状态下最专业的动作不是说服，而是停止升级、修复损害。"
  ],
  script: "这种情况下不建议发送挽回话术。如果必须交代，只能简短说明会停止打扰，并真正停止。"
};

const maintenance = [
  "每周一次 20 分钟短复盘：最近舒服的地方、卡住的地方、下周一个小调整。只谈行为，不翻旧账。",
  "设置冲突暂停机制：任何一方情绪上头时先暂停 20 分钟以上，避免在高唤醒状态下提分手、拉黑、翻旧账。",
  "把改变做成可观察行为，比如回复规则、见面安排、异性边界、财务或未来计划，而不是抽象保证。",
  "保留个人生活和独立节奏。复合不是重新绑定，而是重新选择；失去自我会让关系再次窒息。"
];

const sourceNotes = [
  "《说好不分手：九颜教你爱情挽回术》公开目录：分手迹象、第一夜处理、真假性分手、拉黑、新欢、破冰聊天、战略阶段等；对应系统里的“联系状态、特殊场景、7天行动节奏”。",
  "《认识爱，重建亲密关系》公开介绍：爱情心理学、亲密关系重建、EFT/NVC 背景；对应系统里的“对方心理翻译、追逐-退缩、低压沟通”。",
  "《爱情的重建》《如何优雅地挽回前任》《挽回爱情技巧》等公开资料共同强调：修复不是求回，而是识别裂痕、稳定自我、恢复连接、重建信任。",
  "《二次吸引》相关公开资料：挽回重点不是求回，而是降低需求感、修复旧问题、创造新吸引点；对应本系统里的“低压复联、稳定变化、重新建立吸引”。",
  "《挽回爱情33堂课》PDF全文学习整理：错误挽回、情绪稳定、抽离降压、种子信/成长信、朋友圈展示、间接复联、直接复联、复合约会、结果信等，已转化为本系统里的“当前挽回流程、工具适配、阶段操作重点、朋友圈展示方向”。",
  "直播笔记《被分手，正确的挽回思路：高效挽回4步法》：不纠缠、不用强需求逼回应；按不排斥期、排斥期、极度排斥判断复联方式；复联开口要表明目的、包装低压力需求、给对方回复理由、点到为止。",
  "Gottman 关系研究中的“四骑士”：批评、防御、轻蔑、冷处理，是很多分手前反复消耗的典型沟通模式；对应本系统里的“指责、防御、冷暴力、长期重复问题”。",
  "Gottman 的“修复尝试”概念：关系能不能修，不只看吵没吵架，而看冲突后能否降温、承认影响、重新合作；对应本系统里的“低压复联、关键沟通、冲突暂停机制”。",
  "依恋焦虑与分手反刍研究提示：越焦虑越想确认、解释、追问，但这些动作常让对方压力更大；对应本系统里的“零加压”和“先恢复生活秩序”。",
  "分合循环/on-off relationship 研究提示：多次分分合合会降低承诺感和信任感；对应本系统里的“不能只靠复合，要重建相处机制”。",
  "安全边界资料提示：跟踪、威胁、曝光隐私、造谣和持续骚扰会把关系修复问题变成安全问题；对应本系统里的“安全暂停期”。",
  "真实挽回案例共性：成功通常不是靠一句话术，而是先停止扣分，再让对方看到稳定、低压、可验证的变化；失败通常败在高频解释、逼问、找人施压、刺激嫉妒。"
];

function getFormValues() {
  const data = new FormData(form);
  const score = scoredFields.reduce((sum, field) => sum + Number(data.get(field) || 0), 0);
  const redFlags = data.getAll("redFlags");
  return { data, score, redFlags };
}

function chooseStage(score) {
  return stages.find((stage) => score >= stage.min && score <= stage.max) || stages[0];
}

function listItems(target, items) {
  target.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    target.appendChild(li);
  });
}

function buildAnalysisSteps(data, score, redFlags) {
  const breakupType = selectedText(data, "breakupType").split("：")[0] || "当前分手类型";
  const contactStatus = selectedText(data, "contactStatus");
  const lastWords = selectedText(data, "lastWords").replace(/[“”]/g, "");
  const conflictPattern = selectedText(data, "conflictPattern");
  const attachmentMode = selectedText(data, "attachmentMode");
  const specialScenario = selectedText(data, "specialScenario");
  const dailyTime = selectedText(data, "dailyTime").split("：")[0] || "当前可投入时间";
  const relation = groupScore(data, fieldGroups.relation);
  const signal = groupScore(data, fieldGroups.signal);
  const self = groupScore(data, fieldGroups.self);
  const timing = groupScore(data, fieldGroups.timing);
  const stage = redFlags.length || Number(data.get("behavior")) < 0 || Number(data.get("stability")) < 0
    ? "安全止损期"
    : chooseStage(score).title.split("：")[0];

  return [
    `已读取 ${scoredFields.length} 项核心选项，正在建立你的关系画像和当前挽回起点。`,
    `正在识别分手主类型：匹配到“${breakupType}”，并提取对方最后表达：“${lastWords}”。`,
    `正在复盘互动模式：冲突更接近“${conflictPattern}”，系统会判断旧循环是否容易复发。`,
    `正在扫描你的情绪与依恋状态：${attachmentMode}，用于判断现在能不能直接推进。`,
    `正在读取特殊变量：${specialScenario}，评估新关系、异地、家庭阻力或多次分合的影响。`,
    `正在扫描联系窗口：${contactStatus}，判断适合抽离、间接复联、直接复联还是暂缓触达。`,
    redFlags.length
      ? "红线筛查命中：系统会优先给出止损和安全边界建议。"
      : "红线筛查通过：未发现必须暂停全部挽回动作的高危项。",
    `正在计算四项权重：关系基础 ${relation}、对方信号 ${signal}、自我状态 ${self}、时机条件 ${timing}。`,
    `正在匹配知识库与真实案例共性：错误挽回、抽离降压、种子信/成长信、朋友圈展示、复合约会。`,
    `正在判断复联工具适配：写信、朋友圈、轻话题、见面沟通，哪些能做，哪些现在不能做。`,
    "正在识别排斥等级：不排斥、排斥、极度排斥，并匹配低压力开口策略。",
    `正在结合你的可投入时间：${dailyTime}，压缩成你能执行的行动节奏。`,
    `已匹配当前阶段：${stage}，正在生成行动优先级、避坑提醒、7天计划和报告截图提醒。`
  ];
}

function showAnalysisProcess(data, score, redFlags) {
  const steps = buildAnalysisSteps(data, score, redFlags);
  const duration = 10000;
  const interval = duration / steps.length;

  window.clearTimeout(analysisTimer);
  result.classList.add("hidden");
  analysisProcess.classList.remove("hidden");
  analysisSteps.innerHTML = "";
  analysisFill.style.width = "0%";
  analysisPercent.textContent = "0%";
  calculateButton.disabled = true;
  calculateButton.textContent = "正在生成...";
  analysisProcess.scrollIntoView({ behavior: "smooth", block: "start" });

  steps.forEach((step, index) => {
    window.setTimeout(() => {
      const li = document.createElement("li");
      li.textContent = step;
      analysisSteps.appendChild(li);
      const percent = Math.round(((index + 1) / steps.length) * 100);
      analysisFill.style.width = `${percent}%`;
      analysisPercent.textContent = `${percent}%`;
    }, Math.round(index * interval));
  });

  return new Promise((resolve) => {
    analysisTimer = window.setTimeout(resolve, duration);
  });
}

function groupScore(data, fields) {
  return fields.reduce((sum, field) => sum + Number(data.get(field) || 0), 0);
}

function buildDiagnosis(data, score, redFlags) {
  if (redFlags.length) {
    return [
      "红线项会覆盖所有分数，因为安全感一旦被破坏，任何挽回动作都会先被对方理解成风险。",
      "这不是没有希望，而是希望必须从“停止伤害和停止施压”开始。"
    ];
  }

  const relation = groupScore(data, fieldGroups.relation);
  const signal = groupScore(data, fieldGroups.signal);
  const self = groupScore(data, fieldGroups.self);
  const timing = groupScore(data, fieldGroups.timing);
  const items = [];

  items.push(`总分 ${score}/${maxScore}。这个分数代表“当前适合怎么推进”，不是给感情判死刑。`);
  items.push(relation >= 22 ? "关系基础还在，重点不是重新证明你爱他/她，而是修复旧问题。" : "关系底子暂时偏弱，更需要先建立新的吸引、舒适感和安全感。");
  items.push(signal >= 16 ? "对方信号尚可，可以低压观察回应质量。" : "对方信号偏冷，说明防御还在；先降压，后推进。");
  items.push(self >= 16 ? "你的自控与复盘能力是加分项，继续用稳定行为替代保证。" : "你的状态会直接影响窗口期，先稳住自己比急着复联更重要。");
  items.push(timing >= 14 ? "时机和问题可解性较好，可以设计一次清晰沟通。" : "时机或根因仍不稳，先别急着谈复合，先让对方重新感到轻松。");

  return items;
}

function buildCaseProfile(data, redFlags) {
  if (redFlags.length) {
    return [
      "当前属于高风险止损型案例：核心不是复联技巧，而是先停止伤害、停止扩散、修复基本边界。",
      "这类案例的长期机会来自“风险感下降”，不是来自道歉强度。"
    ];
  }

  const profiles = [];
  const breakupCount = Number(data.get("breakupCount"));
  const livingBinding = Number(data.get("livingBinding"));
  const breakupTypeText = selectedText(data, "breakupType");
  const contactStatus = Number(data.get("contactStatus"));
  const newPartner = Number(data.get("newPartner"));
  const offlineMeet = Number(data.get("offlineMeet"));

  if (livingBinding >= 4) {
    profiles.push("现实绑定型：你们不是单纯情绪分手，生活、习惯、未来成本都在影响判断。优势是连接深，难点是旧问题也更容易被记住。");
  } else if (breakupTypeText.includes("感觉下降")) {
    profiles.push("吸引下降型：对方未必完全没感情，而是把你和疲惫、无聊、压力或低价值感绑定。重点是恢复新鲜感、稳定感和生活吸引。");
  } else if (breakupTypeText.includes("失望")) {
    profiles.push("失望累积型：对方不是突然离开，而是多次期待落空后做了决定。重点不是解释，而是用稳定行为重建可信度。");
  } else if (breakupTypeText.includes("现实")) {
    profiles.push("现实阻力型：感情不是唯一变量，距离、家庭、钱、结婚节奏会直接影响窗口。方案必须包含现实解决路径。");
  } else if (breakupTypeText.includes("信任")) {
    profiles.push("信任修复型：对方需要的不是更多承诺，而是透明、边界、可验证的安全感。复联节奏要慢于普通案例。");
  } else {
    profiles.push("情绪爆发型：窗口通常没有完全关闭，但最怕分手后继续争对错。先降温，再复盘。");
  }

  if (breakupCount <= 1) {
    profiles.push("多次分合会让对方对道歉免疫。你需要拿出新规则，而不是再重复上一轮复合方式。");
  }

  if (contactStatus <= 2 || offlineMeet <= 1) {
    profiles.push("当前触达受限，说明对方防御较高。适合先做间接展示和低打扰复联，不适合突然见面或高强度解释。");
  }

  if (newPartner <= 1) {
    profiles.push("存在新关系变量。新欢不是绝对终局，但你不能介入成对立面；越比较、越攻击，越容易帮对方巩固新关系。");
  }

  return profiles;
}

function buildInsights(data, redFlags) {
  if (redFlags.length) {
    return [
      "你现在卡住的不是“怎么说一句让对方回头”，而是对方可能已经把你和压力、风险、失控联系在一起。",
      "真正的转折点是先把破坏性行为停住，再用时间证明你不会继续制造麻烦。",
      "这类情况不是没有长期机会，但短期越推进，越容易让对方合理化离开。"
    ];
  }

  const behavior = Number(data.get("behavior"));
  const impulse = Number(data.get("impulse"));
  const attitude = Number(data.get("attitude"));
  const lastWords = Number(data.get("lastWords"));
  const solvability = Number(data.get("solvability"));
  const quality = Number(data.get("quality"));
  const breakupType = Number(data.get("breakupType"));
  const contactStatus = Number(data.get("contactStatus"));
  const conflictPattern = Number(data.get("conflictPattern"));
  const specialScenario = Number(data.get("specialScenario"));
  const goalType = Number(data.get("goalType"));
  const willingness = Number(data.get("reconciliationWillingness"));
  const dailyTime = Number(data.get("dailyTime"));
  const insights = [];

  if (behavior <= 1 || impulse <= 1) {
    insights.push("你的最大卡点是“焦虑驱动行动”：越痛越想解释、确认、见面，但对方接收到的往往不是爱，而是压力。先停下来，反而是在保留窗口。");
  } else {
    insights.push("你的优势是还能控制动作。挽回里最稀缺的不是深情，而是稳定：让对方重新觉得和你接触不会被情绪淹没。");
  }

  if (attitude <= 2 || lastWords <= 2) {
    insights.push("对方目前更像处在防御/回避状态。此时不要急着谈爱不爱，先让聊天变轻，让对方重新体验到“和你说话没有负担”。");
  } else {
    insights.push("对方并非完全关闭窗口。你要做的是把残留情绪从拉扯导向合作，别用逼问把柔软信号消耗掉。");
  }

  if (breakupType <= 2 || conflictPattern <= 2) {
    insights.push("你们的问题不是单次分手事件，而是一套反复发生的互动模式：追问、逃避、指责、防御、冷战或失望累积。真正要修的是模式，不只是把人叫回来。");
  }

  if (contactStatus <= 2) {
    insights.push("联系方式受限说明对方在保护自己。越是拉黑/删除/只剩间接连接，越要把复联设计成低打扰、低索取、低情绪浓度。");
  }

  if (specialScenario <= 2) {
    insights.push("新欢、多次分合或稳定断联会让窗口变窄，但不是绝对终局。关键是不要站到对立面，不要比较输赢，而是先恢复你自己的吸引力和稳定感。");
  }

  if (solvability <= 1 || quality <= 1) {
    insights.push("旧问题如果没有新机制，复合只是把同一段剧情重播一遍。你需要拿出可验证方案，而不是更真诚的保证。");
  } else {
    insights.push("你们的问题仍有被具体处理的空间。重点是把“我会改”翻译成对方能看见的行为证据。");
  }

  if (goalType <= 2) {
    insights.push("如果你的目标只是“让对方回来”或“证明自己没输”，挽回动作会很容易变形。真正有用的目标是：让对方重新相信，和你在一起会比离开更轻松、更稳定。");
  }

  if (willingness <= 2) {
    insights.push("你的复合意愿还带着摇摆和不甘心。建议先确认“我到底想修复关系，还是只想缓解失去感”，否则执行时会忽冷忽热。");
  } else if (willingness >= 4) {
    insights.push("你的复合意愿足够强，但强烈意愿不能变成强烈打扰。越想挽回，越要把行动做得稳、轻、可持续。");
  }

  if (dailyTime <= 2) {
    insights.push("你每天可投入时间有限，方案必须极简：少做、不做错、稳定坚持，比一次性学很多技巧更重要。");
  } else if (dailyTime >= 4) {
    insights.push("你有足够时间做系统修复：每天分成三块，情绪整理、关系复盘、状态建设，不要把所有时间都用来盯对方动态。");
  }

  insights.push("一句话总结：挽回不是追回一个人，而是让对方重新相信，回到你身边不会再次进入旧循环。");

  return insights;
}

function buildMindTranslation(data, redFlags) {
  if (redFlags.length) {
    return [
      "对方现在最在意的不是你还爱不爱，而是自己会不会继续被伤害、被威胁或被卷进麻烦。",
      "如果你继续解释，对方大概率会把解释理解成推卸、施压或再次入侵边界。",
      "当前最能产生反差的不是表白，而是停止伤害、停止扩散、承担后果。"
    ];
  }

  const lastWords = selectedText(data, "lastWords");
  const attitude = Number(data.get("attitude"));
  const contactStatus = Number(data.get("contactStatus"));
  const breakupType = Number(data.get("breakupType"));
  const items = [];

  if (lastWords.includes("太累") || breakupType === 3) {
    items.push("对方说“累”通常不是不爱，而是把继续相处和消耗绑定在一起。你要先证明：靠近你不会再被拉进旧循环。");
  } else if (lastWords.includes("不合适") || breakupType <= 2) {
    items.push("对方说“不合适”往往是在给复杂问题做简单结论。你要做的不是反驳这句话，而是拆出到底是哪一类不合适：情绪、现实、信任还是节奏。");
  } else {
    items.push("对方仍有情绪余温时，最怕你把余温用成逼问。柔软信号要被保护，而不是被消耗。");
  }

  if (attitude <= 2 || contactStatus <= 2) {
    items.push("冷淡、拉黑、只聊事务，本质上是防御信号。先降低对方的预期压力，再谈修复。");
  } else {
    items.push("还能联系说明窗口没有完全关上。你要观察的是回应质量，而不是只看有没有回复。");
  }

  items.push("真正有效的复联，不是让对方立刻感动，而是让对方产生一个新判断：这个人好像不再像以前那样让我累。");
  return items;
}

function buildRecoveryStage(data, redFlags, score) {
  if (redFlags.length || Number(data.get("behavior")) < 0 || Number(data.get("stability")) < 0) {
    return [
      "阶段判断：安全止损期。现在不是拼话术的时候，而是先让局面停止恶化，让对方重新感到边界被尊重。",
      "核心目标：停止伤害、停止扩散、停止高压靠近。长期希望来自风险感下降，不来自继续解释。",
      "下一阶段入口：至少连续 30 天没有骚扰、威胁、曝光、造谣或情绪失控行为，再评估是否有低压修复空间。"
    ];
  }

  const behavior = Number(data.get("behavior"));
  const stability = Number(data.get("stability"));
  const contactStatus = Number(data.get("contactStatus"));
  const attitude = Number(data.get("attitude"));
  const offlineMeet = Number(data.get("offlineMeet"));
  const time = Number(data.get("time"));
  const newPartner = Number(data.get("newPartner"));
  const conflictPattern = Number(data.get("conflictPattern"));
  const items = [];

  if (stability <= 1 || behavior <= 1 || time <= 2) {
    items.push("阶段判断：情绪急救期。你现在最容易因为痛、怕、慌而做错动作，所以先保住窗口，比立刻挽回更重要。");
    items.push("核心目标：72小时到10天内少说、少解释、少求证，把睡眠、工作/学习、社交支持先拉回基本线。");
  } else if (contactStatus <= 2 || attitude <= 2 || conflictPattern <= 2) {
    items.push("阶段判断：抽离降压期。抽离不是冷战，也不是放弃，而是让对方从“被你拉扯”里缓一口气。");
    items.push("核心目标：让对方重新形成一个新感受：你不会一出现就带来争辩、哭诉、逼问和压力。");
  } else if (contactStatus === 3 || attitude === 3 || score < 84) {
    items.push("阶段判断：间接复联/展示期。你们还没有到谈复合的火候，但可以开始让对方看见你的稳定变化。");
    items.push("核心目标：用低频互动、共同事务、社交动态和生活状态，让“你变稳定了”先被对方感受到。");
  } else if (contactStatus >= 4 && attitude >= 3 && offlineMeet <= 2) {
    items.push("阶段判断：直接复联试探期。可以恢复聊天，但聊天的任务是重建舒适感，不是立刻要答案。");
    items.push("核心目标：把每一次对话都做轻，观察对方是否愿意多说、接话、主动延展。");
  } else if (offlineMeet >= 3 && contactStatus >= 4 && attitude >= 4) {
    items.push("阶段判断：复合约会期。你们已经有见面或稳定沟通的基础，重点是把见面做得轻松、有边界、不审判。");
    items.push("核心目标：第一次见面不求一次谈成，先让对方确认“和你在一起的感觉变轻了”。");
  } else if (score >= 99) {
    items.push("阶段判断：高姿态推进期。窗口较好，但越接近复合越不能急着回到旧模式。");
    items.push("核心目标：把复合谈成新规则，而不是靠想念回到过去。");
  } else if (newPartner <= 1) {
    items.push("阶段判断：旁观稳态期。对方已有新关系变量时，你不能介入成竞争者，先把自己从对立面移出来。");
    items.push("核心目标：不攻击、不比较、不打扰，把长期吸引力和稳定状态放在前面。");
  } else {
    items.push("阶段判断：自我提升与窗口观察期。现在要做的是停止扣分，同时积累能被看见的改变证据。");
    items.push("核心目标：让对方未来再次接触你时，感受到的不是旧问题重演，而是一个更稳定、更清楚的人。");
  }

  items.push("判断原则：所有分手都可以保留重新连接的可能，但每个阶段能做的事不同。错把低窗口当高窗口硬冲，才是最伤机会的地方。");
  return items;
}

function buildStageActions(data, redFlags) {
  if (redFlags.length || Number(data.get("behavior")) < 0 || Number(data.get("stability")) < 0) {
    return [
      "本阶段只做止损：不堵人、不找单位/学校/家人、不曝光隐私、不发控诉内容。",
      "如果已经造成伤害，先承担后果，不用“我是太爱你了”解释动机。",
      "需要复盘的是边界和安全，不是研究更强的话术。"
    ];
  }

  const contactStatus = Number(data.get("contactStatus"));
  const attitude = Number(data.get("attitude"));
  const behavior = Number(data.get("behavior"));
  const stability = Number(data.get("stability"));
  const offlineMeet = Number(data.get("offlineMeet"));
  const time = Number(data.get("time"));
  const actions = [];

  if (stability <= 1 || behavior <= 1 || time <= 2) {
    actions.push("先做“冷却动作”：把想发的小作文写在备忘录，不发给对方；至少隔一晚再判断是否有必要沟通。");
    actions.push("把复盘写成事实表：分手导火索、对方原话、你做错的动作、下一次如何避免，不写控诉。");
  }

  if (contactStatus <= 2 || attitude <= 2) {
    actions.push("适合抽离降压：7-21天不谈关系，不制造偶遇，不找共同朋友传话，只保留必要事务。");
    actions.push("可以准备一封“种子信”思路：只承认理解到的影响和边界，不求回复，不夹带复合要求。");
  } else if (contactStatus === 3 || attitude === 3) {
    actions.push("适合间接复联：从共同事务、轻话题、对方低成本能回应的问题开始，不进入“还爱不爱”的审问。");
    actions.push("可以准备“成长信”思路：不是忏悔书，而是让对方看到你如何具体调整旧问题。");
  } else {
    actions.push("适合直接复联：每次聊天只推进一点点，先恢复轻松感，再进入关系复盘。");
    actions.push("如果对方愿意见面，第一次复合约会以轻松、安全、自然为目标，不在饭桌上逼答案。");
  }

  if (offlineMeet >= 3 && contactStatus >= 4) {
    actions.push("见面后不要立刻复盘全部旧账。先观察对方的身体语言、停留时长、是否愿意延展话题，再决定下一步。");
  }

  actions.push("阶段动作的底层逻辑：先停止扣分，再恢复舒适，最后才谈复合。顺序错了，真诚也会变成压力。");
  return actions;
}

function buildToolFit(data, redFlags) {
  if (redFlags.length || Number(data.get("behavior")) < 0 || Number(data.get("stability")) < 0) {
    return [
      "抽离：必须做，而且是安全边界意义上的停止靠近。",
      "复联：暂不适合。任何关系推进都可能被理解成继续施压。",
      "写信：只适合必要的边界声明或后果承担，不适合写挽回信。",
      "见面：不适合主动提出。先把现实风险降下来。"
    ];
  }

  const contactStatus = Number(data.get("contactStatus"));
  const attitude = Number(data.get("attitude"));
  const behavior = Number(data.get("behavior"));
  const stability = Number(data.get("stability"));
  const offlineMeet = Number(data.get("offlineMeet"));
  const newPartner = Number(data.get("newPartner"));
  const solvability = Number(data.get("solvability"));
  const items = [];

  items.push(behavior <= 1 || attitude <= 2 ? "抽离：适合。抽离的目的不是让对方着急，而是让防御降下来，让你也恢复判断力。" : "抽离：可以轻量做。不是消失，而是减少情绪浓度和联系压迫感。");
  items.push(contactStatus <= 2 ? "间接复联：更适合。通过共同事务、可见的生活状态和低打扰触点恢复存在感。" : "间接复联：可作为辅助。不要把朋友圈当喊话板，而是展示稳定生活。");
  items.push(contactStatus >= 4 && attitude >= 3 ? "直接复联：可以试探。先聊轻话题和现实小事，再根据回应质量逐步加深。" : "直接复联：暂时谨慎。对方回复冷、躲、只聊事务时，强行谈感情会扣分。");
  items.push(solvability >= 2 && stability >= 2 ? "写信：可考虑“种子信/成长信”。重点是理解、承担、具体改变，不要写成求原谅的长篇压力。" : "写信：暂不建议写长文。情绪不稳或问题不可解时，长文通常只会暴露焦虑。");
  items.push(offlineMeet >= 3 && attitude >= 3 ? "见面：可以低压设计。主题以轻松近况和舒适体验为主，不把见面变成审判会。" : "见面：不宜急推。只有当线上互动不防御、对方有自然回应时，再考虑。");
  if (newPartner <= 1) {
    items.push("新关系变量：不要介入、不要比较、不要攻击。长期窗口来自你重新变得稳定有吸引，而不是拆散对方。");
  }
  return items;
}

function buildResistanceStrategy(data, redFlags) {
  if (redFlags.length || Number(data.get("behavior")) < 0 || Number(data.get("stability")) < 0) {
    return [
      "排斥等级：安全红线型排斥。当前不是聊天技术问题，而是对方可能已经把靠近理解成风险。",
      "开口原则：不发挽回话术，不发长篇解释；如必须沟通，只做边界声明、后果承担和停止打扰。",
      "关键提醒：先让对方确认你不会继续升级，后面才可能重新评估关系。"
    ];
  }

  const contactStatus = Number(data.get("contactStatus"));
  const attitude = Number(data.get("attitude"));
  const behavior = Number(data.get("behavior"));
  const lastTalk = Number(data.get("lastTalk"));
  const offlineMeet = Number(data.get("offlineMeet"));
  const items = [];

  if (contactStatus >= 4 && attitude >= 3 && lastTalk >= 3) {
    items.push("排斥等级：不排斥期。能聊天不代表能聊感情，只代表对方暂时还能接受你的存在。");
    items.push("开口策略：多聊自己当前状态、现实小事和轻话题，少问对方想法，不试探“还爱不爱”。");
    items.push("撤退标准：对方回应变短、开始回避、只剩礼貌回复时，当天就收住，不要把轻松聊天变成复合谈判。");
  } else if (contactStatus >= 2 || attitude >= 2 || offlineMeet >= 2) {
    items.push("排斥等级：排斥期。对方冷淡、回避或只聊必要事务，说明防御还在，不适合直接谈复合。");
    items.push("开口策略：先适当消失 3-10 天降压；重新开口要有低压力理由，比如共同事务、对方熟悉且擅长的小问题。");
    items.push("消息结构：表明目的 + 包装低压力需求 + 给对方回复理由 + 点到为止；不要用“在吗、最近怎么样、我想你了”开局。");
  } else {
    items.push("排斥等级：极度排斥期。拉黑、删除、拒绝见面或明显厌烦时，强行触达只会强化负面标签。");
    items.push("开口策略：先暂停直接联系，必要时只考虑一封很短的启动信；启动信不是求和信，而是承认事实、反思影响、表达停止施压。");
    items.push("恢复好友位前提：你已经停止纠缠，并且有现实、自然、无威胁的触达理由；否则宁可继续降压。");
  }

  if (behavior <= 1) {
    items.push("你的近期高需求行为已经让对方更容易预判你会继续求复合。现在最重要的是打破这个预判：少说、稳定、说到做到。");
  }

  items.push("底层逻辑：消失只能降低排斥，不能让对方自动爱上你；真正恢复连接，要靠新的相处感觉和可验证的改变。");
  return items;
}

function buildSocialDisplay(data, redFlags) {
  if (redFlags.length) {
    return [
      "暂停发布任何针对对方、暗示对方、控诉对方的内容。",
      "不发聊天记录、不发隐私、不阴阳怪气，不让朋友圈成为施压场。",
      "可以只展示正常生活恢复：工作/学习、运动、朋友支持、稳定作息。"
    ];
  }

  const contactStatus = Number(data.get("contactStatus"));
  const breakupTypeText = selectedText(data, "breakupType");
  const attachmentMode = Number(data.get("attachmentMode"));
  const dailyTime = Number(data.get("dailyTime"));
  const items = [];

  items.push("展示方向不是“让对方吃醋”，而是让对方看到你没有停在分手当天：生活在继续，状态在恢复，人变得稳定。");
  items.push("适合展示：规律生活、运动形象、工作/学习进展、真实社交、兴趣恢复、对旧问题的安静调整。");
  items.push("不适合展示：深夜伤感、假装快乐、刺激异性、指桑骂槐、频繁鸡汤、明显写给对方看的内容。");

  if (contactStatus <= 2) {
    items.push("对方防御高或触达少时，朋友圈只做间接展示，不要通过共同朋友刻意转发给对方。");
  }

  if (breakupTypeText.includes("信任")) {
    items.push("信任破裂型重点展示边界感和透明生活，不展示暧昧刺激，不制造“你看我很抢手”的误会。");
  } else if (breakupTypeText.includes("感觉下降")) {
    items.push("感觉下降型重点展示新鲜感和生活质感，但要真实，不能像摆拍营销号。");
  } else if (breakupTypeText.includes("现实")) {
    items.push("现实阻力型重点展示解决问题的能力，比如工作节奏、规划能力、家庭沟通成熟度。");
  }

  if (attachmentMode <= 2) {
    items.push("你越焦虑，越要少发动态。每条动态发布前问一句：这是展示稳定，还是想让对方立刻来回应我？");
  }

  if (dailyTime <= 2) {
    items.push("时间有限时，每周2-3条高质量真实动态就够了，频繁更新反而容易显得刻意。");
  }

  return items;
}

function buildTeacherHelp(data, redFlags, score) {
  if (redFlags.length || Number(data.get("behavior")) < 0 || Number(data.get("stability")) < 0) {
    return [
      "现在是否必须完全暂停联系，避免继续升级风险。",
      "如果已经造成伤害，该如何做边界声明和后果承担。",
      "后续什么时候才适合重新评估低压修复空间。"
    ];
  }

  const contactStatus = Number(data.get("contactStatus"));
  const attitude = Number(data.get("attitude"));
  const behavior = Number(data.get("behavior"));
  const newPartner = Number(data.get("newPartner"));
  const items = [];

  items.push(contactStatus <= 2 || attitude <= 2
    ? "你现在该不该主动联系，还是先抽离降压。"
    : "你现在能不能从轻话题进入低压复联。");

  items.push(behavior <= 1
    ? "前面发过的消息有没有继续扣分，下一条该怎么止损。"
    : "第一句话怎么发，才不会把轻松聊天变成复合谈判。");

  items.push(score >= 84
    ? "如果对方回应变好，什么时候可以提出见面或认真沟通。"
    : "对方冷淡回复时，该继续聊、换话题，还是及时撤退。");

  if (newPartner <= 1) {
    items.push("出现新关系变量时，怎么保留长期窗口而不是站到对立面。");
  }

  items.push("你的报告结果和最近 3-5 张聊天截图是否一致，下一步是否需要微调。");
  return items;
}

function buildTeacherMessage(data, redFlags, score, report) {
  const breakupType = selectedText(data, "breakupType").split("：")[0] || "当前分手类型";
  const contactStatus = selectedText(data, "contactStatus").split("，")[0] || "当前联系状态";
  const redFlagText = redFlags.length ? "报告里有红线/高压风险提示，" : "";
  return `老师你好，我刚做完分手挽回测评，这是我的完整报告截图。系统判断我是「${report.title}」，分数是 ${score}/${maxScore}，分手类型偏「${breakupType}」，目前联系状态是「${contactStatus}」。${redFlagText}我想请你帮我判断：我现在该断联、复联还是先止损，以及下一步第一句话怎么说。`;
}

function buildSevenDayPlan(data, redFlags) {
  if (redFlags.length) {
    return [
      "第1-2天：停止所有扩散、威胁、曝光、打扰行为，删除准备发布的情绪内容。",
      "第3-4天：整理已经造成的伤害，不再解释动机，只判断哪些后果需要补救。",
      "第5-7天：恢复现实生活秩序，必要时找专业支持；这周不做任何复合推进。"
    ];
  }

  const behavior = Number(data.get("behavior"));
  const contactStatus = Number(data.get("contactStatus"));
  const stage = Number(data.get("relationshipStage"));
  const dailyTime = Number(data.get("dailyTime"));
  const plan = [];

  if (behavior <= 1 || contactStatus <= 2) {
    plan.push("第1-3天：零加压。不追问、不解释、不求见面、不发长文，只保留必要事务沟通。");
    plan.push("第4-5天：写一份复盘表，只写事实和可改变行为，不写控诉和委屈。");
    plan.push("第6-7天：根据对方边界决定是否继续静默；如果要发消息，只发一条低索取、低情绪浓度的信息。");
  } else if (stage >= 4) {
    plan.push("第1天：整理你们真正的核心矛盾，不要把问题简化成“对方变心”。");
    plan.push("第2-4天：恢复轻量联系，观察对方是否愿意多说、是否愿意接住你的话题。");
    plan.push("第5-7天：如果回应稳定，可以提出一次短沟通；主题是理解和方案，不是逼复合。");
  } else {
    plan.push("第1-2天：降低情绪表达，先把自己的生活节奏拉回来。");
    plan.push("第3-5天：做外在状态、社交状态、内容表达的轻调整，让对方看到你不是停在分手当天。");
    plan.push("第6-7天：用轻话题试探互动，不谈复合，不索要承诺。");
  }

  if (dailyTime <= 2) {
    plan.push("时间有限版：每天只做三件小事：10分钟情绪记录、10分钟复盘一个旧问题、10分钟整理自己的生活状态。");
  } else if (dailyTime >= 4) {
    plan.push("高投入版：每天安排固定时段学习沟通、复盘聊天记录、运动/形象/社交恢复，但不要把高投入变成高频联系。");
  }

  return plan;
}

function addContextualAdvice(stage, data, score) {
  const actions = [...stage.actions];
  const pitfalls = [...stage.pitfalls];

  if (Number(data.get("behavior")) <= 1) {
    actions.unshift("你的近期行为已经影响窗口期，先做 10 天“零加压”：不追问、不解释、不求见面，只保留必要事务沟通。零加压不是冷暴力，而是重建安全感。");
    pitfalls.unshift("当前最大坑不是说错话，而是联系频率和情绪强度过高。");
  }

  if (Number(data.get("cause")) === 0 || Number(data.get("quality")) === 0) {
    actions.unshift("这段关系存在较重信任损伤或伤害史，先判断是否值得修复，再判断能不能修复。");
    pitfalls.unshift("不要只盯着复合概率，忽略关系本身是否安全、尊重、平等。");
  }

  if (Number(data.get("newPartner")) <= 1) {
    actions.push("如果对方已有稳定新关系，短期不要正面介入。新关系不是绝对终局，但介入会让你站到对立面，反而降低长期窗口。");
    pitfalls.push("不要攻击新对象、比较输赢、制造三角关系。");
  }

  if (Number(data.get("solvability")) <= 1) {
    actions.push("核心矛盾如果长期重复，需要先设计新的相处机制，否则复合也只是重播。");
  }

  if (score >= 38 && Number(data.get("attitude")) >= 3) {
    actions.push("可以准备一次认真对话，但只约一次；对方拒绝就停止推进，给关系留余地。");
  }

  return { actions, pitfalls };
}

async function startReportGeneration() {
  const { data, score, redFlags } = getFormValues();
  await showAnalysisProcess(data, score, redFlags);
  renderReport(data, score, redFlags);
}

function renderReport(data, score, redFlags) {
  const hasRedFlag = redFlags.length > 0 || Number(data.get("behavior")) < 0 || Number(data.get("stability")) < 0;
  const baseStage = chooseStage(score);
  const report = hasRedFlag ? redFlagAdvice : baseStage;
  const contextual = hasRedFlag ? report : addContextualAdvice(baseStage, data, score);

  resultTitle.textContent = report.title;
  probability.textContent = report.range;
  barFill.style.width = `${report.width}%`;
  liveScore.textContent = hasRedFlag ? "红线暂停" : `${score}/${maxScore}`;
  listItems(actionList, contextual.actions);
  listItems(pitfallList, contextual.pitfalls);
  listItems(profileList, buildCaseProfile(data, redFlags));
  listItems(recoveryStageList, buildRecoveryStage(data, redFlags, score));
  listItems(stageActionList, buildStageActions(data, redFlags));
  listItems(toolFitList, buildToolFit(data, redFlags));
  listItems(resistanceList, buildResistanceStrategy(data, redFlags));
  listItems(socialDisplayList, buildSocialDisplay(data, redFlags));
  listItems(diagnosisList, buildDiagnosis(data, score, redFlags));
  listItems(insightList, buildInsights(data, redFlags));
  listItems(mindList, buildMindTranslation(data, redFlags));
  listItems(planList, buildSevenDayPlan(data, redFlags));
  listItems(maintenanceList, maintenance);
  listItems(sourceList, sourceNotes);
  listItems(teacherHelpList, buildTeacherHelp(data, redFlags, score));
  teacherMessage.textContent = buildTeacherMessage(data, redFlags, score, report);
  scriptAdvice.textContent = report.script;
  latestReportPayload = buildPayload(data, score, redFlags, report, contextual);
  latestFormData = data;
  trackEvent("assessment", {
    stage: report.title,
    window: report.range,
    score: `${score}/${maxScore}`,
    redFlagCount: redFlags.length,
    basicInfo: buildBasicInfo(data)
  });
  if (aiOutput) {
    aiOutput.textContent = isDouyinMiniApp
      ? "基础报告已生成。抖音小程序预览中如果 AI 请求失败，请先确认后台已配置合法请求域名；网页正式版 AI 功能仍在。"
      : "基础报告已生成。你可以点击“生成 AI 深度分析”，获得更细的挽回节奏和沟通建议。";
  }

  result.classList.remove("hidden");
  analysisProcess.classList.add("hidden");
  calculateButton.disabled = false;
  calculateButton.textContent = "重新生成测评报告";
  prepareReportImage();
  result.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => {
    followupPrompt?.classList.remove("hidden");
  }, 700);
}

async function prepareReportImage() {
  latestReportImageBlob = null;
  reportImagePreview?.classList.add("hidden");
  if (reportImagePreview?.src) {
    URL.revokeObjectURL(reportImagePreview.src);
    reportImagePreview.removeAttribute("src");
  }
  if (captureStatus) captureStatus.textContent = "报告图片正在生成";
  if (copyReportPackage) {
    copyReportPackage.disabled = true;
    copyReportPackage.textContent = "报告图生成中";
  }

  if (!window.html2canvas) {
    if (captureStatus) captureStatus.textContent = "截图组件加载失败，可先复制开场白";
    if (copyReportPackage) {
      copyReportPackage.disabled = false;
      copyReportPackage.textContent = "复制开场白+报告图";
    }
    return;
  }

  try {
    await new Promise((resolve) => window.setTimeout(resolve, 260));
    const canvas = await window.html2canvas(result, {
      backgroundColor: "#fffaf3",
      scale: Math.min(2, window.devicePixelRatio || 1),
      useCORS: true,
      ignoreElements: (element) => element.classList?.contains("capture-ignore")
    });
    latestReportImageBlob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.95));
    if (!latestReportImageBlob) throw new Error("empty image");
    if (reportImagePreview) {
      reportImagePreview.src = URL.createObjectURL(latestReportImageBlob);
      reportImagePreview.classList.remove("hidden");
    }
    if (captureStatus) {
      captureStatus.textContent = isDouyinMiniApp
        ? "报告图片已生成，可复制开场白并长按保存报告图"
        : "报告图片已生成，可一键复制给老师";
    }
  } catch {
    if (captureStatus) captureStatus.textContent = "报告图片生成失败，可先复制开场白";
  } finally {
    if (copyReportPackage) {
      copyReportPackage.disabled = false;
      copyReportPackage.textContent = "复制开场白+报告图";
    }
  }
}

function downloadReportImage(blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "分手挽回测评报告.png";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

async function copyReportPackageToClipboard() {
  const text = teacherMessage?.textContent || "";
  if (!latestReportImageBlob) {
    await prepareReportImage();
  }

  try {
    if (!latestReportImageBlob || !navigator.clipboard || !window.ClipboardItem) {
      throw new Error("image clipboard unsupported");
    }
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/plain": new Blob([text], { type: "text/plain" }),
        "image/png": latestReportImageBlob
      })
    ]);
    copyReportPackage.textContent = "已复制文字和报告图";
    if (captureStatus) captureStatus.textContent = "已复制，去老师对话框粘贴发送即可";
  } catch {
    try {
      await navigator.clipboard.writeText(text);
      if (latestReportImageBlob) downloadReportImage(latestReportImageBlob);
      copyReportPackage.textContent = "已复制文字，报告图已下载";
      if (captureStatus) captureStatus.textContent = "当前浏览器不支持同时复制图片，已下载报告图";
    } catch {
      copyReportPackage.textContent = "复制失败，请长按文字复制";
      if (captureStatus) captureStatus.textContent = "请长按复制开场白，或手动保存报告图";
    }
  }

  window.setTimeout(() => {
    copyReportPackage.textContent = "复制开场白+报告图";
  }, 2200);
}

function teacherContactText() {
  const text = teacherMessage?.textContent || "";
  const link = isDouyinMiniApp ? douyinGroupUrl : teacherContactUrl;
  const label = isDouyinMiniApp ? "抖音粉丝群链接" : "老师联系方式";
  return `${text}\n\n${label}：${link}`;
}

function postMiniAppMessage(payload) {
  try {
    window.tt?.miniProgram?.postMessage?.({ data: payload });
  } catch {
    // Mini app bridge is optional in normal browsers.
  }
}

async function copyTeacherContactForMiniApp() {
  const text = teacherContactText();
  try {
    await navigator.clipboard.writeText(text);
    if (captureStatus) captureStatus.textContent = "已复制开场白和粉丝群链接，正在尝试打开抖音群";
  } catch {
    if (captureStatus) captureStatus.textContent = "正在尝试打开抖音群；如果失败，请长按复制粉丝群链接";
  }
  postMiniAppMessage({ type: "copy_teacher_contact", text });
}

function openTeacherContact() {
  const url = isDouyinMiniApp ? douyinGroupUrl : teacherContactUrl;
  postMiniAppMessage({ type: "open_teacher_contact", url, text: teacherContactText() });
  window.location.href = url;
  window.setTimeout(() => {
    if (isDouyinMiniApp && captureStatus) {
      captureStatus.textContent = "如果没有自动打开粉丝群，请复制链接后在抖音中打开";
    }
  }, 1200);
}

function getAttribution() {
  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get("utm_source") || params.get("source") || "direct",
    campaign: params.get("utm_campaign") || "",
    referrer: document.referrer || ""
  };
}

function trackEvent(type, extra = {}) {
  const payload = JSON.stringify({ type, ...getAttribution(), ...extra });
  if (navigator.sendBeacon) {
    const sent = navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
    if (sent) return;
  }
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true
  }).catch(() => {});
}

function selectedText(data, field) {
  const element = form.elements[field];
  if (!element || !element.options) return data.get(field) || "";
  return element.options[element.selectedIndex]?.textContent.trim() || "";
}

function buildBasicInfo(data) {
  return {
    userGender: selectedText(data, "userGender"),
    targetGender: selectedText(data, "targetGender"),
    age: selectedText(data, "age"),
    relationshipStage: selectedText(data, "relationshipStage"),
    duration: selectedText(data, "duration"),
    breakupType: selectedText(data, "breakupType"),
    contactStatus: selectedText(data, "contactStatus"),
    specialScenario: selectedText(data, "specialScenario"),
    goalType: selectedText(data, "goalType"),
    reconciliationWillingness: selectedText(data, "reconciliationWillingness"),
    dailyTime: selectedText(data, "dailyTime")
  };
}

function buildPayload(data, score, redFlags, report, contextual) {
  const answers = {};
  scoredFields.forEach((field) => {
    answers[field] = {
      score: Number(data.get(field) || 0),
      text: selectedText(data, field)
    };
  });
  answers.story = data.get("story") || "";
  answers.redFlags = redFlags;

  return {
    score,
    maxScore,
    stage: report.title,
    window: report.range,
    answers,
    baseAdvice: contextual.actions,
    pitfalls: contextual.pitfalls,
    caseProfile: buildCaseProfile(data, redFlags),
    recoveryStage: buildRecoveryStage(data, redFlags, score),
    stageActions: buildStageActions(data, redFlags),
    toolFit: buildToolFit(data, redFlags),
    resistanceStrategy: buildResistanceStrategy(data, redFlags),
    socialDisplay: buildSocialDisplay(data, redFlags),
    scriptAdvice: report.script,
    diagnosis: buildDiagnosis(data, score, redFlags),
    insights: buildInsights(data, redFlags),
    mindTranslation: buildMindTranslation(data, redFlags),
    sevenDayPlan: buildSevenDayPlan(data, redFlags),
    sourceNotes
  };
}

async function runAiAnalysis() {
  if (!latestReportPayload) {
    aiOutput.textContent = "请先点击“生成测评报告”，再进行 AI 深度分析。";
    return;
  }

  aiAnalyzeButton.disabled = true;
  aiAnalyzeButton.textContent = "分析中...";
  aiOutput.textContent = isDouyinMiniApp
    ? "AI 正在生成。如果抖音预览环境拦截请求，稍后会提示你需要补充合法请求域名。"
    : "AI 正在结合你的选项和自述生成更细的方案，请稍等。";

  try {
    const response = await fetch("/api/deepseek-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(latestReportPayload)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "AI 分析失败");
    }
    aiOutput.textContent = `${data.analysis}\n\n下一步建议：AI 可以帮你整理方向，但聊天记录里的语气、对方真实防御程度和第一句话细节，仍建议把本报告和最近 3-5 张聊天截图一起发给老师人工判断。`;
  } catch (error) {
    aiOutput.textContent = isDouyinMiniApp
      ? `${error.message}。如果只在抖音小程序预览中失败，请在抖音后台确认 request 合法域名也包含 breakup-recovery-assessment.onrender.com；如果网页端也失败，再检查 DeepSeek key。`
      : `${error.message}。如果你还没配置 DeepSeek key，请在本地 .env.local 中设置 DEEPSEEK_API_KEY 后重启服务。`;
  } finally {
    aiAnalyzeButton.disabled = false;
    aiAnalyzeButton.textContent = "生成 AI 深度分析";
  }
}

function updateLiveScore() {
  const { score, redFlags } = getFormValues();
  liveScore.textContent = redFlags.length ? "红线暂停" : `${score}/${maxScore}`;
}

form.addEventListener("change", updateLiveScore);
form.addEventListener("reset", () => {
  window.setTimeout(() => {
    window.clearTimeout(analysisTimer);
    liveScore.textContent = "未开始";
    analysisProcess.classList.add("hidden");
    analysisSteps.innerHTML = "";
    analysisFill.style.width = "0%";
    analysisPercent.textContent = "0%";
    result.classList.add("hidden");
    followupPrompt?.classList.add("hidden");
    latestReportPayload = null;
    latestFormData = null;
    latestReportImageBlob = null;
    if (captureStatus) captureStatus.textContent = "报告图片正在生成";
    calculateButton.disabled = false;
    calculateButton.textContent = "生成测评报告";
  }, 0);
});
calculateButton.addEventListener("click", startReportGeneration);
aiAnalyzeButton?.addEventListener("click", runAiAnalysis);
closeFollowup?.addEventListener("click", () => followupPrompt.classList.add("hidden"));
screenshotFirst?.addEventListener("click", () => followupPrompt.classList.add("hidden"));
followupPrompt?.addEventListener("click", (event) => {
  if (event.target === followupPrompt) {
    followupPrompt.classList.add("hidden");
  }
});
copyTeacherMessage?.addEventListener("click", async () => {
  const text = isDouyinMiniApp ? teacherContactText() : (teacherMessage?.textContent || "");
  try {
    await navigator.clipboard.writeText(text);
    copyTeacherMessage.textContent = isDouyinMiniApp ? "已复制链接" : "已复制";
  } catch {
    copyTeacherMessage.textContent = "请长按复制";
  }
  window.setTimeout(() => {
    copyTeacherMessage.textContent = "复制开场白";
  }, 1600);
});
copyReportPackage?.addEventListener("click", copyReportPackageToClipboard);

document.querySelectorAll(".teacher-link").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (isDouyinMiniApp) {
      event.preventDefault();
      copyTeacherContactForMiniApp();
      openTeacherContact();
    }
    const report = latestReportPayload || {};
    trackEvent("teacher_contact", {
      stage: report.stage || resultTitle?.textContent || "",
      window: report.window || probability?.textContent || "",
      score: report.score ? `${report.score}/${report.maxScore || maxScore}` : "",
      basicInfo: latestFormData ? buildBasicInfo(latestFormData) : undefined
    });
  });
});

if (!visitTracked) {
  visitTracked = true;
  trackEvent("visit");
}
