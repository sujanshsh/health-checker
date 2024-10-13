const { createLogger, format, transports, config } = require('winston')
const { consoleFormat } = require('winston-console-format')
const { AppConfig } = require('./configs/app.js')

let transportsToUse

if (AppConfig.isProduction) {
    transportsToUse = [
        new transports.Console({
            format: format.json(),
        }),
    ]
} else {
    transportsToUse = [
        new transports.Console({
            format: format.combine(
                format.colorize({ all: true }),
                format.padLevels(),
                consoleFormat({
                    showMeta: true,
                    metaStrip: ['timestamp', 'service'],
                    inspectOptions: {
                        depth: Infinity,
                        colors: true,
                        maxArrayLength: Infinity,
                        breakLength: 120,
                        compact: Infinity,
                    },
                })
            ),
        }),
    ]
}

const logger = createLogger({
    levels: config.syslog.levels,
    level: AppConfig.logLevel,
    format: format.combine(format.timestamp(), format.errors({ stack: true }), format.splat(), format.json()),
    transports: transportsToUse,
})

module.exports = {
    logger,
}
