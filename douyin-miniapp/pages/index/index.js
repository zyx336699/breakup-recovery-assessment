Page({
  data: {
    webUrl: "https://breakup-recovery-assessment.onrender.com/?source=douyin_miniapp&utm_source=douyin_miniapp"
  },
  onWebMessage(event) {
    const messages = event.detail?.data || [];
    const list = Array.isArray(messages) ? messages : [messages];
    const message = list.find((item) => item?.type === "copy_teacher_contact");
    if (!message?.text) return;

    tt.setClipboardData({
      data: message.text,
      success() {
        tt.showToast({
          title: "已复制老师链接",
          icon: "success"
        });
      }
    });
  }
});
