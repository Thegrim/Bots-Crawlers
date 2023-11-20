const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");

// Feed array for sites to be crawled/scraped
const urls = [];

const processedUrls = [];

const scrapeEmails = url => {
  return new Promise((resolve, reject) => {
    request(url, (error, response, html) => {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        let emails = [];
        $("body").each((i, element) => {
          const text = $(element).text();
          const emailRegex = /\S+@\S+\.\S+/;
          const matches = text.match(emailRegex);
          if (matches) {
            emails = emails.concat(matches);
          }
        });
        resolve({ url, emails });
      } else {
        reject(error);
      }
    });
  });
};

const searchForLinks = url => {
  return new Promise((resolve, reject) => {
    request(url, (error, response, html) => {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        let links = [];
        $("a").each((i, element) => {
          links.push(url + $(element).attr("href"));
        });
        resolve(links);
      } else {
        reject(error);
      }
    });
  });
};

//set maxDepth 
const scrapeAll = async (urls, depth = 0, maxDepth = 2) => {
  let results = [];
  for (const url of urls) {
    if (processedUrls.includes(url)) {
        console.log(`Skipping already processed URL: ${url}`);
        continue;
    }
    processedUrls.push(url);
    if (
        depth >= maxDepth 
        || url.includes(".comhttp") 
        || url.includes(".comtel")
        || url.includes(".htmlhttp") 
        || url.includes(".comjavascript")
        || url.includes("undefined")
        ) {
      continue;
    }
    try {
        console.log("Searching for emails to scrape from: " + url + "\n");
        const result = await scrapeEmails(url);
      if (result.emails.length) {
        console.log("Found email address " + JSON.stringify(result) + "\n");
        results.push(result);
      }
      const links = await searchForLinks(url);
      results = results.concat(await scrapeAll(links, depth + 1, maxDepth));
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
    }
  }
  return results;
};

scrapeAll(urls)
  .then(results => {
    const uniqueResults = [];
    const uniqueEmails = new Set();
    for (const result of results) {
      if (result.emails.length) {
        for (const email of result.emails) {
          if (!uniqueEmails.has(email)) {
            uniqueEmails.add(email);
            uniqueResults.push(result);
            break;
          }
        }
      }
    }
    return uniqueResults;
  })
  .then(uniqueResults => {
    console.log("Saving results to: outputEmailScraper.json \n");
    fs.writeFileSync(
      "outputEmailScraper.json",
      JSON.stringify(uniqueResults, null, 2)
    );
  });
