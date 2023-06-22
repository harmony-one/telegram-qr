import * as QRCode from "qrcode";

export const createQRCode = (str: string): Promise<Buffer> => {
  return QRCode.toBuffer(str, {margin: 5, width: 512, type: "png", errorCorrectionLevel: "high" })
}