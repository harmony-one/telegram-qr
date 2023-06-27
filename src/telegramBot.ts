import {Bot, Context, InputFile, MemorySessionStorage, session, SessionFlavor} from "grammy";
import { config } from './config'
import * as path from "path";
import {createQRCode, isQRCodeReadable} from "./qrcode";
import pRetry from "p-retry";
import {SDClient} from "./sdClient/SDClient";


interface SessionData {
    qrMargin: number
}

type BotContext = Context & SessionFlavor<SessionData>;

const sdClient = new SDClient();


const sendQrCodeImg2Img = async (url: string, prompt: string, ctx: BotContext) => {
  if (!url) {
    await ctx.reply("command /qr should contain an url");
    return;
  }

  try {
    const qrImageBuffer = await createQRCode({url: url, margin: ctx.session.qrMargin});

    const operation = async () => {

      console.log('### retry');

      const imgBuffer = await sdClient.img2img(qrImageBuffer.toString('base64'), prompt);

      if (!imgBuffer) {
        throw new Error('internal error unreadable');
      }

      if (!isQRCodeReadable(imgBuffer)) {
        throw new Error('unreadable');
      }

      return imgBuffer;
    }

    // @ts-expect-error
    const imgBuffer = await pRetry(operation, {retries: 10});

    if (!imgBuffer) {
      // TODO: send feedback
      return;
    }
    const command = `/qr ${url} ${prompt}`

    await ctx.replyWithPhoto(new InputFile(imgBuffer, 'qr_code.png'), {
      caption: command,
    })
  } catch (ex) {
    console.log('### ex', ex);
    ctx.reply('internal error')
  }
}

export const initTelegramBot = (): Bot => {

  console.log('### config', config);
  const bot = new Bot<BotContext>(config.telegramToken);

  function createInitialSessionData(): SessionData {
    return {  qrMargin: 1 };
  }
  bot.use(session({ initial: createInitialSessionData, storage: new MemorySessionStorage() }));

  bot.command("start", (ctx) => {
    (async () => {
      await ctx.reply("Send a message with the \"qr\" command and your prompts: \n/qr LINK PROMPTS." +
        "\n\n" +
        "Example:\n/qr h.country/ai astronaut, sky, colorful", {disable_web_page_preview: true});
      const filePath = path.join(__dirname, '../files/qrcodes/demo_astronaut_qr.png');
      // const imgBuffer = fs.readFileSync(filePath);

      await ctx.replyWithPhoto(new InputFile(filePath), {});
    })();
  })

  bot.command("qrMargin", (ctx) => {
    const margin = parseInt(ctx.match, 10);

    console.log('### ctx.match', ctx.match);
    console.log('### margin', margin);
    if (!isNaN(margin)) {
      console.log('### set margin');
      ctx.session.qrMargin = margin;
    }
    ctx.reply('qrMargin: ' + ctx.session.qrMargin)
  });

  bot.command('qr2', (ctx) => {
    (async () => {
      if (!ctx.message || !ctx.message.text) {
        // TODO: send feedback
        ctx.reply("Please send /qr command")
        return;
      }


      ctx.reply('Wait a minute...');

      const [command, url, ...prompts] = ctx.message.text.split(' ');

      if (!url) {
        await ctx.reply("command /qr should contain an url");
        return;
      }



      try {
        const qrImageBuffer = await createQRCode({url: url, margin: ctx.session.qrMargin});

        const operation = async () => {

          const imgBuffer = await sdClient.text2img(qrImageBuffer.toString('base64'), prompts.join(' '));

          if (!imgBuffer) {
            throw new Error('internal error unreadable');
          }

          if (!isQRCodeReadable(imgBuffer)) {
            throw new Error('unreadable');
          }

          return imgBuffer;
        }

        // @ts-expect-error
        const imgBuffer = await pRetry(operation, {retries: 10});

        if (!imgBuffer) {
          // TODO: send feedback
          return;
        }

        const command = `/qr2 ${url} ${prompts.join(' ')}`

        await ctx.replyWithPhoto(new InputFile(imgBuffer, 'qr_code.png'), {
          caption: command,
        })


      } catch (ex) {
        ctx.reply('/qr2 internal error')
      }
    })()
  })

  bot.command('help', (ctx) => {
    ctx.reply("/start - start the bot\n" +
      "/qr LINK PROMPTS\n" +
      "Example:\n" +
      "/qr h.country/ai astronaut, sky, colorful\n" +
      "/qr2 LINK PROMPTS" +
      "Example:\n" +
      "/qr2 h.country/ai astronaut, sky, colorful\n" +
      "/qrMargin - set qr margin", {disable_web_page_preview: true})
  })

  bot.command('qr', (ctx) => {

    (async () => {

      if (!ctx.message || !ctx.message.text) {
        // TODO: send feedback
        ctx.reply("Please send /qr command")
        return;
      }

      ctx.reply('Wait a minute...');

      console.log('### ctx.message.text', ctx.message.text);
      const [command, url, ...prompts] = ctx.message.text.split(' ');

      if (!url) {
        await ctx.reply("command /qr should contain an url");
        return;
      }

      await sendQrCodeImg2Img(url, prompts.join(' '), ctx)


    })()
  });

  bot.on("message", async (ctx) => {
    ctx.reply("Please send /qr command");
  })

  return bot;
}


