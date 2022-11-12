// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import * as fsPromises from "fs/promises";
import * as path from "path";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const body = req.body;

    console.log("saving");
    console.log(body.originalUrl);
    
    await fsPromises.writeFile(path.join(process.cwd(), "data", body.tabId + "-" + body.createdOn + ".json"), JSON.stringify(body, null, 2));

    res.status(200).end();
}
