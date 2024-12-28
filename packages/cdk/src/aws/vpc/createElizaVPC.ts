import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as cdk from "aws-cdk-lib";

/**
 * Creates a VPC for the Eliza AI service with configurable networking.
 *
 * Features:
 * - 2 Availability Zones for high availability
 * - Private mode: NAT Gateway for secure outbound access
 * - Public mode: Default VPC for cost optimization
 *
 * @param scope - The CDK Stack scope to create the VPC in
 * @param isPrivate - Whether to use private networking with NAT Gateway
 * @returns The created VPC instance
 */
export const createElizaVPC = ({
    scope,
    isPrivate,
}: {
    scope: cdk.Stack;
    isPrivate: boolean;
}) => {
    if (!isPrivate) {
        // Use default VPC for public mode (cheaper)
        return ec2.Vpc.fromLookup(scope, "eliza-vpc", {
            isDefault: true,
        });
    }

    // Create private VPC with NAT Gateway for secure deployment
    return new ec2.Vpc(scope, "eliza-vpc", {
        maxAzs: 2,
        natGateways: 1,
        subnetConfiguration: [
            {
                name: "Public",
                subnetType: ec2.SubnetType.PUBLIC,
                cidrMask: 24,
            },
            {
                name: "Private",
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                cidrMask: 24,
            },
        ],
    });
};
