import { useEffect, useState } from "react"
import axios from 'axios'

const cheerio = require('cheerio');
const webScraper = require('nodejs-web-scraper');

export const XBet = () => {
  const [urlsFix, setUrlsFix] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const url = 'https://ar.1xbet.com/es/live/football'
      try {
        const response = await axios.get(url);
        const data = new Set();
        const $ = cheerio.load(response.data);
        $('a').each((i, element) => {
          data.add($(element).attr('href'))
        });
        const filteredArr = Array.from(data)
          .filter(item => item && (item.startsWith("live/football/") || item.startsWith("/line/football/")))
          .filter(item => item.split("/").length > 3)
          .map(item => item.replace(/^\//, ""));
        const urlFiltered = []
        for (let urlSuffix of filteredArr) {
          let fixUrl = url.replace('live', urlSuffix);
          urlFiltered.push(fixUrl);
        }
        setUrlsFix(urlFiltered);
      } catch (error) {
        console.log(error);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    urlsFix.length > 0 &&
      urlsFix.forEach(async (url) => {
        try {
          const options = {
            url: url,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
          };
          const result = await webScraper.scrapeHTML(options);
          const $ = cheerio.load(result);
          const elementText = $('.c-tablo__team.u-8pt-mr-2.u-tar').text();
          console.log(elementText);
        } catch (error) {
          console.log(error);
        }
      });
  }, [urlsFix]);


  return (
    <>
      {urlsFix.map((match, index) => <div key={index}>{match}</div>)}
    </>
  )
}  