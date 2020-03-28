const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 30 // slow down by 30 ms
    });

    const context = browser.defaultBrowserContext();
    context.overridePermissions("https://www.facebook.com", ["notifications"]);

    const page = await browser.newPage();
    await page.goto('https://facebook.com');
    await page.setViewport({
        width: 1200,
        height: 620,
        deviceScaleFactor: 1,
    });
    
    // enter email address
    await page.click('[id="email"]');
    await page.keyboard.type('<your-email>', {delay: 0});

    // enter password
    await page.click('[id="pass"]');
    await page.keyboard.type('<your-password>', {delay: 0});

    // click on Log In
    await page.click('[value="Log In"]');

    await sleep(3000);

    await page.goto('https://www.facebook.com/messages/');
    
    await page.click('[placeholder="Search Messenger"]');

    await page.keyboard.type('<name-of-message-recipient>', {delay: 0});

    await sleep(5000);

    await page.keyboard.press('ArrowDown');

    await page.keyboard.press('Enter');

    await page.keyboard.type('Hello!\n');
    
    await browser.close();
})();

const sleep = (ms = 1000) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}
