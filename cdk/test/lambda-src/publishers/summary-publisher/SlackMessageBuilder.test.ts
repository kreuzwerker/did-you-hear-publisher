import { InfoItem } from "../../../../lambda-src/InfoItem";
import { InfoItemType } from "../../../../lambda-src/InfoItemType";
import { SlackMessageBuilder } from "../../../../lambda-src/publishers/summary-publisher/SlackMessageBuilder";
import { Logger } from "@aws-lambda-powertools/logger";

describe('SlackMessageBuilder', () => {
  let slackMessageBuilder: SlackMessageBuilder;

  beforeEach(() => {
    const logger = new Logger();
    slackMessageBuilder = new SlackMessageBuilder(logger);
  });

  it('should build message correctly', () => {
    // @ts-ignore
    const itemsByType: { [key in InfoItemType]: InfoItem[] } = {
      [InfoItemType.ARTICLE]: [
        new InfoItem('123', 'Content 1', false, true, '2024-03-05', 'Title 1', InfoItemType.ARTICLE),
        new InfoItem('456', 'Content 2', true, false, '2024-03-06', 'Title 2', InfoItemType.ARTICLE),
      ],
      [InfoItemType.NEW]: [
        new InfoItem('789', 'Content 3', false, true, '2024-03-07', 'Title 3', InfoItemType.NEW),
        new InfoItem('101', 'Content 4', true, false, '2024-03-08', 'Title 4', InfoItemType.NEW),
      ],
      [InfoItemType.TRAINING]: [
        new InfoItem('111', 'Content 5', false, true, '2024-03-09', 'Title 5', InfoItemType.TRAINING),
      ]
    };

    const builtMessage = slackMessageBuilder.buildMessage(itemsByType);

    const expectedMessage = {
      unfurl_links: false,
      unfurl_media: false,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Remember that if you prefer bite-size :chocolate_bar: and fresher :sushi: news you can always join the #aws-did-you-hear channel to enjoy the daily updates :wink:'
          }
        },
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: ':blue_book: Articles',
            emoji: true
          }
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          text: {
            'type': 'mrkdwn',
            'text': '•  *Title 1*: Content 1'
          }
        },
        {
          type: 'section',
          text: {
            'type': 'mrkdwn',
            'text': '•  *Title 2*: Content 2'
          }
        },
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: ':new: New features and releases',
            emoji: true
          }
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          text: {
            'type': 'mrkdwn',
            'text': '•  *Title 3*: Content 3'
          }
        },
        {
          type: 'section',
          text: {
            'type': 'mrkdwn',
            'text': '•  *Title 4*: Content 4'
          }
        },
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: ':books: Training courses',
            emoji: true
          }
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          text: {
            'type': 'mrkdwn',
            'text': '•  *Title 5*: Content 5'
          }
        }
      ]
    };

    expect(builtMessage).toEqual(expectedMessage);
  });
});
