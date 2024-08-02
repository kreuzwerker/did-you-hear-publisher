import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import { WebsiteBucket } from './website-bucket';
import { ItemCreatorStack } from './item-creator-stack';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { WebappConfig } from '../../config/WebappConfig';
import { PublisherUserPool } from './publisher-cognito-user-pool';


export interface WebappInfraStackProps extends cdk.StackProps {
    account: string;
    config: WebappConfig;
}

/**
 * Deploys the Webapp infrastructure
 * Currently includes:
 * - a React UI hosted on S3
 * - a Lambda function creating items in DynamoDB via HTTP API calls
 * - a CloudFront distribution redirecting to the website and the Lambda URL

 */
export class WebappInfraStack extends cdk.Stack {

    public readonly s3Bucket: s3.Bucket;
    public readonly cfDistribution: cloudfront.CloudFrontWebDistribution;
    public readonly infoItemsTable: dynamodb.Table;

    constructor(scope: Construct, id: string, props: WebappInfraStackProps) {
        super(scope, id, props);

        // Create the S3 bucket for hosting the website 
        const webappBucket = new WebsiteBucket(this, 'WebappBucket');
        this.s3Bucket = webappBucket.s3Bucket;
        this.infoItemsTable = this.createItemsTable();

        
        // Create the Lambda handling new publications
        const itemCreator = new ItemCreatorStack(this, 'ItemCreatorStack', {
            config: props.config,
            infoItemsTable: this.infoItemsTable
        });
        const lambdaUrlDomain = getLambdaURL(itemCreator.lambdaUrl);

        // Create the Cloudfront distribution redirecting to the website and the Lambda URL
        const webappCFDistribution = new cloudfront.CloudFrontWebDistribution(this, 'WebappCFDistribution', {
            originConfigs: [
                {
                    s3OriginSource: {
                        s3BucketSource: this.s3Bucket,
                        originAccessIdentity: webappBucket.oai,
                    },
                    behaviors: [{
                        isDefaultBehavior: true,
                    }],
                },
                {
                    customOriginSource: {
                        domainName: lambdaUrlDomain,
                        originProtocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
                    },
                    behaviors: [{
                        isDefaultBehavior: false,
                        pathPattern: '/api/*',
                        allowedMethods: cloudfront.CloudFrontAllowedMethods.ALL
                    }],
                },
            ],
        });

        const websiteURL = `https://${webappCFDistribution.distributionDomainName}`;
        
        const publisherUserPool = new PublisherUserPool(this, 'PublisherUserPoolStack', props.account, websiteURL);

        new cdk.CfnOutput(this, 'PublisherCognitoUIUrl', {
            value: `https://${publisherUserPool.hostedUIDomain}.auth.${this.region}.amazoncognito.com`,
        });

        new cdk.CfnOutput(this, 'WebsiteURL', {
            value: websiteURL,
        });
    }

    private createItemsTable(): dynamodb.Table {
        return new dynamodb.Table(this, 'infoItemsTable', {
            partitionKey: {
                name: 'id',
                type: dynamodb.AttributeType.STRING
            },
            sortKey: {
                name: 'submissionDate',
                type: dynamodb.AttributeType.STRING
            },
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });
    }
}

function getLambdaURL(lambdaUrl: lambda.FunctionUrl) {
    return cdk.Fn.select(2, cdk.Fn.split('/', lambdaUrl.url));
}
