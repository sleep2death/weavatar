import create from "mini-stores";
import globalStore from "../../stores/global-store";

const stores = {
  $g: globalStore, // 同上
};

create.Page(stores, {
  data: {},

  onLoad(options) {
    this.session = wx.createVKSession({
      track: {
        face: { mode: 2 }, // mode: 1 - 使用摄像头；2 - 手动传入图像
      },
    });

    // 静态图片检测模式下，每调一次 detectFace 接口就会触发一次 updateAnchors 事件
    this.session.on("updateAnchors", (anchors) => {
      console.log("face detected");
      this.session.stop();
    });

    this.session.on("removeAnchors", () => {
      console.log("face not detected");
      this.session.stop();
    });
  },

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
      await this.detectFace(cm);
    } catch (err) {
      if (err.errMsg && err.errMsg === "chooseMedia:fail cancel") {
        console.log("user canceled");
      } else {
        console.error(err);
      }
    }
  },

  async detectFace(cm) {
    const imgUrl = cm.tempFiles[0].tempFilePath;
    const imgInfo = await wx.getImageInfo({
      src: imgUrl,
    });

    let { width, height } = imgInfo;

    // get image data
    const canvas = wx.createOffscreenCanvas({
      type: "2d",
      width: width,
      height: height,
    });
    const context = canvas.getContext("2d");
    const img = canvas.createImage();
    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = imgUrl;
    });

    context.clearRect(0, 0, width, height);
    context.drawImage(img, 0, 0, width, height);

    const imgData = context.getImageData(0, 0, width, height);

    // 需要调用一次 start 以启动
    this.session.start((errno) => {
      if (errno) {
        // 如果失败，将返回 errno
        throw new Error("err.session.start");
      } else {
        // 否则，返回null，表示成功
        this.session.detectFace({
          frameBuffer: imgData.data.buffer, // 图片 ArrayBuffer 数据。人脸图像像素点数据，每四项表示一个像素点的 RGBA
          width: imgInfo.width, // 图像宽度
          height: imgInfo.height, // 图像高度
          scoreThreshold: 0.8, // 评分阈值
          sourceType: 1,
          modelMode: 0,
        });
      }
    });
  },
});
