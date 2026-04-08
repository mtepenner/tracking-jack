const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 3000;

// Allow requests from your HTML file
app.use(cors());

// The API endpoint your frontend will call
app.get('/api/track/:carrier/:trackingNumber', async (req, res) => {
  const { carrier, trackingNumber } = req.params;

  console.log(`Received request to track ${carrier} package: ${trackingNumber}`);

  if (carrier === 'usps') {
    try {
      const data = await scrapeUSPS(trackingNumber);
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to scrape USPS. They might have blocked the request or changed their website layout." });
    }
  } else {
    // You would add the scraping logic for DHL, UPS, etc., here.
    res.status(501).json({ error: `Scraping for ${carrier} is not yet implemented.` });
  }
});

// The Puppeteer Web Scraper
async function scrapeUSPS(trackingNumber) {
  // Launch an invisible Chrome browser
  const browser = await puppeteer.launch({ 
    headless: true, // Change to 'false' if you want to watch the robot work!
    args: ['--no-sandbox'] 
  });
  
  const page = await browser.newPage();
  
  // Try to act like a normal user to avoid getting blocked
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

  const url = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Wait for the tracking status container to load on the page
  // Note: If USPS changes their website, this class name ('.tb-status-detail') will need to be updated.
  const statusSelector = '.tb-status-detail';
  await page.waitForSelector(statusSelector, { timeout: 10000 });

  // Extract the text from the page
  const result = await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    // Clean up the text by removing extra spacing and line breaks
    return element ? element.innerText.replace(/\s+/g, ' ').trim() : 'Status not found';
  }, statusSelector);

  await browser.close();

  return {
    carrier: 'usps',
    trackingNumber: trackingNumber,
    status: result
  };
}

// Start the server
app.listen(PORT, () => {
  console.log(`🕵️ Scraper backend running at http://localhost:${PORT}`);
});
