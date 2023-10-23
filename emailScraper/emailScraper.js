const request = require("request");
const cheerio = require("cheerio");

const urls = [
   "https://www.aep.com/contact/careers",
   "https://www.apge.com"
];

const emailRegex = /\S+@\S+\.\S+/;

const scrapeEmails = url => {
  return new Promise((resolve, reject) => {
    request(url, (error, response, html) => {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        let emails = [];
        $("body").each((i, element) => {
          const text = $(element).text();
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

const scrapeAll = async urls => {
  let results = [];
  for (const url of urls) {
    try {
      const result = await scrapeEmails(url);
      results.push(result);
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
    }
  }
  return results;
};

scrapeAll(urls).then(results => {
  console.log(results);
});
