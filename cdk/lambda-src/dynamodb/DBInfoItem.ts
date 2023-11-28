import { InfoItem } from '../InfoItem';

export class DBInfoItem {
  id: string;
  content: string;
  publishedInDaily: boolean;
  publishedInSummary: boolean;
  submissionDate: string;
  title: string;
  itemType: string;

  constructor(
    id: string,
    content: string,
    publishedInDaily: boolean,
    publishedInSummary: boolean,
    submissionDate: string,
    title: string,
    itemType: string
  ) {
    this.id = id;
    this.content = content;
    this.publishedInDaily = publishedInDaily;
    this.publishedInSummary = publishedInSummary;
    this.submissionDate = submissionDate;
    this.title = title;
    this.itemType = itemType;
  }

  static fromInfoItem(item: InfoItem): DBInfoItem {
    return new DBInfoItem(
      item.id,
      item.content,
      item.publishedInDaily,
      item.publishedInSummary,
      item.submissionDate,
      item.title,
      item.itemType.toString()
    );
  }
}

