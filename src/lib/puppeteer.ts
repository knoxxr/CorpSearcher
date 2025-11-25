import puppeteer from 'puppeteer';
import chromium from '@sparticuz/chromium';
import { Browser } from 'puppeteer-core';

// Optional: If you want to force local chrome usage even in production for some reason,
// you can use an env var. But usually NODE_ENV is enough.
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export async function getBrowser(): Promise<Browser> {
  let browser;

  if (IS_PRODUCTION) {
    // Production (Vercel/AWS Lambda)
    // We use puppeteer-core + @sparticuz/chromium
    const puppeteerCore = await import('puppeteer-core');
    
    // @sparticuz/chromium specific settings
    // It finds the path to the chromium binary automatically in the lambda environment
    browser = await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  } else {
    // Local Development
    // We use standard puppeteer which uses the locally installed chrome
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  return browser as unknown as Browser;
}
