import {scanQRCode} from "./qrcode";
import * as fs from "fs";
import * as path from "path";

// await fs.readFile(path)

describe.only('qrcode', () => {

  it('should parse', async function () {

    const dir = path.join("files", "qrcodes");
    const tests = fs.readdirSync(dir).filter((item) => item.endsWith('.png') && !item.includes('demo'));

    console.log('### tests', tests);

    for (let i = 0; i < tests.length; i++) {
      const filePath = path.join(dir, tests[i])
      const file = fs.readFileSync(filePath)

      try {
        const result = scanQRCode(file);
        console.log('### result', filePath, result);
      } catch (ex) {
        console.log('### error', filePath, ex.message);
      }

    }



    // const patdh = path.join(__dirname, '../files/qrcodes/demo_astronaut_qr.png');
    // const imgBuffer = fs.readFileSync()
    //
    // await fs.readFile(path)
    //
    // scanQRCode()

  });
})