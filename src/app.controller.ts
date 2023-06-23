import {Controller, Get, Query, Res} from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import {createQRCode} from "./qrcode";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}



  @Get()
  getHello(): string {
    return this.appService.getHello();
  }


  @Get('qr')
  async generateQRCode(@Res() res: Response, @Query('url') url: string) {
    if (!url) {
      res.json({'error': 'expected url param'});
      return;
    }
    const qrImageBuffer = await createQRCode({url: url, margin: 1});

    res.setHeader('Content-Type', 'image/png')
    res.send(qrImageBuffer);
  }
}
