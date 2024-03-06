import { Logger } from '@aws-lambda-powertools/logger';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { NewInfoItem } from './NewInfoItem';
import { InfoItem } from '../InfoItem';

import { DynamoDBRepository } from '../dynamodb/DynamoDBRepository';

/**
 * Lambda receiving new info items and storing them in the DB
 */

export const logger = new Logger({
    serviceName: 'publisher',
    logLevel: 'INFO',
});

export async function lambdaHandler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    
    const dynamoDBRepository = new DynamoDBRepository(logger);

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
        logger.debug(`Received info item: ${JSON.stringify(infoItem)}`);
        const item = InfoItem.fromNewInfoItem(infoItem)
        logger.debug(`Saving info item: ${JSON.stringify(item)}`);
        await dynamoDBRepository.saveInfoItem(item);
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
