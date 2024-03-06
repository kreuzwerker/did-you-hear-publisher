import { InfoItemType } from "../../InfoItemType";
import { InfoItem } from "../../InfoItem";
import { StringFormatter } from "../../StringFormatter";

export class SlackDailyMessageBuilder {

    private static readonly blankLine = '\n\n';

    public buildDailyMessage(infoItems: InfoItem[]): any {
        let firstLineBlock = {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: 'Here is your daily dose of AWS news, enjoy!'
            }
        };

        return {
            unfurl_links: false,
            unfurl_media: false,
            blocks: [
                firstLineBlock,
                ...this.buildPublicationBlocks(infoItems)
            ]
        };
    }

    private getTypeIcon(type: InfoItemType): string {
        switch (type) {
            case InfoItemType.ARTICLE:
                return ':blue_book:';
            case InfoItemType.FEATURE:
                return ':nerd_face:';
            case InfoItemType.NEW:
                return ':new:';
            case InfoItemType.TRAINING:
                return ':books:';
            default:
                return ':earth_americas:';
        }
    }

    private buildPublicationBlocks(infoItems: InfoItem[]) {
        return infoItems.map(item => {
            const typeIcon = this.getTypeIcon(item.itemType);
            const normalizedTitle = StringFormatter.capitalizeFirstLetter(item.title);
            const content = `•  ${typeIcon} *${normalizedTitle}*: ${item.content}${SlackDailyMessageBuilder.blankLine}`;

            return {
                type: 'section',
                text: {
                    'type': 'mrkdwn',
                    'text': content
                }
            }
        });
    }
}