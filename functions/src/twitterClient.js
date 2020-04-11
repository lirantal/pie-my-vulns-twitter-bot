"use strict";

const crypto = require("crypto");
const querystring = require("querystring");
const OAuth = require("oauth-1.0a");
const got = require("got");
const { getVulnerabilitiesMetaForPackage } = require("./snykClient");
const { Log, getDebugStatus } = require("./utils");
const config = require("../config");

function oauthFactory({ accessKey, accessSecret }) {
  const oauth = OAuth({
    consumer: { key: accessKey, secret: accessSecret },
    signature_method: "HMAC-SHA1",
    hash_function: (baseString, key) => {
      return crypto.createHmac("sha1", key).update(baseString).digest("base64");
    },
  });

  return oauth;
}

function getHeader({ secrets, requestData, twitterStatusUpdateEndpoint }) {
  const oauth = oauthFactory({
    accessKey: secrets.accessKey,
    accessSecret: secrets.accessSecret,
  });
  const token = secrets.token;

  const oauthHeader = oauth.toHeader(
    oauth.authorize(
      {
        url: twitterStatusUpdateEndpoint,
        method: "POST",
        data: requestData,
      },
      token
    )
  );

  return oauthHeader;
}

async function postTwitterReply({
  secrets,
  packageName,
  packageVersion,
  in_reply_to_status_id,
}) {
  let vulnMetadata;
  try {
    Log("Getting vulnerabilities data from Snyk API");
    vulnMetadata = await getVulnerabilitiesMetaForPackage({
      snykApiToken: secrets.snykApiToken,
      packageName,
      packageVersion,
    });
  } catch (err) {
    Log("Snyk API request failed");
    throw err;
  }

  const tweetMessage = composeTweetMessage({
    vulnMetadata,
    packageName,
    packageVersion,
  });

  const twitterStatusUpdateEndpoint = config.twitter.statusUpdateUrl;
  const requestData = {
    status: tweetMessage,
    in_reply_to_status_id,
    auto_populate_reply_metadata: true,
  };

  const oauthHeader = getHeader({
    secrets,
    requestData,
    twitterStatusUpdateEndpoint,
  });

  const bodyString = querystring.stringify(requestData);
  const reqHeaders = Object.assign({}, oauthHeader, {
    "Content-Type": "application/x-www-form-urlencoded",
  });

  let data;
  try {
    Log("Posting Tweet...");
    data = await got.post(twitterStatusUpdateEndpoint, {
      headers: reqHeaders,
      body: bodyString,
    });
  } catch (error) {
    Log(error);
    const { response } = error;
    if (response && response.body) {
      Log(response.body);
    }
  }

  getDebugStatus() && Log(data);
}

function composeTweetMessage({ vulnMetadata, packageName, packageVersion }) {
  const snykVulnPageUrl = `${config.snyk.vulnPageUrl}${encodeURIComponent(
    packageName
  )}`;

  const vulnEmoji = (count) => {
    return count > 0 ? "❌" : "🥳";
  };

  const highSeverity = vulnMetadata.severityInfo.highSeverity;
  const mediumSeverity = vulnMetadata.severityInfo.mediumSeverity;
  const lowSeverity = vulnMetadata.severityInfo.lowSeverity;

  const isUpgradableText =
    (vulnMetadata.depTypeInfo.upgradableCount > 0 &&
      `\n ${vulnMetadata.depTypeInfo.upgradableCount} are upgradable`) ||
    "";

  const isPatchableText =
    (vulnMetadata.depTypeInfo.patchableCount > 0 &&
      `\n ${vulnMetadata.depTypeInfo.patchableCount} are patchable`) ||
    "";

  const vulnChartUrl = `${config.packageLandingPageUrl}?highSeverity=${highSeverity}&mediumSeverity=${mediumSeverity}&lowSeverity=${lowSeverity}&packageName=${packageName}&packageVersion=${packageVersion}`;
  const tweetMessage =
    `📦 security vulnerabilities for npm package: ${packageName}@${packageVersion}\n\n` +
    `${vulnEmoji(
      highSeverity
    )} ${highSeverity} high severity vulnerabilities\n` +
    `${vulnEmoji(
      mediumSeverity
    )} ${mediumSeverity} medium severity vulnerabilities\n` +
    `${vulnEmoji(lowSeverity)} ${lowSeverity} low severity vulnerabilities` +
    `\n\n` +
    isUpgradableText +
    isPatchableText +
    `\n\n\nVulnerability page: ${snykVulnPageUrl}\n ${vulnChartUrl}`;

  return tweetMessage;
}

module.exports = {
  postTwitterReply,
};
