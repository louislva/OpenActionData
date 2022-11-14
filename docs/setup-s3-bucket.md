### How to set up an S3 bucket for use with OpenActionData

1. Create an S3 bucket.
2. Add a CORS policy like so: 
    ```
    [
    {
        "AllowedOrigins": ["*"],
        "AllowedMethods": ["POST"],
        "AllowedHeaders": ["*"]
    }
    ]
    ```
3. Create a IAM policy similar to this (swap out `openactiondata-dev` for your own S3 bucket key):
    ```
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "VisualEditor1",
                "Effect": "Allow",
                "Action": "s3:*",
                "Resource": "arn:aws:s3:::openactiondata-dev/*"
            }
        ]
    }
    ```
4. Create an IAM user with the policy you just created.
5. Put the IAM user's access key and secret key in your `.env` file.