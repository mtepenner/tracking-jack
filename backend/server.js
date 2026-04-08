const express = require('express');
const cors = require('cors');
// Use the stealth version of puppeteer to bypass basic bot-protection
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const app = express();
const PORT = 3000;

app.use(cors());

// --- Main API Route ---
app.get('/api/track/:carrier/:trackingNumber', async (req, res) => {
  const { carrier, trackingNumber } = req.params;
  console.log(`🕵️ Scraping ${carrier.toUpperCase()} for ${trackingNumber}...`);

  try {
    let data;
    switch (carrier) {
      case 'usps':  data = await scrapeUSPS(trackingNumber); break;
      case 'ups':   data = await scrapeUPS(trackingNumber); break;
      case 'fedex': data = await scrapeFedEx(trackingNumber); break;
      case 'dhl':   data = await scrapeDHL(trackingNumber); break;
      case 'tnt':   data = await scrapeTNT(trackingNumber); break;
      default: return res.status(400).json({ error: "Unknown carrier" });
    }
    res.json(data);
  } catch (error) {
    console.error(`Error scraping ${carrier}:`, error.message);
    res.status(500).json({ error: `Scraping failed. ${carrier.toUpperCase()} may have blocked the request or changed their layout.` });
  }
});

// --- Scraper Helper Function ---
// Creates a stealth browser tab and waits for it to load
async function setupBrowser(url, waitSelector) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // Set a realistic viewport and User-Agent
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
  
  try {
    // Wait for the specific tracking element to appear
    await page.waitForSelector(waitSelector, { timeout: 10000 });
  } catch (e) {
    // If it times out, we might be blocked or the selector changed
    await browser.close();
    throw new Error(`Timeout waiting for selector: ${waitSelector}. Bot likely blocked.`);
  }

  return { browser, page };
}

// --- Carrier Specific Scrapers ---

async function scrapeUSPS(trackingNumber) {
  const url = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
  const selector = '.tb-status-detail';
  const { browser, page } = await setupBrowser(url, selector);
  
  const status = await page.$eval(selector, el => el.innerText.replace(/\s+/g, ' ').trim());
  await browser.close();
  return { carrier: 'usps', trackingNumber, status };
}

async function scrapeUPS(trackingNumber) {
  // UPS is notoriously difficult. They use heavy iframes and angular apps.
  const url = `https://www.ups.com/track?loc=en_US&tracknum=${trackingNumber}`;
  const selector = '#stApp_trackingNumberStatusCurrent'; // Often changes!
  
  const { browser, page } = await setupBrowser(url, selector);
  const status = await page.$eval(selector, el => el.innerText.replace(/\s+/g, ' ').trim());
  await browser.close();
  return { carrier: 'ups', trackingNumber, status };
}

async function scrapeFedEx(trackingNumber) {
  const url = `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
  // FedEx often puts their status in a shadow DOM or dynamic div
  const selector = '.dp-title-key-status'; 
  
  const { browser, page } = await setupBrowser(url, selector);
  const status = await page.$eval(selector, el => el.innerText.replace(/\s+/g, ' ').trim());
  await browser.close();
  return { carrier: 'fedex', trackingNumber, status };
}

async function scrapeDHL(trackingNumber) {
  const url = `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${trackingNumber}`;
  const selector = '.c-tracking-result--status'; 
  
  const { browser, page } = await setupBrowser(url, selector);
  const status = await page.$eval(selector, el => el.innerText.replace(/\s+/g, ' ').trim());
  await browser.close();
  return { carrier: 'dhl', trackingNumber, status };
}

async function scrapeTNT(trackingNumber) {
  const url = `https://www.tnt.com/express/en_gb/site/shipping-tools/tracking.html?searchType=CON&cons=${trackingNumber}`;
  const selector = '.status-text'; 
  
  const { browser, page } = await setupBrowser(url, selector);
  const status = await page.$eval(selector, el => el.innerText.replace(/\s+/g, ' ').trim());
  await browser.close();
  return { carrier: 'tnt', trackingNumber, status };
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Stealth Scraper backend running at http://localhost:${PORT}`);
});
