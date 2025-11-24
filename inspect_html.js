const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('jobkorea_mobile.html', 'utf8');
const $ = cheerio.load(html);

console.log('Title:', $('title').text());
console.log('List items count:', $('.list-item').length);
console.log('Corp items count:', $('.corp-item').length);
console.log('Company items count:', $('.company-item').length);
console.log('Any list:', $('ul li').length);

// Print classes of divs to guess structure
$('div').each((i, el) => {
    if (i < 20) {
        console.log('Div class:', $(el).attr('class'));
    }
});

// Try to find "삼성전자" in the body and print parent classes
$('*:contains("삼성전자")').each((i, el) => {
    if ($(el).children().length === 0 && $(el).text().trim() === '삼성전자') {
        const parent = $(el).closest('a');
        if (parent.length) {
            console.log('Found link:', parent.attr('href'));
        } else {
            console.log('No link found for this occurrence');
            // Check siblings or parent's siblings
            const link = $(el).closest('.recruit-item').find('a').attr('href');
            if (link) console.log('Found link in recruit-item:', link);
        }
    }
});

// Check for specific company list section
console.log('Company list section:', $('.company-list').length);
console.log('Corp list section:', $('.corp-list').length);

