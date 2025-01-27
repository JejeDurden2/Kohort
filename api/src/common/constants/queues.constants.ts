import { QueueName } from '../enums/queue-names.enum'

export const bullQueues = Object.values(QueueName).map((name) => ({ name }))
