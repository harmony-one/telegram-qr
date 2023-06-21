import {Controller, Get, Query, Res} from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}



  @Get()
  getHello(): string {
    return this.appService.getHello();
  }


  @Get('qr')
  async generateQRCode(@Res() res: Response, @Query('url') url: string) {
    console.log('### url', url);

    if (!url) {
      res.json({'error': 'expected url param'});
      return;
    }
    const a = await this.appService.generateQRCode(url);
    // return this.appService.getHello();

    res.setHeader('Content-Type', 'image/png')
    res.send(a);
  }
}
