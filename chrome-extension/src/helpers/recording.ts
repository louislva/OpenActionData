import { QueuedSessionType, queueSessionForReview } from "./sessionQueue";
import { v4 as uuidv4 } from 'uuid';

export type RecordingType = {
    createdOn: number;
    tabId: number;
    events: any[];
};

let activeTabRecordings: {
    [tabId: string]: RecordingType;
} = {};

async function concludePreviousTabSession(tabId: number) {
    // TODO: save to file
    const recording: RecordingType = activeTabRecordings[tabId] || null;

    console.log("Ending session", recording);
    if (recording) {
        const timestamps = recording.events.map((event) => event.timestamp);
        const minTimestamp = Math.min(...timestamps);
        const maxTimestamp = Math.max(...timestamps);

        const session: QueuedSessionType = {
            uuid: uuidv4(),
            metadata: {
                tabId: recording.tabId,
                startTs: minTimestamp,
                endTs: maxTimestamp,
                descriptionUser: null,
            },
            recording,
        };

        await queueSessionForReview(session);

        delete activeTabRecordings[tabId];
    }
}
async function startNewTabSession(tabId: number, originalUrl: string) {
    console.log("startNewTabSession", tabId, originalUrl);
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
        if (details.frameId === 0) {
            await concludePreviousTabSession(details.tabId);
            await startNewTabSession(details.tabId, details.url);
        }
    });
    chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
        await concludePreviousTabSession(tabId);
    });
    chrome.runtime.onMessage.addListener(function (
        request,
        sender,
        sendResponse
    ) {
        if (request?.type === "event") {
            if (sender.tab?.id) {
                const tabId = sender.tab.id;
                const session: RecordingType =
                    activeTabRecordings[tabId] || null;
                if (session) session.events.push(request.data);
            }
        }
    });
}
