#!/bin/bash
set -eo pipefail

## Build the Application
npm run build

## Deploy the Application
cd cdk
npx cdk deploy --all --require-approval never "$@"