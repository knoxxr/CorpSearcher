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
    console.log(`[API] Navigating to: ${searchUrl}`);
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    // Extract candidates
    const candidates = await page.evaluate((queryName) => {
      const data: any[] = [];

      // Strategy A: Specific Selectors
      const items = Array.from(document.querySelectorAll('.list-default .list-item'));
      console.log(`[API] Found ${items.length} items in .list-default .list-item`);

      if (items.length > 0) {
        items.forEach(item => {
          const nameAnchor = item.querySelector('.title a');
          if (!nameAnchor) return;

          const name = nameAnchor.textContent?.trim() || '';
          const link = (nameAnchor as HTMLAnchorElement).href;

          let ceo = '';
          let address = '';
          let industry = '';
          let type = '';

          const options = Array.from(item.querySelectorAll('.option span'));
          options.forEach(opt => {
            const text = opt.textContent?.trim() || '';
            if (text.includes('대표자')) {
              ceo = text.replace('대표자', '').trim();
            } else if (['대기업', '중견기업', '중소기업', '외국계', '공공기관', '공기업', '벤처기업'].includes(text)) {
              type = text;
            } else if (text.endsWith('시') || text.endsWith('구') || text.endsWith('군') || text.endsWith('도')) {
              if (!address) address = text;
            } else if (!industry && text.length > 2) {
              industry = text;
            }
          });

          data.push({ name, link, address, industry, type, ceo });
        });
      }

      // Strategy B: Generic Link Search (Fallback)
      if (data.length === 0) {
        console.log('[API] Strategy A failed, trying Strategy B (Generic Link Search)');
        const anchors = Array.from(document.querySelectorAll('a'));
        const seenLinks = new Set();

        anchors.forEach(a => {
          const text = a.innerText?.trim();
          const href = a.href;

          if (!text || !href || href.includes('javascript') || href.includes('#') || seenLinks.has(href)) return;

          // Simple fuzzy match: if link text contains the query
          if (text.includes(queryName) || queryName.includes(text)) {
            seenLinks.add(href);

            // Try to find context
            let container = a.parentElement;
            let contextText = '';
            for (let i = 0; i < 3; i++) {
              if (container) {
                contextText += ' ' + container.innerText;
                container = container.parentElement;
              }
            }

            // Extract simple details from context if possible
            let ceo = '';
            let type = '';

            if (contextText.includes('대표자')) {
              // unexpected format, but try
            }

            // Heuristic: if text looks like a company name (ends in (주) etc or matches query closely)
            data.push({
              name: text,
              link: href,
              address: '',
              industry: '',
              type: '',
              ceo: ''
            });
          }
        });
      }

      return data;
    }, queryName);

    console.log(`[API] Extracted ${candidates.length} candidates`);

    // Filter candidates to match the query name somewhat
    // The user wants "Ignore (주)"
    const normalizedQuery = queryName.replace(/\(주\)|주식회사|\s/g, '');

    const filtered = candidates.filter((c: any) => {
      const normalizedName = c.name.replace(/\(주\)|주식회사|\s/g, '');
      return normalizedName.includes(normalizedQuery);
    });

    console.log(`[API] Filtered down to ${filtered.length} candidates`);

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
