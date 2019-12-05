export class StatusResult {
  frontend: {
    sha: string
  }
  backend: {
    sha: string
  }
  elasticsearch: {
    ping: string
    status: string
  }
  rabbitmq: {
    thumbnails: RabbitQueue
    documents: RabbitQueue
    errors: RabbitQueue
  }
}

export class RabbitQueue {
  consumers: number
  idle_since: string
  state: string
  messages: number
}
