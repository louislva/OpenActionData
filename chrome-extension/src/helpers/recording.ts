import { SessionType, queueSessionForReview } from "./sessionQueue";
import { v4 as uuidv4 } from 'uuid';
import extractSessionDisplayData from "./extractSessionDisplayData";

type ActiveRecordingType = {
    createdOn: number;
    tabId: number;
    events: any[];
};
export type RecordingType = ActiveRecordingType & {
    uuid: string;
}

let activeTabRecordings: {
    [tabId: string]: ActiveRecordingType;
} = {};

async function concludePreviousTabSession(tabId: number) {
    // TODO: save to file
    const recording: ActiveRecordingType = activeTabRecordings[tabId] || null;

    console.log("Ending session", recording);
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
            uuid: session.uuid
        };
        const inferredTitle = extractSessionDisplayData(session, recordingWithUuid);
        if(inferredTitle) session.metadata.inferredTitle = inferredTitle;

        await queueSessionForReview(session, recordingWithUuid);

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
                const recording: ActiveRecordingType =
                    activeTabRecordings[tabId] || null;
                if (recording) recording.events.push(request.data);
            }
        }
    });
}
