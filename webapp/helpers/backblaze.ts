export function createHelloWorld() {
    // Create an S3 client
    const AWS = require("aws-sdk");
    const ep = new AWS.Endpoint(`s3.${process.env.BACKBLAZE_REGION}.backblazeb2.com`);
    const s3 = new AWS.S3({
        endpoint: ep,
        accessKeyId: process.env.BACKBLAZE_ACCESS_KEY_ID,
        secretAccessKey: process.env.BACKBLAZE_SECRET_ACCESS_KEY,
        region: process.env.BACKBLAZE_REGION,
    });

    console.log(s3.service);
    // Create a bucket and upload something into it
    var bucketName = "openactiondata-dev";
    var keyName = "hello_world.txt";

    s3.putObject(
        {
            Bucket: bucketName,
            Key: keyName,
            Body: "Hello World!",
        },
        function (err: any, data: any) {
            if (err) console.log(err);
            else
                console.log(
                    "Successfully uploaded data to " +
                        bucketName +
                        "/" +
                        keyName
                );
        }
    );
}
