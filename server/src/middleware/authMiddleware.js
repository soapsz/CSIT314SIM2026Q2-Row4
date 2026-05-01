import UserRepository from '../repositories/UserAccountRepository.js'

export const requireAuth = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' })
  }
  const userAccount = await UserRepository.findById(req.session.userId)
  if (!userAccount) {
    return res.status(401).json({ success: false, message: 'User not found' })
  }
  req.userAccount = userAccount
  next()
}

export const requirePermission = (...permissions) => async (req, res, next) => {
  const profile = req.userAccount?.userProfile
  if (!profile) {
    return res.status(403).json({ success: false, message: 'No profile assigned' })
  }
  if (!profile.isActive) {
    return res.status(403).json({ success: false, message: 'Your profile has been deactivated' })
  }
  if (!permissions.some(p => profile.permissions.includes(p))) {
    return res.status(403).json({ success: false, message: 'Insufficient permissions' })
  }
  next()
}

export const me = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' })
    }
    const userAccount = await UserRepository.findById(req.session.userId)
    if (!userAccount) return res.status(401).json({ success: false, message: 'User not found' })
    res.json({
      success: true,
      data: {
        _id: userAccount._id,
        username: userAccount.username,
        email: userAccount.email,
        userProfile: userAccount.userProfile
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}