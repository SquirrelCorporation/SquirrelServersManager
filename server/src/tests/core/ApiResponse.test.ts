import { test, expect } from 'vitest';
import {
  AuthFailureResponse,
  NotFoundResponse,
  ForbiddenResponse,
  BadRequestResponse,
  InternalErrorResponse,
  SuccessMsgResponse,
  FailureMsgResponse,
  SuccessResponse,
  ResponseStatus,
} from '../../core/api/ApiResponse';

test('AuthFailureResponse works as expected', () => {
  const mockRes = {
    status: (code: any) => {
      expect(code).toBe(ResponseStatus.UNAUTHORIZED);
      return mockRes;
    },
    json: (data: any) => {
      return mockRes;
    },
  };

  const response = new AuthFailureResponse();
  // @ts-expect-error partial type
  response.send(mockRes);
});

test('NotFoundResponse works as expected', () => {
  const mockRes = {
    status: (code: any) => {
      expect(code).toBe(ResponseStatus.NOT_FOUND);
      return mockRes;
    },
    json: (data: any) => {
      return mockRes;
    },
  };

  const response = new NotFoundResponse();
  // @ts-expect-error partial type
  response.send(mockRes);
});

test('ForbiddenResponse works as expected', () => {
  const mockRes = {
    status: (code: any) => {
      expect(code).toBe(ResponseStatus.FORBIDDEN);
      return mockRes;
    },
    json: (data: any) => {
      return mockRes;
    },
  };

  const response = new ForbiddenResponse();
  // @ts-expect-error partial type
  response.send(mockRes);
});

test('BadRequestResponse works as expected', () => {
  const mockRes = {
    status: (code: any) => {
      expect(code).toBe(ResponseStatus.BAD_REQUEST);
      return mockRes;
    },
    json: (data: any) => {
      return mockRes;
    },
  };

  const response = new BadRequestResponse();
  // @ts-expect-error partial type
  response.send(mockRes);
});

test('InternalErrorResponse works as expected', () => {
  const mockRes = {
    status: (code: any) => {
      expect(code).toBe(ResponseStatus.INTERNAL_ERROR);
      return mockRes;
    },
    json: (data: any) => {
      return mockRes;
    },
  };

  const response = new InternalErrorResponse();
  // @ts-expect-error partial type
  response.send(mockRes);
});

test('SuccessMsgResponse works as expected', () => {
  const mockRes = {
    status: (code: any) => {
      expect(code).toBe(ResponseStatus.SUCCESS);
      return mockRes;
    },
    json: (data: any) => {
      return mockRes;
    },
  };

  const response = new SuccessMsgResponse('Success');
  // @ts-expect-error partial type
  response.send(mockRes);
});

test('FailureMsgResponse works as expected', () => {
  const mockRes = {
    status: (code: any) => {
      expect(code).toBe(ResponseStatus.SUCCESS);
      return mockRes;
    },
    json: (data: any) => {
      return mockRes;
    },
  };

  const response = new FailureMsgResponse('Failure');
  // @ts-expect-error partial type
  response.send(mockRes);
});

test('SuccessResponse works as expected with extras', () => {
  const mockRes = {
    status: (code: any) => {
      expect(code).toBe(ResponseStatus.SUCCESS);
      return mockRes;
    },
    json: (data: any) => {
      expect(data).toHaveProperty('extras');
      return mockRes;
    },
  };

  const response = new SuccessResponse('Success', 'Data', 'Extras');
  // @ts-expect-error partial type
  response.send(mockRes);
});

test('SuccessResponse works as expected without extras', () => {
  const mockRes = {
    status: (code: any) => {
      expect(code).toBe(ResponseStatus.SUCCESS);
      return mockRes;
    },
    json: (data: any) => {
      expect(data).not.toHaveProperty('extras');
      return mockRes;
    },
  };

  const response = new SuccessResponse('Success', 'Data');
  // @ts-expect-error partial type
  response.send(mockRes);
});
