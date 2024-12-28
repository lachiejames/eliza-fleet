import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as elasticache from "aws-cdk-lib/aws-elasticache";

/**
 * Creates an ElastiCache Redis instance for Eliza
 * This Redis instance is used for caching and session management
 */
export function createElizaRedisInstance({
    scope,
    vpc,
    securityGroup,
    isPrivate,
}: {
    scope: cdk.Stack;
    vpc: ec2.IVpc;
    securityGroup: ec2.SecurityGroup;
    isPrivate: boolean;
}): elasticache.CfnCacheCluster {
    const cacheSubnetGroupName = `${scope.stackName}-redis-subnet-group`;
    const subnetGroup = new elasticache.CfnSubnetGroup(
        scope,
        "RedisSubnetGroup",
        {
            cacheSubnetGroupName,
            description: "Subnet group for Redis instance",
            subnetIds: isPrivate
                ? vpc.privateSubnets.map((subnet) => subnet.subnetId)
                : vpc.publicSubnets.map((subnet) => subnet.subnetId),
        }
    );

    const clusterName = `${scope.stackName}-eliza-redis`;
    const redisInstance = new elasticache.CfnCacheCluster(scope, clusterName, {
        autoMinorVersionUpgrade: true,
        cacheNodeType: "cache.t4g.micro", // Small instance for cost optimization
        cacheSubnetGroupName: subnetGroup.ref,
        clusterName,
        engine: "redis",
        numCacheNodes: 1,
        port: 6379,
        vpcSecurityGroupIds: [securityGroup.securityGroupId],
    });

    return redisInstance;
}
