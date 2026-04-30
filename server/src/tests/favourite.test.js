import request from 'supertest'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import app from '../../index.js'
import UserProfile from '../models/UserProfile.js'
import UserAccount from '../models/UserAccount.js'
import FundraisingActivity from '../models/FundraisingActivity.js'
import FRACategory from '../models/FRACategory.js'

let doneeAgent
let doneeUserId
let doneeProfileId
let fraId
let educationCategoryId

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI)
  doneeAgent = request.agent(app)

  await mongoose.connection.collection('useraccounts').deleteMany({ email: 'doneefav@test.com' })
  await mongoose.connection.collection('userprofiles').deleteMany({ profileName: 'Donee Fav Test Profile' })
  await mongoose.connection.collection('fracategories').deleteMany({ name: 'Education_Fav' })

  const educationCategory = await FRACategory.create({ name: 'Education_Fav', isActive: true })
  educationCategoryId = educationCategory._id

  const doneeProfile = await UserProfile.create({
    profileName: 'Donee Fav Test Profile',
    description: 'For favourite testing',
    permissions: ['donating'],
    isActive: true
  })
  doneeProfileId = doneeProfile._id.toString()

  const hashedPassword = await bcrypt.hash('Abc.1234', 10)
  const doneeUser = await UserAccount.create({
    username: 'doneefavuser',
    email: 'doneefav@test.com',
    password: hashedPassword,
    userProfile: doneeProfileId,
    isActive: true
  })
  doneeUserId = doneeUser._id.toString()

  const fra = await FundraisingActivity.create({
    title: 'Test FRA for Favourites',
    description: 'FRA for favourite testing',
    targetAmount: 5000,
    category: educationCategoryId,
    status: 'active',
    createdBy: doneeUserId
  })
  fraId = fra._id.toString()

  await doneeAgent.post('/api/auth/login').send({ username: 'doneefavuser', password: 'Abc.1234' })
}, 30000)

afterAll(async () => {
  await mongoose.connection.collection('useraccounts').deleteMany({ email: 'doneefav@test.com' })
  await mongoose.connection.collection('userprofiles').deleteMany({ profileName: 'Donee Fav Test Profile' })
  await mongoose.connection.collection('fundraisingactivities').deleteMany({ title: 'Test FRA for Favourites' })
  await mongoose.connection.collection('favourites').deleteMany({ donee: new mongoose.Types.ObjectId(doneeUserId) })
  await mongoose.connection.collection('fracategories').deleteMany({ name: 'Education_Fav' })
  await mongoose.connection.close()
}, 30000)

describe('TC-22: Save FRA to Favourites', () => {
  it('TC22-1: should save an FRA to favourites successfully', async () => {
    const res = await doneeAgent.post(`/api/favourites/${fraId}`)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.message).toBe('FRA saved to favourites')
  })

  it('TC22-2: should fail when FRA is already in favourites', async () => {
    const res = await doneeAgent.post(`/api/favourites/${fraId}`)

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe('FRA already in favourites')
  })

  it('TC22-3: should fail for invalid FRA ID', async () => {
    const res = await doneeAgent.post('/api/favourites/invalidid123')

    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe('FRA not found')
  })

  it('TC22-4: should fail when not authenticated', async () => {
    const res = await request(app).post(`/api/favourites/${fraId}`)

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })
})

describe('TC-23: View Favourite List', () => {
  it('TC23-1: should return the donee favourite list', async () => {
    const res = await doneeAgent.get('/api/favourites')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBeGreaterThan(0)
  })

  it('TC23-2: should fail when not authenticated', async () => {
    const res = await request(app).get('/api/favourites')

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })
})

describe('TC-24: Search Favourite List', () => {
  it('TC24-1: should return results for a matching query', async () => {
    const res = await doneeAgent.get('/api/favourites/search?query=Test FRA')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBeGreaterThan(0)
  })

  it('TC24-2: should return empty array for non-matching query', async () => {
    const res = await doneeAgent.get('/api/favourites/search?query=zzznomatchxxx')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.length).toBe(0)
  })

  it('TC24-3: should return all favourites when query is empty', async () => {
    const res = await doneeAgent.get('/api/favourites/search?query=')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
  })
})