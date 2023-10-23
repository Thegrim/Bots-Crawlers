const request = require("request");
const cheerio = require("cheerio");

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

const searchForContact = url => {
  return new Promise((resolve, reject) => {
    request(url, (error, response, html) => {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        let found = false;
        $("a").each((i, element) => {
          const link = $(element).attr("href");
          const linkText = $(element).text().toLowerCase();
          if (linkText.includes("contact") || linkText.includes("about")) {
            found = true;
            resolve(url + link);
          }
        });
        if (!found) {
          resolve(url);
        }
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

const scrapeAll = async urls => {
  let results = [];
  for (const url of urls) {
    try {
      const contactUrl = await searchForContact(url);
      const links = await searchLinks(contactUrl);
      for (const link of links) {
        const result = await scrapeEmails(link);
        results.push(result);
      }
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
    }
  }
  return results;
};

scrapeAll(urls).then(results => {
  console.log(results);
});
