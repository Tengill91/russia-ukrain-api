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
    base: "",
  },
  {
    name: "guardian",
    address: "https://www.theguardian.com/world",
    base: "",
  },
  {
    name: "telegraph",
    address: "https://www.telegraph.co.uk/russia-ukraine-war",
    base: "https://www.telegraph.co.uk",
  },
  {
    name: "nyt",
    address: "https://www.nytimes.com/international/section/world",
    base: "",
  },
  {
    name: "latimes",
    address: "https://www.latimes.com/world-nation",
    base: "",
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
    base: "",
  },
  {
    name: "dm",
    address:
      "https://www.dailymail.co.uk/news/russia-ukraine-conflict/index.html",
    base: "",
  },
  {
    name: "nyp",
    address: "https://nypost.com/news/",
    base: "",
  },
  {
    name: "cityam",
    address: "https://www.cityam.com/news/",
    base: "",
  },
];
const articles = [];

newspapers.forEach((newsPaper) => {
  axios.get(newsPaper.address).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);

    $('a:contains("Russia")', html).each(function () {
      const title = $(this).text();
      const url = $(this).attr("href");

      articles.push({
        title,
        url: newsPaper.base + url,
        source: newsPaper.name,
      });
    });
  });
});

app.get("/", (req, res) => {
  res.json("Welcome to my Russia-Ukrain News API ");
});

app.get("/news", (req, res) => {
  res.json(articles);
});

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
        specificArticles.push({
          title,
          url: newspaperBase + url,
          source: newspaperId,
        });
      });
      res.json(specificArticles);
    })
    .catch((err) => console.log(err));
});

app.listen(PORT, () => console.log(`server running on PORT: ${PORT}`));
