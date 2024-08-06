import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import { WebappConfig } from '../../config/WebappConfig';

interface ItemCreatorStackProps extends cdk.StackProps {
    config: WebappConfig;
}

/**
 * Lambda@Edge used in the CloudFront distribution
 */
export class WebappInfraEdgeStack extends cdk.Stack {

    public readonly lambdaFunction: lambda.IFunction;

    constructor(scope: Construct, id: string, props: ItemCreatorStackProps) {
        super(scope, id, props);

        this.lambdaFunction = new lambdaNode.NodejsFunction(this, 'authEdgeLambda', {
            functionName: 'authEdgeLambda',
            entry: 'lambda-src/auth-edge/handler.ts',
            handler: 'handler',
            runtime: lambda.Runtime.NODEJS_16_X,
            environment: {
                // LOG_LEVEL: props.config.logLevel   doesn't support env variables
            }
        });
    }
}