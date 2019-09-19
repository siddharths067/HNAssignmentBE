const winston = require(`winston`);

const logger = winston.createLogger({
    level: `info`,
    format: winston.format.json(),
    defaultMeta: {service: `HackerNews Backend`},
    transports: [
        new winston.transports.File({
            filename: `error.log`,
            level: `error`
        }),
        new winston.transports.File({
            filename: `combined.log`
        })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
    logger.info(`Added Console to Winston`);
}

module.exports = logger;
