import config from "./config";

// chrome.runtime.onInstalled.addListener(async () => {
//     let url = chrome.runtime.getURL("hello.html");
//     let tab = await chrome.tabs.create({ url });
// });

type SessionId = {
    createdOn: number;
    tabId: number;
    originalUrl: string;
    events: any[];
};
let activeTabSessions: {
    [tabId: string]: SessionId;
} = {};

async function concludePreviousTabSession(tabId: number) {
    // TODO: save to file
    const session: SessionId = activeTabSessions[tabId] || null;
    console.log("Ending session", session);
    if (session) {
        fetch(config.backendHost + "/api/v1/post/session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(session),
        });
        delete activeTabSessions[tabId];
    }
}
async function startNewTabSession(tabId: number, originalUrl: string) {
    console.log("startNewTabSession", tabId, originalUrl);
    if (originalUrl.startsWith("http")) {
        activeTabSessions[tabId] = {
            createdOn: Date.now(),
            tabId,
            originalUrl,
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
            const session: SessionId = activeTabSessions[tabId] || null;
            if (session) session.events.push(request.data);
        }
    }
});
