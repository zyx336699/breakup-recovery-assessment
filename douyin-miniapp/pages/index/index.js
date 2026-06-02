Page({
  data: {
    webUrl: "https://breakup-recovery-assessment.onrender.com/?source=douyin_miniapp&utm_source=douyin_miniapp"
  },
  onWebMessage(event) {
    const messages = event.detail?.data || [];
    const list = Array.isArray(messages) ? messages : [messages];
    const copyMessage = list.find((item) => item?.type === "copy_teacher_contact" || item?.type === "open_teacher_contact");
    if (copyMessage?.text) {
      tt.setClipboardData({
        data: copyMessage.text,
        success() {
          tt.showToast({
            title: "已复制老师链接",
            icon: "success"
          });
        }
      });
    }

    const openMessage = list.find((item) => item?.type === "open_teacher_contact");
    if (!openMessage?.url || typeof tt.openSchema !== "function") return;

    tt.openSchema({
      schema: openMessage.url,
      success() {
        console.log("open teacher contact success");
      }
    });
  }
});
