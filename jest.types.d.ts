// Jest type declarations for TypeScript support
import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeDefined(): R
      toBeUndefined(): R
      toBeNull(): R
      toBeTruthy(): R
      toBeFalsy(): R
      toEqual(expected: any): R
      toStrictEqual(expected: any): R
      toBeCloseTo(expected: number, precision?: number): R
      toBeGreaterThan(expected: number): R
      toBeGreaterThanOrEqual(expected: number): R
      toBeLessThan(expected: number): R
      toBeLessThanOrEqual(expected: number): R
      toMatch(expected: string | RegExp): R
      toContain(expected: any): R
      toHaveLength(expected: number): R
      toThrow(expected?: string | RegExp | jest.Constructor): R
      toHaveBeenCalled(): R
      toHaveBeenCalledTimes(expected: number): R
      toHaveBeenCalledWith(...args: any[]): R
      toHaveBeenLastCalledWith(...args: any[]): R
      toHaveReturnedWith(expected: any): R
      toHaveReturnedTimes(expected: number): R
      // DOM matchers from @testing-library/jest-dom
      toBeInTheDocument(): R
      toHaveClass(className: string): R
      toHaveValue(value: string | number): R
      toBeVisible(): R
    }

    interface Expect {
      toBeDefined(): any
      toBeUndefined(): any
      toBeNull(): any
      toBeTruthy(): any
      toBeFalsy(): any
      toEqual(expected: any): any
      toStrictEqual(expected: any): any
      toBeCloseTo(expected: number, precision?: number): any
      toBeGreaterThan(expected: number): any
      toBeGreaterThanOrEqual(expected: number): any
      toBeLessThan(expected: number): any
      toBeLessThanOrEqual(expected: number): any
      toMatch(expected: string | RegExp): any
      toContain(expected: any): any
      toHaveLength(expected: number): any
      toThrow(expected?: string | RegExp | jest.Constructor): any
      toHaveBeenCalled(): any
      toHaveBeenCalledTimes(expected: number): any
      toHaveBeenCalledWith(...args: any[]): any
      toHaveBeenLastCalledWith(...args: any[]): any
      toHaveReturnedWith(expected: any): any
      toHaveReturnedTimes(expected: number): any
    }
  }
}

export {}