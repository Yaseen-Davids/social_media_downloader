const showMultiple = async (page) => {
  return await new Promise(async (resolve, reject) => {
    const dots = await page.$$("div[class='Yi5aA ']");

    for (let i = 0; i < dots.length - 1; i++) {
      await page.click("button[class='  _6CZji   ']");
    }

    resolve();
  });
};

const isMultipleCheck = async (data, page) => {
  try {
    const isMultiple = await page.$("ul[class='vi798']");
    const username = await page.$eval("div[class='e1e1d']", (el) => el.textContent);

    if (isMultiple) {
      await showMultiple(page);
      const links = await page.$$("li[class='Ckrof']");
      for (let i = 0; i < links.length; i++) {
        const media = await downloadInstagramMedia(links[i], username);
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
    const media = await page.$("div[class='KL4Bh']");
    const mediaType = media ? "image" : "video";

    if (mediaType === "video") {
      const videoLink = await page.$("video[class='tWeCl']");
      const videoUrl = await (await videoLink.getProperty("src")).jsonValue();

      return { url: videoUrl, username, type: "video" };
    } else {
      const imageLink = await page.$("img[class='FFVAD']");
      const videoUrl = await (await imageLink.getProperty("src")).jsonValue();

      return { url: videoUrl, username, type: "image" };
    }
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  downloadSingleByUrl: async (context, url) => {
    try {
      const page = await context.newPage();
      const data = [];

      // tiktok doesn't seem to work when it detects debugger mode
      await page.evaluateOnNewDocument(() => {
        delete navigator.__proto__.webdriver;
      });

      await page.goto(url);

      if (url.includes("tiktok")) {
        await page.waitForSelector("div[class='jsx-45460717 main-body page-with-header']");

        const errorPage = await page.$("div[class='jsx-2985563530 video-detail-container'] > div > img");

        if (errorPage) {
          throw "Cannot find post!";
        }

        const videoLink = await page.waitForSelector("video[class='jsx-3536131567 horizontal video-player']");
        const videoUrl = await (await videoLink.getProperty("src")).jsonValue();
        const username = await page.$eval("h2[class='jsx-1939796256 jsx-932449746 user-username underline']", (el) => el.textContent);

        data.push({ url: videoUrl, username, type: "video" });
      } else {
        await page.waitForSelector("section[class='_9eogI E3X2T'] > main");

        const errorPage = await page.$("section[class='_9eogI E3X2T'] > main > div > h2");

        if (errorPage) {
          throw "Cannot find post!";
        }

        // await page.waitForSelector("div[class='ltEKP']");

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
