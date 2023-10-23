const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");

const urls = [
    "https://www.aep.com",
    "https://www.apge.com",
    "https://aggressiveenergy.com",
    "https://www.ageraenergy.com",
    "https://alphagasandelectric.com",
    "https://www.arcadia.com",
    "https://www.ambitenergy.com/rates-and-plans/service-areas/ohio-energy-providers",
    "https://www.firstenergycorp.com/illuminating_company.html",
    "https://americanpowerandgas.com",
    "https://americanpowerpartners.net",
    "https://www.americanpowernet.com",
    "https://www.atlanticenergyco.com",
    "https://www.championenergyservices.com",
    "https://cleanchoiceenergy.com",
    "https://www.clearviewenergy.com",
    "https://www.conocophillips.com",
    "https://www.constellation.com",
    "https://www.cpv.com",
    "https://www.directenergy.com",
    "https://www.dynegy.com",
    "https://ecopluspower.com",
    "https://edfenergyna.com",
    "https://www.eligoenergy.com",
    "https://energyharbor.com/en",
    "https://www.energypluscompany.com",
    "https://www.enerstar.com",
    "https://www.engieresources.com",
    "https://www.exeloncorp.com",
    "https://www.freepointsolutions.com",
    "https://www.frontierutilities.com",
    "https://www.greatamericanpower.com",
    "https://www.greenmountainenergy.com",
    "https://gogreenlightenergy.com",
    "https://www.gridpowerdirect.com",
    "https://www.holcim.us",
    "http://hplco.com",
    "https://www.hudsonenergy.net",
    "https://www.icenergyservices.com",
    "https://idtenergy.com",
    "https://www.inspirecleanenergy.com",
    "https://www.igs.com",
    "https://joscoenergy.com",
    "https://justenergy.com",
    "https://www.lowerelectric.com",
    "https://majorenergy.com",
    "https://mansfield.energy",
    "https://www.mc2energyservices.com",
    "https://www.medianenergy.com/home",
    "https://www.messer-us.com",
    "https://metergenius.com/company",
    "https://www.midamericanenergy.com/home",
    "https://mpowerenergy.com",
    "https://ngande.com",
    "https://www.nexteraenergyservices.com",
    "https://www.nordicenergy-us.com",
    "https://www.napower.com/#gref",
    "https://www.parkpower.com",
    "https://www.pepco.com/Pages/default.aspx",
    "https://www.publicpowercompany.com",
    "http://www.pureenergyus.com",
    "https://realgyenergyservices.com",
    "https://www.reliant.com",
    "https://rescom-energy.com",
    "https://residentsenergy.com",
    "https://www.rpaenergysite.com",
    "https://rushmoreenergy.com",
    "https://santannaenergyservices.com",
    "https://shellenergy.com",
    "https://smartenergy.com",
    "https://www.smartestenergy.com/en_us/",
    "https://southbayenergy.com",
    "https://www.sparkenergy.com",
    "https://www.starenergypartners.com",
    "https://www.starionenergy.com",
    "https://statewiseenergy.com",
    "https://www.mystream.com/en/",
    "https://www.summerenergy.com",
    "https://switchenergypartners.com",
    "https://www.tenaskapowermanagement.com",
    "https://texasretailenergy.com",
    "https://www.thinkenergy.com",
    "https://tomorrowenergy.com",
    "https://www.trieagleenergy.com",
    "https://www.vanguardpower.com/na/en_us/home.html",
    "https://www.verdeenergy.com",
    "https://www.viridian.com",
    "https://vistaenergymarketing.com",
    "https://wieland-rolledproductsna.com",
    "https://www.wisconsinpublicservice.com",
    "https://xoomenergy.com/en/residential/illinois",

];

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
