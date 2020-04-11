require('console-stamp')(console, { pattern: 'dd/mm/yyyy HH:MM:ss.l' });

const puppeteer = require('puppeteer');
const config = require('./credential.json');

(async () => {
    console.log("Starting Execution...");

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
    context.overridePermissions("https://www.facebook.com", ["notifications"]);

    const page = await browser.newPage();
    await page.goto('https://facebook.com');
    await page.setViewport({
        width: 1500,
        height: 1000,
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

    await sleep(10000);

    console.log('Login Done!!!');

    // goto friend list
    await page.goto('https://www.facebook.com/me/friends');

    await sleep(3000);

    await autoScroll(page);

    console.log('Starting to fetch allHrefs');

    const allHrefs = await page.$$eval('a', anchors => anchors.map(anchor => anchor.href));
    const ownerIdName = getOwnerIdName(page.url());

    console.log('allHrefs length:', allHrefs.length);

    const friendProfileHrefs = filterValidFriendProfileHrefs(allHrefs, ownerIdName);

    console.log('friendProfileHrefs length:', friendProfileHrefs.length);
    console.log(JSON.stringify(friendProfileHrefs, null, 4));

    await browser.close();

    console.log("Ending Execution.");
})();

const sleep = (ms = 1000) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const getOwnerIdName = (url) => {
    // url = 'https://www.facebook.com/SakibulMowlaJesi/friends'
    const ownerIdName = url.split('/')[3];
    return ownerIdName;
}

const filterValidFriendProfileHrefs = (allHrefs, ownerIdName) => {
    console.log("Starting filterValidFriendProfileHrefs...");

    const uniqueFriendProfileHrefs = new Set();

    const validLink = href => !!href;
    const isMutualFriendPage = href => href.includes('friends_mutual');
    const isHomePage = href => href === 'https://www.facebook.com/';
    const isOwnerRelatedPage = href => href.includes(ownerIdName);
    const isFeaturePage = (href) => {
        const features = [ 
            'watch',
            'marketplace',
            'groups',
            'gaming',
            'bookmarks',
            'memories',
            'videos',
            'groups',
            'posts',
            'pages',
            'events',
            'donate',
            'photo',
            'friends',
            'groupslanding',
            'messages',
            'mutual_friends',
            'settings',
            'notifications',
            'profile',
            'find-friends',
            'notes',
            'permalink',
            '?'
        ];

        const matchesHref = feature => href.includes('/' + feature);
        return features.some(matchesHref);
    };

    allHrefs.forEach((href) => {
        if (validLink(href) &&
            !isMutualFriendPage(href) &&
            !isHomePage(href) &&
            !isOwnerRelatedPage(href) &&
            !isFeaturePage(href)) {
            uniqueFriendProfileHrefs.add(href);
        }
    });

    return [ ...uniqueFriendProfileHrefs ];
}

async function autoScroll(page) {
    console.log("Starting autoScroll...");

    try {
        await page.evaluate(async () => {
            await new Promise((resolve, reject) => {
                let totalHeight = 0;
                let distance = 400;
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
    } catch (reason) {
        console.error(reason);
    }
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
