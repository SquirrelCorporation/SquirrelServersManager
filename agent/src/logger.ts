import winston from 'winston';
import 'winston-daily-rotate-file';

const transport = new winston.transports.DailyRotateFile({
  level: 'info',
  filename: 'agent-%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});

const logger = winston.createLogger({
      level: process.env.NODE_ENV === "development" ? "debug" : "info",
    format: winston.format.combine(
      winston.format.timestamp(), // adds a timestamp property
      winston.format.json()
    ),
    transports: [new winston.transports.Console(), transport],
  },
)

export default logger;
