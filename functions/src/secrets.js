"use strict;";

const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const secretsManagerClient = new SecretManagerServiceClient();

async function getTwitterSecrets() {
  let secretText = null;
  const nameTwitterAppKey = "twitterAppKey";
  const pathTwitterAppKey = `projects/${process.env.GCLOUD_PROJECT}/secrets/${nameTwitterAppKey}/versions/latest`;
  [secretText] = await secretsManagerClient.accessSecretVersion({
    name: pathTwitterAppKey,
  });

  const twitterAppKey = secretText.payload.data.toString();

  const nameTwitterAppSecret = "twitterAppSecret";
  const pathTwitterAppSecret = `projects/${process.env.GCLOUD_PROJECT}/secrets/${nameTwitterAppSecret}/versions/latest`;
  [secretText] = await secretsManagerClient.accessSecretVersion({
    name: pathTwitterAppSecret,
  });

  const twitterAppSecret = secretText.payload.data.toString();

  const nameTwitterTokenKey = "twitterTokenKey";
  const pathTwitterTokenKey = `projects/${process.env.GCLOUD_PROJECT}/secrets/${nameTwitterTokenKey}/versions/latest`;
  [secretText] = await secretsManagerClient.accessSecretVersion({
    name: pathTwitterTokenKey,
  });

  const twitterTokenKey = secretText.payload.data.toString();

  const nameTwitterTokenSecret = "twitterTokenSecret";
  const pathTwitterTokenSecret = `projects/${process.env.GCLOUD_PROJECT}/secrets/${nameTwitterTokenSecret}/versions/latest`;
  [secretText] = await secretsManagerClient.accessSecretVersion({
    name: pathTwitterTokenSecret,
  });

  const twitterTokenSecret = secretText.payload.data.toString();

  const nameSnykTokenSecret = "snykApiToken";
  const pathSnykTokenSecret = `projects/${process.env.GCLOUD_PROJECT}/secrets/${nameSnykTokenSecret}/versions/latest`;
  [secretText] = await secretsManagerClient.accessSecretVersion({
    name: pathSnykTokenSecret,
  });

  const snykTokenSecret = secretText.payload.data.toString();

  return {
    accessKey: twitterAppKey,
    accessSecret: twitterAppSecret,
    token: {
      key: twitterTokenKey,
      secret: twitterTokenSecret,
    },
    snykApiToken: snykTokenSecret,
  };
}

module.exports = {
  getTwitterSecrets,
};
