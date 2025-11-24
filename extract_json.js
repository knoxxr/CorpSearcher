const fs = require('fs');

const html = fs.readFileSync('jobkorea.html', 'utf8');
const regex = /self\.__next_f\.push\(\[1,"(.*)"\]\)/g;
const regex2 = /self\.__next_f\.push\(\[1,"(.*)\\n"\]\)/g;

// The format is actually self.__next_f.push([1,"..."])
// But the string inside might be escaped.

let match;
let allData = '';

// Simple extraction of all push calls
const lines = html.split('\n');
lines.forEach(line => {
    if (line.includes('self.__next_f.push')) {
        // Extract the string inside the array
        // self.__next_f.push([1,"..."])
        const start = line.indexOf('self.__next_f.push([1,"');
        if (start !== -1) {
            const contentStart = start + 'self.__next_f.push([1,"'.length;
            const contentEnd = line.lastIndexOf('"])');
            if (contentEnd !== -1) {
                let content = line.substring(contentStart, contentEnd);
                // Unescape quotes
                content = content.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                allData += content;
            }
        }
    }
});

// Save chunks to file
const chunks = [];
lines.forEach(line => {
    if (line.includes('self.__next_f.push')) {
        const start = line.indexOf('self.__next_f.push([1,"');
        if (start !== -1) {
            const contentStart = start + 'self.__next_f.push([1,"'.length;
            const contentEnd = line.lastIndexOf('"])');
            if (contentEnd !== -1) {
                let content = line.substring(contentStart, contentEnd);
                content = content.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                chunks.push(content);
            }
        }
    }
});
fs.writeFileSync('chunks.txt', chunks.join('\n--CHUNK--\n'));
console.log('Saved chunks to chunks.txt');


