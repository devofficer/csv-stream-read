#!/usr/bin/env node

require("dotenv").config();
const yargs = require("yargs");
const fs = require('fs'); 
const csv = require('csv-parser')
const axios = require("axios");

// const { API_BASE_URL, API_TOKEN } = process.env;
const API_BASE_URL='https://min-api.cryptocompare.com/data/price?tsyms=USD&fsym='
const API_TOKEN='Apikey 499372a892c79cd63eeb10ff08957a0fb9983c0c8d7170f9f6fb3154c04f1f37'

const options = yargs
 .usage("Usage: -n <filename> [-t <token>] [-d <date>]")
 .option("n", { alias: "filename", describe: "Name of file with .csv", type: "string", demandOption: true })
 .option("t", { alias: "token", describe: "Return the latest portfolio value for that token in USD\ne.x. BTC", type: "string" })
 .option("d", { alias: "date", describe: "Return the portfolio value per token in USD on that date\ne.x. 12/31/2020", type: "string" })
 .argv;

const printInUSD = (results) => () => {
  Object.keys(results).forEach((key) => {
    const url = API_BASE_URL + key
    axios.get(url, { headers: { authorization: API_TOKEN } })
      .then(res => {
        const amountInUSD = res.data.USD * results[key]
        console.log(key, amountInUSD.toFixed(3));
      });
  })
}

const filepath = process.cwd() + '/' + options.filename + '.csv'

const main = () => {
  let results = {}

  if (options.date) {            // when date is given
    const startTime = new Date(options.date).getTime() / 1000;
    const endTime = startTime + 86400;

    if (options.token) {          // when date and token is given
      var readStream = fs.createReadStream(filepath)
        .pipe(csv())
        .on('data', (record) => {
          const acc = record.transaction_type === 'DEPOSIT' ? 1 : -1;
          if (
            record.timestamp >= startTime && 
            record.timestamp < endTime && 
            record.token === options.token
          ) {
            results[record.token] = (results[record.token] !== undefined 
              ? results[record.token] + acc * record.amount 
              : 0)
          }

          // assume that csv is sorted as timestamp then stop reading old data before the given date
          if (record.timestamp < startTime) {
            readStream.destroy();
          }
        })
        .on('end', printInUSD(results))
        .on('close', printInUSD(results))
    } else {                    // when only date is given
      var readStream = fs.createReadStream(filepath)
        .pipe(csv())
        .on('data', (record) => {
          const acc = record.transaction_type === 'DEPOSIT' ? 1 : -1;
          if (
            record.timestamp >= startTime && 
            record.timestamp < endTime
          ) {
            results[record.token] = (results[record.token] !== undefined 
              ? results[record.token] + acc * record.amount 
              : 0)
          }

          // assume that csv is sorted as timestamp then stop reading old data before the given date
          if (record.timestamp < startTime) {
            readStream.destroy();
          }
        })
        .on('end', printInUSD(results))
        .on('close', printInUSD(results))
    }
  } else if (options.token) {    // when only token is given
    fs.createReadStream(filepath)
      .pipe(csv())
      .on('data', (record) => {
        const acc = record.transaction_type === 'DEPOSIT' ? 1 : -1;
        if (
          record.token === options.token
        ) {
          results[record.token] = (results[record.token] !== undefined 
            ? results[record.token] + acc * record.amount 
            : 0)
        }
      })
      .on('end', printInUSD(results))
  } else {                       // no param is given
    fs.createReadStream(filepath)
      .pipe(csv())
      .on('data', (record) => {
        const acc = record.transaction_type === 'DEPOSIT' ? 1 : -1;
        results[record.token] = (results[record.token] !== undefined 
          ? results[record.token] + acc * record.amount 
          : 0)
      })
      .on('end', printInUSD(results))
  }
}

main()
