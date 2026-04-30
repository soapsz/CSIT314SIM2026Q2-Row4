import request from 'supertest'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import app from '../../index.js'
import UserProfile from '../models/UserProfile.js'
import UserAccount from '../models/UserAccount.js'
import FundraisingActivity from '../models/FundraisingActivity.js'
import FRACategory from '../models/FRACategory.js'

let agent
let doneeAgent
let frUserId
let doneeUserId
let frProfileId
let doneeProfileId
let fraId
let educationCategoryId
let medicalCategoryId

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI)
  agent      = request.agent(app)
  doneeAgent = request.agent(app)

  await mongoose.connection.collection('useraccounts').deleteMany({
    email: { $in: ['fruser@test.com', 'doneeuser@test.com'] }
  })
  await mongoose.connection.collection('userprofiles').deleteMany({
    profileName: { $in: ['FR Test Profile', 'Donee Test Profile'] }
  })
  await mongoose.connection.collection('fracategories').deleteMany({
    name: { $in: ['Education_FRA', 'Medical_FRA'] }
  })

  const educationCategory = await FRACategory.create({ name: 'Education_FRA', isActive: true })
  educationCategoryId = educationCategory._id

  const medicalCategory = await FRACategory.create({ name: 'Medical_FRA', isActive: true })
  medicalCategoryId = medicalCategory._id

  const frProfile = await UserProfile.create({
    profileName: 'FR Test Profile',
    description: 'For FR testing',
    permissions: ['fundraising'],
    isActive: true
  })
  frProfileId = frProfile._id.toString()

  const doneeProfile = await UserProfile.create({
    profileName: 'Donee Test Profile',
    description: 'For donee testing',
    permissions: ['donating'],
    isActive: true
  })
  doneeProfileId = doneeProfile._id.toString()

  const hashedPassword = await bcrypt.hash('Abc.1234', 10)

  const frUser = await UserAccount.create({
    username: 'fruser',
    email: 'fruser@test.com',
    password: hashedPassword,
    userProfile: frProfileId,
    isActive: true
  })
  frUserId = frUser._id.toString()

  const doneeUser = await UserAccount.create({
    username: 'doneeuser',
    email: 'doneeuser@test.com',
    password: hashedPassword,
    userProfile: doneeProfileId,
    isActive: true
  })
  doneeUserId = doneeUser._id.toString()

  await agent.post('/api/auth/login').send({ username: 'fruser', password: 'Abc.1234' })
  await doneeAgent.post('/api/auth/login').send({ username: 'doneeuser', password: 'Abc.1234' })
}, 30000)

afterAll(async () => {
  await mongoose.connection.collection('useraccounts').deleteMany({
    email: { $in: ['fruser@test.com', 'doneeuser@test.com'] }
  })
  await mongoose.connection.collection('userprofiles').deleteMany({
    profileName: { $in: ['FR Test Profile', 'Donee Test Profile'] }
  })
  await mongoose.connection.collection('fundraisingactivities').deleteMany({
    createdBy: new mongoose.Types.ObjectId(frUserId)
  })
  await mongoose.connection.collection('fracategories').deleteMany({
    name: { $in: ['Education_FRA', 'Medical_FRA'] }
  })
  await mongoose.connection.collection('favourites').deleteMany({
    donee: new mongoose.Types.ObjectId(doneeUserId)
  })
  await mongoose.connection.close()
}, 30000)

