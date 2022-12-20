import { GET } from "./request";

class Store {
  // api token
  token = "";

  data = {
    err: "",
    index: 0,
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
