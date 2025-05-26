
const mongoose = require("mongoose");
const request = require('supertest');
const app = require('./app'); // Importez votre application Express configurée
const Place = require('./models/places');
const User = require("./models/users");
const bcrypt = require("bcrypt");

describe('POST /comments', () => {
    let token;
    let placeTest;

    beforeAll(async () => {

        await mongoose.connect(process.env.CONNECTION_STRING, { connectTimeoutMS: 2000 });

        // Connexion pour obtenir le token
        // Création d'un utilisateur de test avant les tests
        const hashedPassword = await bcrypt.hash("testpassword", 10);
        await User.create({
            firstname: "Test",
            email: "test@gmail.com",
            password: hashedPassword,
        });
        const userDatas = await request(app).post("/login").send({
            email: "test@gmail.com",
            password: "testpassword",
        });

        token = userDatas.body.token;
    });

    afterAll(async () => {
        await User.deleteOne({ email: "test@gmail.com" });
        await mongoose.disconnect();
    });

    beforeEach(async () => {
        placeTest = await Place.create({
            name: 'Test Place',
            address: '123 rue test',
            comments: []
        });
    });

    it('should save a comment only', async () => {
        const res = await request(app)
            .post('/comments')
            .set('Authorization', `Bearer ${token}`)
            .send({
                picture: 'http://example.com/photo.jpg',
                comment: 'Unit test comment',
                placeId: placeTest._id.toString()
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('comment');
        expect(res.body.comment).toHaveProperty('_id');
        expect(res.body.comment.comment).toBe('Unit test comment');
    });

    it('should update the Place with the new comment ID', async () => {
        const res = await request(app)
            .post('/comments')
            .set('Authorization', `Bearer ${token}`)
            .send({
                picture: 'http://example.com/photo.jpg',
                comment: 'Linked comment',
                placeId: placeTest._id.toString()
            });

        const updatedPlace = await Place.findById(placeTest._id);
        expect(updatedPlace).not.toBeNull();
    });
})