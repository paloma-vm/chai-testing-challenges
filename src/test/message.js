require('dotenv').config()
const app = require('../server.js')
const mongoose = require('mongoose')
const chai = require('chai')
const chaiHttp = require('chai-http')
const assert = chai.assert
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

const SAMPLE_MESSAGE_ID = 'mmmmmmmmmmmm' // 12 byte string
const SAMPLE_USER_ID = 'uuuuuuuuuuuu'

describe('Message API endpoints', () => {
    // Create a sample message for use in tests.
    beforeEach((done) => {
        // TODO: add any beforeEach code here
        const sampleUser = new User({
            username: 'myuser',
            password: 'mypassword',
            _id: new ObjectId(SAMPLE_USER_ID)  // changed to address hexidecimal (help from ChatGPT)
        })
        // sampleUser.save((err, savedUser) => { // is sampleUser the same as savedUser?
        sampleUser.save((err, savedUser) => {

            if (err) {
                return done(err)
            } 
            const sampleMessage = new Message({
                title: 'Urgent News',
                body: 'This is extremely important',
                author: savedUser, //  ? Schema says ObjectID, savedUser is object
                // author: SAMPLE_USER_ID,
                _id: SAMPLE_MESSAGE_ID
            })
            sampleMessage.save((err, savedMessage) => {
                if (err) {
                    return done(err)
                }
                // expect(savedMessage.body._id).to.equal('mmmmmmmmmmmm') 
                done()
            })
            
        })

    })
    
    // Delete sample message
    afterEach((done) => {
        // TODO: add any afterEach code here
        Message.deleteOne({ _id: SAMPLE_MESSAGE_ID }, (err) => {
            if (err) {
                return done(err)
            }
            User.deleteOne({ _id: SAMPLE_USER_ID }, (err) => {
                if (err) {
                    return done(err)
                }
                done()
            })
            
        })
           
    })


    it('should load all messages', (done) => {
        // TODO: Complete this
        chai.request(app)
        .get('/messages')
        .end((err, res) => {
            if (err) { done(err) }
            expect(res).to.have.status(200)
            expect(res.body.messages).to.be.an('array')
            done()
        })
    })

    it('should get one specific message', (done) => {
        // TODO: Complete this
        chai.request(app)
        .get(`/messages/${SAMPLE_MESSAGE_ID}`)
        .end((err, res) => {
            if (err) { done(err) }
            expect(res).to.have.status(200)
            expect(res.body).to.be.an('object')
            expect(res.body.title).to.equal('Urgent News')
            expect(res.body.body).to.equal('This is extremely important')
            done()
        })
    })
// I tried, but it is still not working.  I could change the route, but it was provided in the README as is
// so I was not sure if I should change it.
    it('should post a new message', (done) => {
        // TODO: Complete this
        chai.request(app)
        .post('/messages')
        .send({title: 'Some other title', body: 'Here is another message', author: SAMPLE_USER_ID})
        .end((err, res) => {
            if (err) { done(err) }
            expect(res.body.body).to.equal('Here is another message')
            // expect(res.body.message).to.have.property('title', 'Some other title')
            expect(res.body).to.have.property('title', 'Some other title')


            // check that message is actually inserted into database
            Message.findOne({title: 'Some other title'}).then(message => {
                expect(message).to.be.an('object')
                done()
            })
        })
    })

    it('should update a message', (done) => {
        // TODO: Complete this
        chai.request(app)
        .put(`/messages/${SAMPLE_MESSAGE_ID}`)
        .send({title: 'Urgent News'})
        .end((err, res) => {
            if (err) { done(err) }
            expect(res.body.message).to.be.an('object')
            expect(res.body.message).to.have.property('title', 'Urgent News')

            // check that message is actually inserted into database
            Message.findOne({title: 'Urgent News'}).then(message => {
                expect(message).to.be.an('object')
                done()
            })
        })
    })

    it('should delete a message', (done) => {
        // TODO: Complete this
        chai.request(app)
        .delete(`/messages/${SAMPLE_MESSAGE_ID}`)
        .end((err, res) => {
            if (err) { done(err) }
            expect(res.body.message).to.equal('The message has been successfully deleted.')
            expect(res.body._id).to.equal(SAMPLE_MESSAGE_ID)

            // check that message is actually deleted from database
            Message.findOne({title: 'Urgent News'}).then(message => {
                expect(message).to.equal(null)
                done()
            })
        })
    })
})
