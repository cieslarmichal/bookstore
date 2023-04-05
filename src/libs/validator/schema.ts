/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyZodTuple, z, ZodFunction, ZodTuple, ZodType, ZodTypeAny } from 'zod';

export class Schema {
  public static string(): z.ZodString {
    return z.string();
  }

  public static literal(value: any): z.ZodLiteral<any> {
    return z.literal(value);
  }

  public static unknownObject(): z.ZodObject<Record<string, ZodTypeAny>, 'passthrough'> {
    return z.object({}).passthrough();
  }

  public static number(): z.ZodNumber {
    return z.number();
  }

  public static positiveNumber(): z.ZodNumber {
    return z.number().positive();
  }

  public static integer(): z.ZodNumber {
    return z.number().int();
  }

  public static positiveInteger(): z.ZodNumber {
    return z.number().int().positive();
  }

  public static boolean(): z.ZodBoolean {
    return z.boolean();
  }

  public static symbol(): z.ZodSymbol {
    return z.symbol();
  }

  public static date(): z.ZodDate {
    return z.date();
  }

  public static enum<T extends z.EnumLike>(value: T): z.ZodNativeEnum<T> {
    return z.nativeEnum(value);
  }

  public static array<T extends ZodTypeAny>(type: T): z.ZodArray<T> {
    return z.array(type);
  }

  public static undefined(): z.ZodUndefined {
    return z.undefined();
  }

  public static null(): z.ZodNull {
    return z.null();
  }

  public static record<K extends z.ZodString, T extends ZodTypeAny>(key: K, value: T): z.ZodRecord<K, T> {
    return z.record(key, value);
  }

  public static void(): z.ZodVoid {
    return z.void();
  }

  public static any(): z.ZodAny {
    return z.any();
  }

  public static map<K extends ZodTypeAny = ZodTypeAny, V extends ZodTypeAny = ZodTypeAny>(
    key: K,
    value: V,
  ): z.ZodMap<K, V> {
    return z.map(key, value);
  }

  public static unknown(): z.ZodUnknown {
    return z.unknown();
  }

  public static object<T extends z.ZodRawShape>(schema: T): z.ZodObject<T> {
    return z.object(schema);
  }

  public static instanceof<T extends new (...args: any) => any>(ctor: T): ZodType<InstanceType<T>> {
    return z.instanceof(ctor);
  }

  public union<T extends [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]>(types: T): ZodTuple<T> {
    return z.tuple(types);
  }

  public static function<A extends AnyZodTuple, R extends ZodTypeAny>(args: A, returns: R): ZodFunction<A, R> {
    return z.function(args, returns);
  }

  public static unsafeType<T>(): ZodType<T> {
    return z.any();
  }

  public static union<T extends [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]>(types: T): z.ZodUnion<T> {
    return z.union(types);
  }

  public static promise<T extends ZodTypeAny>(value: T): z.ZodPromise<T> {
    return z.promise(value);
  }

  public static tuple<T extends [] | [ZodTypeAny, ...ZodTypeAny[]]>(types: T): ZodTuple<T> {
    return z.tuple(types);
  }
}
