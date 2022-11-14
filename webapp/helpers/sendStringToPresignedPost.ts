import type AWS from "aws-sdk";

export default (
    presignedPost: AWS.S3.PresignedPost,
    content: string,
): Promise<Response> => {
    // https://advancedweb.hu/how-to-use-s3-post-signed-urls/
    const formData = new FormData();

    // Put the AWS presign fields into the FormData
    Object.entries(presignedPost.fields).forEach(([k, v]) => {
        formData.append(k, v);
    });

    // Add the file to the FormData
    const file = new File([content], presignedPost.fields.key);
    formData.append("file", file);

    return fetch(presignedPost.url, {
        method: "POST",
        body: formData,
    });
};
