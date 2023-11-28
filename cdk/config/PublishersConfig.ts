export class PublishersConfig {
    logLevel: string;
    dailyCronExpression: string;
    dailySlackUrlSSMParam: string;
    dailyMaxPerPublication: number;
    summaryCronExpression: string;
    summarySlackUrlSSMParam: string;
}