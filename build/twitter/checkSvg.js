const fs = require("fs");
const emojis = require("../../emoji.json");

function check(emoji) {
  const filePath = "../../svg-twitter/" + emoji.unified.toLowerCase() + ".svg";
  if (!fs.existsSync(filePath)) {
    if (emoji.has_img_twitter) {
      console.log("missing", emoji.unified);
    } else {
      console.log("known missing", emoji.unified);
    }
  }
}

for (const emoji of emojis) {
  check(emoji);
  if (emoji.skin_variations) {
    for (const variation of Object.values(emoji.skin_variations)) {
      check(variation);
    }
  }
}
