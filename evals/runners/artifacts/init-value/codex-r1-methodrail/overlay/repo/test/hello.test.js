"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const helloExample = require("../examples/hello");
const { createApp } = require("../lib/app");

function request(app, method, url) {
  return new Promise((resolve) => {
    const chunks = [];
    const req = { method, url };
    const res = {
      statusCode: 200,
      headers: {},
      setHeader(name, value) {
        this.headers[name] = value;
      },
      end(body) {
        if (body) chunks.push(body);
        resolve({ status: this.statusCode, body: chunks.join(""), headers: this.headers });
      },
    };
    app(req, res);
  });
}

test("GET /hello returns Hello World without listening", async () => {
  const app = createApp();
  const res = await request(app, "GET", "/hello");
  assert.equal(res.status, 200);
  assert.equal(res.body, "Hello World");
});

test("hello-world example GET /hello returns Hello World", async () => {
  const res = await request(helloExample, "GET", "/hello");
  assert.equal(res.status, 200);
  assert.equal(res.body, "Hello World");
});
