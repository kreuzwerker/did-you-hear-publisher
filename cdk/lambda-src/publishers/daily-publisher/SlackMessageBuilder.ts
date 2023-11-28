import { InfoItemType } from "../../InfoItemType";
import { InfoItem } from "../../InfoItem";

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
        return infoItems.map(items => {
            const typeIcon = this.getTypeIcon(items.itemType);
            const normalizedTitle = this.capitalizeFirstLetter(items.title);
            const content = `•  ${typeIcon} *${normalizedTitle}*: ${items.content}${SlackDailyMessageBuilder.blankLine}`;

            return {
                type: 'section',
                text: {
                    'type': 'mrkdwn',
                    'text': content
                }
            }
        });
    }

    private capitalizeFirstLetter(input: string): string {
        return input.charAt(0).toUpperCase() + input.slice(1);
    }
}