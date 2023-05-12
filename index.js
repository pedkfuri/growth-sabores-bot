import puppeteer from 'puppeteer';
import TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';
dotenv.config();

const token = process.env.TOKEN;
const bot = new TelegramBot(token, {polling: true});

(async () => {
  const browser = await puppeteer.launch({headless: 'new'});
  const page = await browser.newPage();

  await page.goto('https://www.gsuplementos.com.br/whey-protein-concentrado-1kg-growth-supplements-p985936');

  await page.setViewport({width: 1080, height: 1024});

  let originalList =  await page.evaluate(() => Array.from(document.querySelectorAll('body > main > section.topoDetalhe > div.row.large-collapse.align-center.large-align-right > div.small-12.large-3.columns.text-center.large-text-left.topoDetalhe-boxRight-mob.z-2 > div > div:nth-child(11) > div.boxAtributoSimples.borderBlack > div > ul > li'), e => e.textContent));
  originalList.shift();

  const available = originalList.filter(item => !item.includes('Indisponível'));
  const unavailable = originalList.filter(item => item.includes('Indisponível')).map(item => item.split(' ').shift());

  const result = `Disponível:
${available}
Indisponível:
${unavailable}`;

  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, result);
  });

  await browser.close();
})();