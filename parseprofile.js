/* eslint-disable no-await-in-loop */
require('console-stamp')(console, {
    pattern: 'dd/mm/yyyy HH:MM:ss.l'
});

const fs = require('fs');
const puppeteer = require('puppeteer');
const config = require('./credential.json');
const Constants = require('./constants.js');
// eslint-disable-next-line import/no-dynamic-require
const friends = require(`./friend_${config.username}.json`);

const sleep = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));

const basicFilter = (dataTexts) => dataTexts.map((text) => text && text.trim()).filter((text) => text.length > 3);

const parseCommaSeparatedNumber = (numberString) => {
    const splitted = numberString.split(',');
    let result = '';
    for (let i = 0; i < splitted.length; i++) {
        result += splitted[i];
    }
    return parseInt(result, 10);
};

const parseMarriageInfo = (text) => {
    const [beforeSince, afterSince] = text.split(' since ');
    const spouseName = beforeSince.split('Married to ')[1];
    const marriageDate = afterSince;
    return {
        spouseName,
        marriageDate
    };
};

const getHandle = (profileURL) => {
    if (profileURL.includes('profile.php?id=')) {
        let handle = profileURL.split('profile.php?id=')[1];
        handle = handle.split('&')[0];
        return handle;
    }
    return profileURL.split('https://www.facebook.com/')[1];
};

const parseInfo = async (profileURL, spanTexts, titles) => {
    console.log('Parsing Info');
    console.log('Profile URL', profileURL);
    console.log('Span text counts ', spanTexts.length);
    console.log('Title counts ', titles.length);

    console.info('spantexts', JSON.stringify(spanTexts, null, 4));
    console.info('titles', JSON.stringify(titles, null, 4));

    // doing deep-copy otherwise all info element will be same due to reference
    const info = JSON.parse(JSON.stringify(Constants.DEFAULT_INFO));
    info.handle = getHandle(profileURL);

    const familyMembers = new Set();
    const mobiles = new Set();
    const institutions = new Set();

    try {
        for (let i = 1; i < spanTexts.length; i++) {
            if (spanTexts[i] === 'Religious Views') {
                info.religion = spanTexts[i - 1];
            } else if (spanTexts[i] === 'Interested In') {
                info.interestedIn = spanTexts[i - 1];
            } else if (spanTexts[i] === 'Languages') {
                info.language = spanTexts[i - 1];
            } else if (spanTexts[i] === 'Birth Year') {
                info.birthYear = spanTexts[i - 1];
            } else if (spanTexts[i] === 'Birth Date' || spanTexts[i] === 'Birthday') {
                info.birthDate = spanTexts[i - 1];
            } else if (spanTexts[i].includes('Birthday:')) {
                info.birthDate = spanTexts[i].split('Birthday:')[1];
            } else if (spanTexts[i] === 'Gender') {
                info.gender = spanTexts[i - 1];
            } else if (spanTexts[i] === 'Skype') {
                info.skype = spanTexts[i - 1];
            } else if (spanTexts[i] === 'Google Talk') {
                info.googleTalk = spanTexts[i - 1];
            } else if (spanTexts[i] === 'LinkedIn') {
                info.linkedIn = spanTexts[i - 1];
            } else if (spanTexts[i] === 'Mobile') {
                mobiles.add(spanTexts[i - 1]);
            } else if (Constants.FAMILY_MEMBER_CATEGORIES.includes(spanTexts[i])) {
                familyMembers.add(spanTexts[i - 1]);
            } else if (spanTexts[i] === 'Current City') {
                info.currentLocation = spanTexts[i - 1];
            } else if (spanTexts[i] === 'Hometown') {
                info.homeLocation = spanTexts[i - 1];
            } else if (spanTexts[i].includes('Studies ')
                    || spanTexts[i].includes('Studied ')) {
                institutions.add(spanTexts[i].split(' at ')[1]);
            } else if (spanTexts[i].includes('Went to ')) {
                institutions.add(spanTexts[i].split('Went to ')[1]);
            } else if (spanTexts[i].includes('Lives in ')) {
                info.currentLocation = spanTexts[i].split('Lives in ')[1];
            } else if (spanTexts[i].includes('Joined ')) {
                info.joined = spanTexts[i].split('Joined ')[1];
            } else if (spanTexts[i].includes(' mutual friends')) {
                info.mutualFriends = parseInt(spanTexts[i], 10);
            } else if (spanTexts[i].includes('Followed by ')) {
                info.followers = parseCommaSeparatedNumber(spanTexts[i].split(' ')[2]);
            } else if (spanTexts[i].includes('Married to ') && spanTexts[i].includes(' since ')) {
                const marriageInfo = parseMarriageInfo(spanTexts[i]);
                info.spouseName = marriageInfo.spouseName;
                info.marriageDate = marriageInfo.marriageDate;
            }
        }
        info.institutions = [...institutions];
        info.familyMember = [...familyMembers];
        info.mobile = [...mobiles];
    } catch (reason) {
        console.error(reason);
    }

    try {
        info.name = titles
            .filter((title) => !(Constants.TITLES_TO_EXCLUDE.includes(title)))
            .sort((a, b) => b.length - a.length)[0];
    } catch (reason) {
        console.error(reason);
    }
    console.log(info);
    return info;
};

