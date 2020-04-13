require('console-stamp')(console, { pattern: 'dd/mm/yyyy HH:MM:ss.l' });
const fs = require('fs');
const puppeteer = require('puppeteer');
const config = require('./credential.json');

const filePath = `./friend_${config.username}.json`;
// eslint-disable-next-line import/no-dynamic-require
const friends = require(filePath);

const sleep = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));

const parseCommaSeparatedNumber = (numberString) => {
    const splitted = numberString.split(',');
    let result = '';
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < splitted.length; i++) {
        result += splitted[i];
    }
    return parseInt(result, 10);
};

const parseInfo = (spanTexts, url) => {
    const info = {
        handle: url.split('https://www.facebook.com/')[1],
        name: null,
        institutions: [],
        currentLocation: null,
        joined: null,
        mutualFriends: null,
        followers: null,
        from: null
    };

    try {
        spanTexts.forEach((text, index) => {
            if (index && spanTexts[index - 1] === 'More') {
                info.name = text;
            } else if (text.includes('Studies ')
                       || text.includes('Studied ')) {
                info.institutions.push(text.split(' at ')[1]);
            } else if (text.includes('Went to ')) {
                info.institutions.push(text.split('Went to ')[1]);
            } else if (text.includes('Lives in ')) {
                info.currentLocation = text.split('Lives in ')[1];
            } else if (text.includes('Joined ')) {
                info.joined = text.split('Joined ')[1];
            } else if (text.includes(' mutual friends')) {
                info.mutualFriends = parseInt(text, 10);
            } else if (text.includes('Followed by ')) {
                info.followers = parseCommaSeparatedNumber(text.split(' ')[2]);
            } else if (text.includes('From ')) {
                info.from = text.split('From ')[1];
            }
        });
    } catch (reason) {
        console.error(reason);
    }

    return info;
};

const pad = (number, length, inRight = true) => {
    let str = number.toString(10);
    while (str.length < length) {
        str = inRight ? ` ${str}` : `${str} `;
    }

    return str;
};

const browseProfiles = async (page) => {
    const infos = [];
    const length = friends.profiles.length;

    try {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < length; i++) {
            console.info(` [${pad(i + 1, 4)} / ${pad(length, 4, false)} ] Going to ${friends.profiles[i]}`);
            // eslint-disable-next-line no-await-in-loop
            await page.goto(friends.profiles[i]);
            // eslint-disable-next-line no-await-in-loop
            await sleep(3000);

            // eslint-disable-next-line no-await-in-loop
            const spanTexts = await page.$$eval('span', (spans) => spans.map((span) => span.textContent));

            infos.push(parseInfo(spanTexts, page.url()));
        }
    } catch (reason) {
        console.error(reason);
    }

    const knowledgebaseFilePath = `knowledgebase_${config.username}.json`;
    fs.writeFileSync(knowledgebaseFilePath, JSON.stringify({ infos }, null, 4));
};

(async () => {
    let browser;
    if (config.chromiumPath && config.chromiumPath !== '') {
        console.log('Custom chromium path found');
        browser = await puppeteer.launch({
            executablePath: config.chromiumPath,
            headless: config.headless,
            slowMo: 0 // slow down by 30 ms
        });
    } else {
        console.log('Opening with default chromium path');
        browser = await puppeteer.launch({
            headless: config.headless,
            slowMo: 0 // slow down by 30 ms
        });
    }

    const context = browser.defaultBrowserContext();
    context.overridePermissions('https://www.facebook.com', ['notifications']);

    const page = await browser.newPage();
    await page.goto('https://facebook.com');
    await page.setViewport({
        width: 1500,
        height: 1000,
        deviceScaleFactor: 1
    });

    // enter email address
    await page.click('[id="email"]');
    await page.keyboard.type(config.username, { delay: 0 });

    // enter password
    await page.click('[id="pass"]');
    await page.keyboard.type(config.password, { delay: 0 });

    // click on Log In
    await page.click('[value="Log In"]');

    console.log('Login Done!!!');

    // For new UI
    await page.waitForSelector("[href='/me/']", { visiable: true });

    await sleep(3000);

    try {
        await browseProfiles(page);
    } catch (reason) {
        console.error(reason);
    }

    await browser.close();

    console.log('Ending Execution.');
})();
