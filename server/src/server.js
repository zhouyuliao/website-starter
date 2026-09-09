import bcrypt from 'bcryptjs'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import jwt from 'jsonwebtoken'
import pg from 'pg'

const { Pool } = pg
const app = express()
const port = Number(process.env.PORT || 3001)
const jwtSecret = process.env.JWT_SECRET

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be set and contain at least 32 characters')
}

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'quote_app',
  user: process.env.DB_USER || 'quote_app',
  password: process.env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30_000,
})

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(helmet())
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }
    callback(new Error('Origin is not allowed'))
  },
}))
app.use(express.json({ limit: '32kb' }))

const schema = `
  CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    identity_id VARCHAR(32) NOT NULL,
    name VARCHAR(80) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    address VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`

function publicUser(user) {
  return {
    id: user.id,
    identityId: user.identity_id,
    name: user.name,
    phone: user.phone,
    address: user.address,
  }
}

function signUser(user) {
  return jwt.sign({ sub: String(user.id) }, jwtSecret, { expiresIn: '7d' })
}

function validateRegistration(body) {
  const identityId = String(body.identityId || '')
  const name = String(body.name || '').trim()
  const phone = String(body.phone || '').trim()
  const address = String(body.address || '').trim()
  const password = String(body.password || '')

  if (!['dealer', 'agent', 'supplier'].includes(identityId)) {
    return { error: '身份信息无效' }
  }
  if (!name || name.length > 80) return { error: '联系人姓名无效' }
  if (!/^1[3-9]\d{9}$/.test(phone)) return { error: '请输入正确的 11 位手机号码' }
  if (!address || address.length > 255) return { error: '搅拌站地址无效' }
  if (password.length < 8 || password.length > 72) return { error: '密码需要为 8-72 位' }

  return { value: { identityId, name, phone, address, password } }
}

function authRequired(req, res, next) {
  const header = req.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return res.status(401).json({ error: '请先登录' })

  try {
    const payload = jwt.verify(token, jwtSecret)
    req.userId = Number(payload.sub)
    return next()
  } catch {
    return res.status(401).json({ error: '登录已过期，请重新登录' })
  }
}

app.get('/healthz', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true, service: 'quote-assistant-api' })
  } catch {
    res.status(503).json({ ok: false, error: 'database_unavailable' })
  }
})

app.post('/api/auth/register', async (req, res, next) => {
  const result = validateRegistration(req.body || {})
  if (result.error) return res.status(400).json({ error: result.error })

  try {
    const passwordHash = await bcrypt.hash(result.value.password, 12)
    const { rows } = await pool.query(
      `INSERT INTO users (identity_id, name, phone, address, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, identity_id, name, phone, address`,
      [result.value.identityId, result.value.name, result.value.phone, result.value.address, passwordHash],
    )
    const user = rows[0]
    return res.status(201).json({ token: signUser(user), user: publicUser(user) })
  } catch (error) {
    if (error?.code === '23505') return res.status(409).json({ error: '该手机号已注册，请直接登录' })
    return next(error)
  }
})

app.post('/api/auth/login', async (req, res, next) => {
  const phone = String(req.body?.phone || '').trim()
  const password = String(req.body?.password || '')
  if (!/^1[3-9]\d{9}$/.test(phone) || !password) {
    return res.status(400).json({ error: '手机号或密码格式不正确' })
  }

  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE phone = $1', [phone])
    const user = rows[0]
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: '手机号或密码错误' })
    }
    return res.json({ token: signUser(user), user: publicUser(user) })
  } catch (error) {
    return next(error)
  }
})

app.get('/api/me', authRequired, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, identity_id, name, phone, address FROM users WHERE id = $1',
      [req.userId],
    )
    if (!rows[0]) return res.status(404).json({ error: '用户不存在' })
    return res.json({ user: publicUser(rows[0]) })
  } catch (error) {
    return next(error)
  }
})

app.put('/api/me', authRequired, async (req, res, next) => {
  const identityId = String(req.body?.identityId || '')
  const name = String(req.body?.name || '').trim()
  const address = String(req.body?.address || '').trim()
  if (!['dealer', 'agent', 'supplier'].includes(identityId) || !name || !address) {
    return res.status(400).json({ error: '资料信息不完整' })
  }

  try {
    const { rows } = await pool.query(
      `UPDATE users SET identity_id = $1, name = $2, address = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING id, identity_id, name, phone, address`,
      [identityId, name, address, req.userId],
    )
    if (!rows[0]) return res.status(404).json({ error: '用户不存在' })
    return res.json({ user: publicUser(rows[0]) })
  } catch (error) {
    return next(error)
  }
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ error: '服务器暂时不可用' })
})

async function start() {
  await pool.query(schema)
  app.listen(port, '0.0.0.0', () => {
    console.log(`quote-assistant-api listening on ${port}`)
  })
}

start().catch((error) => {
  console.error(error)
  process.exit(1)
})
