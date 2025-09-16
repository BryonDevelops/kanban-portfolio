import '@testing-library/jest-dom';

// Application layer test setup
// This file sets up the testing environment for application layer tests

// Ensure Jest globals are available in TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeDefined(): R;
      toBeUndefined(): R;
      toBeNull(): R;
      toBeTruthy(): R;
      toBeFalsy(): R;
      toEqual(expected: any): R;
      toStrictEqual(expected: any): R;
      toMatchObject(expected: any): R;
      toBe(expected: any): R;
      toHaveBeenCalled(): R;
      toHaveBeenCalledWith(...args: any[]): R;
      toHaveBeenCalledTimes(times: number): R;
      toThrow(error?: string | RegExp | Error): R;
      rejects: {
        toThrow(error?: string | RegExp | Error): Promise<R>;
        toBeDefined(): Promise<R>;
        toEqual(expected: any): Promise<R>;
      };
    }
  }
};