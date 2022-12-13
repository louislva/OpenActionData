import config from "../config";
import { RecordingType } from "./recording";

export type QueuedSessionType = {
    uuid: string;
    metadata: {
        tabId: number;
        startTs: number;
        endTs: number;
        descriptionUser: string | null;
    };
    recording: RecordingType;
};

export function queueSessionForReview(
    session: QueuedSessionType
): Promise<void> {
    return new Promise((resolve, reject) => {
        getSessionQueue().then((queue) => {
            const sessionQueue = queue.slice(-config.maxSessionQueueSize);
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
export function deleteSessionByUuid(uuid: string): Promise<void> {
    return new Promise((resolve, reject) => {
        getSessionQueue().then((queue) => {
            const sessionQueue = queue.filter(
                (session) => session.uuid !== uuid
            );
            const foundAndDeleted = sessionQueue.length === queue.length - 1;
            chrome.storage.local.set(
                { sessionQueue: JSON.stringify(sessionQueue) },
                function () {
                    if (chrome.runtime.lastError)
                        return reject(chrome.runtime.lastError);

                    if (!foundAndDeleted)
                        return reject(
                            new Error(
                                `Could not find session with uuid ${uuid} in session queue`
                            )
                        );

                    resolve();
                }
            );
        });
    });
}
