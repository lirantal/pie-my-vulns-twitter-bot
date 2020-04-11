"use strict";

const admin = require("firebase-admin");
const { Log } = require("./utils");
const config = require("../config");
const SCANS_COLLECTION_NAME = config.db.scans.collectionName;
const DAYS_PER_ALLOWED_SCANS = config.db.scans.daysPerAllowedScans;

async function saveScanRequest({
  userId,
  userScreenName,
  packageName,
  packageVersion,
  tweetId,
}) {
  const db = admin.firestore();
  await db.collection(SCANS_COLLECTION_NAME).add({
    userId,
    userScreenName,
    tweetId,
    packageName,
    packageVersion,
    date: new Date(),
  });
}

async function userAllowedMoreScans({ userId, scansPerDay }) {
  const db = admin.firestore();

  let dateStartRange = new Date();
  dateStartRange.setDate(dateStartRange.getDate() - DAYS_PER_ALLOWED_SCANS);

  const scans = db.collection(SCANS_COLLECTION_NAME);
  let snapshot = await scans
    .where("userId", "==", userId)
    .where("date", ">=", dateStartRange)
    .get();

  const totalDocs = snapshot.size;

  if (totalDocs <= scansPerDay) {
    return true;
  } else {
    Log(
      `User not allowed more scans, reaching ${totalDocs} scan requests so far.`
    );
    return false;
  }
}

module.exports = {
  userAllowedMoreScans,
  saveScanRequest,
};
