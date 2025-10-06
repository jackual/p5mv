const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs-extra');

async function captureFrames() {
  const downloadPath = path.join(__dirname, 'output', 'frames');

  // Create output directory
  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Set download behavior using CDP session
  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadPath
  });

  const htmlPath = `file://${path.join(__dirname, 'public/sketch.html')}`;
  await page.goto(htmlPath);

  // Wait for completion flag
  await page.waitForFunction(() => window.captureComplete === true, {
    timeout: 30000
  });

  await browser.close();
  console.log(`Frames saved to: ${downloadPath}`);
}

module.exports = { captureFrames };

// Run if called directly
if (require.main === module) {
  captureFrames().catch(console.error);
}