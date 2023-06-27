import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {scanQRCode} from "../src/qrcode";
import * as fs from "fs";
import * as path from "path";

// await fs.readFile(path)

describe('AppController (e2e)', () => {
  let app: INestApplication;

  it('should parse', async function () {

    const tests = fs.readdirSync(path.join("../", "files", "qrcodes"));

    console.log('### tests', tests);



    // const patdh = path.join(__dirname, '../files/qrcodes/demo_astronaut_qr.png');
    // const imgBuffer = fs.readFileSync(filePath)
    //
    // await fs.readFile(path)
    //
    // scanQRCode()

  });
})