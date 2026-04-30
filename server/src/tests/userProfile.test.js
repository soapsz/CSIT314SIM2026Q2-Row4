import request from 'supertest'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import app from '../../index.js'
import UserProfile from '../models/UserProfile.js'
import UserAccount from '../models/UserAccount.js'

let agent

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI)
  agent = request.agent(app)

  await mongoose.connection.collection('useraccounts').deleteMany({ email: 'profileadmin@test.com' })
  await mongoose.connection.collection('userprofiles').deleteMany({
    profileName: { $in: ['Test Profile', 'Test Profile Updated', 'Admin Profile For Tests'] }
  })

  const adminProfile = await UserProfile.create({
    profileName: 'Admin Profile For Tests',
    description: 'Seed admin profile',
    permissions: ['user_management'],
    isActive: true
  })

  const hashedPassword = await bcrypt.hash('Abc.1234', 10)
  await UserAccount.create({
    username: 'profileadmin',
    email: 'profileadmin@test.com',
    password: hashedPassword,
    userProfile: adminProfile._id,
    isActive: true
  })

  await agent
    .post('/api/auth/login')
    .send({ username: 'profileadmin', password: 'Abc.1234' })
}, 30000)

afterAll(async () => {
  await mongoose.connection.collection('useraccounts').deleteMany({ email: 'profileadmin@test.com' })
  await mongoose.connection.collection('userprofiles').deleteMany({
    profileName: { $in: ['Test Profile', 'Test Profile Updated', 'Admin Profile For Tests'] }
  })
  await mongoose.connection.close()
}, 30000)

describe('User Profile API', () => {
  let userProfileId

  describe('TC-01: Create user profile', () => {
    it('TC01-1: should create a user profile successfully', async () => {
      const res = await agent
        .post('/api/user-profiles')
        .send({
          profileName: 'Test Profile',
          description: 'Test Description',
          permissions: ['fundraising']
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('User Profile successfully created')

      userProfileId = res.body.data._id
    })

    it('TC01-2: should not create a user profile with duplicate profile name', async () => {
      const res = await agent
        .post('/api/user-profiles')
        .send({
          profileName: 'Test Profile',
          description: 'Test Description',
          permissions: ['fundraising']
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toBe('Profile name already exists')
    })

    it('TC01-3: should not create a user profile with empty profile name', async () => {
      const res = await agent
        .post('/api/user-profiles')
        .send({
          profileName: '',
          description: 'Test Description',
          permissions: ['fundraising']
        })

      expect(res.status).toBe(500)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toBe('Profile name is required')
    })
  })

  describe('TC-02: View user profile', () => {
    it('TC02-1: should display user profile details for a valid ID', async () => {
      const res = await agent.get(`/api/user-profiles/${userProfileId}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data._id).toBe(userProfileId)
    })

    it('TC02-2: should return not found for an invalid ID', async () => {
      const res = await agent.get('/api/user-profiles/0000abdef12345')

      expect(res.status).toBe(404)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toBe('User Profile ID not found')
    })
  })

  describe('TC-03: Update user profile', () => {
    it('TC03-1: should update a user profile successfully', async () => {
      const res = await agent
        .put(`/api/user-profiles/${userProfileId}`)
        .send({
          profileName: 'Test Profile Updated',
          description: 'Updated Description',
          permissions: ['donating']
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('User Profile successfully updated')
    })

    it('TC03-2: should fail to update when user profile is not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString()

      const res = await agent
        .put(`/api/user-profiles/${fakeId}`)
        .send({
          profileName: 'Test Profile Updated',
          description: 'Updated Description',
          permissions: ['donating']
        })

      expect(res.status).toBe(404)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toBe('User Profile was not found')
    })
  })

  describe('TC-04: Suspend user profile', () => {
    it('TC04-1: should suspend a user profile successfully', async () => {
      const res = await agent.patch(`/api/user-profiles/${userProfileId}/suspend`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('User Profile successfully suspended')
      expect(res.body.data.isActive).toBe(false)
    })

    it('TC04-2: should fail to suspend when user profile is not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString()

      const res = await agent.patch(`/api/user-profiles/${fakeId}/suspend`)

      expect(res.status).toBe(404)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toBe('User Profile was not found')
    })
  })

  describe('TC-05: Search user profiles', () => {
    it('TC05-1: should return results for a valid search query', async () => {
      const res = await agent.get('/api/user-profiles/search?query=Test')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
    })

    it('TC05-2: should return empty array for non-matching search query', async () => {
      const res = await agent.get('/api/user-profiles/search?query=zzznomatchxxx')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.length).toBe(0)
    })
  })
})