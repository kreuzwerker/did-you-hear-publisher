
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3Deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';

export interface WebappDeploymentStackProps extends cdk.StackProps {
    readonly s3Bucket: s3.Bucket;
    readonly cfDistribution: cloudfront.CloudFrontWebDistribution;
}

/**
 * Deploys the React webapp to S3
 */
export class WebappDeploymentStack extends cdk.Stack {

    constructor(scope: Construct, id: string, props: WebappDeploymentStackProps) {
        super(scope, id, props);
        
        // Upload the website files to the S3 bucket
        new s3Deploy.BucketDeployment(this, "DeployWebsiteFiles", {
            sources: [s3Deploy.Source.asset("../build")],
            destinationBucket: props.s3Bucket,
            distribution: props.cfDistribution // Indicates that this CF distribution should be invalided after deployment (to avoid caching issues)
        });
    };
}