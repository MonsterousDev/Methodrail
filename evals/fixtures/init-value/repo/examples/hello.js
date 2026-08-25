"use strict";

const http = require("node:http");
const { createApp } = require("../lib/app");

const app = createApp();

if (!module.parent) {
  http.createServer(app).listen(3000);
}

module.exports = app;
