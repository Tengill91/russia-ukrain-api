const PORT = process.env.PORT || 8000; // for heroku
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const { response } = require("express");

const app = express();
const newspapers = [
  {
    name: "thetimes",
    address: "https://www.thetimes.co.uk/#section-world",
    base: "https://www.thetimes.co.uk",
  },
  {
    name: "guardian",
    address: "https://www.theguardian.com/world",
    base: "https://www.theguardian.com",
  },
  {
    name: "telegraph",
    address: "https://www.telegraph.co.uk/russia-ukraine-war",
    base: "https://www.telegraph.co.uk",
  },
  {
    name: "nyt",
    address: "https://www.nytimes.com/international/section/world",
    base: "https://www.nytimes.com",
  },
  {
    name: "latimes",
    address: "https://www.latimes.com/world-nation",
    base: "https://www.latimes.com",
  },
  {
    name: "smh",
    address: "https://www.smh.com.au/world",
    base: "https://www.smh.com.au",
  },
  {
    name: "bbc",
    address: "https://www.bbc.com/news/world-60525350",
    base: "https://www.bbc.co.uk",
  },
  {
    name: "es",
    address: "https://www.standard.co.uk/news/world",
    base: "https://www.standard.co.uk",
  },
  {
    name: "sun",
    address: "https://www.thesun.co.uk/news/worldnews/",
    base: "https://www.thesun.co.uk",
  },
  {
    name: "dm",
    address:
      "https://www.dailymail.co.uk/news/russia-ukraine-conflict/index.html",
    base: "https://www.dailymail.co.uk",
  },
  {
    name: "nyp",
    address: "https://nypost.com/news/",
    base: "https://nypost.com",
  },
  {
    name: "cityam",
    address: "https://www.cityam.com/news/",
    base: "https://www.cityam.com",
  },
];
const articles = [];

// för varje newspaper i newspaper listan hämta adressen och gör en (axios) get request för att hämta websidans html (innehåll)
// lägger sedan in websidans inehåll med hjälp utav cheerio i en ($) variabel
newspapers.forEach((newsPaper) => {
  axios.get(newsPaper.address).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);

    // för varje "a tagg" (link) som innehåller Russia spara texten, url och bild
    $('a:contains("Russia")', html).each(function () {
      const title = $(this).text();
      const url = $(this).attr("href");
      const image = $(this).find("img").attr("src");
      // const image = [];
      // {
      //   $(this).map(function () {
      //     image.push($(this).find("img").attr("src"));
      //   });
      // }

      // $('img').map(function(){ return $(this).attr('src'); })

      // lägger sedan allt sammans i articles listan
      articles.push({
        title,
        url: url.includes("https") ? url : newsPaper.base + url,
        source: newsPaper.name,
        image: image ? image : "no image...",
      });
    });
  });
});

// sakapar en landnings sida på port 8000
app.get("/", (req, res) => {
  res.json("Welcome to my Russia-Ukrain News API ");
});

// visar sedan upp alla artiklar på /news sidan (url)
app.get("/news", (req, res) => {
  res.json(articles);
});

// en till sida för specifika nyhets sidor
app.get("/news/:newspaperId", (req, res) => {
  const newspaperId = req.params.newspaperId;

  const newspaperAddress = newspapers.filter(
    (newspaper) => newspaper.name == newspaperId
  )[0].address;
  const newspaperBase = newspapers.filter(
    (newspaper) => newspaper.name == newspaperId
  )[0].base;

  axios
    .get(newspaperAddress)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const specificArticles = [];

      $('a:contains("Russia")', html).each(function () {
        const title = $(this).text();
        const url = $(this).attr("href");
        const image = $(this).find("img").attr("src");

        specificArticles.push({
          title,
          url: url.includes("https") ? url : newspaperBase + url,
          source: newspaperId,
          image: image ? image : "no image...",
        });
      });
      res.json(specificArticles);
    })
    .catch((err) => console.log(err));
});

app.listen(PORT, () => console.log(`server running on PORT: ${PORT}`));
