import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryName = searchParams.get('companyName');

  if (!queryName) {
    return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set User-Agent to avoid being blocked/served mobile view
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const searchUrl = `https://www.jobkorea.co.kr/Search/?stext=${encodeURIComponent(queryName)}&tabType=corp&Page_No=1`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    // Extract candidates
    const candidates = await page.evaluate(() => {
      const data: any[] = [];
      const anchors = Array.from(document.querySelectorAll('a'));

      anchors.forEach(a => {
        const text = a.innerText.trim();
        const href = a.href;

        if (!text || href.includes('javascript') || href.includes('#')) return;

        // Check if it looks like a company link
        if (href.includes('/Company/') || href.includes('/Recruit/Co_Read/')) {
          // Get context from parent elements
          let container = a.parentElement;
          let contextText = '';

          // We found in testing that the 3rd level parent (great-grandparent) contains the full info
          // Level 0: Name + Like button
          // Level 1: Wrapper of Level 0
          // Level 2: Name + Like + Tags + Type + Address + Industry

          // Go up 3 levels if possible
          if (container?.parentElement?.parentElement) {
            container = container.parentElement.parentElement;
            contextText = container.innerText;
          } else if (container?.parentElement) {
            container = container.parentElement;
            contextText = container.innerText;
          } else if (container) {
            contextText = container.innerText;
          }

          if (!contextText) contextText = text;

          // Parse context text
          // Example: 삼성전자㈜\n좋아요\n삼성 계열사\n대기업\n경기 수원시\n이동전화기 제조업
          const lines = contextText.split('\n').map(l => l.trim()).filter(l => l && l !== '좋아요');

          let address = '';
          let industry = '';
          let type = '';

          const regions = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
          const types = ['대기업', '중견기업', '중소기업', '외국계', '공공기관', '공기업', '벤처기업'];

          // Iterate lines to find Address and Type
          // Industry is usually the line AFTER Address
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (types.includes(line)) {
              type = line;
            }

            if (regions.some(r => line.startsWith(r))) {
              address = line;
              // The next line is likely Industry, if it exists and isn't a type or tag
              if (i + 1 < lines.length) {
                const nextLine = lines[i + 1];
                if (!types.includes(nextLine) && !regions.some(r => nextLine.startsWith(r))) {
                  industry = nextLine;
                }
              }
            }
          }

          data.push({
            name: text,
            link: href,
            address: address,
            industry: industry,
            type: type
          });
        }
      });

      // Deduplicate
      const unique: any[] = [];
      const seen = new Set();
      data.forEach(item => {
        if (!seen.has(item.link)) {
          seen.add(item.link);
          unique.push(item);
        }
      });

      return unique;
    });

    // Filter candidates to match the query name somewhat
    // The user wants "Ignore (주)"
    const normalizedQuery = queryName.replace(/\(주\)|주식회사|\s/g, '');

    const filtered = candidates.filter(c => {
      const normalizedName = c.name.replace(/\(주\)|주식회사|\s/g, '');
      return normalizedName.includes(normalizedQuery);
    });

    return NextResponse.json(filtered);

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Failed to search companies' }, { status: 500 });
  } finally {
    if (browser) await browser.close();
  }
}
