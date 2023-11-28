import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger';
import axios from 'axios';
import { getParameter } from '@aws-lambda-powertools/parameters/ssm';
import middy from '@middy/core';
import { InfoItem } from '../../InfoItem';
import { SlackMessageBuilder } from './SlackMessageBuilder';
import { DynamoDBRepository } from '../../dynamodb/DynamoDBRepository';
import { InfoItemType as InfoItemType } from '../../InfoItemType';

/**
 * Lambda publishing the summary to Slack
 */

const slackUrlSSMParameter = process.env.SLACK_URL_SSM_PARAMETER || 'missing';

const logger = new Logger({
    serviceName: 'summary-publisher'
});

const dynamoDBRepository = new DynamoDBRepository(logger);
const messageBuilder = new SlackMessageBuilder(logger);

async function lambdaHandler() {

    const slackWebhookUrl = await getParameter(slackUrlSSMParameter, { decrypt: true }) || '';

    let items = await dynamoDBRepository.getSummaryItems();
    if (items.length === 0) {
        logger.info('No items to publish');
        return;
    }

    const itemsByType = groupItemsByType(items);
    const payload = messageBuilder.buildMessage(itemsByType);

    try {
        await axios.post(slackWebhookUrl, payload);

        await recordItemStatus(items);

        logger.info(`${items.length} info items successfully sent to Slack`);

        return;
    
    } catch (error) {

        console.error('Error sending message to Slack:', error);
        return;
    }
}

function groupItemsByType(items: InfoItem[]): Record<InfoItemType, InfoItem[]> {
    return items.reduce(
        (acc, infoItem) => {
            if (!acc[infoItem.itemType]) {
                acc[infoItem.itemType] = [];
            }
            acc[infoItem.itemType].push(infoItem);
            return acc;
        },
        {} as Record<InfoItemType, InfoItem[]>
    );
}

async function recordItemStatus(items: InfoItem[]) {
    for (const item of items) {
        item.publishedInSummary = true;
        await dynamoDBRepository.saveInfoItem(item);
    };
}

export const handler = middy(lambdaHandler)
    .use(injectLambdaContext(logger, { logEvent: true }));