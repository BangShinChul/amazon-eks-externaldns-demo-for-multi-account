#!/bin/bash

PRIMARY_CLUSTER=eks-blueprint-blue-cluster
RECOVERY_CLUSTER=eks-blueprint-green-cluster
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)

eksctl create iamserviceaccount \
    --cluster=$PRIMARY_CLUSTER \
    --name=velero-server \
    --namespace=velero \
    --role-name=eks-velero-backup \
    --role-only \
    --attach-policy-arn=arn:aws:iam::$ACCOUNT:policy/VeleroAccessPolicy \
    --approve

eksctl create iamserviceaccount \
    --cluster=$RECOVERY_CLUSTER \
    --name=velero-server \
    --namespace=velero \
    --role-name=eks-velero-recovery \
    --role-only \
    --attach-policy-arn=arn:aws:iam::$ACCOUNT:policy/VeleroAccessPolicy \
    --approve
