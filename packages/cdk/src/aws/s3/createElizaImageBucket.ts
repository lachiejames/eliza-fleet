import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";

export const createElizaImageBucket = ({ scope }: { scope: cdk.Stack }) => {
    const bucketName = `${scope.stackName}-eliza-images`;
    const bucket = new s3.Bucket(scope, bucketName, {
        bucketName,
        versioned: true,
        encryption: s3.BucketEncryption.S3_MANAGED,
        publicReadAccess: false,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: true, // Enable this for development, consider changing for production
        lifecycleRules: [
            {
                expiration: cdk.Duration.days(30), // Objects expire after 30 days
            },
        ],
    });

    return bucket;
};
