const fs = require("fs");
require("rrdom-nodejs");
const rrweb = require("rrweb");

async function main() {
  const recording = fs.readFileSync("recording.json", "utf8");
  const events = JSON.parse(recording).events;

  const replayer = new rrweb.Replayer(events, {
    root: document.body,
    useVirtualDom: true,
  });
  replayer.play();
  replayer.on("event-cast", (payload) => {
    console.log(payload);
  });
}

main();
