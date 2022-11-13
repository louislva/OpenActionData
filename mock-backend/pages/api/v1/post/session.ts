// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import * as fsPromises from "fs/promises";
import * as path from "path";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const body = req.body;
   
    const hostname = body?.originalUrl?.match(/https?:\/\/([^/]+)/)?.[1]?.replace(/\W+/g, "_");
    const filename = Date.now().toString() + "-" + hostname + ".json";
    
    await fsPromises.writeFile(path.join(process.cwd(), "data", filename), JSON.stringify(body, null, 2));

    res.status(200).end();
}
