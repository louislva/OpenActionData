import config from "./config";
import sendStringToPresignedPost from "./helpers/sendStringToPresignedPost";
import {
    V1PostSessionRequestBodyType,
} from "./shared";

// chrome.runtime.onInstalled.addListener(async () => {
//     let url = chrome.runtime.getURL("hello.html");
//     let tab = await chrome.tabs.create({ url });
// });

function generateRandomToken() {
    // E.g. 8 * 32 = 256 bits token
    var randomPool = new Uint8Array(32);
    crypto.getRandomValues(randomPool);
    var hex = '';
    for (var i = 0; i < randomPool.length; ++i) {
        hex += randomPool[i].toString(16);
    }
    // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
    return hex;
}

function getUserToken(): Promise<string> {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get('userToken', function(items) {
            const userToken = items.userToken;
            if (userToken) {
                resolve(userToken);
            } else {
                const newUserToken = generateRandomToken();
                chrome.storage.sync.set({userToken: newUserToken}, function() {
                    resolve(newUserToken);
                });
            }
        });
    });
}

type RecordingType = {
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
        
        const body: V1PostSessionRequestBodyType = {
            session: {
                tabId: recording.tabId,
                startTs: minTimestamp,
                endTs: maxTimestamp,
                descriptionUser: null,
            },
            userToken: await getUserToken(),
        };
        const backendResponse = await fetch(config.backendHost + "/api/v1/post/session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        if(backendResponse.status === 200){
            const backendResponseJson = await backendResponse.json();
            sendStringToPresignedPost(backendResponseJson.presignedPost, JSON.stringify(recording));
        }
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

chrome.webNavigation.onCommitted.addListener(async (details) => {
    if (details.frameId === 0) {
        await concludePreviousTabSession(details.tabId);
        await startNewTabSession(details.tabId, details.url);
    }
});
chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
    await concludePreviousTabSession(tabId);
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request?.type === "event") {
        if (sender.tab?.id) {
            const tabId = sender.tab.id;
            const session: RecordingType = activeTabRecordings[tabId] || null;
            if (session) session.events.push(request.data);
        }
    }
});
