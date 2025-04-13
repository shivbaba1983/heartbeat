//const express = require("express");
import express from "express";
//const axios = require("axios");
import axios from "axios";
//const cheerio = require("cheerio");
import * as cheerio from "cheerio";
//const cors = require("cors");
import cors from "cors"
const app = express();
app.use(cors()); // Enable CORS for frontend requests

const PORT = 8080;
//const express = require("express");
//const fs = require("fs");
import fs from 'fs';
import path from 'path';
//const path = require("path");
//const cors = require("cors");


// Endpoint to scrape NASDAQ option data
// app.get("/myData", async (req, res) => {
//   try {
//     const { symbol } = req.params;
//     const url = `https://api.nasdaq.com/api/quote/AAPL/option-chain?assetclass=stocks`;
//     console.warn('----warn-----',req);
//     //console.log('----log-----',req);
//     // Fetch page HTML
//     const { data } = await axios.get(url);
//     const $ = cheerio.load(data);
//     console.log('----data-----',data);
//     let optionsData = [];

//     // $(".optionsTable tbody tr").each((i, el) => {
//     //   const strike = $(el).find("td:nth-child(3)").text().trim();
//     //   const price = $(el).find("td:nth-child(5)").text().trim();
//     //   if (strike && price) {
//     //     optionsData.push({ strike, price });
//     //   }
//     // });

//    // res.json({ symbol, options: optionsData });
//   } catch (error) {
//    // res.status(500).json({ error: "Error fetching data" });
//   }
// });

// app.post("/save-data", (req, res) => {
// const filePath= '/public/test.json'
//   try {
//     console.warn('----warn-----',req);
//     console.log('----log-----',req);
//     if (!req.body || !Array.isArray(req.body)) {
//       return res.status(400).json({ message: "Invalid data format. Expecting an array." });
//     }

//     // Read existing data safely
//     let existingData = [];
//     if (fs.existsSync(filePath)) {
//       const rawData = fs.readFileSync(filePath, "utf8");
//       existingData = rawData ? JSON.parse(rawData) : [];
//     }

//     // Append new data
//     const newData = [...existingData, ...req.body];

//     // Write updated JSON data
//     fs.writeFileSync(filePath, JSON.stringify(newData, null, 2), "utf8");

//     res.status(200).json({ message: "Data saved successfully!", data: newData });
//   } catch (error) {
//     console.error("Error writing file:", error);
//     res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// });


// const express = require('express');
// const axios = require('axios');
// const cors = require('cors');
//const app = express();

app.use(cors());
function getFridayOfCurrentWeek() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // Sunday - Saturday : 0 - 6
  const diffToFriday = 5 - dayOfWeek;
  const friday = new Date(today);
  friday.setDate(today.getDate() + diffToFriday);
  return friday.toISOString().slice(0, 10);;
}

app.get('/api/options/:symbol/:assetclass/:selected', async (req, res) => {
  const { symbol, assetclass, selected } = req.params;
  console.warn('assetclass', assetclass)
  console.warn('selected', selected)
  let tempUrl;
  if (selected ==='day' && (assetclass ==='ETF' )) {
    const today = new Date();
    const todayDate = '2025-04-14';//today.toISOString().slice(0, 10);
    tempUrl = `https://api.nasdaq.com/api/quote/${symbol}/option-chain?assetclass=${assetclass}&limit=100&fromdate=${todayDate}`
  }
  else if (selected ==='day' && assetclass ==='stocks') {
    const fridayDate = '2025-04-17';//getFridayOfCurrentWeek();
    console.warn('fridayDate',fridayDate)
    tempUrl = `https://api.nasdaq.com/api/quote/${symbol}/option-chain?assetclass=${assetclass}&limit=100&fromdate=${fridayDate}`
  }
  else {
    //const fridayDate = getFridayOfCurrentWeek();
    tempUrl = `https://api.nasdaq.com/api/quote/${symbol}/option-chain?assetclass=${assetclass}`;
  }

  try {
    const response = await axios.get(tempUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
        'Referer': `https://www.nasdaq.com/market-activity/stocks/${symbol}/option-chain`,
        'Origin': 'https://www.nasdaq.com'
      }
    });
// const APKEY="6iP3qhYoTkS_xtsLvRUD1edy7UqWfBtp";

//     const res = await axios.get(`https://api.polygon.io/v3/reference/options/contracts`, {
//       params: {
//         underlying_ticker: "NVDA",
//         limit: 10, // paginate if needed
//         apiKey: APKEY,
//       },
//     });
  

    
    res.json(response?.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Nasdaq options data' });
  }
});

app.listen(8080, () => {
  console.log('Proxy server running at http://localhost:8080');
});



// app.listen(5000, () => console.log("✅ Server running on port 5000"));

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
