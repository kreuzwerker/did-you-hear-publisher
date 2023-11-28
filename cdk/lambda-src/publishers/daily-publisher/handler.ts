import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger';
import axios from 'axios';
import { getParameter } from '@aws-lambda-powertools/parameters/ssm';
import middy from '@middy/core';
import { InfoItem } from '../../InfoItem';
import { SlackDailyMessageBuilder } from './SlackMessageBuilder';
import { DynamoDBRepository } from '../../dynamodb/DynamoDBRepository';

/**
 * Lambda publishing the daily DYH to Slack
 */

const slackDailyUrlSSMParameter = readConfig('SLACK_URL_SSM_PARAMETER');
const maxItemsToPublish = readIntConfig('MAX_ITEMS_TO_PUBLISH');

// function which takes the name of an env variable, then look for that value using process.env and throws an error if the value is missing

const logger = new Logger({
    serviceName: 'daily-publisher'
});

const dynamoDBRepository = new DynamoDBRepository(logger);
const messageBuilder = new SlackDailyMessageBuilder();

async function lambdaHandler() {

    const slackWebhookUrl = await getParameter(slackDailyUrlSSMParameter, { decrypt: true }) || '';

    let infoItems = await dynamoDBRepository.getDailyItems();
    if (infoItems.length === 0) {
        logger.info('No info items to publish');
        return;
    } else {
        infoItems = infoItems.slice(0, maxItemsToPublish);
        logger.debug(`Publishing {infoItems.length} infoItems to Slack`);
    }

    const payload = messageBuilder.buildDailyMessage(infoItems);

    // Send the message to Slack
    try {
        await axios.post(slackWebhookUrl, payload);

        await recordDailyPublication(infoItems);

        logger.info(`${infoItems.length} infoItems successfully sent to Slack`);
        logger.debug

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Message sent to Slack!' }),
        };
    } catch (error) {
        console.error('Error sending message to Slack:', error);
        return {
            statusCode: 500, // Internal Server Error
            body: JSON.stringify({ message: 'Failed to send message to Slack' }),
        };
    }
}

async function recordDailyPublication(items: InfoItem[]) {
    for (const item of items) {
        item.publishedInDaily = true;
        await dynamoDBRepository.saveInfoItem(item);
    };
}

function readConfig(configName: string) {
    const value = process.env[configName];
    if (!value) {
        throw new Error(`Missing configuration value for ${configName}`);
    }
    return value;
}

function readIntConfig(configName: string) {
    const value = parseInt(readConfig(configName));
    
    if (isNaN(value)) {
        throw new Error(`Invalid integere configuration value for ${configName}`);
    }
    
    return value;
}

export const handler = middy(lambdaHandler)
    .use(injectLambdaContext(logger, { logEvent: true }));