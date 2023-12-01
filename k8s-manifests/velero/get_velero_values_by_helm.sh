#!/bin/bash

ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
BUCKET=$ACCOUNT-eks-velero-backups
REGION=ap-northeast-2

helm repo add vmware-tanzu https://vmware-tanzu.github.io/helm-charts

cat > values.yaml <<EOF
configuration:
  backupStorageLocation:
  - bucket: $BUCKET
    provider: aws
  volumeSnapshotLocation:
  - config:
      region: $REGION
    provider: aws
initContainers:
- name: velero-plugin-for-aws
  image: velero/velero-plugin-for-aws:v1.8.0
  volumeMounts:
  - mountPath: /target
    name: plugins
credentials:
  useSecret: false
serviceAccount:
  server:
    annotations:
      eks.amazonaws.com/role-arn: "arn:aws:iam::${ACCOUNT}:role/eks-velero-backup"
EOF

cat > values_recovery.yaml <<EOF
configuration:
  backupStorageLocation:
  - bucket: $BUCKET
    provider: aws
  volumeSnapshotLocation:
  - config:
      region: $REGION
    provider: aws
initContainers:
- name: velero-plugin-for-aws
  image: velero/velero-plugin-for-aws:v1.8.0
  volumeMounts:
  - mountPath: /target
    name: plugins
credentials:
  useSecret: false
serviceAccount:
  server:
    annotations:
      eks.amazonaws.com/role-arn: "arn:aws:iam::${ACCOUNT}:role/eks-velero-recovery"
EOF