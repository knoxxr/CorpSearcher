const puppeteer = require('puppeteer');
const fs = require('fs');

async function debug() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const url = 'https://www.jobkorea.co.kr/Search/?stext=%EC%82%BC%EC%84%B1%EC%A0%84%EC%9E%90&tabType=corp&Page_No=1';
    console.log('Navigating to:', url);
    await page.goto(url, { waitUntil: 'networkidle2' });

    const html = await page.content();
    fs.writeFileSync('debug.html', html);
    console.log('Saved HTML to debug.html');

    await browser.close();
}

debug();
