const fs = require('fs');

const content = fs.readFileSync('chunks.txt', 'utf8');
const chunks = content.split('\n--CHUNK--\n');

const chunk0 = chunks[0].replace(/\\n/g, '\n');
const lines = chunk0.split('\n');
lines.forEach(line => {
    // line format: id:json
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
        const id = line.substring(0, colonIndex);
        const content = line.substring(colonIndex + 1);

        if (content.includes('queries')) {
            console.log(`Found queries in line with ID ${id}`);
            const cleanId = id.replace(/[^0-9]/g, '');
            fs.writeFileSync(`data_${cleanId}.json`, content);
            console.log(`Saved to data_${cleanId}.json`);
        }

        if (id === '19' || content.includes('삼성전자')) {
            console.log(`Found relevant line with ID ${id} `);
            // console.log(content.substring(0, 200) + '...');

            // Try to parse content
            try {
                // The content might be T["..."] or I[...] or just JSON
                // If it starts with I or T, strip it?
                // Actually, for data, it's usually just JSON or a specific format.
                // Let's print the start of content to see format
                console.log('Content start:', content.substring(0, 50));
            } catch (e) {
                console.log('Error parsing');
            }
        }
    }
});
