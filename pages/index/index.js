import create from "mini-stores";
import globalStore from "../../stores/global-store";

const stores = {
  $g: globalStore, // 同上
};

create.Page(stores, {
  data: {},
  onLoad(options) {
    globalStore.login();
  },
  onRetry() {
    globalStore.login();
  },
  onNext() {
    wx.navigateTo({
      url: "/pages/photo-selection/index",
    });
  },
});
