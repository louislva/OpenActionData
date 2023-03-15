import {
  SessionType,
  queueSessionForReview,
  getQueueCount,
} from "./sessionQueue";
import { v4 as uuidv4 } from "uuid";
import extractSessionDisplayData from "./extractSessionDisplayData";

type ActiveRecordingType = {
  createdOn: number;
  tabId: number;
  events: any[];
};
export type RecordingType = ActiveRecordingType & {
  uuid: string;
};

let activeTabRecordings: {
  [tabId: string]: ActiveRecordingType;
} = {};

async function concludePreviousTabSession(tabId: number, cause: "closed-tab") {
  // TODO: save to file
  const recording: ActiveRecordingType = activeTabRecordings[tabId] || null;

  if (recording) {
    const timestamps = recording.events.map((event) => event.timestamp);
    const minTimestamp = Math.min(...timestamps);
    const maxTimestamp = Math.max(...timestamps);

    let session: SessionType = {
      uuid: uuidv4(),
      metadata: {
        tabId: recording.tabId,
        startTs: minTimestamp,
        endTs: maxTimestamp,
        descriptionUser: null,
      },
    };
    const recordingWithUuid: RecordingType = {
      ...recording,
      uuid: session.uuid,
    };
    const inferredTitle = extractSessionDisplayData(session, recordingWithUuid);
    if (inferredTitle) session.metadata.inferredTitle = inferredTitle;

    await queueSessionForReview(session, recordingWithUuid);
    delete activeTabRecordings[tabId];

    getQueueCount().then((count) =>
      chrome.action.setBadgeText({ text: count ? count.toString() : "" })
    );
  }
}
async function startNewTabSession(tabId: number, originalUrl: string) {
  // If this is a website, and not chrome://newtab or something, start recording the tab
  if (originalUrl.startsWith("http")) {
    activeTabRecordings[tabId] = {
      createdOn: Date.now(),
      tabId,
      events: [],
    };
  }
}

export function startRecordingDaemon() {
  chrome.webNavigation.onCommitted.addListener(async (details) => {
    // If we're not in an IFrame
    if (details.frameId === 0) {
      // If the tab is not currently recording
      if (!activeTabRecordings[details.tabId]) {
        // Try to start recording
        await startNewTabSession(details.tabId, details.url);
      } else {
        // TODO: is rrweb already recording the manual URL changes? because the model should learn to "commit" new urls to the search bar
      }
    }
  });
  chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
    // If the tab is closed, conclude the session (if any is running; it might have been stopped early by the data-engine)
    await concludePreviousTabSession(tabId, "closed-tab");
  });

  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request?.type === "event") {
      if (sender.tab?.id) {
        const tabId = sender.tab.id;
        const recording: ActiveRecordingType =
          activeTabRecordings[tabId] || null;
        if (recording) recording.events.push(request.data);
      }
    }
  });
}
