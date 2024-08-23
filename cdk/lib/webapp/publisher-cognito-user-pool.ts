import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export class PublisherUserPool extends Construct {

    public readonly userPoolId: string;
    public readonly userPoolClientId: string;
    public readonly hostedUIDomain: string;

    constructor(scope: Construct, id: string, account: string, websiteUrl: string) {
        super(scope, id);

        const userPool = new cognito.UserPool(this, 'PublisherUserPool', {
            userPoolName: 'PublisherUserPool',
            selfSignUpEnabled: false,
            signInAliases: {
                email: true,
            },
            autoVerify: { email: true },
            passwordPolicy: {
                minLength: 8,
                requireLowercase: true,
                requireUppercase: true,
                requireDigits: true,
                requireSymbols: true,
            },
            accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
            deletionProtection: false,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        const userPoolClient = new cognito.UserPoolClient(this, 'PublisherUserPoolWebappClient', {
            userPool,
            authFlows: {
                adminUserPassword: true, // Allow admin-created users to authenticate
            },
            generateSecret: false,
            oAuth: {
              flows: {
                implicitCodeGrant: true, // Use for token response type
              },
              scopes: [
                cognito.OAuthScope.OPENID,
                cognito.OAuthScope.PROFILE,
              ],
              callbackUrls: [websiteUrl],
              logoutUrls: [websiteUrl],
            },
        });

        const userPoolDomain = new cognito.CfnUserPoolDomain(this, 'PublisherUserPoolDomain', {
            domain: `${account}-publisher-login`,
            userPoolId: userPool.userPoolId,
        });

        this.userPoolId = userPool.userPoolId;
        this.userPoolClientId = userPoolClient.userPoolClientId;
        this.hostedUIDomain = userPoolDomain.domain;
    }
}
