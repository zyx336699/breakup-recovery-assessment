Page({
  data: {
    webUrl: "https://breakup-recovery-assessment.onrender.com/?source=douyin_miniapp&utm_source=douyin_miniapp"
  },
  onWebMessage(event) {
    console.log("web-view message", event.detail);
  }
});
