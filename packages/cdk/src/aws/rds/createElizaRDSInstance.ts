import * as cdk from "aws-cdk-lib";
import * as rds from "aws-cdk-lib/aws-rds";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export const createElizaRDSInstance = ({
    scope,
    vpc,
    securityGroup,
    isPrivate,
}: {
    scope: cdk.Stack;
    vpc: ec2.IVpc;
    securityGroup: ec2.SecurityGroup;
    isPrivate: boolean;
}) => {
    const databaseName = `${scope.stackName}-eliza-rds-postgres`;
    const database = new rds.DatabaseInstance(scope, databaseName, {
        credentials: rds.Credentials.fromGeneratedSecret("postgres", {
            secretName: `${scope.stackName}-db-credentials`,
        }),
        databaseName: "eliza",
        engine: rds.DatabaseInstanceEngine.postgres({
            version: rds.PostgresEngineVersion.VER_13_18,
        }),
        instanceType: ec2.InstanceType.of(
            ec2.InstanceClass.T4G,
            ec2.InstanceSize.MICRO
        ),
        vpc,
        vpcSubnets: {
            subnetType: isPrivate
                ? ec2.SubnetType.PRIVATE_WITH_EGRESS
                : ec2.SubnetType.PUBLIC,
        },
        securityGroups: [securityGroup],
        multiAz: false,
        allocatedStorage: 20,
        maxAllocatedStorage: 100,
        storageEncrypted: true,
        storageType: rds.StorageType.GP2,
        publiclyAccessible: !isPrivate,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        deletionProtection: false,
    });

    return database;
};
