import { Injectable } from '@nestjs/common';
import {createQRCode} from "./qrcode";
import {SDClient} from "./sdClient/SDClient";

@Injectable()
export class AppService {

  getHello(): string {
    return 'Hello QR!';
  }

  async generateQRCode(url: string) {
    const sdClient = new SDClient();

    const qrImageBuffer = await createQRCode(url);

    return sdClient.img2img(qrImageBuffer.toString('base64'));
  }
}
