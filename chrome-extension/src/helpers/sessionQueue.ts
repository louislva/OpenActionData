import config from "../config";
import { RecordingType } from "./recording";

export type QueuedSessionType = {
    metadata: {
        tabId: number;
        startTs: number;
        endTs: number;
        descriptionUser: string | null;
    };
    recording: RecordingType;
};

export function queueSessionForReview(session: QueuedSessionType): Promise<void> {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["sessionQueue"], function (result) {
            if (chrome.runtime.lastError)
                return reject(chrome.runtime.lastError);

            let sessionQueue = JSON.parse(result.sessionQueue || "[]").slice(
                -config.maxSessionQueueSize
            );
            sessionQueue.push(session);
            chrome.storage.local.set(
                { sessionQueue: JSON.stringify(sessionQueue) },
                function () {
                    if (chrome.runtime.lastError)
                        return reject(chrome.runtime.lastError);

                    resolve();
                }
            );
        });
    });
}
export function getSessionQueue(): Promise<QueuedSessionType[]> {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["sessionQueue"], function (result) {
            if (chrome.runtime.lastError)
                return reject(chrome.runtime.lastError);

            resolve(JSON.parse(result.sessionQueue || "[]"));
        });
    });
}