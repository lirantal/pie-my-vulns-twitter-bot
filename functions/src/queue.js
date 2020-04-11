"use strict";

const { PubSub } = require("@google-cloud/pubsub");
const { getTwitterSecrets } = require("./secrets");
const { postTwitterReply } = require("./twitterClient");
const { saveScanRequest, userAllowedMoreScans } = require("./scansDb");
const { Log } = require("./utils");
const config = require("../config");

const TWEETS_QUEUE_TOPIC_NAME = config.db.tweets.queueName;
const pubSubClient = new PubSub();

function parsePackageDataFromString(messageString) {
  let packageName = null;
  let packageVersion = null;

  if (typeof messageString === "string" && messageString) {
    const parsedMessageData = /package:?\s?(@?[a-z0-9._-]+?\/?[a-z0-9._-]+)@?(\d+.\d+.\d+)?/.exec(
      messageString
    );

    if (parsedMessageData && parsedMessageData[1]) {
      packageName = parsedMessageData[1];
    }

    if (parsedMessageData && parsedMessageData[2]) {
      packageVersion = parsedMessageData[2];
    }

    return {
      packageName,
      packageVersion,
    };
  }

  return {};
}

function addMessageToQueue(dataBuffer) {
  return pubSubClient.topic(TWEETS_QUEUE_TOPIC_NAME).publish(dataBuffer);
}

async function processQueueMessage(message) {
  let messageText = null;
  let replyToTweetId = null;
  let replyToUserScreenName = null;
  let fromUserId = null;
  let packageName = null;
  let packageVersion = null;

  try {
    messageText = message.json.messageText;
    replyToTweetId = message.json.replyToTweetId;
    replyToUserScreenName = message.json.replyToUserScreenName;
    fromUserId = message.json.fromUserId;
  } catch (error) {
    Log("Queue message data was not JSON formatted, exiting");
    Log(error);
    return null;
  }

  Log("Parsing message for package name and version");
  const packageInfo = parsePackageDataFromString(messageText);
  if (packageInfo && packageInfo.packageName) {
    packageName = packageInfo.packageName;
  }

  if (packageInfo && packageInfo.packageVersion) {
    packageVersion = packageInfo.packageVersion;
  }

  Log("Recording scan request in database");
  await saveScanRequest({
    userId: fromUserId,
    userScreenName: replyToUserScreenName,
    packageName,
    packageVersion,
    tweetId: replyToTweetId,
  });

  Log("Checking if user is allowed to scan packages");
  const allowedScans = await userAllowedMoreScans({
    userId: fromUserId,
    scansPerDay: 10,
  });

  if (allowedScans !== true) {
    return null;
  }

  Log("Fetching secrets");
  const secrets = await getTwitterSecrets();

  Log("Posting twitter reply");
  await postTwitterReply({
    packageName,
    packageVersion,
    in_reply_to_status_id: replyToTweetId,
    secrets,
  });

  return null;
}

module.exports = { processQueueMessage, addMessageToQueue };
