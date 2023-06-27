import axios from "axios";
import {config} from "../config.js";

type Img2ImgResponse = {
  images: string[]
  parameters: object
  info: string
}

const HOST = config.sdHost;

const getImg2ImgConfig = ({imgBase64, prompt}: {prompt: string, imgBase64: string}) => {
  return {
    "init_images": [imgBase64],
    "prompt": prompt,
    "negative_prompt": "(KHFB, AuroraNegative),(Worst Quality, Low Quality:1.4)",
    "seed": -1,
    "subseed": -1,
    "subseed_strength": 0,
    "sampler_name": "DPM++ 2M Karras",
    "batch_size": 1,
    "n_iter": 1,
    "steps": 60,
    width: '512',
    height: '512',
    "cfg_scale": 7,
    "seed_resize_from_h": -1,
    "seed_resize_from_w": -1,
    "restore_faces": false,

    "alwayson_scripts": {
      "controlnet": {
        "args": [
          {
            "input_image": imgBase64,
            "module": "tile_resample",
            "model": "control_v11f1e_sd15_tile [a371b31b]",
            "weight": 1,
            // "mask": "pixel_perfect",
            "resize_mode": 0,
            "control_mode": 0,
            "guidance_start": 0.20,
            "guidance_end": 0.9,
            "pixel_perfect": true,
          }
        ]
      }
    }
  }
}

const getTxt2ImgConfig = ({imgBase64, prompt}: {prompt: string, imgBase64: string}) => {
  return {
    "prompt": prompt,
    "negative_prompt": "(KHFB, AuroraNegative),(Worst Quality, Low Quality:1.4)",
    "seed": -1,
    "subseed": -1,
    "subseed_strength": 0,
    "sampler_name": "DPM++ 2M Karras",
    "batch_size": 1,
    "n_iter": 1,
    "steps": 60,
    width: '600',
    height: '600',
    "cfg_scale": 7,
    "seed_resize_from_h": -1,
    "seed_resize_from_w": -1,
    "restore_faces": false,

    "alwayson_scripts": {
      "controlnet": {
        "args": [
          {
            "input_image": imgBase64,
            "module": "none",
            "model": "controlnetQRPatternQR_v10 [c4220211]",
            "weight": 1,
            // "mask": "pixel_perfect",
            "resize_mode": 0,
            "control_mode": 0,
            "guidance_start": 0.8,
            "guidance_end": 0.75,
            "pixel_perfect": true,
          }
        ]
      }
    }
  }
}


export class SDClient {
  async img2img(imgBase64: string, propmt?: string) {
    // const filePath = path.join(__dirname, '../../files/qrcodes/h_country.png');
    // const imgBase64 = fs.readFileSync(filePath, 'base64')

    const _prompt = propmt || "one anime jumping girl, colorful";

    const body = getImg2ImgConfig({imgBase64, prompt: _prompt})

    const config = {headers: {'Content-Type': 'application/json'}};
    try {
      const response = await axios.post(`${HOST}/sdapi/v1/img2img`, body, config);
      const data: Img2ImgResponse = response.data;
      const img = data.images[0]

      return Buffer.from(img, 'base64')
    } catch (ex) {
      console.log('### ex', ex);
      console.log('### ex', JSON.stringify(ex.response.data));
    }
  }

  async text2img(imgBase64: string, propmt?: string) {
    // const filePath = path.join(__dirname, '../../files/qrcodes/h_country.png');
    // const imgBase64 = fs.readFileSync(filePath, 'base64')

    const _prompt = propmt || "one anime jumping girl, colorful";

    const body = getTxt2ImgConfig({imgBase64, prompt: _prompt})

    const config = {headers: {'Content-Type': 'application/json'}};
    try {
      const response = await axios.post(`${HOST}/sdapi/v1/txt2img`, body, config);
      const data: Img2ImgResponse = response.data;
      const img = data.images[0];
      return Buffer.from(img, 'base64')
    } catch (ex) {
      console.log('### ex', ex);
      console.log('### ex', JSON.stringify(ex.response.data));
    }
  }

}