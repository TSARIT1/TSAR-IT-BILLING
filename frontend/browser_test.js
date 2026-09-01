const puppeteer = require('puppeteer');
(async () => {
    console.log('Starting browser test...');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });

    try {
        console.log('Navigating to frontend...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
        
        console.log('Current URL:', page.url());
        
        // Let's test if frontend is running!
        console.log('Page title:', await page.title());
        
    } catch (e) {
        console.error('Test failed:', e);
    } finally {
        await browser.close();
        console.log('Browser closed.');
    }
})();
