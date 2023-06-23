import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { config } from './config'
import { NewMessage, NewMessageEvent } from "telegram/events";
import { SDClient } from "./sdClient/SDClient";
import { createQRCode } from "./qrcode";
import * as fs from "fs";
import * as path from "path"

const { telegramToken, telegramApiId, telegramApiHash } = config

const sessionId = '';

const stringSession = new StringSession(sessionId);

const sdClient = new SDClient();

export const initTelegramClient = async () => {
  const client = new TelegramClient(stringSession, telegramApiId, telegramApiHash, {
    connectionRetries: 5,
  });
  await client.start({
    botAuthToken: telegramToken,
  });
  console.log('Session:', client.session.save());

  async function sendHelp(event: NewMessageEvent) {

    const sender = await event.message.getSender();

    if (!sender) {
      return;
    }

    await client.sendMessage(sender, {
      message: 'Send a message with the "qr" command and your prompts: /qr LINK PROMPTS.'
    })

    await client.sendMessage(sender, {
      message: 'Example: /qr h.country/ai astronaut, sky, colorful',
      linkPreview: false,
    })

    // const qrImageBuffer = await createQRCode({value: 'h.country'});
    // const imgBuffer = await sdClient.img2img(qrImageBuffer.toString('base64'), 'astronaut, sky, colorful');

    const filePath = path.join(__dirname, '../files/qrcodes/demo_astronaut_qr.png');
    const imgBuffer = fs.readFileSync(filePath)

    // hack from gramjs type docs
    // @ts-ignore
    imgBuffer.name = 'demo.png';

    client.sendMessage(sender, {
      file: imgBuffer,
    })
  }

  async function handleNewMessage(event: NewMessageEvent) {
    const message = event.message;

    // Checks if it's a private message (from user or bot)
    if (event.isPrivate){
      const sender = await message.getSender();

      if (!sender) {
        return;
      }

      const [command, url, ...prompts] = message.text.split(' ');

      if (command === '/start') {
        sendHelp(event);
        return;
      }

      if (command == "/qr") {
        await client.sendMessage(sender, {
          message: 'Wait a minute...'
        });

        try {
          const qrImageBuffer = await createQRCode({url: url, margin: 1});
          const imgBuffer = await sdClient.img2img(qrImageBuffer.toString('base64'), prompts.join(' '));

          if (!imgBuffer) {
            return;
          }

          // hack from gramjs type docs
          // @ts-ignore
          imgBuffer.name = message.text + '.png';
          client.sendMessage(sender, {
            message: url + ' ' + prompts.join(' '),
            file: imgBuffer,
          })
        } catch (ex) {
          client.sendMessage(sender, {
            message: 'internal error'
          });
        }

        return;
      }

      sendHelp(event)
    }
  }

  client.addEventHandler(handleNewMessage, new NewMessage({incoming: true, outgoing: false}));

  return client
}