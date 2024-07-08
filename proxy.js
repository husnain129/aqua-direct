var redbird = require("redbird");
const httpStart = require("./http-ipc");

var proxy = redbird({
  port: 80,
  letsencrypt: {
    path: __dirname + "/certs",
    port: 9999, // LetsEncrypt minimal web server port for handling challenges. Routed 80->9999, no need to open 9999 in firewall. Default 3000 if not defined.
  },
  ssl: {
    http2: true,
    // redirect:true,
    port: 443, // SSL port used to serve registered https routes with LetsEncrypt certificate.
  },
  bunyan: { level: "debug" },
});


httpStart(proxy);
