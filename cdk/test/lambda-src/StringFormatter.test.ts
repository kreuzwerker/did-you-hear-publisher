import { StringFormatter } from "../../lambda-src/StringFormatter";

describe('StringFormatter', () => {
    it('should capitalize first letter correctly', () => {
        const input = 'test string';
        const expectedOutput = 'Test string';

        const result = StringFormatter.capitalizeFirstLetter(input);

        expect(result).toBe(expectedOutput);
    });
});