// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import {
    V1PostSessionRequestBodyType,
    isV1PostSessionRequestBodyType,
} from "../../../../helpers/shared";
import config from "../../../../config";
import { getDB } from "../../../../helpers/db";
import { createPresignedPost } from "../../../../helpers/s3";
import { v4 as uuidv4 } from "uuid";
const { db } = getDB();

// Validates whether it wants to receive the session
// If yes, inserts the session metadata into the database
// Then signs a presigned PUT URL and returns it

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        if (req.method === "POST") {
            if (!isV1PostSessionRequestBodyType(req.body))
                return res.status(400).send("Invalid body");

            await db.task(async (t) => {
                const body = req.body as V1PostSessionRequestBodyType;
                const sessionData = body.session;
                const userToken: string = body.userToken;

                const ipAddress =
                    req.headers["x-forwarded-for"] || req.socket.remoteAddress;
                const ip = await t.one(
                    `INSERT INTO ip (address) VALUES ($/ipAddress/)
                    ON CONFLICT (address) DO NOTHING;
                    
                    SELECT i.id, count(s.id) as count
                    FROM ip i
                    LEFT JOIN session s 
                        ON s.ip = i.id
                        AND s.created_on > now() - interval '1 day'
                    WHERE i.address = $/ipAddress/
                    GROUP BY i.id`,
                    {
                        ipAddress,
                    }
                );
                if (ip.count >= config.MAX_SESSIONS_PER_IP_PER_DAY) {
                    return res
                        .status(429)
                        .send("Too many sessions from this IP address");
                }

                const userPromise = t.one(
                    `INSERT INTO "user" (token) VALUES ($/token/) 
                    ON CONFLICT (token) DO NOTHING;
                    
                    SELECT * FROM "user" WHERE token = $/token/`,
                    {
                        token: userToken,
                    }
                );

                const key = uuidv4() + ".json.gz";

                const presignedPostPromise = createPresignedPost({
                    Bucket: process.env.S3_BUCKET as string,
                    Fields: {
                        key,
                    },
                    Conditions: [
                        ["content-length-range", 0, config.MAX_SESSION_FILE_SIZE], // 10 MB
                    ],
                    Expires: 60 * 10, // 10 minutes
                });

                const user = await userPromise;

                const session = await t.one(
                    `INSERT INTO "session" ("user", ip, s3_key, description_user, tab_id, start_ts, end_ts)
                    VALUES ($/user/, $/ip/, $/s3_key/, $/description_user/, $/tab_id/, $/start_ts/, $/end_ts/)
                    RETURNING *`,
                    {
                        user: user.id,
                        ip: ip.id,
                        s3_key: key,
                        description_user: sessionData.descriptionUser,
                        tab_id: sessionData.tabId,
                        start_ts: new Date(sessionData.startTs),
                        end_ts: new Date(sessionData.endTs),
                    }
                );

                const presignedPost = await presignedPostPromise;

                res.status(200).json({
                    presignedPost,
                });

                return res.status(200).end();
            });
        } else {
            return res.status(405).end();
        }
    } catch (e) {
        console.error(e);
        return res.status(500).end();
    }
}
