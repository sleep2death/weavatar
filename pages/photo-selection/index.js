import create from "mini-stores";
import globalStore from "../../stores/global-store";
import photoStore from "../../stores/photo-store";

import {
  initFaceDetect,
  faceDetect,
  stopFaceDetect,
} from "../../utils/faceDetect";

const canvasId = "canvas2d";
const maxCanvasWidth = 512;

const stores = {
  $g: globalStore, // 同上
  $p: photoStore,
};

create.Page(stores, {
  data: {
    tempFilePath: "",
  },

  onReady() {
    photoStore.initSession();
  },

  onUnload() {
    photoStore.destroySession();
  },

  onRetry() {},
  async onNext() {
    // await photoStore.detectFace();
    wx.navigateTo({
      url: "/pages/pending/index",
    });
  },

  async onSelectPhoto() {
    await photoStore.chooseMedia();
  },

  onPreviewSelect(evt) {
    wx.showModal({
      title: "是否取消选择该照片",
      content: "",
      showCancel: true,
      cancelText: "否",
      cancelColor: "#000000",
      confirmText: "是",
      success: (result) => {
        if (result.confirm) {
          photoStore.deleteFile(evt.currentTarget.dataset.index);
        }
      },
      fail: () => {},
      complete: () => {},
    });
  },

  async onUpload() {
    try {
      wx.showLoading({
        title: "正在上传",
        mask: true,
      });
      await photoStore.upload(globalStore.token);
    } catch (e) {
      if (e.statusCode && e.statusCode !== 200) {
        wx.showToast({
          title: "网络出错",
          icon: "error",
        });
      }
    } finally {
      wx.hideLoading();
    }
  },
});
