import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { WebappConfig } from '../../config/WebappConfig';

interface ItemCreatorStackProps {
    config: WebappConfig;
    infoItemsTable: dynamodb.Table;
}

/**
 * Lambda creating a new infoItem in the infoItems DynamoDB table
 */
export class ItemCreatorStack extends Construct {

    public readonly lambdaUrl: lambda.FunctionUrl;

    constructor(scope: Construct, id: string, props: ItemCreatorStackProps) {
        super(scope, id);

        const itemCreatorLambda = new lambdaNode.NodejsFunction(this, 'itemCreatorLambda', {
            entry: 'lambda-src/item-creator/handler.ts',
            handler: 'handler',
            runtime: lambda.Runtime.NODEJS_16_X,
            environment: {
                LOG_LEVEL: props.config.logLevel,
                INFO_ITEMS_TABLE: props.infoItemsTable.tableName,
            }
        });
        props.infoItemsTable.grantWriteData(itemCreatorLambda);

        this.lambdaUrl = itemCreatorLambda.addFunctionUrl({
            authType: lambda.FunctionUrlAuthType.NONE,
        });
    }
}