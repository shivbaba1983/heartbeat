

import axios from 'axios';

import * as cheerio from "cheerio"
import React, { useState,useEffect } from 'react';

import * as yahooFinance  from "yahoo-finance2";
import  express from "express";
//const yahooFinance = require("yahoo-finance2");
//const express = require("express");

//   const yahooFinance = require("yahoo-finance2");
//   const express = require("express");
    const NasdaqData = () => {

        useEffect(() => {
            // fetch("http://localhost:5000/options/GOOG")
            //   .then((res) => res.json())
            //   .then((data) => console.log(data))
            //   .catch((error) => console.error("Error:", error));

   

            const app = express();
            const PORT = 5000;

            app.get("/options/:GOOG", async (req, res) => {
            try {
                const symbol = req.params.symbol;
                const data = await yahooFinance.options(symbol);
                console.log('---data---',data)
                res.json(data);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
            });

            app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

          }, []);

        // async function getNasdaqOptions(symbol) {
        //     const url ="https://www.nasdaq.com/market-activity/stocks/goog/option-chain"
        //     const { data } = await axios.get(url);
        //     const $ = cheerio.load(data);

        //     let optionsData = [];
        //     $(".optionsTable tbody tr").each((i, el) => {
        //       const strike = $(el).find("td:nth-child(3)").text().trim();
        //       const price = $(el).find("td:nth-child(5)").text().trim();
        //       optionsData.push({ strike, price });
        //     });
          
        //     console.log(optionsData);
        //   }

    const [isExpanded, setIsExpanded] = useState(false);
  
    const toggleExpandCollapse = () => {
      setIsExpanded(!isExpanded);
    };
  
    return (
      <div>
{/* <button onClick={()=> getNasdaqOptions("GOOG")}>Click</button> */}
      </div>
    );
  };
  
  export default NasdaqData;