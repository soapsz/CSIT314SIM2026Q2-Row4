import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import session from 'express-session'

import userAccountRoutes from './src/routes/userAccountRoutes.js'
import userProfileRoutes from './src/routes/userProfileRoutes.js'
import authRoutes from './src/routes/authRoutes.js'
import fundraisingActivityRoutes from './src/routes/fundraisingActivityRoutes.js'
import fraCategoryRoutes from './src/routes/fraCategoryRoutes.js'
import favouriteRoutes from './src/routes/favouriteRoutes.js'
import reportRoutes from './src/routes/reportRoutes.js'

dotenv.config()

const app = express()

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true
  })
)

app.use(express.json())

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
      sameSite: 'lax'
    }
  })
)

app.get('/', (req, res) => res.send('API running'))

app.use('/api/users-account', userAccountRoutes)
app.use('/api/user-profiles', userProfileRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/fra', fundraisingActivityRoutes)
app.use('/api/fra-categories', fraCategoryRoutes)
app.use('/api/favourites', favouriteRoutes)
app.use('/api/reports', reportRoutes)

export default app