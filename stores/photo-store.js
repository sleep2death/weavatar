import { promisify } from "../utils/util";
import { GET, UPLOAD_PHOTO } from "./request";
class Store {
  MAX_SIZE = 2000000;
  data = {
    fileList: [],
    count: 12,
  };

  isVKSupported = false;
  session = null;
  canvas = null;
  canvasW = 512;
  canvasH = 512;

  async initSession() {
    try {
      const session = wx.createVKSession({
        track: {
          face: { mode: 2 }, // 1.使用摄像头 2.传入图像
        },
        version: "v1",
      });
      this.session = await this.startSession(session);
      this.isVKSupported = true;

      this.canvas = wx.createOffscreenCanvas({
        type: "2d",
        width: this.canvasW,
        height: this.canvasH,
      });
    } catch (e) {
      this.isVKSupported = false;
    }
  }

  destroySession() {
    if (this.session) {
      this.session.destroy();
    }
  }

  async chooseMedia() {
    const res = await wx.chooseMedia({
      sourceType: ["album", "camera"],
      mediaType: ["image"],
      sizeType: ["compressed"],
      count: this.data.count - this.data.fileList.length,
      camera: ["front"],
    });

    const fm = wx.getFileSystemManager();
    const getFileInfo = promisify(fm.getFileInfo);
    // console.log("selection length:", res.tempFiles.length);

    let skipped = 0; // skipped count

    wx.showLoading({
      title: "照片检测中",
      mask: true,
    });

    for (const tmp of res.tempFiles) {
      if (this.data.fileList.length >= this.data.count) {
        break;
      }

      const info = await getFileInfo({ filePath: tmp.tempFilePath });
      if (this.data.fileList.some((e) => e.digest === info.digest)) {
        skipped++;
        continue;
      }
      if (info.size > 2000000) {
        skipped++;
        continue;
      }

      let width,
        height = 0;
      try {
        const info2 = await wx.getImageInfo({ src: tmp.tempFilePath });
        width = info2.width;
        height = info2.width;
      } catch (e) {
        skipped++;
        continue;
      }

      if (this.isVKSupported) {
        const detected = await this.detectFace(tmp.tempFilePath, width, height);
        if (!detected) {
          skipped++;
          continue;
        }
      }

      this.data.fileList.push({
        url: tmp.tempFilePath,
        digest: info.digest,
        width: width,
        height: height,
      });
    }

    wx.hideLoading();
    if (skipped > 0) {
      wx.showModal({
        title: "忽略了" + skipped + "张照片",
        content: "照片不能大于2M,\n且人脸不能被遮挡",
        showCancel: false,
        confirmText: "继续",
      });
    }

    this.update();
  }

  deleteFile(idx) {
    this.data.fileList.splice(idx, 1);
    this.update();
  }

  async upload(token) {
    try {
      const res = await GET("/api/training/init", token);
      const tid = res.data.training;

      for (const f of this.data.fileList) {
        await UPLOAD_PHOTO(f.url, { tid: tid }, token);
      }

      await GET("/api/training/complete/" + tid, token);
      wx.navigateTo({
        url: "/pages/pending/index",
      });
    } catch (err) {
      if (err && err.errMsg) {
        console.error(err.errMsg);
      }
    }
  }

  async detectFace(path, width, height) {
    const context = this.canvas.getContext("2d");
    const ratio = Math.min(this.canvasW / width, this.canvasH / height);

    const w = width * ratio;
    const h = height * ratio;
    const img = this.canvas.createImage();
    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = path;
    });

    context.clearRect(0, 0, this.canvasW, this.canvasH);
    context.drawImage(
      img,
      (this.canvasW - w) / 2,
      (this.canvasH - h) / 2,
      w,
      h
    );
    const imgData = context.getImageData(0, 0, this.canvasW, this.canvasH);
    return await this._detectFace(this.session, imgData.data.buffer);
  }

  startSession(session) {
    return new Promise((resolve, reject) => {
      session.start((no) => {
        if (no > 0) {
          reject(no);
        } else {
          resolve(session);
        }
      });
    });
  }

  _detectFace(session, buffer) {
    return new Promise((resolve) => {
      session.on("updateAnchors", (anchors) => {
        // console.log("updateAnchors", anchors);
        resolve(true);
      });

      session.on("removeAnchors", (anchors) => {
        resolve(false);
      });

      session.detectFace({
        frameBuffer: buffer,
        width: this.canvasW,
        height: this.canvasH,
        scoreThreshold: 0.6, // 评分阈值
        sourceType: 1,
        modelMode: 1,
      });
    });
  }
}
export default new Store();
