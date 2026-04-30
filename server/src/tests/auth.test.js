import request from 'supertest'
import mongoose from 'mongoose'
import app from '../../index.js'
import UserProfile from '../models/UserProfile.js'
import UserAccount from '../models/UserAccount.js'
import bcrypt from 'bcrypt'

let userId
let userProfileId
let agent

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI)
  agent = request.agent(app)

  await mongoose.connection.collection('useraccounts').deleteMany({ email: 'auth@test.com' })
  await mongoose.connection.collection('userprofiles').deleteMany({ profileName: 'Auth Test Profile' })

  const profile = await UserProfile.create({
    profileName: 'Auth Test Profile',
    description: 'For auth testing',
    permissions: ['user_management'],
    isActive: true
  })
  userProfileId = profile._id.toString()

  const hashedPassword = await bcrypt.hash('Abc.1234', 10)
  const user = await UserAccount.create({
    username: 'authuser',
    email: 'auth@test.com',
    password: hashedPassword,
    userProfile: userProfileId,
    isActive: true
  })
  userId = user._id.toString()

  await agent
    .post('/api/auth/login')
    .send({ username: 'authuser', password: 'Abc.1234' })
}, 30000)

afterAll(async () => {
  await mongoose.connection.collection('useraccounts').deleteMany({ email: 'auth@test.com' })
  await mongoose.connection.collection('userprofiles').deleteMany({ profileName: 'Auth Test Profile' })
  await mongoose.connection.close()
}, 30000)

describe('TC-11: User Login', () => {
  it('TC11-1: should login successfully with valid credentials', async () => {
    const res = await agent
      .post('/api/auth/login')
      .send({
        username: 'authuser',
        password: 'Abc.1234'
      })

    expect(res.status).toBe(200)
    expect(res.body._id).toBeDefined()
    expect(res.body.username).toBe('authuser')
  })

  it('TC11-2: should fail login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'authuser',
        password: 'WrongPass123!'
      })

    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Invalid credentials')
  })

  it('TC11-3: should fail login with non-existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'nouser',
        password: 'Abc.1234'
      })

    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Invalid credentials')
  })

  it('TC11-4: should fail login if account is suspended', async () => {
    await agent.patch(`/api/users-account/${userId}/suspend`)

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'authuser',
        password: 'Abc.1234'
      })

    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Account is suspended')
  })
})

describe('TC-12: User Logout', () => {
  beforeAll(async () => {
    await UserAccount.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { isActive: true }
    )

    await agent
      .post('/api/auth/login')
      .send({ username: 'authuser', password: 'Abc.1234' })
  })

  it('TC12-1: should logout successfully', async () => {
    const res = await agent.post('/api/auth/logout')

    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Logged out successfully')
  })

  it('TC12-2: should not access protected route after logout', async () => {
    const res = await agent.get('/api/auth/me')

    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Not authenticated')
  })
})