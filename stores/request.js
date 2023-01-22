export function POST(relativeUrl, data, token) {
  return new Promise((resolve, reject) => {
    var header = {};

    if (data) {
      header["content-type"] = "application/json";
    }

    if (token && token !== "") {
      // Authorization: "Bearer <insert_your_JWT_here>"
      header["Authorization"] = `Bearer ${token}`;
    }

    wx.request({
      url: `https://diff.minish-cap.com${relativeUrl}`,
      data: data,
      header: header,
      method: "POST",
      dataType: "json",
      responseType: "text",
      complete: (res) => {
        if (res.statusCode === 200) {
          resolve(res);
        } else {
          if (res.data && res.data.msg) {
            res.errMsg = res.data.msg;
          } else if (res.statusCode === 404) {
            res.errMsg = "err.page_not_found";
          }
          reject(res);
        }
      },
    });
  });
}

export function GET(relativeUrl, token) {
  return new Promise((resolve, reject) => {
    var header = {};

    if (token && token !== "") {
      // Authorization: "Bearer <insert_your_JWT_here>"
      header["Authorization"] = `Bearer ${token}`;
    }

    wx.request({
      url: `https://diff.minish-cap.com${relativeUrl}`,
      header: header,
      method: "GET",
      dataType: "json",
      responseType: "text",
      complete: (res) => {
        if (res.statusCode === 200) {
          resolve(res);
        } else {
          if (res.data && res.data.msg) {
            res.errMsg = res.data.msg;
          }
          reject(res);
        }
      },
    });
  });
}

export function UPLOAD_PHOTO(file, formData, token) {
  const header = {};
  if (token && token !== "") {
    // Authorization: "Bearer <insert_your_JWT_here>"
    header["Authorization"] = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `https://diff.minish-cap.com/api/task/init`,
      header: header,
      filePath: file,
      name: "photo",
      formData: formData,
      dataType: "json",
      responseType: "text",
      complete: (res) => {
        if (res.statusCode === 200) {
          resolve(res);
        } else {
          if (res.data && res.data.msg) {
            res.errMsg = res.data.msg;
          } else if (res.statusCode === 404) {
            res.errMsg = "err.page_not_found";
          }
          reject(res);
        }
      },
    });
  });
}
