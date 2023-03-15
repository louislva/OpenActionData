const fs = require("fs");
require("rrdom-nodejs");
const rrweb = require("rrweb");
const { v4: uuidv4 } = require("uuid");
const {
  MouseInteractions,
  EventType,
  IncrementalSource,
  ReplayerEvents,
} = require("rrweb");

// A way to convert between human readable sequential ids and UUIDs
class UUIDToSequentialMap {
  constructor() {
    this.map = {};
    this.nextId = 0;
  }

  uuid(uuid) {
    if (!this.map[uuid]) {
      this.map[uuid] = this.nextId++;
    }
    return this.map[uuid];
  }
  sequential(sequential) {
    return Object.keys(this.map).find((key) => this.map[key] === sequential);
  }
  reset() {
    this.map = {};
    this.nextId = 0;
  }
}
const uuidToSequentialMap = new UUIDToSequentialMap();

// Function that gives every node in the document an oadId, and returns an array of [oadId, textRepresentation] for every node in the document.
function interpretDocument(node) {
  let elements = [];

  if (!node.oadId) node.oadId = uuidv4();
  if (node.childNodes.length === 0) {
    const cssSelector =
      (node.tagName ? node.tagName.toLowerCase() : "") +
      (node.id ? "#" + node.id : "") +
      (node.className ? "." + node.className : "");
    const textRepresentation = node.textContent?.trim() || cssSelector;
    if (textRepresentation) {
      elements.push([node.oadId, textRepresentation]);
    }
  }

  node.childNodes.forEach((child) => {
    elements = elements.concat(interpretDocument(child));
  });

  return elements;
}

// Main! Replay a recording, and print out the oadIds and text representations of every node in the document.
async function main() {
  const recording = JSON.parse(fs.readFileSync("recording.json", "utf8"));
  const events = recording.events;
  const oadEvents = recording.oadEvents;

  const SPEED = 10;

  const rrwebReplayer = new rrweb.Replayer(events, {
    root: document.body,
    useVirtualDom: true,
    speed: SPEED,
  });
  rrwebReplayer.play();
  rrwebReplayer.on("mouse-interaction", (event) => {
    if (event.type === MouseInteractions.Click) {
      console.log("");
      console.log("");
      uuidToSequentialMap.reset();
      interpretDocument(rrwebReplayer.iframe.contentDocument.body).forEach(
        ([oadId, text]) => console.log(uuidToSequentialMap.uuid(oadId), text)
      );
      console.log("CLICK", uuidToSequentialMap.uuid(event.target.oadId));
    }
  });
}

main();
