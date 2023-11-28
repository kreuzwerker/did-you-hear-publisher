import { InfoItemType } from "./InfoItemType";

import { v4 as uuidv4 } from 'uuid';
import { NewInfoItem as NewInfoItem } from "./item-creator/NewInfoItem";

export class InfoItem {
  id: string;
  content: string;
  publishedInDaily: boolean;
  publishedInSummary: boolean;
  submissionDate: string;
  title: string;
  itemType: InfoItemType;

  constructor(
    id: string,
    content: string,
    publishedInDaily: boolean,
    publishedInSummary: boolean,
    submissionDate: string,
    title: string,
    itemType: InfoItemType
  ) {
    this.id = id;
    this.content = content;
    this.publishedInDaily = publishedInDaily;
    this.publishedInSummary = publishedInSummary;
    this.submissionDate = submissionDate;
    this.title = title;
    this.itemType = itemType;
  }

  static fromNewInfoItem(infoItem: NewInfoItem): InfoItem {
    return new InfoItem(
      uuidv4(),
      infoItem.content,
      false,
      false,
      new Date().toISOString(),
      infoItem.title,
      infoItem.itemType
    );
  }

}

