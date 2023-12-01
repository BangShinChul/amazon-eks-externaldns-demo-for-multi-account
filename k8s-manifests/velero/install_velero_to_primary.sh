#!/bin/bash

PRIMARY_CONTEXT=primary

kubectl config use-context $PRIMARY_CONTEXT
helm install velero vmware-tanzu/velero --version 5.1.5 \
    --create-namespace \
    --namespace velero \
    -f values.yaml