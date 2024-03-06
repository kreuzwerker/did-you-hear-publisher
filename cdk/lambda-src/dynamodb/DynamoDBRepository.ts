import { DynamoDB } from "aws-sdk";
import { InfoItem } from "../InfoItem";
import { Logger } from "@aws-lambda-powertools/logger";

import { DBInfoItem } from "./DBInfoItem";
import { typeStrToType } from "../InfoItemType";
import { ScanInput } from "aws-sdk/clients/dynamodb";

const itemsTable = process.env.INFO_ITEMS_TABLE || 'missing';

const publishedInDailyField = 'publishedInDaily';
const publishedInSummaryField = 'publishedInSummary';

const dynamoDB = new DynamoDB.DocumentClient();

export class DynamoDBRepository {

    logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    async saveInfoItem(item: InfoItem) {
        const payload = DBInfoItem.fromInfoItem(item);

        const params: DynamoDB.DocumentClient.PutItemInput = {
            TableName: itemsTable,
            Item: payload,
        };

        this.logger.info(`Saving the info item: ${JSON.stringify(payload)}`);
        await dynamoDB.put(params).promise();
    }

    async getDailyItems(): Promise<InfoItem[]> {
        const queryParameters: DynamoDB.DocumentClient.ScanInput = {
            TableName: itemsTable,
            FilterExpression: `${publishedInDailyField} = :${publishedInDailyField}`,
            ExpressionAttributeValues: {
                [`:${publishedInDailyField}`]: false,
            },
        };

        return this.findPendingItems(queryParameters);
    }

    async getSummaryItems(): Promise<InfoItem[]> {
        const queryParameters: DynamoDB.DocumentClient.ScanInput = {
            TableName: itemsTable,
            FilterExpression: `${publishedInDailyField} = :${publishedInDailyField} AND ${publishedInSummaryField} = :${publishedInSummaryField}`,
            ExpressionAttributeValues: {
                [`:${publishedInSummaryField}`]: false,
                [`:${publishedInDailyField}`]: true
            },
        };

        return this.findPendingItems(queryParameters);
    }

    private async findPendingItems(scanParameters: ScanInput): Promise<InfoItem[]> {

        try {
            const searchResult = await dynamoDB.scan(scanParameters).promise();

            if (searchResult.Items) {
                this.logger.info(`Found ${searchResult.Items.length} items to publish`);

                return searchResult.Items.map((item) => this.mapToInfoItem(item));
            } else {
                this.logger.info(`Found no items to publish`);
                return [];
            }
        } catch (error) {
            this.logger.error(`Error retrieving info items to publish: ${error}`);
            throw error;
        }
    }


    mapToInfoItem(item: any): InfoItem {
        return new InfoItem(
            item.id,
            item.content,
            item.publishedInDaily,
            item.publishedInSummary,
            item.submissionDate,
            item.title,
            typeStrToType(item.itemType)
        );
    }

}