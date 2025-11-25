async function test() {
    try {
        const res = await fetch('http://localhost:3001/api/search?companyName=Samsung');
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

test();
