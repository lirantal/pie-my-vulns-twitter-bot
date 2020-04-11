const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { Log } = require("./src/utils");

admin.initializeApp(functions.config().firebase);

const { processQueueMessage } = require("./src/queue");
const { vulnLandingPage } = require("./src/controllers/vulnLandingPage");
const {
  twitterChallengeResponseCheck,
} = require("./src/controllers/twitterChallengeRespose");
const {
  twitterWebhookRequest,
} = require("./src/controllers/twitterWebhookRequest");

exports.webhook = functions.https.onRequest(async (req, res) => {
  if (req.method === "GET") {
    try {
      await twitterChallengeResponseCheck(req, res);
    } catch (err) {
      Log("Error: responding to twitter crc check");
      Log(err);
      return res.status(500).send();
    }
  } else if (req.method === "POST" && req.body) {
    try {
      await twitterWebhookRequest(req, res);
    } catch (err) {
      Log("Error: processing twitter webhhook request");
      Log(err);
      return res.status(500).send();
    }
  }
});

exports.piemyvulns_page = functions.https.onRequest((req, res) => {
  return vulnLandingPage(req, res);
});

exports.messageTrigger = functions.pubsub
  .topic("tweets")
  .onPublish(processQueueMessage);
