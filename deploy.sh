#!/bin/bash
set -eo pipefail

npm ci

cd cdk
npx cdk deploy WebappInfraStack --require-approval never "$@"

INFRA_STACK_OUTPUTS=$(aws cloudformation describe-stacks --stack-name WebappInfraStack --query "Stacks[0].Outputs" --output json)
export REACT_APP_COGNITO_UI_URL=$(echo $INFRA_STACK_OUTPUTS | jq -r '.[] | select(.OutputKey=="PublisherCognitoUIUrl").OutputValue')
export REACT_APP_COGNITO_USER_POOL_ID=$(echo $INFRA_STACK_OUTPUTS | jq -r '.[] | select(.OutputKey=="PublisherCognitoUserPoolId").OutputValue')
export REACT_APP_COGNITO_USER_POOL_CLIENT_ID=$(echo $INFRA_STACK_OUTPUTS | jq -r '.[] | select(.OutputKey=="PublisherCognitoUserPoolClientId").OutputValue')
export REACT_APP_WEBSITE_URL=$(echo $INFRA_STACK_OUTPUTS | jq -r '.[] | select(.OutputKey=="WebsiteURL").OutputValue')

cd ..
npm run build

cd cdk
npx cdk deploy WebappStack PublicationsHandlerStack --require-approval never "$@"