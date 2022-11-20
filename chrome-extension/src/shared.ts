// IMPORTANT: this is ugly, but if you change this file, you must also change
// the copy in the webapp/helpers/ directory.
import * as path from 'path';

export type V1PostSessionRequestBodyType = {
    session: {
        tabId: number;
        startTs: number;
        endTs: number;
        descriptionUser: string | null;
    };
    userToken: string;
};
export function isV1PostSessionRequestBodyType(
    obj: any
): obj is V1PostSessionRequestBodyType {
    return (
        typeof obj === "object" &&
        typeof obj.session === "object" &&
        typeof obj.session.tabId === "number" &&
        typeof obj.session.startTs === "number" &&
        typeof obj.session.endTs === "number" &&
        (obj.session.descriptionUser === null ||
            typeof obj.session.descriptionUser === "string") &&
        typeof obj.userToken === "string"
    );
}