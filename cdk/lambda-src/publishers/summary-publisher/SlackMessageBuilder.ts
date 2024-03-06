import { InfoItemType, getTypeEmoji } from "../../InfoItemType";
import { InfoItem } from "../../InfoItem";
import { Logger } from "@aws-lambda-powertools/logger";
import { StringFormatter } from "../../StringFormatter";

export class SlackMessageBuilder {

    logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    public buildMessage(itemsByType: Record<InfoItemType, InfoItem[]>): any {
        const blocks = [];
        blocks.push(this.buildIntroBlock());

        this.addTypesSectionBlocks(blocks, itemsByType);

        return {
            unfurl_links: false,
            unfurl_media: false,
            blocks: blocks
        };
    }

    private addTypesSectionBlocks(blocks: any[], itemsByType: Record<InfoItemType, InfoItem[]>) {
        const allTypes: InfoItemType[] = Object.values(InfoItemType).sort();

        for (const infoItemType of allTypes) {
            const itemsOfType = itemsByType[infoItemType] || [];

            if (itemsOfType.length > 0) {

                this.logger.info(`${itemsOfType.length} items of type ${infoItemType} ready to publish`);

                const sectionHeader = this.buildHeader(
                    getTypeEmoji(infoItemType),
                    this.getTypeSectionLabel(infoItemType)
                );

                blocks.push(sectionHeader);
                blocks.push(this.buildDivider());

                for (const item of itemsOfType) {
                    const block = this.buildPublicationBlock(item);
                    blocks.push(block);
                }
            }
        }
    }

    private buildIntroBlock() {
        return {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: 'Remember that if you prefer bite-size :chocolate_bar: and fresher :sushi: news you can always join the #aws-did-you-hear channel to enjoy the daily updates :wink:'
            }
        };
    }

    private buildHeader(emoji: string, text: string) {
        return {
            type: 'header',
            text: {
                type: 'plain_text',
                text: `${emoji} ${StringFormatter.capitalizeFirstLetter(text)}`,
                emoji: true
            }
        };
    }

    private buildDivider() {
        return {
            type: 'divider'
        };
    }

    private buildPublicationBlock(item: InfoItem) {
            const normalizedTitle = StringFormatter.capitalizeFirstLetter(item.title);
            const content = `•  *${normalizedTitle}*: ${item.content}`;

            return {
                type: 'section',
                text: {
                    'type': 'mrkdwn',
                    'text': content
                }
            }
    }

    private getTypeSectionLabel(itemType: InfoItemType): string {
        switch (itemType) {
            case InfoItemType.ARTICLE:
                return 'Articles';
            case InfoItemType.FEATURE:
                return 'Tips & tricks';
            case InfoItemType.NEW:
                return 'New features and releases';
            case InfoItemType.TRAINING:
                return 'Training courses';
            case InfoItemType.MISC:
                return 'Other';
        }
    }
}