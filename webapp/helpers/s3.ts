import AWS from "aws-sdk";

const s3 = new AWS.S3({
    // // Use Backblaze B2
    // endpoint: new AWS.Endpoint(`s3.${process.env.S3_REGION}.backblazeb2.com`);,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: process.env.S3_REGION,
    signatureVersion: "v4",
});

export function createPresignedPost(params: {
    Bucket: string;
    Fields: {
        key: string;
    };
    Conditions?: [["content-length-range", number, number]];
    Expires: number;
}): Promise<AWS.S3.PresignedPost> {
    return new Promise((resolve, reject) => {
        s3.createPresignedPost(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}
