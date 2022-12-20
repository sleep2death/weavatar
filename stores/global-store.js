import { GET } from "./request";

class Store {
  // api token
  token = "";
  isSupportV2 = wx.isVKSupport("v2");

  data = {
    err: "",
    colors: {
      yellow: "rgb(0, 149, 246)",
    },
    text: {
      welcome: {
        title: "机车头",
        subtitle: "机车头，一款古怪难用的AI头像生成器",
        content: "content message",
        nextButton: "立刻开始",
      },
      selection: {
        title: "选择照片",
        button: "请选择 1 张自拍照",
      },
      nextButton: "下一步",
    },
  };

  login() {
    wx.showLoading({
      title: "正在登录",
      mask: true,
    });
    wx.login({
      timeout: 10000,
      success: async (res) => {
        try {
          const r = await GET("/api/auth/wx/code/" + res.code);
          if (r.data.token) {
            this.token = r.data.token;
            wx.showToast({
              title: "登录成功",
              icon: "success",
              duration: 1000,
              mask: false,
            });
            this.clearError();
          } else {
            throw new Error("token为空");
          }
        } catch (err) {
          this.error("登录失败", err);
        } finally {
          wx.hideLoading();
        }
      },
      fail: (err) => {
        const msg = "无法获得登陆代码";
        error("无法获得登陆代码", err);
        wx.hideLoading();
      },
    });
  }
  error(msg, err) {
    console.error(err);
    wx.showToast({
      title: msg,
      icon: "error",
      duration: 1000,
      mask: false,
    });
    this.data.err = msg;
    this.update();
  }

  clearError() {
    this.data.err = "";
    this.update();
  }
}

export default new Store();
