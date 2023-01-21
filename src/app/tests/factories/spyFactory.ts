import { SpyInstance, vi } from 'vitest';

type Procedure = (...args: any[]) => any;

type Methods<T> = {
  [K in keyof T]: T[K] extends Procedure ? K : never;
}[keyof T] &
  (string | symbol);

export class SpyFactory {
  private readonly vitest: typeof vi;

  public constructor(vitest: typeof vi) {
    this.vitest = vitest;
  }

  public create<T, M extends Methods<Required<T>>>(
    obj: T,
    methodName: M,
  ): Required<T>[M] extends (...args: infer A) => infer R | (new (...args: infer A) => infer R)
    ? SpyInstance<A, R>
    : never {
    const dummy = ((): void => {}) as any;

    obj[methodName] = dummy;

    return this.vitest.spyOn(obj, methodName);
  }
}
