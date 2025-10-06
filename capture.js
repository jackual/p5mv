const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs-extra');

async function captureFrames(input = {
  scene: 'blinds',
  frameCount: 500,
  dims: [1920, 1080],
  brush: false
}) {

  const htmlString = `
<!DOCTYPE html>
<html lang="en">

<head>
    <script>${fs.readFileSync(path.join(__dirname, 'node_modules', 'p5', 'lib', 'p5.min.js'), 'utf8')}</script> 
    <script>
    const captureInput = JSON.parse('${JSON.stringify(input)}');
    </script>
    <script>${fs.readFileSync(path.join(__dirname, 'captureLib.js'), 'utf8')}</script> 
    <!-- <script src="https://cdn.jsdelivr.net/npm/p5.brush"></script> -->
    <meta charset="utf-8" />
</head>

<body>
    <main>
    </main>

    <script>
    ${fs.readFileSync(path.join(__dirname, 'public', 'scenes', input.scene + '.js'), 'utf8')}
    </script>
</body>

</html>
  `

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

  await page.setContent(htmlString)
  console.log("Set page content");


  page.on('console', msg => console.log('Browser:', msg.text()));

  // Wait for completion flag
  await page.waitForFunction(() => {
    if (window.captureComplete === true) {
      return true;
    }
  }, {
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