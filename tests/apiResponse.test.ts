import { ApiResponseHelper } from '../src/utils/ApiResponse';
import { Response } from 'express';

describe('ApiResponseHelper Unit Tests', () => {
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockRes = {
      status: statusMock,
    };
  });

  it('should format success response correctly', () => {
    ApiResponseHelper.success(mockRes as Response, 200, 'Success message', { key: 'value' });

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      status: 'success',
      message: 'Success message',
      data: { key: 'value' },
    });
  });

  it('should format error response correctly', () => {
    ApiResponseHelper.error(mockRes as Response, 400, 'Error message', ['Detail 1']);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      status: 'fail',
      message: 'Error message',
      errors: ['Detail 1'],
    });
  });

  it('should set status to "error" for HTTP status codes >= 500', () => {
    ApiResponseHelper.error(mockRes as Response, 500, 'Server error');

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      status: 'error',
      message: 'Server error',
    });
  });
});
