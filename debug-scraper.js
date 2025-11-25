const puppeteer = require('puppeteer');

async function debug() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const url = 'https://www.jobkorea.co.kr/Company/1696583';
    console.log('Navigating to:', url);
    await page.goto(url, { waitUntil: 'networkidle2' });

    const text = await page.evaluate(() => document.body.innerText);
    console.log('--- BODY TEXT START ---');
    console.log(text.slice(0, 2000)); // Print first 2000 chars
    console.log('--- BODY TEXT END ---');

    // Also try to find specific keywords
    const hasCEO = text.includes('대표자') || text.includes('CEO') || text.includes('한종희');
    console.log('Has CEO keyword:', hasCEO);

    if (hasCEO) {
        // Find the line with the keyword
        const lines = text.split('\n');
        const ceoLine = lines.find(l => l.includes('대표자') || l.includes('CEO') || l.includes('한종희'));
        console.log('CEO Line:', ceoLine);
    }

    await browser.close();
}

debug();