describe('TC-13: Create FRA', () => {
  it('TC13-1: should create FRA successfully', async () => {
    const res = await agent
      .post('/api/fra')
      .send({
        title: 'Help Build a School',
        description: 'We need funds to build a school',
        targetAmount: 10000,
        category: educationCategoryId,
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.message).toBe('Fundraising activity successfully created')
    expect(res.body.data._id).toBeDefined()

    fraId = res.body.data._id
  })

  it('TC13-2: should fail when title is missing', async () => {
    const res = await agent
      .post('/api/fra')
      .send({ description: 'No title here', targetAmount: 5000 })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe('Title is required')
  })

  it('TC13-3: should fail when targetAmount is invalid', async () => {
    const res = await agent
      .post('/api/fra')
      .send({ title: 'Bad Amount', targetAmount: -100 })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe('Target amount must be greater than 0')
  })

  it('TC13-4: should fail when not authenticated', async () => {
    const res = await request(app)
      .post('/api/fra')
      .send({ title: 'Unauthenticated', targetAmount: 1000 })

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })
})

describe('TC-14: View my FRA', () => {
  it('TC14-1: should return all FRAs for the logged in FR', async () => {
    const res = await agent.get('/api/fra/mine')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBeGreaterThan(0)
  })

  it('TC14-2: should return FRA by valid ID', async () => {
    const res = await agent.get(`/api/fra/${fraId}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data._id).toBe(fraId)
  })

  it('TC14-3: should return 404 for invalid ID format', async () => {
    const res = await agent.get('/api/fra/invalidid123')

    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe('Fundraising activity not found')
  })

  it('TC14-4: should return 404 for non-existing FRA', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString()
    const res = await agent.get(`/api/fra/${fakeId}`)

    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe('Fundraising activity not found')
  })
})

describe('TC-15: Update FRA', () => {
  it('TC15-1: should update FRA successfully', async () => {
    const res = await agent
      .put(`/api/fra/${fraId}`)
      .send({
        title: 'Updated School Campaign',
        targetAmount: 15000,
        description: 'Updated description',
        category: educationCategoryId,
      })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.message).toBe('Fundraising activity successfully updated')
  })

  it('TC15-2: should fail for non-existing FRA', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString()
    const res = await agent
      .put(`/api/fra/${fakeId}`)
      .send({ title: 'Ghost Campaign', targetAmount: 1000 })

    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe('Fundraising activity not found')
  })
})

describe('TC-16: Suspend FRA', () => {
  it('TC16-1: should suspend FRA successfully', async () => {
    const res = await agent.patch(`/api/fra/${fraId}/suspend`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.message).toBe('Fundraising activity successfully suspended')
    expect(res.body.data.status).toBe('suspended')
  })

  it('TC16-2: should reactivate a suspended FRA', async () => {
    const res = await agent.patch(`/api/fra/${fraId}/suspend`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.status).toBe('active')
  })

  it('TC16-3: should fail for non-existing FRA', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString()
    const res = await agent.patch(`/api/fra/${fakeId}/suspend`)

    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe('Fundraising activity not found')
  })
})

describe('TC-17: Search my FRA', () => {
  it('TC17-1: should return results for valid search query', async () => {
    const res = await agent.get('/api/fra/search?query=School')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('TC17-2: should return 400 when query is empty', async () => {
    const res = await agent.get('/api/fra/search?query=')

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe('Search query is required')
  })
})

describe('TC-18: FR Login', () => {
  it('TC18-1: should login successfully with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'fruser', password: 'Abc.1234' })

    expect(res.status).toBe(200)
    expect(res.body.username).toBe('fruser')
  })

  it('TC18-2: should fail with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'fruser', password: 'WrongPass123!' })

    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Invalid credentials')
  })

  it('TC18-3: should fail with non-existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'ghostuser', password: 'Abc.1234' })

    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Invalid credentials')
  })
})

describe('TC-19: FR Logout', () => {
  it('TC19-1: should logout successfully', async () => {
    const tempAgent = request.agent(app)
    await tempAgent.post('/api/auth/login').send({ username: 'fruser', password: 'Abc.1234' })

    const res = await tempAgent.post('/api/auth/logout')
    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Logged out successfully')
  })

  it('TC19-2: should not access FRA after logout', async () => {
    const tempAgent = request.agent(app)
    await tempAgent.post('/api/auth/login').send({ username: 'fruser', password: 'Abc.1234' })
    await tempAgent.post('/api/auth/logout')

    const res = await tempAgent.get('/api/fra/mine')
    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })
})

describe('TC-27: View FRA view count', () => {
  it('TC27-1: should increment viewCount when donee views an FRA', async () => {
    const before = await agent.get(`/api/fra/${fraId}`)
    const viewsBefore = before.body.data.viewCount

    await doneeAgent.post(`/api/fra/${fraId}/view`)
    await doneeAgent.post(`/api/fra/${fraId}/view`)

    const after = await agent.get(`/api/fra/${fraId}`)
    expect(after.body.data.viewCount).toBeGreaterThan(viewsBefore)
  })
})

describe('TC-28: View FRA shortlist count', () => {
  it('TC28-1: should increment shortlistCount when donee favourites an FRA', async () => {
    const before = await agent.get(`/api/fra/${fraId}`)
    const shortlistBefore = before.body.data.shortlistCount

    await doneeAgent.post(`/api/favourites/${fraId}`)

    const after = await agent.get(`/api/fra/${fraId}`)
    expect(after.body.data.shortlistCount).toBeGreaterThan(shortlistBefore)
  })
})

describe('TC-29: Search completed FRA history', () => {
  beforeAll(async () => {
    await FundraisingActivity.create({
      title: 'Completed Medical Campaign',
      description: 'A completed campaign',
      targetAmount: 5000,
      category: medicalCategoryId,
      status: 'completed',
      createdBy: frUserId,
      completedAt: new Date('2024-06-01')
    })
  })

  it('TC29-1: should return completed FRAs', async () => {
    const res = await agent.get('/api/fra/completed')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.every(f => f.status === 'completed')).toBe(true)
  })

  it('TC29-2: should filter completed FRAs by category', async () => {
    const res = await agent.get(`/api/fra/completed?category=${medicalCategoryId}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.length).toBeGreaterThan(0)
  })

  it('TC29-3: should filter completed FRAs by date range', async () => {
    const res = await agent.get('/api/fra/completed?from=2024-01-01&to=2024-12-31')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.length).toBeGreaterThan(0)
  })
})

describe('TC-30: View completed FRA', () => {
  let completedFraId

  beforeAll(async () => {
    const fra = await FundraisingActivity.create({
      title: 'View Completed FRA Test',
      description: 'Testing view of completed FRA',
      targetAmount: 3000,
      category: educationCategoryId,
      status: 'completed',
      createdBy: frUserId,
      completedAt: new Date()
    })
    completedFraId = fra._id.toString()
  })

  it('TC30-1: should view a completed FRA successfully', async () => {
    const res = await agent.get(`/api/fra/${completedFraId}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.status).toBe('completed')
    expect(res.body.data._id).toBe(completedFraId)
  })
})