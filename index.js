import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import userAgent from 'user-agents';
import 'dotenv/config'

/// Using puppeteer Stealth plugin to avoid bot detection
puppeteer.use(StealthPlugin())

/// Setting up the environment variables
const email = process.env.EMAIL;
const password = process.env.PASSWORD;
const eventUrl = process.env.EVENT_URL;

try {
    /// Launching the browser
    puppeteer.launch({
        /// Setting up the headless mode to true to run the browser in background 
        headless: true,
        /// Setting up the args to avoid sandbox error
        args: [
            "--no-sandbox"
        ],
    }).then(async browser => {
        console.log('Running script...')

        /// Creating a new page
        const page = await browser.newPage()
        /// Setting up the user agent and viewport
        await page.setUserAgent(userAgent.random().toString())
        await page.setViewport({ width: 1920, height: 1080 });

        await randomWait();

        /// Navigating to the LinkedIn login page 
        await page.goto("https://www.linkedin.com/?original_referer=", { waitUntil: 'load', timeout: 0 });
        /// Reloading the page to avoid any network error
        await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
        console.log("Navigated to LinkedIn");

        await randomWait();

        /// Waiting for the email input field to load and then entering the email
        await page.waitForSelector("input[id=session_key]");
        await page.type("input[id=session_key]", email);
        console.log("Entered email");

        /// Waiting for the password input field to load and then entering the password
        await page.waitForSelector("input[id=session_password]");
        await page.type("input[id=session_password]", password);
        console.log("Entered password");

        await randomWait();

        /// Waiting for the submit button to load and then clicking on it
        await page.click("button[type=submit]");

        await randomWait();

        console.log("Logged in");

        await randomWait();

        /// Navigating to the event page
        page.setDefaultTimeout(0);
        await page.goto(eventUrl, { waitUntil: 'load', timeout: 0 });
        await randomWait();
        console.log("Navigated to event");

        /// Waiting for the share button to load and then clicking on it
        let btn = await page.$x('//button[contains(.,"Share")]');
        await btn[0].click()
        console.log("Clicked on share button");

        /// Waiting for the drop down modal to open and then clicking on the invite button
        await page.waitForSelector(".artdeco-dropdown__content-inner");
        await randomWait();
        let inviteBtn = await page.$x('//li[text() = "Invite"]');
        await inviteBtn[0].click();
        console.log("Clicked on invite button");

        await randomWait();

        /// Accesing all the list of users
        let userList = await page.$x('//input[@type = "checkbox"]');
        let inviteCount = 0;
        try {
            /// Looping over the top 10 users and selected their checkbox
            for (let i = 0; i < 10; i++) {
                await randomWait();
                await userList[i].click();
                console.log(`Clicked on user ${i + 1}`);
                inviteCount++;
            }
            await randomWait();

            /// Taking the screenshot of the invited users
            await page.screenshot({ path: "invitedUser.png" });
            await randomWait();

            /// Clicking on the invite button
            let inviteUserBtn = await page.$x(`//span[contains(., 'Invite ${inviteCount}')]`)
            await randomWait();
            await inviteUserBtn[0].click();
            console.log(`Clicked on invite for ${inviteCount} users`);
        } catch (e) {
            console.log(`Only ${inviteCount} users found`);
        }

        await randomWait();
        /// Taking the screenshot of the page after inviting the users
        await page.screenshot({ path: "userInvited.png" });
        await browser.close();
    })
} catch (e) {
    console.log(e);
}

async function randomWait() {
    console.log("-------------------------");
    console.log("Waiting for random time");
    console.log("-------------------------");
    return await new Promise(r => setTimeout(r, (Math.floor(Math.random() * 12) + 5) * 1000));
}

