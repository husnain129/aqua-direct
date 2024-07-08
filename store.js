const parse = require("csv-parse/lib/sync");

var fs = require("fs");

let pairs = [];
const TARGET = "http://35.153.212.198:3000";

const OPTS = {
  ssl: {
    // redirect: true,
    letsencrypt: {
      email: "support@recrutability.com",
      production: true,
    },
  },
};

function loadPairs(_push) {
  const records = parse(fs.readFileSync("store.csv", "utf8"), {
    skip_empty_lines: true,
  });

  pairs = records;

  for (let p of pairs) {
    if (p[0] && p[1]) _push(p[0], p[1]);
  }
}

function removeExisting(domain, username) {
  return pairs.filter(
    ([_domain, _username]) => _domain !== domain && _username !== username
  );
}

function removeExistingUsername(username) {
  return pairs.filter(([_domain, _username]) => _username !== username);
}

function addPair(domain, username) {
  pairs = removeExisting(domain, username);
  pairs.push([domain, username]);
  fs.appendFile(
    "store.csv",
    domain + "," + username + "\n",
    (err) => err && console.error(err)
  );
}
function removePair(domain, username) {
  pairs = removeExisting(domain, username);
  let s = "";
  for (let p of pairs) {
    s = p[0] + "," + p[1] + "\n";
  }
  fs.writeFile("store.csv", s, (err) => err & console.error(err));
}

function makeURL(username) {
  return `${username}.recrutability.com`;
}

function getDomain(username) {
  for (let p of pairs) {
    if (p[1] === username) {
      return p[0];
    }
  }
  return null;
}

function getUsername(domain) {
  for (let p of pairs) {
    if (p[0] === domain) {
      return p[1];
    }
  }
  return null;
}
function push(domain, username) {
  addPair(domain, username);
  console.log("Registering domain: ", domain, TARGET);
  this.register(domain, TARGET, OPTS);
}

function removeDomain(domain) {
  let u = getUsername(domain);
  if (!u) return;
  removePair(domain, u);
  this.unregister(domain, TARGET);
}
var CustomDomainsResolver = function (host, url, req) {
  // console.log('PROTOCOL:');
  // console.log(req.connection.encrypted);

  // console.log('lOG:',url);
  if (!req.connection.encrypted)
    // //   // http protocol? redbird will redirect
    // {
    //   console.log('Redirect:', `https://${req.headers.host}${url}`);
    return;
  // }

  let u = getUsername(host);
  if (u) {
    req.headers.host = makeURL(u);
    req.headers["x-custom-domain"] = host;
    return {
      url: TARGET,
    };
  }
};
CustomDomainsResolver.priority = 0;

function store(proxy) {
  proxy.addResolver(CustomDomainsResolver);
  loadPairs(push.bind(proxy));
  let _push = push.bind(proxy);
  return {
    getDomain,
    push: (domain, username) => {
      let _domain = getDomain(username);
      if (_domain) removeDomain.bind(proxy)(_domain);

      _push(domain, username);
    },
    removeDomain: removeDomain.bind(proxy),
  };
}

module.exports = store;
