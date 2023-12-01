#!/bin/bash

kubectl create --filename externaldns-with-rbac.yaml --namespace ${EXTERNALDNS_NS:-"default"}