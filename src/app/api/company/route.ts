import { NextResponse } from 'next/server';
import { getBrowser } from '@/lib/puppeteer';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        const parsedUrl = new URL(url);
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            return NextResponse.json({ error: 'Invalid protocol' }, { status: 400 });
        }
    } catch {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    let browser;
    try {
        browser = await getBrowser();
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.goto(url, { waitUntil: 'networkidle2' });

        // Extract details
        const details = await page.evaluate(() => {
            // Helper to get text by label
            const getByLabel = (label: string) => {
                // Try dt/dd first
                const dts = Array.from(document.querySelectorAll('dt'));
                const dt = dts.find(el => (el as HTMLElement).innerText.includes(label));
                if (dt && dt.nextElementSibling) {
                    return (dt.nextElementSibling as HTMLElement).innerText.trim();
                }

                // Try th/td
                const ths = Array.from(document.querySelectorAll('th'));
                const th = ths.find(el => (el as HTMLElement).innerText.includes(label));
                if (th && th.nextElementSibling) {
                    return (th.nextElementSibling as HTMLElement).innerText.trim();
                }

                return '';
            };

            const name = (document.querySelector('.name') as HTMLElement)?.innerText?.trim() || '';
            const ceo = (document.querySelector('.ceo .name') as HTMLElement)?.innerText?.trim() || getByLabel('대표자');
            const address = (document.querySelector('.address') as HTMLElement)?.innerText?.trim() || getByLabel('주소');
            const type = getByLabel('기업구분');
            const industry = getByLabel('업종') || getByLabel('산업');
            const majorBusiness = getByLabel('주요사업');
            const establishmentDate = getByLabel('설립일');
            const revenue = getByLabel('매출액');
            const employees = getByLabel('사원수');
            const homepage = document.querySelector('.homepage a')?.getAttribute('href') || getByLabel('홈페이지');

            return {
                name,
                ceo,
                address,
                type,
                industry,
                majorBusiness,
                establishmentDate,
                revenue,
                employees,
                homepage
            };
        });

        return NextResponse.json(details);

    } catch (error) {
        console.error('Details error:', error);
        return NextResponse.json({
            error: 'Failed to fetch company details',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    } finally {
        if (browser) await browser.close();
    }
}
