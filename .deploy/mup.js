module.exports = {
    servers: {
        one: {
            host: '134.122.3.48',
            username: 'root',
        }
    },
    app: {
        name: 'BigDipper',
        path: '../',
        docker: {
            image: 'abernix/meteord:node-12-base',
        },
        servers: {
            one: {}
        },
        buildOptions: {
            serverOnly: true
        },
        env: {
            ROOT_URL: 'https://explorer.cashmaney.com',
            MONGO_URL: 'mongodb://localhost/meteor'
        }
    },
    mongo: {
        version: '3.4.1',
        servers: {
            one: {}
        }
    },
    proxy: {
        domains: 'explorer.cashmaney.com',
        ssl: {
            // Enable let's encrypt to create free certificates.
            // The email is used by Let's Encrypt to notify you when the
            // certificates are close to expiring.
            letsEncryptEmail: 'itzik@keytango.io',
            forceSSL: false
        }
    }
};
