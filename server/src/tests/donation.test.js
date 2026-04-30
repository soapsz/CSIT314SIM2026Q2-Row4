import request from 'supertest'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import app from '../../index.js'
import UserProfile from '../models/UserProfile.js'
import UserAccount from '../models/UserAccount.js'
import FundraisingActivity from '../models/FundraisingActivity.js'
import Donation from '../models/Donation.js'
import FRACategory from '../models/FRACategory.js'

let doneeAgent
let doneeUserId
let doneeProfileId
let fraId
let healthCategoryId

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI)
  doneeAgent = request.agent(app)

  const healthCategory = await FRACategory.create({ name: 'Health', isActive: true })
  healthCategoryId = healthCategory._id

  const doneeProfile = await UserProfile.create({
    profileName: 'Donee Donation Test Profile',
    description: 'For donation testing',
    permissions: ['donating'],
    isActive: true
  })
  doneeProfileId = doneeProfile._id.toString()

  const hashedPassword = await bcrypt.hash('Abc.1234', 10)

  const doneeUser = await UserAccount.create({
    username: 'doneedonationuser',
    email: 'doneedonation@test.com',
    password: hashedPassword,
    userProfile: doneeProfileId,
    isActive: true
  })
  doneeUserId = doneeUser._id.toString()

  const fra = await FundraisingActivity.create({
    title: 'Test FRA for Donations',
    description: 'FRA for donation testing',
    targetAmount: 10000,
    category: healthCategoryId,
    status: 'active',
    createdBy: doneeUserId
  })
  fraId = fra._id.toString()

  await Donation.create({
    donee: doneeUserId,
    fra: fraId,
    amount: 100,
    category: healthCategoryId,
    donatedAt: new Date('2024-06-15')
  })

  await doneeAgent.post('/api/auth/login').send({ username: 'doneedonationuser', password: 'Abc.1234' })
}, 30000)

afterAll(async () => {
  await mongoose.connection.collection('useraccounts').deleteMany({ email: 'doneedonation@test.com' })
  await mongoose.connection.collection('userprofiles').deleteMany({ profileName: 'Donee Donation Test Profile' })
  await mongoose.connection.collection('fundraisingactivities').deleteMany({ title: 'Test FRA for Donations' })
  await mongoose.connection.collection('donations').deleteMany({ donee: new mongoose.Types.ObjectId(doneeUserId) })
  await mongoose.connection.collection('fracategories').deleteMany({ name: 'Health' })
  await mongoose.connection.close()
}, 30000)

describe('TC-31: Search Donation History', () => {
  it('TC31-1: should return all donation history for the donee', async () => {
    const res = await doneeAgent.get('/api/fra/donations')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBeGreaterThan(0)
  })

  it('TC31-2: should filter by category', async () => {
    const res = await doneeAgent.get(`/api/fra/donations?category=${healthCategoryId}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.length).toBeGreaterThan(0)
  })

  it('TC31-3: should filter by date range', async () => {
    const res = await doneeAgent.get('/api/fra/donations?from=2024-01-01&to=2024-12-31')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.length).toBeGreaterThan(0)
  })

  it('TC31-4: should return empty array for non-matching category', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString()
    const res = await doneeAgent.get(`/api/fra/donations?category=${fakeId}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.length).toBe(0)
  })

  it('TC31-5: should fail when not authenticated', async () => {
    const res = await request(app).get('/api/fra/donations')

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })
})

describe('TC-32: View FRA Progress', () => {
  it('TC32-1: should return FRA details and progress for valid ID', async () => {
    const res = await doneeAgent.get(`/api/fra/${fraId}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data._id).toBe(fraId)
    expect(res.body.data.totalRaised).toBeDefined()
  })

  it('TC32-2: should return 404 for invalid ID format', async () => {
    const res = await doneeAgent.get('/api/fra/invalidid123')

    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe('Fundraising activity not found')
  })

  it('TC32-3: should return 404 for non-existing FRA', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString()
    const res = await doneeAgent.get(`/api/fra/${fakeId}`)

    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe('Fundraising activity not found')
  })

  it('TC32-4: should fail when not authenticated', async () => {
    const res = await request(app).get(`/api/fra/${fraId}`)

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })
})