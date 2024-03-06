import { InfoItem } from "../../../lambda-src/InfoItem";
import { InfoItemType } from "../../../lambda-src/InfoItemType";
import { SlackDailyMessageBuilder } from "../../../lambda-src/publishers/daily-publisher/SlackDailyMessageBuilder";

describe('SlackDailyMessageBuilder', () => {

    const slackDailyMessageBuilder: SlackDailyMessageBuilder = new SlackDailyMessageBuilder();

    it('should build daily message correctly', () => {
        const infoItems: InfoItem[] = [
            new InfoItem('123', 'Content 1', false, true, '2024-03-05', 'Title 1', InfoItemType.NEW),
            new InfoItem('456', 'Content 2', true, false, '2024-03-06', 'Title 2', InfoItemType.ARTICLE),
        ];

        const expectedMessage = {
            unfurl_links: false,
            unfurl_media: false,
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: 'Here is your daily dose of AWS news, enjoy!'
                    }
                },
                {
                    type: 'section',
                    text: {
                        'type': 'mrkdwn',
                        'text': '•  :new: *Title 1*: Content 1\n\n'
                    }
                },
                {
                    type: 'section',
                    text: {
                        'type': 'mrkdwn',
                        'text': '•  :blue_book: *Title 2*: Content 2\n\n'
                    }
                }
            ]
        };

        const builtMessage = slackDailyMessageBuilder.buildDailyMessage(infoItems);

        expect(builtMessage).toEqual(expectedMessage);
    });
});
