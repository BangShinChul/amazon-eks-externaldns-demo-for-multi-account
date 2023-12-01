#!/bin/bash

PRIMARY_CLUSTER=eks-blueprint-blue-cluster
PRIMARY_CONTEXT=primary
PRIMARY_CLUSTER_ROLE_ARN=

RECOVERY_CLUSTER=eks-blueprint-green-cluster
RECOVERY_CONTEXT=recovery
RECOVERY_CLUSTER_ROLE_ARN=

REGION=ap-northeast-2

aws eks update-kubeconfig --name $PRIMARY_CLUSTER --region $REGION --role-arn $PRIMARY_CLUSTER_ROLE_ARN --alias $PRIMARY_CONTEXT
aws eks update-kubeconfig --name $RECOVERY_CLUSTER --region $REGION --role-arn $RECOVERY_CLUSTER_ROLE_ARN --alias $RECOVERY_CONTEXT