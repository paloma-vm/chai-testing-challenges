require('dotenv').config()
const app = require('../server.js')
const mongoose = require('mongoose')
const chai = require('chai')
const chaiHttp = require('chai-http')
const { ObjectId } = require('mongodb'); // added this because the test was getting _id as hexidecimal (help from ChatGPT)

const User = require('../models/user.js')
const Message = require('../models/message.js')

chai.config.includeStack = true

const expect = chai.expect
const should = chai.should()
chai.use(chaiHttp)

/**
 * root level hooks
 */
after((done) => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {}
  mongoose.modelSchemas = {}
  mongoose.connection.close()
  done()
})

const SAMPLE_USER_ID = 'uuuuuuuuuuuu' // 12 byte string

describe('User API endpoints', () => {
    // Create a sample user for use in tests.
    beforeEach((done) => {
        const sampleUser = new User({
            username: 'myuser',
            password: 'mypassword',
            _id:  new ObjectId(SAMPLE_USER_ID) // changed to address hexidecimal (help from ChatGPT)
        })
        sampleUser.save((err, savedUser) => {
            if (err) {
                return done(err)
            }
            // expect(savedUser.body._id).to.equal('uuuuuuuuuuuu')
            //expect(savedUser._id).to.equal('uuuuuuuuuuuu')

            console.log(`saved user:${savedUser}`)
            console.log(savedUser)
            done()
        })

    })

    // Delete sample user.
    afterEach((done) => {
        User.deleteMany({ username: ['myuser', 'anotheruser'] }, (err) => {
            if (err) {
                return done(err)
            }
            done()
        })
    })

    it('should load all users', (done) => {
        chai.request(app)
        .get('/users')
        .end((err, res) => {
            if (err) { done(err) }
            expect(res).to.have.status(200)
            expect(res.body.users).to.be.an("array")
            done()
        })
    })

    it('should get one user', (done) => {
        chai.request(app)
        .get(`/users/${SAMPLE_USER_ID}`)
        .end((err, res) => {
            if (err) { done(err) }
            expect(res).to.have.status(200)
            expect(res.body).to.be.an('object')
            expect(res.body.username).to.equal('myuser')
            expect(res.body.password).to.equal(undefined)
            done()
        })
    })

    it('should post a new user', (done) => {
        chai.request(app)
        .post('/users')
        .send({username: 'anotheruser', password: 'mypassword'})
        .end((err, res) => {
            if (err) { done(err) }
            expect(res.body.user).to.be.an('object')
            expect(res.body.user).to.have.property('username', 'anotheruser')

            // check that user is actually inserted into database
            User.findOne({username: 'anotheruser'}).then(user => {
                expect(user).to.be.an('object')
                done()
            })
        })
    })

    it('should update a user', (done) => {
        chai.request(app)
        .put(`/users/${SAMPLE_USER_ID}`)
        .send({username: 'anotheruser'})
        .end((err, res) => {
            if (err) { done(err) }
            expect(res.body.user).to.be.an('object')
            expect(res.body.user).to.have.property('username', 'anotheruser')

            // check that user is actually inserted into database
            User.findOne({username: 'anotheruser'}).then(user => {
                expect(user).to.be.an('object')
                done()
            })
        })
    })

    it('should delete a user', (done) => {
        chai.request(app)
        .delete(`/users/${SAMPLE_USER_ID}`)
        .end((err, res) => {
            if (err) { done(err) }
            expect(res.body.message).to.equal('Successfully deleted.')
            expect(res.body._id).to.equal(SAMPLE_USER_ID)

            // check that user is actually deleted from database
            User.findOne({username: 'myuser'}).then(user => {
                expect(user).to.equal(null)
                done()
            })
        })
    })
})
