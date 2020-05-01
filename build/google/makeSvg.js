const fs = require("fs");
const { execSync } = require("child_process");

const foundMatch = {};
const missing = [];

const srcDir = "./noto-emoji/svg/";

// Delete the existing directory.
const destDir = "../../svg-google/";
if (fs.existsSync(destDir)) {
  execSync("rm -rf " + destDir);
}
fs.mkdirSync(destDir);

// Copied from map136.php
const aliases = {};
fs.readFileSync("./noto-emoji/emoji_aliases.txt", "utf8")
  .split("\n")
  .map((line) => line.split("#")[0])
  .map((line) => line.trim())
  .filter((line) => Boolean(line))
  .forEach((line) => {
    const [from, to] = line.split(";");
    aliases[from] = to;
  });

const emojis = require("../../emoji.json");
for (const emoji of emojis) {
  fetchSvg(emoji);
  if (emoji.skin_variations) {
    for (const variation of Object.values(emoji.skin_variations)) {
      fetchSvg(variation);
    }
  }
}

function fetchSvg(emoji) {
  // Gather all potential names of the file we're looking for.
  const names = [];
  names.push(emoji.unified.toLowerCase().replace(/-/g, "_"));
  if (emoji.non_qualified) {
    names.push(emoji.non_qualified.toLowerCase().replace(/-/g, "_"));
  }
  if (emoji.unified.toLowerCase().includes("-fe0f")) {
    names.push(
      emoji.unified.toLowerCase().replace(/-fe0f/g, "").replace(/-/g, "_")
    );
  }

  const moreNames = [];
  for (const name of names) {
    if (aliases[name]) {
      moreNames.push(aliases[name]);
    }
  }
  names.push(...moreNames);

  const dest = destDir + emoji.unified.toLowerCase() + ".svg";

  const srcs = names.map((name) => srcDir + "emoji_u" + name + ".svg");
  // Find the first name that exists.
  for (const src of srcs) {
    if (fs.existsSync(src)) {
      foundMatch[src] = dest;
      fs.copyFileSync(src, dest);
      return;
    }
  }

  if (emoji.has_img_google) {
    missing.push(emoji);
    console.log("Not found", dest, srcs);
  }
}

// See what svgs are unused inside the svg directory.
const unused = [];
const items = fs.readdirSync(srcDir);
for (const item of items) {
  if (!foundMatch[srcDir + item]) {
    console.log("unused", item);
    unused.push(item);
  }
}

// See if there are any partial name matches.
function partialMatch(a, b) {
  const aa = a
    .replace("emoji_u", "")
    .replace(".svg", "")
    .toLowerCase()
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  const bb = b
    .replace("emoji_u", "")
    .replace(".svg", "")
    .toLowerCase()
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  for (const aaa of aa) {
    for (const bbb of bb) {
      if (aaa === bbb) {
        return true;
      }
    }
  }
  return false;
}

for (const emoji of missing) {
  const possible = unused.filter(
    (item) =>
      partialMatch(emoji.unified, item) ||
      partialMatch(emoji.non_qualified || "", item)
  );
  console.log("possible", emoji.unified, possible);
}

console.log(missing.length, unused.length);
