import create from "mini-stores";
import globalStore from "../../stores/global-store";
import { GET } from "../../stores/request";

const statusList = ["等待中", "处理中", "已完成", "生成失败"];
const stores = {
  $g: globalStore, // 同上
};

create.Page(stores, {
  fetchLoop: null,
  data: {
    statusText: "等待中",
  },
  onLoad(options) {
    this.setData({
      task: options.id,
    });
    this.getStatus();
  },
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onShareAppMessage() {
    return {
      title: "",
    };
  },
  getStatus() {
    this.fetchLoop = setTimeout(async () => {
      const res = await GET(
        "/api/task/status/" + this.data.task,
        globalStore.token
      );
      if (res.data.status >= 2) {
        const t = await GET(
          "/api/task/detail/" + this.data.task,
          globalStore.token
        );

        const images = t.data.images.map(
          (item) => "http://cdn.minish-cap.com" + item
        );
        t.data.images = images;

        this.setData({
          task: t.data,
          statusText: statusList[t.data.status],
        });
      } else {
        this.setData({
          statusText:
            res.data.status === 0
              ? "等待中，您是第" + res.data.queue + "位"
              : "处理中",
        });
        // TODO: timeout handling
        this.getStatus();
      }
    }, 5000);
  },
  onImageTapped(evt) {
    const images = this.data.task.images;
    const index = evt.target.dataset.index;
    wx.previewImage({
      current: images[index],
      urls: images,
      success: (result) => {},
      fail: () => {},
      complete: () => {},
    });
  },
});
