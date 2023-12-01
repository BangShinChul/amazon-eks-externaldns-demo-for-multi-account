#!/bin/bash

ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
BUCKET=$ACCOUNT-eks-velero-backups
REGION=ap-northeast-2
aws s3api create-bucket \
    --bucket $BUCKET \
    --region $REGION \
    --create-bucket-configuration LocationConstraint=$REGION