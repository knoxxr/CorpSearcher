const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        const query = '삼성전자';
        const url = `https://www.jobkorea.co.kr/Search/?stext=${encodeURIComponent(query)}&tabType=corp&Page_No=1`;
        console.log(`Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Extract data using text-based search
        const results = await page.evaluate(() => {
            const data = [];
            const anchors = Array.from(document.querySelectorAll('a'));

            anchors.forEach(a => {
                const text = a.innerText.trim();
                const href = a.href;

                if (!text || href.includes('javascript') || href.includes('#')) return;

                if (text.includes('삼성전자')) {
                    // Get parent text to see context
                    let container = a.parentElement;
                    let context = '';
                    // Go up a few levels to find a container with more text
                    for (let i = 0; i < 3; i++) {
                        if (container) {
                            context += `\nLevel ${i} Tag: ${container.tagName} Class: ${container.className}\nText: ` + container.innerText;
                            container = container.parentElement;
                        }
                    }

                    data.push({ name: text, link: href, context: context });
                }
            });

            return data.slice(0, 3); // Just take first 3
        });

        console.log('Results with context:', JSON.stringify(results, null, 2));

        await browser.close();
    } catch (error) {
        console.error('Puppeteer error:', error);
    }
})();
