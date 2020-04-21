"use strict";

const fetch = require("node-fetch");
const DependencyTypeParser = require("pie-my-vulns/src/Parsers/RemediationTypeParser");
const SeverityParser = require("pie-my-vulns/src/Parsers/SeverityParser.js");
const { Log, getDebugStatus } = require("./utils");
const config = require("../config");
const URL = require("url").URL;

function getSnykPackageTestEndpoint({ packageName, packageVersion }) {
  const snykApiBaseUrl = config.snyk.apiBaseUrl;

  const packageTestUrl = new URL(
    `${packageName}/${packageVersion}`,
    snykApiBaseUrl
  );

  if (packageTestUrl.href.indexOf(snykApiBaseUrl) === 0) {
    return packageTestUrl.href;
  }

  return "";
}

async function getVulnerabilitiesMetaForPackage({
  snykApiToken,
  packageName,
  packageVersion,
}) {
  const packageTestUrl = getSnykPackageTestEndpoint({
    packageName,
    packageVersion,
  });

  Log(`URL for vulnerabilities: ${packageTestUrl}`);
  const response = await fetch(packageTestUrl, {
    method: "get",
    headers: {
      "Content-Type": "application/json",
      Authorization: `token ${snykApiToken}`,
    },
  });

  const data = await response.json();
  const issues = data.issues;
  getDebugStatus() && Log(issues);

  const depTypeParser = new DependencyTypeParser(issues);
  depTypeParser.parse();
  const depTypeInfo = {
    upgradableCount: depTypeParser.getUpgradableCount(),
    patchableCount: depTypeParser.getPatchableCount(),
  };

  const severityParser = new SeverityParser(issues);
  severityParser.parse();
  const severityInfo = {
    highSeverity: severityParser.getHighSeverityCount(),
    mediumSeverity: severityParser.getMediumSeverityCount(),
    lowSeverity: severityParser.getLowSeverityCount(),
  };

  return {
    depTypeInfo,
    severityInfo,
  };
}

module.exports = {
  getVulnerabilitiesMetaForPackage,
};
