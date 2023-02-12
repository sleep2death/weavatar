import create from "mini-stores";
import { GET, UPLOAD_PHOTO } from "../../stores/request";
import globalStore from "../../stores/global-store";
import photoStore from "../../stores/photo-store";

const stores = {
  $g: globalStore, // 同上
  $p: photoStore,
};

create.Page(stores, {
  data: {},
  onLoad(options) {},
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onShareAppMessage() {
    return {
      title: "",
    };
  },
  async onNext() {
    wx.showLoading({
      title: "正在上传",
      mask: true,
    });

    let tid = ""; // training id
    try {
      const res = await GET("/api/training/init", globalStore.token);
      tid = res.data.training;

      for (const f of photoStore.data.fileList) {
        await UPLOAD_PHOTO(f.url, { tid: tid }, globalStore.token);
      }

      await GET("/api/training/complete/" + tid, globalStore.token);
    } catch (e) {
      wx.showModal({
        title: "上传照片失败",
        content: "请重新尝试",
        confirmText: "确定",
      });
      return;
    } finally {
      wx.hideLoading();
    }

    wx.showLoading({
      title: "正在支付",
      mask: true,
    });

    try {
      const pre = await GET("/api/pay/prepay/" + tid, globalStore.token);
      const res = await wx.requestPayment({
        timeStamp: pre.data.timeStamp,
        nonceStr: pre.data.nonceStr,
        package: pre.data.package,
        signType: pre.data.signType,
        paySign: pre.data.paySign,
      });
    } catch (e) {
      wx.showModal({
        title: "拉起支付失败",
        content: "请重新尝试",
        confirmText: "确定",
      });
      wx.hideLoading();
    }
  },
});
