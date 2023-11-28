export enum InfoItemType {
    NEW = 'NEW',
    ARTICLE = 'ARTICLE',
    FEATURE = 'FEATURE',
    TRAINING = 'TRAINING',
    MISC = 'MISC',
}  

export function typeStrToType(typeStr: string): InfoItemType {
    const itemType =  InfoItemType[typeStr as keyof typeof InfoItemType];

    if (!itemType) {
        throw new Error(`Unknown InfoItemType: ${typeStr}`);
    }

    return itemType;
}

export function getTypeEmoji(itemType: InfoItemType): string {
    switch (itemType) {
        case InfoItemType.ARTICLE:
            return ':blue_book:';
        case InfoItemType.FEATURE:
            return ':nerd_face:';
        case InfoItemType.NEW:
            return ':new:';
        case InfoItemType.TRAINING:
            return ':books:';
        case InfoItemType.MISC:
            return ':earth_americas:';
    }
}
