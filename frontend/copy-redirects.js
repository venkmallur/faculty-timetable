const fs = require("fs");
const path = require("path");

const from = path.join(__dirname, "public", "_redirects");
const to = path.join(__dirname, "build", "_redirects");

fs.copyFile(from, to, (err) => {
  if (err) {
    console.error("Failed to copy _redirects file:", err);
  } else {
    console.log("_redirects file copied successfully.");
  }
});
