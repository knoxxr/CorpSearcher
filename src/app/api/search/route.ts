import { NextResponse } from 'next/server';
import { getBrowser } from '@/lib/puppeteer';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryName = searchParams.get('companyName');

  if (!queryName) {
    return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
  }

  let browser;
  try {
    browser = await getBrowser();
    const page = await browser.newPage();

    // Set User-Agent to avoid being blocked/served mobile view
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Use tabType=corp to get corporate info including CEO name
    const searchUrl = `https://www.jobkorea.co.kr/Search/?stext=${encodeURIComponent(queryName)}&tabType=corp&Page_No=1`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    // Extract candidates
    const candidates = await page.evaluate(() => {
      const data: any[] = [];
      // In tabType=corp, the structure is usually a list of .list-item
      // We look for the company name link and then try to find the CEO name in the description
      const items = Array.from(document.querySelectorAll('.list-default .list-item'));

      items.forEach(item => {
        const nameAnchor = item.querySelector('.title a');
        if (!nameAnchor) return;

        const name = nameAnchor.textContent?.trim() || '';
        const link = (nameAnchor as HTMLAnchorElement).href;

        // Extract other details
        // The structure usually has .option for details like Industry, Type, etc.
        // And .desc for description which might contain CEO name

        let ceo = '';
        let address = '';
        let industry = '';
        let type = '';

        // Try to find details in the .option list
        const options = Array.from(item.querySelectorAll('.option span'));
        options.forEach(opt => {
          const text = opt.textContent?.trim() || '';
          if (text.includes('대표자')) {
            ceo = text.replace('대표자', '').trim();
          } else if (['대기업', '중견기업', '중소기업', '외국계', '공공기관', '공기업', '벤처기업'].includes(text)) {
            type = text;
          } else if (text.endsWith('시') || text.endsWith('구') || text.endsWith('군') || text.endsWith('도')) {
            // Heuristic for address
            if (!address) address = text;
          } else if (!industry && text.length > 2) {
            // Heuristic for industry
            industry = text;
          }
        });

        // If CEO not found in options, try to parse from other text nodes if available
        // But usually tabType=corp has it in the option list or description

        data.push({
          name,
          link,
          address,
          industry,
          type,
          ceo
        });
      });

      return data;
    });

    // Filter candidates to match the query name somewhat
    // The user wants "Ignore (주)"
    const normalizedQuery = queryName.replace(/\(주\)|주식회사|\s/g, '');

    const filtered = candidates.filter((c: any) => {
      const normalizedName = c.name.replace(/\(주\)|주식회사|\s/g, '');
      return normalizedName.includes(normalizedQuery);
    });

    // Deduplicate
    const unique: any[] = [];
    const seen = new Set();
    filtered.forEach((item: any) => {
      if (!seen.has(item.link)) {
        seen.add(item.link);
        unique.push(item);
      }
    });

    return NextResponse.json(unique);

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({
      error: 'Failed to search companies',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  } finally {
    if (browser) await browser.close();
  }
}
