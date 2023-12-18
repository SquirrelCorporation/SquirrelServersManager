import pino from 'pino';

const transport = pino.transport({
  targets: [
    {
      target: 'pino/file',
      options: { destination: `${__dirname}/agent.log` , mkdir: true }
    },
      {
          target: 'pino-pretty',
      }
  ]
})

const logger = pino({
      level: process.env.NODE_ENV === "development" ? "debug" : "info",
      timestamp: pino.stdTimeFunctions.isoTime,
    },
  transport
)

export default logger;
