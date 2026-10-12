const express = require("express")
const cors = require("cors")
const path = require("path")
require("dotenv").config({ path: path.resolve(__dirname, "../.env") })
const { clerkMiddleware, getAuth } = require("@clerk/express")

const app = express()
const port = process.env.PORT || 8080
const { Pool } = require("pg")

if (!process.env.CLERK_PUBLISHABLE_KEY && process.env.VITE_CLERK_PUBLISHABLE_KEY) {
    process.env.CLERK_PUBLISHABLE_KEY = process.env.VITE_CLERK_PUBLISHABLE_KEY
}

const isClerkConfigured = !!(
    process.env.CLERK_SECRET_KEY &&
    !process.env.CLERK_SECRET_KEY.includes("your_clerk_secret_key")
)

app.use(cors())
app.use(express.json())

if (isClerkConfigured) {
    app.use(clerkMiddleware())
}

const requireUser = (req, res, next) => {
    if (!isClerkConfigured) {
        req.userId = "dev_user"
        return next()
    }
    const auth = getAuth(req)
    if (!auth || !auth.userId) {
        return res.status(401).json({ error: "Unauthorized" })
    }
    req.userId = auth.userId
    next()
}

const pool = new Pool({
    host: process.env.POSTGRES_HOST || "localhost",
    port: process.env.POSTGRES_PORT || "5432",
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD
})

const setup = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notes (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL DEFAULT '',
                title TEXT NOT NULL,
                content TEXT NOT NULL DEFAULT '',
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            )
        `)
        await pool.query(`
            ALTER TABLE notes ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT ''
        `)
    } catch(e) {
        console.error("Database setup error:", e)
    }
}

setup()

app.get("/api/health", async (req, res) => {
    try {
        await pool.query("SELECT 1")
        res.status(200).json({
            status: "ok",
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            database: "connected"
        })
    } catch (e) {
        res.status(503).json({
            status: "error",
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            database: "disconnected",
            error: e.message
        })
    }
})

app.get("/health", (req, res) => res.redirect("/api/health"))

app.get("/api/notes", requireUser, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM notes WHERE user_id = $1 ORDER BY updated_at DESC`,
            [req.userId]
        )
        res.status(200).json(result.rows)
    } catch(e) {
        console.error(e)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.get("/api/notes/:id", requireUser, async (req, res) => {
    const { id } = req.params
    try {
        const result = await pool.query(
            `SELECT * FROM notes WHERE id = $1 AND user_id = $2`,
            [id, req.userId]
        )
        if (!result.rows[0]) {
            return res.status(404).json({ error: "Note not found" })
        }
        res.status(200).json(result.rows[0])
    } catch(e) {
        console.error(e)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.post("/api/notes", requireUser, async (req, res) => {
    const { title = "Untitled", content = "" } = req.body || {}
    try {
        const result = await pool.query(
            `INSERT INTO notes (title, content, user_id) VALUES ($1, $2, $3) RETURNING *`,
            [title, content, req.userId]
        )
        res.status(201).json(result.rows[0])
    } catch(e) {
        console.error(e)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.put("/api/notes/:id", requireUser, async (req, res) => {
    const {title, content} = req.body
    const {id} = req.params
    try {
        const result = await pool.query(
            `UPDATE notes SET title = $1, content = $2, updated_at = NOW() WHERE id = $3 AND user_id = $4 RETURNING *`,
            [title, content, id, req.userId]
        )
        if (!result.rows[0]) {
            return res.status(404).json({ error: "Note not found" })
        }
        res.status(200).json(result.rows[0])
    } catch(e) {
        console.error(e)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.delete("/api/notes/:id", requireUser, async (req, res) => {
    const {id} = req.params
    try {
        const result = await pool.query(
            `DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING *`,
            [id, req.userId]
        )
        if (!result.rows[0]) {
            return res.status(404).json({ error: "Note not found" })
        }
        res.status(200).json(result.rows[0])
    } catch(e) {
        console.error(e)
        res.status(500).json({ error: "Internal server error" })
    }
})

const distPath = path.resolve(__dirname, "../frontend/dist")
app.use(express.static(distPath))

app.use((req, res, next) => {
    if (req.path.startsWith("/api")) return next()
    res.sendFile(path.join(distPath, "index.html"), (err) => {
        if (err) next()
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})