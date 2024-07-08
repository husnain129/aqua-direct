const express = require("express");
const port = 6000;
const Store = require("./store");
const bodyParser = require("body-parser");

function httpStart(proxy) {
  const app = express();
  const store = Store(proxy);

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.put("/domains", (req, res, next) => {
    const { domain, username } = req.query;
    console.log(domain, username);
    store.push( domain, username);

    res.json({ ok: true });
  });
  app.delete("/domains", (req, res, next) => {
    const { domain } = req.query;
    store.removeDomain(domain);

    res.json({ ok: true });
  });

  app.get("/domains", (req, res, next) => {
    const { username } = req.query;
    let dom = store.getDomain(username);
    res.json({ ok: true, domain: dom });
  });

  app.listen(port, () => {
    console.log("HTTP IPC Listening on ", port);
  });

  // setTimeout(() => {
  //   store.removeDomain("www.humayun.io");
  // }, 4000);

  // setTimeout(() => {
  //   store.push("www.humayun.io", "humayun");
  // }, 2000);

  return app;
}

module.exports = httpStart;
