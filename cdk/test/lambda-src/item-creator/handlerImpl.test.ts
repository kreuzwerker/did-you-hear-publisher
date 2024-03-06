import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { lambdaHandler } from '../../../lambda-src/item-creator/handlerImpl'; // Assuming your lambda file is named 'yourLambdaFile'

const mockSaveInfoItem = jest.fn();

jest.mock('../../../lambda-src/dynamodb/DynamoDBRepository', () => {
  return {
    DynamoDBRepository: jest.fn().mockImplementation(() => { return { saveInfoItem: mockSaveInfoItem } }),
  };
});

describe('lambdaHandler', () => {

  beforeEach(() => {
    mockSaveInfoItem.mockReset();
  });

  it('should return 405 if method is not POST', async () => {
    const event: APIGatewayProxyEventV2 = {
      requestContext: {
        http: {
          method: 'GET',
        },
      },
    } as any;

    const result = await lambdaHandler(event) as APIGatewayProxyStructuredResultV2;

    expect(result.statusCode).toBe(405);
    expect(result.body).toEqual(JSON.stringify({ message: 'Method not allowed' }));
  });

  it('should return 400 if JSON in request body is invalid', async () => {
    const event: APIGatewayProxyEventV2 = {
      requestContext: {
        http: {
          method: 'POST',
        },
      },
      body: 'invalid JSON',
    } as any;

    const result = await lambdaHandler(event) as APIGatewayProxyStructuredResultV2;

    expect(result.statusCode).toBe(400);
    expect(result.body).toEqual(JSON.stringify({ message: 'Invalid JSON in request body' }));
  });

  it('should return 500 if unable to save the info item', async () => {
    const event: APIGatewayProxyEventV2 = {
      requestContext: {
        http: {
          method: 'POST',
        },
      },
      body: JSON.stringify({}), // valid JSON
    } as any;

    mockSaveInfoItem.mockRejectedValueOnce('Unable to save info item'); // Mocking the rejection of saveInfoItem

    const result = await lambdaHandler(event) as APIGatewayProxyStructuredResultV2;

    expect(result.statusCode).toBe(500);
    expect(result.body).toEqual(JSON.stringify({ message: 'Unable to save the info item' }));
  });

  it('should return 200 if info item is saved successfully', async () => {
    const event: APIGatewayProxyEventV2 = {
      requestContext: {
        http: {
          method: 'POST',
        },
      },
      body: JSON.stringify({}), // valid JSON
    } as any;

    mockSaveInfoItem.mockResolvedValueOnce({});

    const result = await lambdaHandler(event) as APIGatewayProxyStructuredResultV2;

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(JSON.stringify({ message: 'Info item recorded' }));
  });
});
