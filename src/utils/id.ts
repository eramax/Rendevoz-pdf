import { SnowflakeIdv1 } from './snowflakeIdv1'

const generator = new SnowflakeIdv1({ workerId: 1, workerIdBitLength: 1 })
function getNumberId() {
  return generator.NextNumber()
}
function getStringId(){
  return generator.NextNumber().toString()
}
interface IId {
  getId: () => number
  getStrId: () => string
}
const Id: IId = {
  getId: () => getNumberId(),
  getStrId: () => getStringId()
}
export default Id
