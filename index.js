import puppeteer from 'puppeteer';
import TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';
import * as cron from 'node-cron';
dotenv.config();

const token = process.env.TOKEN;
const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Pronto! Você verá os sabores disponíveis no site a cada hora.');
  const firstData = await fetchData();
  bot.sendMessage(chatId, firstData, {parse_mode: 'Markdown'});
  cron.schedule('0 */1 * * *', async () => {
    const data = await fetchData();
    bot.sendMessage(chatId, data, {parse_mode: 'Markdown'});
  });

});

const fetchData = async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  await page.goto('https://www.gsuplementos.com.br/whey-protein-concentrado-1kg-growth-supplements-p985936');

  await page.setViewport({width: 1080, height: 1024});

  let originalList =  await page.evaluate(() => Array.from(document.querySelectorAll('body > main > section.topoDetalhe > div.row.large-collapse.align-center.large-align-right > div.small-12.large-3.columns.text-center.large-text-left.topoDetalhe-boxRight-mob.z-2 > div > div:nth-child(11) > div.boxAtributoSimples.borderBlack > div > ul > li'), e => e.textContent));
  originalList.shift();

  const available = originalList.filter(item => !item.includes('Indisponível'));
  const unavailable = originalList.filter(item => item.includes('Indisponível')).map(item => item.split(' ').slice(0, -1).join(' '));

  const result = `***Disponível:***
${available.map((item, index) => `${index+1}. ${item}\n`).join('')}
***Indisponível:***
${unavailable.map((item, index) => `${index+1}. ${item}\n`).join('')}

[Copmrar agora:](https://www.gsuplementos.com.br/whey-protein-concentrado-1kg-growth-supplements-p985936)`;

  await browser.close();

  return result;
};