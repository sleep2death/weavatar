import create from "mini-stores";
import globalStore from "../../stores/global-store";
import { UPLOAD_PHOTO } from "../../stores/request";

const stores = {
  $g: globalStore, // 同上
};

create.Page(stores, {
  data: {
    tempFilePath: "",
  },

  onLoad(options) {},

  onRetry() {},
  onNext() {
    // wx.navigateTo({
    //   url: "/pages/photo-selection/index",
    // });
  },
  async onSelectPhoto() {
    try {
      const cm = await wx.chooseMedia({
        camera: "front",
        count: 1,
        mediaType: ["image"],
      });

      const tempFile = cm.tempFiles[0];
      const imgInfo = await wx.getImageInfo({
        src: tempFile.tempFilePath,
      });
      let { width, height } = imgInfo;
      if (tempFile.size > 2000000) {
        throw new Error("err.chooseMedia.too_big");
      }
      wx.showLoading({
        title: "上传中",
        mask: true,
      });

      const res = await UPLOAD_PHOTO(
        tempFile.tempFilePath,
        { width: width, height: height },
        globalStore.token
      );
      const json = JSON.parse(res.data);

      wx.hideLoading();
      wx.navigateTo({
        url: "/pages/process/index?id=" + json.task,
      });
    } catch (err) {
      if (err.errMsg && err.errMsg === "chooseMedia:fail cancel") {
        console.log("user canceled");
      } else if (err.toString() === "Error: err.chooseMedia.too_big") {
        wx.showToast({
          title: "照片不能大于2M",
          icon: "error",
          duration: 1500,
        });
      } else {
        wx.showToast({
          title: "照片上传失败",
          icon: "error",
          duration: 1500,
        });
        console.error(err);
      }
    }
  },
});
