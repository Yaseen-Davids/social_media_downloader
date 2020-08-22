const showMultiple = async (page) => {
  return await new Promise(async (resolve, reject) => {
    const dots = await page.$$("div[class*='Yi5aA']");

    for (let i = 0; i < dots.length - 1; i++) {
      await page.click("button[class*='_6CZji']");
    }

    resolve();
  });
};

const isMultipleCheck = async (data, page) => {
  try {
    const isMultiple = await page.$("div[class='JSZAJ  _3eoV-  IjCL9  WXPwG']");
    const username = await page.$eval("a[class='sqdOP yWX7d     _8A5w5   ZIAjV ']", (el) => el.textContent);

    if (isMultiple) {
      await showMultiple(page);
      const links = await page.$$("div[class*='Yi5aA']");
      for (let i = 0; i < links.length; i++) {
        const media = await downloadInstagramMedia(page, username);
        data.push(media);
      }
    } else {
      const media = await downloadInstagramMedia(page, username);
      data.push(media);
    }
  } catch (error) {
    throw new Error(error);
  }
};

const downloadInstagramMedia = async (page, username) => {
  try {
    const media = await page.$("img[class*='FFVAD']");
    const mediaType = media ? "image" : "video";

    if (mediaType === "video") {
      const videoLink = await page.$("video[class='tWeCl']");
      const videoUrl = await (await videoLink.getProperty("src")).jsonValue();

      return { url: videoUrl, username, type: "video" };
    } else {
      const imageLink = await page.$("img[class='FFVAD']");
      const imgUrl = await (await imageLink.getProperty("src")).jsonValue();

      return { url: imgUrl, username, type: "image" };
    }
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  getTiktokVideoUrl: async (context, url) => {
    try {
      const page = await context.newPage();

      await page.evaluateOnNewDocument(() => delete navigator.__proto__.webdriver); // tiktok doesn't seem to work when it detects debugger mode
      await page.setViewport({ width: 800, height: 768 });

      await page.goto(url, { waitUntil: "networkidle2" });

      const errorPage = await page.$("div[class='jsx-2985563530 video-detail-container'] > div > img");

      if (errorPage) {
        throw "Cannot find post!";
      }

      let videoLink = await page.$("video[class='jsx-3536131567 video-player']");
      if (!videoLink) {
        videoLink = await page.$("video[class='jsx-3536131567 horizontal video-player']");
      }
      const videoUrl = await (await videoLink.getProperty("src")).jsonValue();

      let usernameEl = await page.$("h2[class*='jsx-1939796256 jsx-932449746 user-username']");
      if (!usernameEl) {
        usernameEl = await page.$("h3[class*='author-uniqueId jsx-242381890']");
      }
      if (!usernameEl) {
        throw "Cannot find username!";
      }

      const username = await (await usernameEl.getProperty("textContent")).jsonValue();

      await page.close();
      await context.close();
      return { url: videoUrl, username, type: "video" };
    } catch (error) {
      throw new Error(error);
    }
  },
  downloadSingleByUrl: async (context, url) => {
    try {
      const page = await context.newPage();
      const data = [];

      await page.evaluateOnNewDocument(() => delete navigator.__proto__.webdriver); // tiktok doesn't seem to work when it detects debugger mode
      await page.setViewport({ width: 800, height: 768 });

      await page.goto(url, { waitUntil: "networkidle2" });

      if (url.includes("tiktok")) {
        const errorPage = await page.$("div[class='jsx-2985563530 video-detail-container'] > div > img");

        if (errorPage) {
          throw "Cannot find post!";
        }

        let videoLink = await page.$("video[class='jsx-3536131567 video-player']");

        if (!videoLink) {
          videoLink = await page.$("video[class='jsx-3536131567 horizontal video-player']");
        }
        const videoUrl = await (await videoLink.getProperty("src")).jsonValue();

        let usernameEl = await page.$("h2[class*='jsx-1939796256 jsx-932449746 user-username']");

        if (!usernameEl) {
          usernameEl = await page.$("h3[class*='author-uniqueId jsx-242381890']");
        }

        if (!usernameEl) {
          throw "Cannot find username!";
        }

        const username = await (await usernameEl.getProperty("textContent")).jsonValue();

        data.push({ url: videoUrl, username, type: "video" });
      } else {
        const errorPage = await page.$("section[class='_9eogI E3X2T'] > main > div > h2");

        if (errorPage) {
          throw "Cannot find post!";
        }

        await isMultipleCheck(data, page);
      }

      await page.close();
      await context.close();
      return data;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  },
};
