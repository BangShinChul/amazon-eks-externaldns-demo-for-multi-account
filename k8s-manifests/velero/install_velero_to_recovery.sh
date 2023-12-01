#!/bin/bash

RECOVERY_CONTEXT=recovery

kubectl config use-context $RECOVERY_CONTEXT
helm install velero vmware-tanzu/velero --version 5.1.5 \
    --create-namespace \
    --namespace velero \
    -f values_recovery.yaml