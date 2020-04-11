"use strict";

const { addMessageToQueue } = require("../queue");
const { Log, getDebugStatus } = require("../utils");
const config = require("../../config");

async function twitterWebhookRequest(req, res) {
  Log(
    `Processing twitter POST webhook sent to user id: ${req.body.for_user_id}`
  );

  if (req.body.for_user_id === config.twitter.botTwitterId) {
    let queuedMessagesBucket = [];
    for (const event of req.body.tweet_create_events) {
      if (req.body.for_user_id === event.user.id_str) {
        if (getDebugStatus()) {
          Log("Skipping mesage from same user as reply to own thread");
        }

        continue;
      }

      if (getDebugStatus()) {
        Log("Message text:", event.text);
        Log("id", event.id);
        Log("id_str", event.id_str);
        Log("in_reply_to_user_id", event.id_str.in_reply_to_user_id);
        Log("in_reply_to_screen_name", event.in_reply_to_screen_name);
        Log("in_reply_to_user_id_str", event.in_reply_to_user_id_str);
        Log("in_reply_to_status_id", event.in_reply_to_status_id);
        Log("user id", event.user.id);
        Log("user.name", event.user.name);
        Log("user.screen_name", event.user.screen_name);
      }

      const dataBuffer = Buffer.from(
        JSON.stringify({
          fromUserId: event.user.id,
          messageText: event.text,
          replyToTweetId: event.id_str,
          replyToUserScreenName: event.user.screen_name,
        })
      );
      queuedMessagesBucket.push(addMessageToQueue(dataBuffer));
    }

    const messageIds = await Promise.all(queuedMessagesBucket);

    if (getDebugStatus()) {
      Log("Queued message IDs:");
      Log(messageIds);
    }

    return res.status(200).send();
  }

  return res.status(200).send();
}

module.exports = {
  twitterWebhookRequest,
};
