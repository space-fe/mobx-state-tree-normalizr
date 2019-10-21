interface IResult {
  result?: string | number
  entities: object
}
interface IObject {
  [key: string]: any
}
interface IMyModelType {
  identifierAttribute?: string
  name?: string
}
declare function normalize(input: IObject, model: IMyModelType): IResult
declare function normalize(input: IObject[], model: IMyModelType[]): IResult[]
export default normalize
