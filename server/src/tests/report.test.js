import request from 'supertest'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import app from '../../index.js'
import UserProfile from '../models/UserProfile.js'
import UserAccount from '../models/UserAccount.js'
import FundraisingActivity from '../models/FundraisingActivity.js'
import FRACategory from '../models/FRACategory.js'

let agent
let pmProfileId
let pmUserId
let educationCategoryId

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI)
  agent = request.agent(app)

  const educationCategory = await FRACategory.create({ name: 'Report Education', isActive: true })
  educationCategoryId = educationCategory._id

  const pmProfile = await UserProfile.create({
    profileName: 'PM Report Test Profile',
    description: 'For report testing',
    permissions: ['platform_management'],
    isActive: true
  })
  pmProfileId = pmProfile._id.toString()

  const hashedPassword = await bcrypt.hash('Abc.1234', 10)
  const pmUser = await UserAccount.create({
    username: 'pmreportuser',
    email: 'pmreport@test.com',
    password: hashedPassword,
    userProfile: pmProfileId,
    isActive: true
  })
  pmUserId = pmUser._id.toString()

  await FundraisingActivity.create({
    title: 'Report Test FRA',
    description: 'For report testing',
    targetAmount: 5000,
    category: educationCategoryId,
    status: 'active',
    createdBy: pmUserId
  })

  await agent.post('/api/auth/login').send({ username: 'pmreportuser', password: 'Abc.1234' })
}, 30000)

afterAll(async () => {
  await mongoose.connection.collection('useraccounts').deleteMany({ email: 'pmreport@test.com' })
  await mongoose.connection.collection('userprofiles').deleteMany({ profileName: 'PM Report Test Profile' })
  await mongoose.connection.collection('fundraisingactivities').deleteMany({ title: 'Report Test FRA' })
  await mongoose.connection.collection('fracategories').deleteMany({ name: 'Report Education' })
  await mongoose.connection.close()
}, 30000)

describe('TC-38: Generate Daily Report', () => {
  it('TC38-1: should generate daily report successfully', async () => {
    const res = await agent.get('/api/reports/daily')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('TC38-2: should fail when not authenticated', async () => {
    const res = await request(app).get('/api/reports/daily')

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })

  it('TC38-3: should fail without platform_management permission', async () => {
    const unauthorizedAgent = request.agent(app)
    const hashedPassword = await bcrypt.hash('Abc.1234', 10)
    const profile = await UserProfile.create({
      profileName: 'No PM Permission Profile',
      permissions: ['donating'],
      isActive: true
    })
    await UserAccount.create({
      username: 'nopermuser',
      email: 'noperm@test.com',
      password: hashedPassword,
      userProfile: profile._id,
      isActive: true
    })
    await unauthorizedAgent.post('/api/auth/login').send({ username: 'nopermuser', password: 'Abc.1234' })

    const res = await unauthorizedAgent.get('/api/reports/daily')
    expect(res.status).toBe(403)
    expect(res.body.success).toBe(false)

    await mongoose.connection.collection('useraccounts').deleteMany({ email: 'noperm@test.com' })
    await mongoose.connection.collection('userprofiles').deleteMany({ profileName: 'No PM Permission Profile' })
  })
})

describe('TC-39: Generate Weekly Report', () => {
  it('TC39-1: should generate weekly report successfully', async () => {
    const res = await agent.get('/api/reports/weekly')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('TC39-2: should fail when not authenticated', async () => {
    const res = await request(app).get('/api/reports/weekly')

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })
})

describe('TC-40: Generate Monthly Report', () => {
  it('TC40-1: should generate monthly report successfully', async () => {
    const res = await agent.get('/api/reports/monthly')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('TC40-2: should fail when not authenticated', async () => {
    const res = await request(app).get('/api/reports/monthly')

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })
})