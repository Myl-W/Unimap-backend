const mongoose = require("mongoose");
const request = require('supertest');
const app = require('./app'); // Importez votre application Express configurée

// describe('POST /comments', () => {
//     it('should return 400 if required fields are missing', async () => {
//         const res = await request(app)
//             .post('/comments')
//             .send({
//                 comment: '',
//             });

//         expect(res.statusCode).toBe(400);
//         expect(res.body.result).toBe(false);
//         expect(res.body.error).toBe('Missing fields');
//     });
// });

describe('POST /comments', () => {
    beforeAll(async () => {
        // Connexion à la base de données avant les tests
        await mongoose.connect(process.env.CONNECTION_STRING, { connectTimeoutMS: 2000 });
        console.log("Database connected");
    });

    afterAll(async () => {
        // Déconnexion de la base de données après les tests
        await mongoose.disconnect();
        console.log("Database disconnected");
    });

    it('should return 400 if required fields are missing', async () => {
        const res = await request(app)
            .post('/comments')
            .send({
                comment: '',
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.result).toBe(false);
        expect(res.body.error).toBe('Missing fields');
    });

    // Ajoutez d'autres tests ici
});
