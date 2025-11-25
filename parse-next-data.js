const fs = require('fs');

const html = fs.readFileSync('debug.html', 'utf8');
const regex = /self\.__next_f\.push\(\[1,"(.*?)"\]\)/g;

let match;
while ((match = regex.exec(html)) !== null) {
    try {
        // The data is a string inside a string, so we need to unescape it
        // But it's also chunked. This is complex.
        // Let's just print the raw matches to see what we have.
        console.log('--- MATCH ---');
        console.log(match[1].slice(0, 200)); // Print start of match

        // Try to find "CEO" or "대표" in the match
        if (match[1].includes('대표') || match[1].includes('CEO')) {
            console.log('!!! FOUND CEO KEYWORD !!!');
            // Print context
            const idx = match[1].indexOf('대표');
            console.log(match[1].slice(idx - 100, idx + 100));
        }
    } catch (e) {
        console.error(e);
    }
}
