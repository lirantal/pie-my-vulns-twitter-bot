"use strict";

const crypto = require("crypto");
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const secretsManagerClient = new SecretManagerServiceClient();

async function twitterChallengeResponseCheck(req, res) {
  console.log(`Twitter CRC processing`);
  const twitterAppSecretName = "twitterAppSecret";
  const twitterAppSecretPath = `projects/${process.env.GCLOUD_PROJECT}/secrets/${twitterAppSecretName}/versions/latest`;
  const [secret] = await secretsManagerClient.accessSecretVersion({
    name: twitterAppSecretPath,
  });
  const twitterAppSecret = secret.payload.data.toString();

  const crcToken = req.query.crc_token;
  if (crcToken) {
    const crcTokenSignedHash = crypto
      .createHmac("sha256", twitterAppSecret)
      .update(crcToken)
      .digest("base64");

    return res
      .status(200)
      .json({ response_token: "sha256=" + crcTokenSignedHash });
  } else {
    return res.status(400).json({ message: "error with crc_token" });
  }
}

module.exports = {
  twitterChallengeResponseCheck,
};
