const CONFIG = {
    server: {
        host: process.env.HOST ? process.env.HOST : '0.0.0.0',
        port: process.env.PORT ? Number(parseInt(process.env.PORT)) : 8080,
    }
};

export { CONFIG };