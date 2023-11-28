import { InfoItemType } from '../InfoItemType';


export class NewInfoItem {
    public title: string;
    public content: string;
    public itemType: InfoItemType;

    constructor(
        title: string,
        content: string,
        itemType: InfoItemType
      ) {
        this.title = title;
        this.content = content;
        this.itemType = itemType;
      }
}