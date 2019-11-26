export type NormalizedSchema<E, R> = { entities: E; result: R }

export default function normalize<T = any, E = { [key: string]: { [key: string]: T } }, R = any>(
  data: any,
  schema: any
): NormalizedSchema<E, R>
