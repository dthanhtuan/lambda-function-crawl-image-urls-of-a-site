// import * as AWS from 'aws-sdk'; FIXME: comment this out when deploying to lambda
const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const puppeteerDefault = require('puppeteer');

exports.handler = async (event = {}) => {
    let browser = null;
    try {
        // Initialize Puppeteer
        // AWS_EXECUTION_ENV environment variable to determine whether the code is running in the AWS Lambda environment.
        // If it is, we use the Chromium executable provided by chrome-aws-lambda. If not, we use the Chromium executable provided by Puppeteer.
        if (process.env.AWS_EXECUTION_ENV) {
            browser = await puppeteer.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath,
                headless: chromium.headless,
            });
        } else {
            browser = await puppeteer.launch({executablePath: puppeteerDefault.executablePath()});
        }
        // Open a new page
        const page = await browser.newPage();
        // Navigate to the URL provided in the event
        await page.goto(event.url, {waitUntil: 'networkidle2'}).catch(error => {
            console.error(`Failed to navigate to ${event.url}:`, error);
            throw error;
        });
        // Extract src attributes of all img tags
        const imageSources = await page.evaluate((minWidth, minHeight) => {
            const images = document.querySelectorAll('img');
            return Array.from(images).map(img => {
                return {
                    src: img.getAttribute('src') || '',
                    width: img.naturalWidth,
                    height: img.naturalHeight
                };
            }).filter(image => image.src !== '' && image.width >= minWidth && image.height >= minHeight);
        }, event.minWidth, event.minHeight);

        // Return the list of image sources
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Image sources extracted successfully.",
                totalImages: imageSources.length,
                imageSources,
            }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Failed to extract image sources.",
                error: error.message,
            }),
        };
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }
};
