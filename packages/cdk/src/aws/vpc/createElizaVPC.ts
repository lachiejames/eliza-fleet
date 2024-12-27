import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as cdk from "aws-cdk-lib";

/**
 * Creates a VPC for the Eliza AI service with high availability and cost optimization.
 *
 * Features:
 * - 2 Availability Zones for high availability
 * - Single NAT Gateway for cost optimization
 *
 * @param scope - The CDK Stack scope to create the VPC in
 * @returns The created VPC instance
 */
export const createElizaVPC = (
    {
        scope,
    }: {
        scope: cdk.Stack;
    }
) => {
    return ec2.Vpc.fromLookup(scope, 'eliza-vpc', {
        vpcId: 'vpc-cb06e5b6', // Default VPC
    });
};
