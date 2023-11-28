import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { PublishersConfig } from '../../config/PublishersConfig';


export interface PublisherWorkflowStackProps extends cdk.StackProps {
    config: PublishersConfig;
    infoItemsTable: dynamodb.Table;
}

/**
 * Deploys cron triggered Lambdas for items daily and summary publications
 */
export class PublisherStack extends cdk.Stack {

    constructor(scope: Construct, id: string, props: PublisherWorkflowStackProps) {
        super(scope, id, props);

        this.deployDailyPublisher(props);
        this.deploySummaryPublisher(props);
    }

    private deployDailyPublisher(props: PublisherWorkflowStackProps) {
        const dailyPublisherLambda = new lambdaNode.NodejsFunction(this, 'dailyPublisherLambda', {
            entry: 'lambda-src/publishers/daily-publisher/handler.ts',
            handler: 'handler',
            runtime: lambda.Runtime.NODEJS_16_X,
            environment: {
                LOG_LEVEL: props.config.logLevel,
                INFO_ITEMS_TABLE: props.infoItemsTable.tableName,
                SLACK_URL_SSM_PARAMETER: props.config.dailySlackUrlSSMParam,
                MAX_ITEMS_TO_PUBLISH: props.config.dailyMaxPerPublication.toString()
            }
        });

        // Grant the Lambda function read/write access to the DynamoDB table and the SSM parameters
        props.infoItemsTable.grantReadWriteData(dailyPublisherLambda);
        this.giveSSMReadPermissions(props.config.dailySlackUrlSSMParam, dailyPublisherLambda);

        // Configure eventbridge to trigger the Lambda
        this.configureEventBridgeTrigger('DailyPublicationRule', props.config.dailyCronExpression, dailyPublisherLambda);
    }

    private deploySummaryPublisher(props: PublisherWorkflowStackProps) {
        const summaryPublisherLambda = new lambdaNode.NodejsFunction(this, 'itemsSummaryPublisherLambda', {
            entry: 'lambda-src/publishers/summary-publisher/handler.ts',
            handler: 'handler',
            runtime: lambda.Runtime.NODEJS_16_X,
            environment: {
                LOG_LEVEL: props.config.logLevel,
                INFO_ITEMS_TABLE: props.infoItemsTable.tableName,
                SLACK_URL_SSM_PARAMETER: props.config.summarySlackUrlSSMParam
            }
        });

        // Grant the Lambda function read/write access to the DynamoDB table and the SSM parameters
        props.infoItemsTable.grantReadWriteData(summaryPublisherLambda);
        this.giveSSMReadPermissions(props.config.summarySlackUrlSSMParam, summaryPublisherLambda);

        // Configure eventbridge to trigger the Lambda
        this.configureEventBridgeTrigger('SummaryPublicationRule', props.config.summaryCronExpression, summaryPublisherLambda);
    }

    private configureEventBridgeTrigger(ruleName: string, cronExpression: string, publisherLambda: lambda.Function) {
        const rule = new events.Rule(this, ruleName, {
            schedule: events.Schedule.expression(`cron(${cronExpression})`),
        });
        rule.addTarget(new targets.LambdaFunction(publisherLambda));
    }

    private giveSSMReadPermissions(paramName: string, dailyPublisherLambda: lambdaNode.NodejsFunction) {
        const ssmParameterArn = `arn:aws:ssm:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:parameter${paramName}`;
        dailyPublisherLambda.addToRolePolicy(new iam.PolicyStatement({
            actions: ['ssm:GetParameter', 'ssm:GetParameters', 'ssm:Decrypt'],
            resources: [ssmParameterArn],
        }));
    }
}