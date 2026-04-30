import request from 'supertest'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import app from '../../index.js'
import UserProfile from '../models/UserProfile.js'
import UserAccount from '../models/UserAccount.js'

let userProfileId
let agent

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI)
  agent = request.agent(app)

  await mongoose.connection.collection('useraccounts').deleteMany({
    email: { $in: ['test00@gmail.com', 'test01@gmail.com', 'seedadmin@test.com'] }
  })
  await mongoose.connection.collection('userprofiles').deleteMany({
    profileName: 'Test Profile For Account'
  })

  const profile = await UserProfile.create({
    profileName: 'Test Profile For Account',
    description: 'Created for user account tests',
    permissions: ['user_management'],
    isActive: true
  })
  userProfileId = profile._id.toString()

  const hashedPassword = await bcrypt.hash('Abc.1234', 10)
  await UserAccount.create({
    username: 'seedadmin',
    email: 'seedadmin@test.com',
    password: hashedPassword,
    userProfile: userProfileId,
    isActive: true
  })

  await agent
    .post('/api/auth/login')
    .send({ username: 'seedadmin', password: 'Abc.1234' })
}, 30000)

afterAll(async () => {
  await mongoose.connection.collection('useraccounts').deleteMany({
    email: { $in: ['test00@gmail.com', 'test01@gmail.com', 'seedadmin@test.com'] }
  })
  await mongoose.connection.collection('userprofiles').deleteMany({
    profileName: 'Test Profile For Account'
  })
  await mongoose.connection.close()
}, 30000)

describe('User Account API', () => {
  let userId

  describe('TC-06: Create user account', () => {
    it('TC06-1: should create a user account successfully', async () => {
      const res = await agent
        .post('/api/users-account')
        .send({
          username: 'testuser00',
          email: 'test00@gmail.com',
          password: 'Abc.1234',
          phone: '12345678',
          address: '123 Test Street',
          dateOfBirth: '1990-01-01',
          userProfile: userProfileId
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('User Account successfully created')

      userId = res.body.data._id
    })

    it('TC06-2: should not create a user account with duplicate email', async () => {
      const res = await agent
        .post('/api/users-account')
        .send({
          username: 'testuser01',
          email: 'test00@gmail.com',
          password: 'Abc.1234',
          userProfile: userProfileId
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toBe('Email already exists')
    })
  })

  describe('TC-07: View user account', () => {
    it('TC07-1: should display user details for a valid ID', async () => {
      const res = await agent.get(`/api/users-account/${userId}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data._id).toBe(userId)
    })

    it('TC07-2: should return not found for an invalid ID', async () => {
      const res = await agent.get('/api/users-account/0000abdef12345')

      expect(res.status).toBe(404)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toBe('User ID not found')
    })
  })

  describe('TC-08: Update user account', () => {
    it('TC08-1: should update a user account successfully', async () => {
      const res = await agent
        .put(`/api/users-account/${userId}`)
        .send({
          username: 'testuser00updated',
          email: 'test00@gmail.com',
          phone: '87654321',
          address: '456 Updated Street',
          userProfile: userProfileId
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('User Account successfully updated')
    })

    it('TC08-2: should fail to update when user is not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString()

      const res = await agent
        .put(`/api/users-account/${fakeId}`)
        .send({
          username: 'testuser00updated',
          email: 'notfound@gm.com',
          userProfile: userProfileId
        })

      expect(res.status).toBe(404)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toBe('User account was not found')
    })
  })

  describe('TC-09: Suspend user account', () => {
    it('TC09-1: should suspend a user account successfully', async () => {
      const res = await agent.patch(`/api/users-account/${userId}/suspend`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('User Account successfully suspended')
      expect(res.body.data.isActive).toBe(false)
    })

    it('TC09-2: should fail to suspend when user is not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString()

      const res = await agent.patch(`/api/users-account/${fakeId}/suspend`)

      expect(res.status).toBe(404)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toBe('User account was not found')
    })
  })

  describe('TC-10: Search user accounts', () => {
    it('TC10-1: should return results for a valid search query', async () => {
      const res = await agent.get('/api/users-account/search?query=testuser')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
    })

    it('TC10-2: should return empty array for non-matching search query', async () => {
      const res = await agent.get('/api/users-account/search?query=zzznomatchxxx')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.length).toBe(0)
    })
  })
})