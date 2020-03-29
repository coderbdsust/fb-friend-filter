const puppeteer = require('puppeteer');
const config = require('./credential.json');

(async () => {
    let browser;
    if (config.chromiumPath && config.chromiumPath !== '') {    
        console.log('Custom chromium path found');
        browser = await puppeteer.launch({
            executablePath: config.chromiumPath,
            headless: config.headless,
            slowMo: 30 // slow down by 30 ms
        });
    } else {
        console.log('Opening with default chromium path');
        browser = await puppeteer.launch({
            headless: config.headless,
            slowMo: 30 // slow down by 30 ms
        });
    }
    

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
    await page.keyboard.type(config.username, {delay: 0});

    // enter password
    await page.click('[id="pass"]');
    await page.keyboard.type(config.password, {delay: 0});

    // click on Log In
    await page.click('[value="Log In"]');

    await page.waitForNavigation({waitUntil: 'load'});

    console.log('Login Done');

   // await sendMessage(page,'Biswajit Debath');

    await page.click('[data-click="profile_icon"]');

    await sleep(6000);
    
    await page.click('[data-tab-key="friends"]');
    
    await sleep(2000);

    await autoScroll(page);
    
    await browser.close();
})();

const sleep = (ms = 1000) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0;
            let distance = 100;
            let timer = setInterval(() => {
                let scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 1000);
        });
    });
}

const sendMessage = async (page, receiver) => {

    await page.click('[data-click="home_icon"]');

    await page.goto('https://www.facebook.com/messages/');
    
    await page.click('[placeholder="Search Messenger"]');

    await page.keyboard.type(receiver, {delay: 0});

    await sleep(10000);

    await page.keyboard.press('ArrowDown');

    await page.keyboard.press('Enter');

    await page.keyboard.type('Hello From Auto Bot!\n');
}