const pad = (number, length, inRight = true) => {
    let str = number.toString(10);
    while (str.length < length) {
        str = inRight ? ` ${str}` : `${str} `;
    }
    return str;
};

const immediateSecondOcurranceWordRemove = async (items) => {
    for (let i = 0; i < items.length - 1; i++) {
        if (items[i] === items[i + 1]) {
            items.splice(i, 1);
        }
    }
    return items;
};

const browseProfiles = async (page) => {
    const knowledgebaseFilePath = `knowledgebase_${config.username}.json`;

    let knowledgeInfo = {
        totalProfiles: 0,
        retrievedProfiles: 0,
        retrievedProfilesPercent: 0.0,
        profileInfos: {}
    };

    try {
        if (fs.existsSync(knowledgebaseFilePath)) {
            // file exists
            console.log('Reading From Existing File.');
            const rawdata = fs.readFileSync(knowledgebaseFilePath);
            knowledgeInfo = JSON.parse(rawdata);
        } else {
            console.log('No Existing File Found!!!');
        }
    } catch (err) {
        console.error(err);
    }

    const length = friends.profiles.length;

    const profileFeatures = Constants.PROFILE_FEATURES;

    try {
        knowledgeInfo.totalProfiles = length;

        for (let i = 0; i < length; i++) {
            const profileLink = friends.profiles[i];
            const handle = getHandle(profileLink);

            if (!(handle in knowledgeInfo.profileInfos) || knowledgeInfo.profileInfos[handle].override === true) {
                console.info(` [${pad(i + 1, 4)} / ${pad(length, 4, false)} ] Going to ${friends.profiles[i]}`);
                let spanInfos = [];
                let h1Infos = [];

                await page.goto(profileLink, Constants.PAGE_LOADING_STYLE);
                // await sleep(3000);

                let spanTexts = await page.$$eval('span', (spans) => spans.map((span) => span.textContent));
                spanInfos = spanInfos.concat(spanTexts);

                for (let f = 0; f < profileFeatures.length; f++) {
                    console.log('Feature page: ', profileFeatures[f]);
                    if (profileLink.includes('profile.php?')) {
                        await page.goto(`${profileLink}&sk=${profileFeatures[f]}`, Constants.PAGE_LOADING_STYLE);
                    } else {
                        await page.goto(`${profileLink}/${profileFeatures[f]}`, Constants.PAGE_LOADING_STYLE);
                    }
                    // await sleep(3000);

                    spanTexts = await page.$$eval('span', (spans) => spans.map((span) => span.textContent));
                    spanInfos = spanInfos.concat(spanTexts);
                }

                const h1Texts = await page.$$eval('h1', (h1Tags) => h1Tags.map((h1) => h1.textContent));
                h1Infos = h1Infos.concat(h1Texts);

                spanInfos = await immediateSecondOcurranceWordRemove(spanInfos);

                if (!(handle in knowledgeInfo.profileInfos)) {
                    knowledgeInfo.retrievedProfiles += 1;
                    const retrievePercent = (knowledgeInfo.retrievedProfiles / knowledgeInfo.totalProfiles) * 100.0;
                    knowledgeInfo.retrievedProfilesPercent = retrievePercent.toFixed(2);
                } else {
                    console.info(`Information overriding for handle : ${handle}`);
                }

                knowledgeInfo.profileInfos[handle] = await parseInfo(profileLink, spanInfos, h1Infos);
                fs.writeFileSync(knowledgebaseFilePath, JSON.stringify(knowledgeInfo, null, 4));
            } else {
                console.info(`Already have info using handle : ${handle}, Ignoring this handle...`);
            }
        }
    } catch (reason) {
        console.error(reason);
    }
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
    await page.goto('https://facebook.com', Constants.PAGE_LOADING_STYLE);
    await page.setViewport({
        width: 1500,
        height: 1000,
        deviceScaleFactor: 1
    });
    // enter email address
    await page.click('[id="email"]');
    await page.keyboard.type(config.username, {
        delay: 0
    });

    // enter password
    await page.click('[id="pass"]');
    await page.keyboard.type(config.password, {
        delay: 0
    });

    // click on Log In
    await page.click('[value="Log In"]');

    console.log('Login Done!!!');

    // For new UI
    await page.waitForSelector("[href='/me/']", {
        visiable: true
    });

    await sleep(3000);

    try {
        await browseProfiles(page);
    } catch (reason) {
        console.error(reason);
    }

    await browser.close();

    console.log('Ending Execution.');
})();
