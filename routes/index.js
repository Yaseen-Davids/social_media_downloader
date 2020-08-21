const express = require("express");
const { downloadSingleByUrl } = require("../repositories");
const router = express.Router();
const request = require("request");

router.get("/status", (req, res, next) => {
  return res.json({ message: "API IS RUNNING" });
});

router.post("/download/single", async (req, res, next) => {
  try {
    const { url } = req.body;
    console.log(url);
    const context = req.puppeteerContext;
    const data = await downloadSingleByUrl(context, url);
    const buffers = [];
    let chunks = [];

    await new Promise(async (resolve, reject) => {
      try {
        for (let i = 0; i < data.length; i++) {
          await new Promise((resolve2, reject2) => {
            request(data[i])
              .on("error", () => {
                reject2();
              })
              .on("data", (data) => {
                chunks.push(data);
              })
              .on("complete", () => {
                const fileName = data[i].username + `__${Math.floor(Math.random() * new Date().getTime())}.${data[i].type === "image" ? "jpeg" : "mp4"}`;
                const buffer = Buffer.concat(chunks);
                buffers.push({ base64: buffer.toString("base64"), fileName, type: data[i].type });
                chunks = [];
                resolve2();
              });
          });
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });

    return res.json({ buffers }).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
