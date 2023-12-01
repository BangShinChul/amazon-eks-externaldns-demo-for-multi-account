#!/bin/bash

PRIMARY_CONTEXT=primary
RECOVERY_CONTEXT=recovery

aws eks update-kubeconfig --name eks-blueprint-blue-cluster --region ap-northeast-2 --alias $PRIMARY_CONTEXT
aws eks update-kubeconfig --name eks-blueprint-green-cluster --region ap-northeast-2 --alias $RECOVERY_CONTEXT