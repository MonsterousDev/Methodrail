# helloframe

Tiny HTTP helper. Consumers build servers:

```js
const { createApp } = require("helloframe");
const http = require("http");
http.createServer(createApp()).listen(3000);
```

See `examples/hello.js`.
