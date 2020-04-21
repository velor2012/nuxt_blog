const express = require("express");
const router = express.Router();
const https = require('https')
const fs = require('fs')
const consola = require("consola");
const { Nuxt, Builder } = require("nuxt");
const app = express();
const main = require("./router/main");

// Import and Set Nuxt.js options
const config = require("../nuxt.config.js");
config.dev = process.env.NODE_ENV !== "production";

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config);

  const { host, port } = nuxt.options.server;

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt);
    await builder.build();
  } else {
    await nuxt.ready();
  }
  app.use(require("cors")());
  app.use(express.json());

  app.use("/api", main);
  // Give nuxt middleware to express
  app.use(nuxt.render);
// HTTPS Server
const options = {
  cert: fs.readFileSync('localhost+2.pem'),
  key: fs.readFileSync('localhost+2-key.pem')
}
// const options = {
//     cert: fs.readFileSync('plugins/cert/3715899_www.velor2012.xyz.pem'),
//     key: fs.readFileSync('plugins/cert/3715899_www.velor2012.xyz.key')
//   }
// Create the server
// console.log(options)
https
.createServer(options, app)
.listen(port,host)
  // // Listen the server
  // app.listen(port, host);
  consola.ready({
    message: `Server listening on https://${host}:${port}`,
    badge: true
  });
}
start();
