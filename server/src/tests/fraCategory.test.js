import request from 'supertest'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import app from '../../index.js'
import UserProfile from '../models/UserProfile.js'
import UserAccount from '../models/UserAccount.js'

let agent
let pmProfileId
let pmUserId
let categoryId

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI)
  agent = request.agent(app)

  const pmProfile = await UserProfile.create({
    profileName: 'PM Test Profile',
    description: 'For platform management testing',
    permissions: ['platform_management'],
    isActive: true
  })
  pmProfileId = pmProfile._id.toString()

  const hashedPassword = await bcrypt.hash('Abc.1234', 10)
  await UserAccount.create({
    username: 'pmuser',
    email: 'pmuser@test.com',
    password: hashedPassword,
    userProfile: pmProfileId,
    isActive: true
  })

  await agent.post('/api/auth/login').send({ username: 'pmuser', password: 'Abc.1234' })
}, 30000)

afterAll(async () => {
  await mongoose.connection.collection('useraccounts').deleteMany({ email: 'pmuser@test.com' })
  await mongoose.connection.collection('userprofiles').deleteMany({ profileName: 'PM Test Profile' })
  await mongoose.connection.collection('fracategories').deleteMany({ name: { $in: ['Category Education', 'Health', 'UpdatedCategory'] } })
  await mongoose.connection.close()
}, 30000)

describe('TC-33: Create FRA Category', () => {
  it('TC33-1: should create a category successfully', async () => {
    const res = await agent
      .post('/api/fra-categories')
      .send({ name: 'Category Education', description: 'Educational campaigns' })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.message).toBe('Category successfully created')
    expect(res.body.data._id).toBeDefined()

    categoryId = res.body.data._id
  })

  it('TC33-2: should fail when name is missing', async () => {
    const res = await agent
      .post('/api/fra-categories')
      .send({ description: 'No name here' })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe('Category name is required')
  })

  it('TC33-3: should fail when category name already exists', async () => {
    const res = await agent
      .post('/api/fra-categories')
      .send({ name: 'Category Education' })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe('Category name already exists')
  })

  it('TC33-4: should fail when not authenticated', async () => {
    const res = await request(app)
      .post('/api/fra-categories')
      .send({ name: 'Health' })

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })
})

describe('TC-34: View FRA Categories', () => {
  it('TC34-1: should return all categories', async () => {
    const res = await agent.get('/api/fra-categories')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBeGreaterThan(0)
  })

  it('TC34-2: should return a single category by valid ID', async () => {
    const res = await agent.get(`/api/fra-categories/${categoryId}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data._id).toBe(categoryId)
  })

  it('TC34-3: should return 404 for invalid ID', async () => {
    const res = await agent.get('/api/fra-categories/invalidid123')

    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe('Category not found')
  })
})

describe('TC-35: Update FRA Category', () => {
  it('TC35-1: should update a category successfully', async () => {
    const res = await agent
      .put(`/api/fra-categories/${categoryId}`)
      .send({ name: 'UpdatedCategory', description: 'Updated description' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.message).toBe('Category successfully updated')
  })

  it('TC35-2: should fail for non-existing category', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString()
    const res = await agent
      .put(`/api/fra-categories/${fakeId}`)
      .send({ name: 'Ghost' })

    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe('Category not found')
  })
})

describe('TC-36: Suspend FRA Category', () => {
  it('TC36-1: should suspend a category successfully', async () => {
    const res = await agent.patch(`/api/fra-categories/${categoryId}/suspend`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.message).toBe('Category successfully suspended')
    expect(res.body.data.isActive).toBe(false)
  })

  it('TC36-2: should reactivate a suspended category', async () => {
    const res = await agent.patch(`/api/fra-categories/${categoryId}/suspend`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.isActive).toBe(true)
  })

  it('TC36-3: should fail for non-existing category', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString()
    const res = await agent.patch(`/api/fra-categories/${fakeId}/suspend`)

    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe('Category not found')
  })
})

describe('TC-37: Search FRA Categories', () => {
  it('TC37-1: should return results for valid search query', async () => {
    const res = await agent.get('/api/fra-categories/search?query=Updated')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBeGreaterThan(0)
  })

  it('TC37-2: should return all categories when query is empty', async () => {
    const res = await agent.get('/api/fra-categories/search?query=')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('TC37-3: should return empty array for non-matching query', async () => {
    const res = await agent.get('/api/fra-categories/search?query=zzznomatchxxx')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.length).toBe(0)
  })
})