const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { Log } = require("./utils");

admin.initializeApp(functions.config().firebase);

const { processQueueMessage } = require("./queue");
const { vulnLandingPage } = require("./controllers/vulnLandingPage");
const {
  twitterChallengeResponseCheck,
} = require("./controllers/twitterChallengeRespose");
const {
  twitterWebhookRequest,
} = require("./controllers/twitterWebhookRequest");

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
