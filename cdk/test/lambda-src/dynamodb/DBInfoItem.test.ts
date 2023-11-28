import { DBInfoItem } from '../../../lambda-src/dynamodb/DBInfoItem';
import { InfoItem } from '../../../lambda-src/InfoItem';
import { InfoItemType } from '../../../lambda-src/InfoItemType';

describe('DBInfoItem', () => {

  it('should create a DBInfoItem from an InfoItem', () => {
    const infoItem: InfoItem = new InfoItem(
      '456',
      'InfoItem content',
      false,
      true,
      '2023-09-26',
      'InfoItem Title',
      InfoItemType.NEW
    );

    const dbInfoItem = DBInfoItem.fromInfoItem(infoItem);

    expect(dbInfoItem.id).toBe(infoItem.id);
    expect(dbInfoItem.content).toBe(infoItem.content);
    expect(dbInfoItem.publishedInDaily).toBe(infoItem.publishedInDaily);
    expect(dbInfoItem.publishedInSummary).toBe(infoItem.publishedInSummary);
    expect(dbInfoItem.submissionDate).toBe(infoItem.submissionDate);
    expect(dbInfoItem.title).toBe(infoItem.title);
    expect(dbInfoItem.itemType).toBe(infoItem.itemType);
  });
});
