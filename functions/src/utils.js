"use strict";

const admin = require("firebase-admin");
const config = require("../config");

const CONFIG_COLLECTION_NAME = config.db.config.collectionName;
let debugStatus = null;

async function getDebugStatus() {
  if (debugStatus !== null) {
    return debugStatus;
  }

  const db = admin.firestore();
  let debugStatusConfig = false;

  try {
    const snapshot = await db
      .collection(CONFIG_COLLECTION_NAME)
      .doc("configuration")
      .get();
    debugStatusConfig = snapshot.data().debug;
  } catch (err) {
    Log("error fetching debug from config");
    Log(err);
  }

  debugStatus = debugStatusConfig;
  return debugStatusConfig;
}

function Log(...data) {
  console.log(...data);
}

module.exports = {
  getDebugStatus,
  Log,
};
