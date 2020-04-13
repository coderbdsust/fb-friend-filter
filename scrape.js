require('console-stamp')(console, { pattern: 'dd/mm/yyyy HH:MM:ss.l' });
const fs = require('fs');
const puppeteer = require('puppeteer');
const _ = require('lodash');
const config = require('./credential.json');

const sleep = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));

const getOwnerIdName = (url) => {
    // url = 'https://www.facebook.com/SakibulMowlaJesi/friends'
    const ownerIdName = url.split('/')[3];
    return ownerIdName;
};

const filterValidFriendProfileHrefs = (allHrefs, ownerIdName) => {
    console.log('Starting filterValidFriendProfileHrefs...');

    const uniqueFriendProfileHrefs = new Set();

    const validLink = (href) => !!href;
    const isMutualFriendPage = (href) => href.includes('friends_mutual');
    const isHomePage = (href) => href === 'https://www.facebook.com/';
    const isOwnerRelatedPage = (href) => href.includes(ownerIdName);
    const isFeaturePage = (href) => {
        const features = [
            '?',
            'bookmarks',
            'donate',
            'events',
            'find-friends',
            'friends',
            'gaming',
            'groups',
            'groupslanding',
            'marketplace',
            'me/',
            'memories',
            'messages',
            'mutual_friends',
            'notes',
            'notifications',
            'pages',
            'permalink',
            'photo',
            'posts',
            'settings',
            'stories',
            'videos',
            'watch'
        ];

        const matchesHref = (feature) => href.includes(`/${feature}`);
        return features.some(matchesHref);
    };

    allHrefs.forEach((href) => {
        if (validLink(href)
            && !isMutualFriendPage(href)
            && !isHomePage(href)
            && !isOwnerRelatedPage(href)
            && !isFeaturePage(href)) {
            uniqueFriendProfileHrefs.add(href);
        }
    });

    return [...uniqueFriendProfileHrefs];
};

async function autoScroll(page) {
    console.log('Starting autoScroll...');

    try {
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                let totalHeight = 0;
                const distance = 350;
                const timer = setInterval(() => {
                    const { scrollHeight } = document.body;
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

(async () => {
    console.info('Starting Execution...');

    let profileData = {};
    const profileFilePath = `friend_${config.username}.json`;

    try {
        if (fs.existsSync(profileFilePath)) {
            // file exists
            console.log('Reading From Existing File.');
            const rawdata = fs.readFileSync(profileFilePath);
            profileData = JSON.parse(rawdata);
        } else {
            console.log('No Existing File Found!!!');
        }
    } catch (err) {
        console.error(err);
    }

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

    // For old UI
    // await sleep(10000);

    // For new UI
    await page.waitForSelector("[href='/me/']", { visiable: true });

    // goto friend list
    await page.goto('https://www.facebook.com/me/friends');

    await sleep(3000);

    if (!profileData.allProfileFound) {
        const spanTexts = await page.$$eval('span', (spans) => spans.map((span) => span.textContent));
        const probableFriendNumbers = spanTexts.filter((text) => text && _.toNumber(text) > 20 && _.toNumber(text) < 10000);
        const friendCount = parseInt(_.max(probableFriendNumbers), 10);

        console.log(`Friend Counts: ${friendCount}`);

        const startDate = new Date();

        // Do your operations
        await autoScroll(page);

        const endDate = new Date();

        const seconds = (endDate.getTime() - startDate.getTime()) / 1000;

        console.log('Starting to fetch allHrefs');

        const allHrefs = await page.$$eval('a', (anchors) => anchors.map((anchor) => anchor.href));
        const ownerIdName = getOwnerIdName(page.url());

        console.log('allHrefs length:', allHrefs.length);

        const friendProfileHrefs = filterValidFriendProfileHrefs(allHrefs, ownerIdName);

        const ratio = Math.min(friendCount, friendProfileHrefs.length) / Math.max(friendCount, friendProfileHrefs.length);

        console.log(`Friend Profile Links Count: ${friendProfileHrefs.length}`);

        console.log(`Friend Profile Retrieval Ratio: ${ratio}`);

        // writing friend profile links to a file
        if (ratio && ratio > 0.85) {
            profileData.allProfileFound = true;
        } else {
            profileData.allProfileFound = false;
        }

        profileData.friendLinkRetrievalRatio = ratio;
        profileData.friendCount = friendCount;
        profileData.probableFriendLinkCount = friendProfileHrefs.length;
        profileData.profileLinkSearchTime = seconds;
        profileData.profiles = friendProfileHrefs;

        console.log('Writig to file start');

        fs.writeFileSync(profileFilePath, JSON.stringify(profileData, null, 4));

        console.log('Writig to file end');
    } else {
        console.log('All friend profile link retrieved already');
    }

    await browser.close();

    console.log('Ending Execution.');
})();
