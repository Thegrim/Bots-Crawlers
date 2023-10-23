const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");

const urls = [
    "https://www.aep.com",
    "https://www.apge.com"
];

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

const searchLinks = url => {
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

const scrapeAll = async (urls, depth = 0) => {
  let results = [];
  for (const url of urls) {
    if (depth > 2) {
      break;
    }
    try {
      const links = await searchLinks(url);
      const emails = await scrapeEmails(url);
      results.push(emails);
      const subResults = await scrapeAll(links, depth + 1);
      results = results.concat(subResults);
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
    }
  }
  return results;
};

scrapeAll(urls).then(results => {
  fs.writeFileSync("results.json", JSON.stringify(results, null, 2));
  console.log(`Scraping complete, results written to results.json`);
});
