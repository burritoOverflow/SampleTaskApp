const winston = require('winston');
const path = require('path');
const logFilePath = path.join(__dirname, '..', '..', 'logs');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    new winston.transports.File({
      filename: `${logFilePath}/error.log`,
      level: 'error',
    }),
    new winston.transports.File({ filename: `${logFilePath}/combined.log` }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  // log to stdout when not in prod
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

logger.stream = {
  write: function (message) {
    logger.info(message);
  },
};

module.exports = logger;
