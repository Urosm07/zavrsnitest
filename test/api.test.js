"use strict";

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const expect = chai.expect;
chai.use(chaiHttp);
require('dotenv').config()

let testData = require('../data/api.json');

const HEADER_AUTH = 'Authorization';
const HEADER_AUTH_BEARER = 'Bearer ';

describe('api.qa.rs', () => {
    let request;
    let tokenAdmin;
    let tokenUser;
    let userId;
    let bookingId;
    let roomTypeId;
    let roomId;

    before(() => {
        request = chai.request(process.env.API_BASE_URL);
    });

    it('Performs user login - admin', (done) => {
        request.post('/user/login')
            .send({
                'email': process.env.API_USERNAME_ADMIN,
                'password': process.env.API_PASSWORD_ADMIN
            })
            .end((error, response) => {
                response.should.have.status(200);
                response.body.user.level.should.be.eq(99);
                tokenAdmin = response.body.token;
                done();
            });
    });

    it('Performs user registration', (done) => {
        request.post('/user/register')
            .send({
                'name': testData.user.name,
                'email': testData.user.email,
                'password': process.env.API_PASSWORD_USER,
                'password_confirmation': process.env.API_PASSWORD_USER
            })
            .end((error, response) => {
                response.should.have.status(200);
                response.body.user.id.should.be.gt(0);
                response.body.token.should.not.be.null;
                tokenUser = response.body.token;
                userId = response.body.user.id;
                done();
            });
    });

    it('Verifies user is registered', (done) => {
        request.get('/users')
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .end((error, response) => {
                response.should.have.status(200);
                response.body.should.have.property('data');
                response.body.data.should.be.an('array');
                response.body.data.length.should.be.gte(0);
                const userData = response.body.data;
                let userFlag = false;

                userData.forEach((user) => {
                    if (user.email === testData.user.email) {
                        userFlag = true;
                    }
                });

                userFlag.should.eq(true);

                done();
            });
    });

    it('Performs user login - user', (done) => {
        request.post('/user/login')
            .send({
                'email': testData.user.email,
                'password': process.env.API_PASSWORD_USER
            })
            .end((error, response) => {
                response.should.have.status(200);
                response.body.user.level.should.be.eq(0);
                tokenUser = response.body.token;
                userId = response.body.user.id;
                done();
            });
    });

    it("Adds new room type", (done) => {
        let testRoomType = testData.room_type;

        request.post('/room_type')
            .set(HEADER_AUTH, HEADER_AUTH_BEARER + tokenAdmin)
            .send(testRoomType)
            .end((error, response) => {
                response.should.have.status(201);
                response.body.should.have.property('data');
                roomTypeId = response.body.data.id;
                expect(roomTypeId).to.be.gt(0);
                done();
            });
    });

    it('Adds a new room', (done) => {
        let testRoom = testData.room;
        testRoom.type_id = roomTypeId;

        request.post('/room')
            .set(HEADER_AUTH, HEADER_AUTH_BEARER + tokenAdmin)
            .send(testRoom)
            .end((error, response) => {
                response.should.have.status(201);
                response.body.should.have.property('data');
                roomId = response.body.data.id;
                expect(roomId).to.be.gt(0);
                expect(response.body.data.type.id).to.be.eq(roomTypeId);
                done();
            });

    });

    it("Updates room_type", (done) => {
        let testRoomTypeUpdate = testData.room_type_update;

        request.put(`/room_type/${roomTypeId}`)
            .set(HEADER_AUTH, HEADER_AUTH_BEARER + tokenAdmin)
            .send(testRoomTypeUpdate)
            .end((error, response) => {
                response.should.have.status(200);
                response.body.should.have.property('data');
                expect(response.body.data.beds).to.be.eq(testRoomTypeUpdate.beds);
                expect(response.body.data.max_people).to.be.eq(testRoomTypeUpdate.max_people);
                done();
            });
    });

    it("Updates room", (done) => {
        let testRoomUpdate = testData.room_update;
        testRoomUpdate.type_id = roomTypeId;

        request.put(`/room/${roomId}`)
            .set(HEADER_AUTH, HEADER_AUTH_BEARER + tokenAdmin)
            .send(testRoomUpdate)
            .end((error, response) => {
                response.should.have.status(200);
                response.body.should.have.property('data');
                expect(response.body.data.price).to.be.eq(testRoomUpdate.price);
                done();
            });
    });

    it('Makes a booking', (done) => {
        let testBooking = testData.bookings[0];
        testBooking.user_id = userId;
        testBooking.room_id = roomId;

        request.post('/booking')
            .set('Authorization', `Bearer ${tokenUser}`)
            .send(testBooking)
            .end((error, response) => {
                response.should.have.status(200);
                response.body.booking.persons.should.eq(testBooking.people);
                response.body.booking.total_price.should.be.gt(0);
                bookingId = response.body.booking.id;
                expect(bookingId).to.be.gt(0);
                done();
            })
        ;
    });

    it('Gets booking information', (done) => {
        let testBooking = testData.bookings[0];

        request.get(`/booking/${bookingId}`)
            .set('Authorization', `Bearer ${tokenUser}`)
            .end((error, response) => {
                response.should.have.status(200);
                response.body.persons.should.eq(testBooking.people);
                response.body.id.should.eq(bookingId);
                response.body.user.should.eq(userId);
                done();
            });
    });

    it('Gets all bookings as admin', (done) => {
        request.get('/booking')
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .end((error, response) => {
                response.should.have.status(200);
                response.body.should.have.property('data');
                response.body.data.should.be.an('array');
                response.body.data.length.should.be.gte(0);
                const bookingData = response.body.data;
                let bookingFlag = false;

                bookingData.forEach((booking) => {
                    if (booking.id === bookingId) {
                        bookingFlag = true;
                    }
                });

                bookingFlag.should.eq(true);

                done();
            });
    });

    it('Deletes a booking', (done) => {
        request.delete(`/booking/${bookingId}`)
            .set('Authorization', `Bearer ${tokenUser}`)
            .end((error, response) => {
                response.should.have.status(200);
                done();
            });
    });

    it('Deletes a room', (done) => {
        request.delete(`/room/${roomId}`)
            .set(HEADER_AUTH, `${HEADER_AUTH_BEARER}${tokenAdmin}`)
            .end((error, response) => {
                response.should.have.status(200);
                done();
            });
    });

    it('Deletes a room type', (done) => {
        request.delete(`/room_type/${roomTypeId}`)
            .set(HEADER_AUTH, `${HEADER_AUTH_BEARER}${tokenAdmin}`)
            .end((error, response) => {
                response.should.have.status(200);
                done();
            });
    });


    it('Deletes the test user', (done) => {
        request.delete(`/user`)
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send({
                "id": userId
            })
            .end((error, response) => {
                response.should.have.status(200);
                done();
            });
    });

});

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}