import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as iam from 'aws-cdk-lib/aws-iam';


export class WebsiteBucket extends Construct {

    public readonly s3Bucket: s3.Bucket;
    public readonly oai: cloudfront.OriginAccessIdentity;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.s3Bucket = new s3.Bucket(this, 'WebappBucket', {
            publicReadAccess: false,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            websiteIndexDocument: 'index.html',
        });

        // Create an Origin Access Identity (OAI)
        this.oai = new cloudfront.OriginAccessIdentity(this, 'S3WebsiteOAI');

        // Update the S3 bucket policy to allow access from the OAI and deny public access
        this.s3Bucket.addToResourcePolicy(
            new iam.PolicyStatement({
                actions: ['s3:GetObject'],
                principals: [this.oai.grantPrincipal],
                resources: [`${this.s3Bucket.bucketArn}/*`],
            })
        );
    }
}
