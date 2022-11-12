// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import * as fsPromises from "fs/promises";
import * as path from "path";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { session } = req.query;

    const dataFilePath = path.join(process.cwd(), "data", `${session}.json`);
    const data = await fsPromises
        .readFile(dataFilePath, "utf8")
        .then((data: string) => JSON.parse(data.toString()))
        .catch(() => null);

    res.status(200).json(data);
}