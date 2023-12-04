#!/bin/bash

PRIMARY_CONTEXT=primary

kubectl config use-context $PRIMARY_CONTEXT

helm install ghost oci://registry-1.docker.io/bitnamicharts/ghost \
    --create-namespace \
    --namespace ghost

export APP_HOST=$(kubectl get svc --namespace ghost ghost --template "{{ range (index .status.loadBalancer.ingress 0) }}{{ . }}{{ end }}")
export GHOST_PASSWORD=$(kubectl get secret --namespace "ghost" ghost -o jsonpath="{.data.ghost-password}" | base64 -d)
export MYSQL_ROOT_PASSWORD=$(kubectl get secret --namespace "ghost" ghost-mysql -o jsonpath="{.data.mysql-root-password}" | base64 -d)
export MYSQL_PASSWORD=$(kubectl get secret --namespace "ghost" ghost-mysql -o jsonpath="{.data.mysql-password}" | base64 -d)

helm upgrade ghost oci://registry-1.docker.io/bitnamicharts/ghost \
    --namespace ghost \
    --set service.type=LoadBalancer \
    --set ghostHost=$APP_HOST \
    --set ghostPassword=$GHOST_PASSWORD \
    --set mysql.auth.rootPassword=$MYSQL_ROOT_PASSWORD \
    --set mysql.auth.password=$MYSQL_PASSWORD

kubectl get pods -n ghost