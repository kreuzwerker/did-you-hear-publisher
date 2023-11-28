import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import middy from '@middy/core';
import { NewInfoItem } from './NewInfoItem';
import { InfoItem } from '../InfoItem';

import { DynamoDBRepository } from '../dynamodb/DynamoDBRepository';

/**
 * Lambda receiving new info items and storing them in the DB
 */

const logger = new Logger({
    serviceName: 'publisher',
    logLevel: 'INFO',
});

const dynamoDBRepository = new DynamoDBRepository(logger);

async function lambdaHandler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    logger.debug(`Received event: ${JSON.stringify(event)}`);
    if (event.requestContext.http.method !== 'POST') {
        return {
            statusCode: 405, // Method Not Allowed
            body: JSON.stringify({ message: 'Method not allowed' }),
        };
    };

    let infoItem: NewInfoItem;
    try {
        infoItem = JSON.parse(event.body || '');
    } catch (error) {
        return {
            statusCode: 400, // Bad Request
            body: JSON.stringify({ message: 'Invalid JSON in request body' }),
        };
    }

    try {
        await dynamoDBRepository.saveInfoItem(InfoItem.fromNewInfoItem(infoItem));
    }
    catch (error) {
        logger.error(`Unable to save the info item: ${error}`)
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Unable to save the info item' }),
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Info item recorded' }),
    };
}



export const handler = middy(lambdaHandler)
    .use(injectLambdaContext(logger, { logEvent: true }));
    
