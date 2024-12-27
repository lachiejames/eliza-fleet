import * as cdk from "aws-cdk-lib";
import * as rds from "aws-cdk-lib/aws-rds";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export const createElizaRDSInstance = ({
    scope,
    vpc,
    securityGroup,
}: {
    scope: cdk.Stack;
    vpc: ec2.IVpc;
    securityGroup: ec2.SecurityGroup;
}) => {
    const databaseName = `${scope.stackName}-eliza-rds-postgres`;
    const database = new rds.DatabaseInstance(scope, databaseName, {
        databaseName: "eliza",
        engine: rds.DatabaseInstanceEngine.postgres({
            version: rds.PostgresEngineVersion.VER_15_10,
        }),
        instanceType: ec2.InstanceType.of(
            ec2.InstanceClass.T4G,
            ec2.InstanceSize.MICRO
        ),
        vpc,
        vpcSubnets: {
            subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        securityGroups: [securityGroup],
        multiAz: false,
        allocatedStorage: 20,
        maxAllocatedStorage: 100,
        storageType: rds.StorageType.GP2,
        publiclyAccessible: false,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        deletionProtection: false,
        credentials: rds.Credentials.fromGeneratedSecret("postgres"),
    });

    return database;
};
