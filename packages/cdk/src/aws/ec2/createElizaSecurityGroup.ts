import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as cdk from "aws-cdk-lib";

/**
 * Creates a security group for the Eliza AI service.
 *
 * Features:
 * - Allows all outbound traffic
 *
 * @param scope - The CDK Stack scope to create the security group in
 * @param vpc - The VPC to create the security group in
 * @returns The created security group
 */
export const createElizaSecurityGroup = (scope: cdk.Stack, vpc: ec2.IVpc) => {
    const securityGroupName = `${scope.stackName}-security-group`;
    const securityGroup = new ec2.SecurityGroup(scope, securityGroupName, {
        securityGroupName,
        vpc,
        description: "Security group for Eliza AI service",
        allowAllOutbound: true, // Allows outbound internet access
    });

    // Add inbound rules
    securityGroup.addIngressRule(
        ec2.Peer.anyIpv4(), // TODO: Replace with a specific IP address
        ec2.Port.tcp(3000),
        "Allow inbound traffic on port 3000"
    );

    return securityGroup;
};
