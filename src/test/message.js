require('dotenv').config()
const app = require('../server.js')
const mongoose = require('mongoose')
const chai = require('chai')
const chaiHttp = require('chai-http')
const assert = chai.assert

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

const ANOTHER_SAMPLE_OBJECT_ID = 'mmmmmmmmmmmm' // 12 byte string
const SAMPLE_OBJECT_ID = 'bbbbbbbbbbbb'

describe('Message API endpoints', () => {
    // Create a sample message for use in tests.
    beforeEach((done) => {
        // TODO: add any beforeEach code here
        const sampleMessage = new Message({
            title: 'Urgent News',
            body: 'This is extremely important',
            author: ANOTHER_SAMPLE_OBJECT_ID,
            _id: SAMPLE_OBJECT_ID
        })
        sampleMessage.save()
        .then(() => {
            done()
        })
    })
    
    // Delete sample message
    afterEach((done) => {
        // TODO: add any afterEach code here
        Message.deleteMany({ title: ['Urgent News', 'Some other title'] }) // do these titles even matter?
        .then(() => {
            done()
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
        // .get(`/messages/${SAMPLE_OBJECT_ID}`)
        .get(`/messages/${SAMPLE_OBJECT_ID}`)
        .end((err, res) => {
            if (err) { done(err) }
            expect(res).to.have.status(200)
            expect(res.body).to.be.an('object')
            expect(res.body.title).to.equal('Urgent News')
            expect(res.body.body).to.equal('This is extremely important')
            done()
        })
    })

    it('should post a new message', (done) => {
        // TODO: Complete this
        done()
    })

    it('should update a message', (done) => {
        // TODO: Complete this
        done()
    })

    it('should delete a message', (done) => {
        // TODO: Complete this
        done()
    })
})
