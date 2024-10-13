const AppConfig = {
    isProduction: (process.env.APP_ENV ?? 'production') === 'production',
    appEnv: process.env.APP_ENV ?? 'staging',
    port: 3000,
    logLevel: process.env.LOG_LEVEL ?? 'info',
}

module.exports = {
    AppConfig,
}
