import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { config } from './config'
import { NewMessage, NewMessageEvent } from "telegram/events";
import { SDClient } from "./sdClient/SDClient";
import { createQRCode } from "./qrcode";

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
      message: 'Please send me a link and provide a prompt: /gen :link :prompt'
    })

    await client.sendMessage(sender, {
      message: 'example: /gen https://h.country anime girl, sky, colorful',
      linkPreview: false,
    })

    const qrImageBuffer = await createQRCode('https://h.country');
    const imgBuffer = await sdClient.img2img(qrImageBuffer.toString('base64'));

    if (!imgBuffer) {
      return;
    }
    // hack from gramjs type docs
    // @ts-ignore
    imgBuffer.name = event.message.text + '.png';

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

      if (command == "/gen") {
        await client.sendMessage(sender, {
          message: 'Wait a minute...'
        });

        const qrImageBuffer = await createQRCode(url);
        const imgBuffer = await sdClient.img2img(qrImageBuffer.toString('base64'), prompts.join(' '));

        if (!imgBuffer) {
          return;
        }

        // hack from gramjs type docs
        // @ts-ignore
        imgBuffer.name = message.text + '.png';
        client.sendMessage(sender, {
            message: url,
            file: imgBuffer,
        })
      }
    }
  }

  client.addEventHandler(handleNewMessage, new NewMessage({incoming: true, outgoing: false}));

  return client
}