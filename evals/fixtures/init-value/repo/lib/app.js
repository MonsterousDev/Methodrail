"use strict";

function createApp() {
  return function app(req, res) {
    if (req.method === "GET" && req.url === "/hello") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/plain");
      res.end("Hello World");
      return;
    }
    res.statusCode = 404;
    res.end("Not Found");
  };
}

module.exports = { createApp };
