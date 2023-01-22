import config from "../config";
import { V1PostSessionRequestBodyType } from "../shared";
import { RecordingType } from "./recording";
import sendStringToPresignedPost from "./sendStringToPresignedPost";
import { deleteSessionByUuid, SessionType } from "./sessionQueue";

function generateRandomToken() {
    // E.g. 8 * 32 = 256 bits token
    var randomPool = new Uint8Array(32);
    crypto.getRandomValues(randomPool);
    var hex = "";
    for (var i = 0; i < randomPool.length; ++i) {
        hex += randomPool[i].toString(16);
    }
    // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
    return hex;
}
function getUserToken(): Promise<string> {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get("userToken", function (items) {
            const userToken = items.userToken;
            if (userToken) {
                resolve(userToken);
            } else {
                const newUserToken = generateRandomToken();
                chrome.storage.sync.set(
                    { userToken: newUserToken },
                    function () {
                        resolve(newUserToken);
                    }
                );
            }
        });
    });
}

export async function uploadQueuedSession(
    session: SessionType,
    recording: RecordingType,
    descriptionUser: string | null
): Promise<void> {
    const body: V1PostSessionRequestBodyType = {
        session: {
            ...session.metadata,
            descriptionUser: descriptionUser || null,
        },
        userToken: await getUserToken(),
    };
    const backendResponse = await fetch(
        config.backendHost + "/api/v1/post/session",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        }
    );
    if (backendResponse.status === 200) {
        const backendResponseJson = await backendResponse.json();
        const presignedPostResponse = await sendStringToPresignedPost(
            backendResponseJson.presignedPost,
            JSON.stringify(recording)
        );
        if (presignedPostResponse.status.toString().startsWith("2")) {
            await deleteSessionByUuid(session.uuid);
        } else {
            throw new Error("Upload failed");
        }
    } else {
        throw new Error("Upload registration failed");
    }
}
