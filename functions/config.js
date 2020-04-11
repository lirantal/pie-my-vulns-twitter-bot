"use strict";

module.exports = {
  packageLandingPageUrl:
    "https://us-central1-pie-my-vulns-twitter-bot.cloudfunctions.net/piemyvulns_page",
  snyk: {
    apiBaseUrl: "https://snyk.io/api/v1/test/npm/",
    vulnPageUrl: "https://snyk.io/vuln/npm:",
  },
  twitter: {
    statusUpdateUrl: "https://api.twitter.com/1.1/statuses/update.json",
    botTwitterId: "1238496812274790400",
  },
  db: {
    config: {
      collectionName: "config",
    },
    scans: {
      collectionName: "scanRequests",
      daysPerAllowedScans: 1,
    },
    tweets: {
      queueName: "tweets",
    },
  },
};
