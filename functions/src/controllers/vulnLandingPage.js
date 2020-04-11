"use strict";

function vulnLandingPage(req, res) {
  const packageName = req.query.packageName || "";
  const packageVersion = req.query.packageVersion || "";

  const highSeverity = req.query.highSeverity || 0;
  const mediumSeverity = req.query.mediumSeverity || 0;
  const lowSeverity = req.query.lowSeverity || 0;

  const packageSpecifierForUrl = encodeURIComponent(
    `${packageName}@${packageVersion}`
  );

  const snykVulnPageUrl = `https://snyk.io/vuln/npm:${encodeURIComponent(
    packageName
  )}`;

  const htmlContents = `
  <!doctype html>
  <html lang="en">
    <head>
      <!-- Required meta tags -->

      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:site" content="@snyksec">
      <meta name="twitter:creator" content="@piemyvulns">
      <meta name="twitter:title" content="Snyk security vulnerabilities in open source package: ${packageName}@${packageVersion}">
      <meta name="twitter:description" content="Snyk security vulnerabilities in open source package: ${packageName}@${packageVersion}">
      <meta name="twitter:image" content="https://image-charts.com/chart?chco=c27100%2Cb31a6b&chd=t%3A${highSeverity}%2C${mediumSeverity}%2C${lowSeverity}&chdlp=t&chdls=8d3396%2C10&chli=${packageSpecifierForUrl}&chma=20%2C0%2C0%2C20&chs=700x300&cht=pd&chts=76A4FB%2C20&chtt=Pie%20My%20Vulns%20-%20Snyk%20Vulnerabilities%20Severity%20Breakdown&chdl=${highSeverity}%20high%7C${mediumSeverity}%20medium%7C${lowSeverity}%20low">
      <meta name="twitter:image:alt" content="Snyk security vulnerabilities in open source package: ${packageName}@${packageVersion}">

      <meta http-equiv="refresh" content="0; URL='${snykVulnPageUrl}'" />

      <title>Hello, world!</title>
  </head>
  <body>
    <h1>Just a sec... redirecting you to Snyk's vulnrability page for package</h1>
  </body>
</html>
  `;

  return res.status(200).send(htmlContents);
}

module.exports = {
  vulnLandingPage,
};
