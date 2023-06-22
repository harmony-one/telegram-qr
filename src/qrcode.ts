import * as QRCode from "qrcode";


interface Params {
  url: string,
  margin?: number,
  width?: number
}

function normalizeUrl(url: string) {

  if (!url.startsWith('http')) {
    url = 'https://' + url;
  }

  try {
    const parsedUrl = new URL(url);
    if (!parsedUrl.protocol.startsWith('http')) {
      parsedUrl.protocol = 'https:';
    }
    return parsedUrl.href;
  } catch (error) {
    // Handle invalid URL
    console.error('Invalid URL:', url);
    return url;
  }
}

export const createQRCode = ({url, margin = 0, width = 512}: Params): Promise<Buffer> => {
  return QRCode.toBuffer(normalizeUrl(url), {margin: margin, width: width, type: "png", errorCorrectionLevel: "high" })
}