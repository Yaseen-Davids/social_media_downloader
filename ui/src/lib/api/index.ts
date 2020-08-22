import axios from "axios";

export const downloadSingleVideo = async (url: string, direct: boolean) => {
  try {
    const response = await axios.post(`/download/single`, { url });
    console.log("response", response);

    const mediaData = response.data.buffers.map((buffer: { base64: string; fileName: string; type: string }) => ({
      url: `data:${buffer.type === "image" ? "image/jpeg" : "video/mp4"};base64,${buffer.base64}`,
      fileName: buffer.fileName,
      type: buffer.type,
    }));

    if (direct) {
      mediaData.forEach((media: any) => {
        const anchorTag = document.createElement("a");
        anchorTag.href = media.url;
        anchorTag.download = media.fileName;
        anchorTag.click();
      });
      return [];
    }

    return mediaData;
  } catch (error) {
    if (error.response.headers.message) {
      throw error.response.headers.message;
    }
    throw error.message;
  }
};
