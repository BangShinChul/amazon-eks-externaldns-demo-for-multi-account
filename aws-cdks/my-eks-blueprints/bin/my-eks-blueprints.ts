#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as eks from "aws-cdk-lib/aws-eks";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as kms from "aws-cdk-lib/aws-kms";
import * as blueprints from "@aws-quickstart/eks-blueprints";
import { demoApplicationDeploy } from "../lib/utils/deploy-demo-application";

const app = new cdk.App();

// environment variables for the demo
const account = process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION;
const hostedZoneName = process.env.CDK_HOSTED_ZONE_NAME || "my-domain.com";
const subdomain = `demo${account}.${hostedZoneName}`;
const parentDnsAccountId = process.env.CDK_PARENT_DNS_ACCOUNT_ID || "111122223333";

console.log("account : " + account);
console.log("region : " + region);
console.log("hostedZoneName : ", hostedZoneName);
console.log("parentDnsAccountId : ", parentDnsAccountId);

// create blue-cluster
const blueClusterAddOns: Array<blueprints.ClusterAddOn> = [
  new blueprints.addons.AwsLoadBalancerControllerAddOn(),
  new blueprints.addons.SSMAgentAddOn(),
  new blueprints.addons.VpcCniAddOn({
    serviceAccountPolicies: [
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEKS_CNI_Policy"),
    ],
    version: "v1.10.4-eksbuild.1",
  }),
  new blueprints.addons.ClusterAutoScalerAddOn(),
  new blueprints.addons.CoreDnsAddOn({ version: "v1.8.7-eksbuild.2" }),
  new blueprints.addons.KubeProxyAddOn("v1.23.7-eksbuild.1"),
  new blueprints.addons.ExternalDnsAddOn({
    hostedZoneResources: ["blue-cluster-hosted-zone"],
  }),
  new blueprints.addons.EbsCsiDriverAddOn({
    version: "v1.25.0-eksbuild.1",
    kmsKeys: [
      blueprints.getResource(
        (context) => new kms.Key(context.scope, "blue-cluster-ebs-csi-driver-key", {
          alias: "blue-cluster-ebs-csi-driver-key"
        })
      ),
    ],
  }),
];
const blueCluster = blueprints.EksBlueprint.builder()
  .account(account)
  .region(region)
  .addOns(...blueClusterAddOns)
  .name("blue-cluster")
  .version(eks.KubernetesVersion.V1_23)
  .resourceProvider(
    "blue-cluster-hosted-zone",
    new blueprints.DelegatingHostedZoneProvider({
      parentDomain: hostedZoneName,
      subdomain: subdomain,
      parentDnsAccountId: parentDnsAccountId,
      delegatingRoleName: 'account-b-role'
    })
  )
  .resourceProvider(
    blueprints.GlobalResources.Vpc,
    new (class implements blueprints.ResourceProvider<ec2.IVpc> {
      provide(context: blueprints.ResourceContext): cdk.aws_ec2.IVpc {
        return new ec2.Vpc(context.scope, "blue-cluster-vpc", {
          ipAddresses: ec2.IpAddresses.cidr("172.51.0.0/16"),
          availabilityZones: [`${region}a`, `${region}b`, `${region}c`],
          subnetConfiguration: [
            {
              cidrMask: 24,
              name: "blue-cluster-private",
              subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            },
            {
              cidrMask: 24,
              name: "blue-cluster-public",
              subnetType: ec2.SubnetType.PUBLIC,
            },
          ],
          natGatewaySubnets: {
            availabilityZones: [`${region}c`],
            subnetType: ec2.SubnetType.PUBLIC,
          },
        });
      }
    })()
  )
  .useDefaultSecretEncryption(false) // set to false to turn secret encryption off (non-production/demo cases)
  .build(app, "eks-blueprint-blue-cluster", {stackName: "eks-blueprint-blue-cluster"});

demoApplicationDeploy(
  blueCluster.getClusterInfo().cluster,
  "demo-application-blue",
  subdomain
);


// // create green-cluster
const greenClusterAddOns: Array<blueprints.ClusterAddOn> = [
  new blueprints.addons.AwsLoadBalancerControllerAddOn(),
  new blueprints.addons.SSMAgentAddOn(),
  new blueprints.addons.VpcCniAddOn({
    serviceAccountPolicies: [
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEKS_CNI_Policy"),
    ],
    version: "v1.12.6-eksbuild.2",
  }),
  new blueprints.addons.ClusterAutoScalerAddOn(),
  new blueprints.addons.CoreDnsAddOn({ version: "v1.10.1-eksbuild.1" }),
  new blueprints.addons.KubeProxyAddOn("v1.27.1-eksbuild.1"),
  new blueprints.addons.EbsCsiDriverAddOn({
    version: "v1.25.0-eksbuild.1",
    kmsKeys: [
      blueprints.getResource(
        (context) => new kms.Key(context.scope, "green-cluster-ebs-csi-driver-key", {
          alias: "green-cluster-ebs-csi-driver-key"
        })
      ),
    ],
  }),
];
const greenCluster = blueprints.EksBlueprint.builder()
  .account(account)
  .region(region)
  .addOns(...greenClusterAddOns)
  .name("green-cluster")
  .version(eks.KubernetesVersion.V1_27)
  .resourceProvider(
    blueprints.GlobalResources.Vpc,
    new (class implements blueprints.ResourceProvider<ec2.IVpc> {
      provide(context: blueprints.ResourceContext): cdk.aws_ec2.IVpc {
        return new ec2.Vpc(context.scope, "green-cluster-vpc", {
          ipAddresses: ec2.IpAddresses.cidr("172.61.0.0/16"),
          availabilityZones: [`${region}a`, `${region}b`, `${region}c`],
          subnetConfiguration: [
            {
              cidrMask: 24,
              name: "green-cluster-private",
              subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            },
            {
              cidrMask: 24,
              name: "green-cluster-public",
              subnetType: ec2.SubnetType.PUBLIC,
            },
          ],
          natGatewaySubnets: {
            availabilityZones: [`${region}c`],
            subnetType: ec2.SubnetType.PUBLIC,
          },
        });
      }
    })()
  )
  .useDefaultSecretEncryption(false) // set to false to turn secret encryption off (non-production/demo cases)
  .build(app, "eks-blueprint-green-cluster", {stackName: "eks-blueprint-green-cluster"});

demoApplicationDeploy(
  greenCluster.getClusterInfo().cluster,
  "demo-application-green",
  subdomain
);