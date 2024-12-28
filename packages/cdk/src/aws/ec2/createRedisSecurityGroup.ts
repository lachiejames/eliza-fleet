import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";

/**
 * Creates a security group for Redis instance
 * This security group controls network access to the Redis instance
 */
export function createRedisSecurityGroup({
    scope,
    vpc,
}: {
    scope: cdk.Stack;
    vpc: ec2.IVpc;
}): ec2.SecurityGroup {
    const securityGroupName = `${scope.stackName}-redis-security-group`;
    const securityGroup = new ec2.SecurityGroup(scope, "RedisSecurityGroup", {
        vpc,
        securityGroupName,
        description: "Security group for Redis instance",
        allowAllOutbound: true,
    });

    return securityGroup;
}
