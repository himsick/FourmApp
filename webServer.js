/**
 * WebServer for Project 2 (fixed version)
 * Handles:
 *   GET /user/list
 *   GET /user/:id
 *   GET /photosOfUser/:id
 */

import express from "express";
import session from "express-session";
import mongoose from 'mongoose';
import User from './schema/user.js';
import fs from 'fs';
import multer from 'multer';
import models from "./modelData/photoApp.js";

const app = express();
const portno = 3001;

// Connect to MongoDB (Project 3 DB)
mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1/project3");

// Parse JSON bodies
app.use(express.json());

// Simple logging
app.use((req, _res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
        next();
});

// Basic CORS (for browser testing) - allow credentials
app.use((req, res, next) => {
    const allowed = new Set(["http://localhost:3000", "http://localhost:5173"]);
    const origin = req.headers.origin;
    if (allowed.has(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") return res.status(200).end();
    next();
});

// Express-session middleware
app.use(
    session({
        secret: "photoapp-secret",
        resave: false,
        saveUninitialized: false,
    })
);

// Multer: process single file upload in memory
const processFormBody = multer({ storage: multer.memoryStorage() }).single('uploadedphoto');

// Helper: check if a user exists
function userExists(id) {
        try {
                return !!models.userModel(id);
        } catch {
                return false;
        }
}

// Paths that don't require login
const publicPaths = new Set(["/admin/login", "/admin/logout", "/user"]);

// Guard: reject all other requests if not logged in
app.use((req, res, next) => {
    if (publicPaths.has(req.path)) return next();
    if (!req.session || !req.session.user_id) {
        return res.status(401).send("Unauthorized");
    }
    return next();
});

// Admin: login (checks password against MongoDB User model)
app.post('/admin/login', async (req, res) => {
    try {
        const { login_name, password } = req.body || {};
        if (!login_name || !password) {
            return res.status(400).send('login_name and password are required.');
        }

        const user = await User.findOne({ login_name }).exec();
        if (!user || user.password !== password) {
            return res.status(400).send('Invalid login_name or password.');
        }

        req.session.user_id = user._id;

        return res.status(200).json({ _id: user._id, login_name: user.login_name, first_name: user.first_name, last_name: user.last_name });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).send('Internal server error');
    }
});

// Admin: logout
app.post('/admin/logout', (req, res) => {
    if (!req.session || !req.session.user_id) return res.status(400).send('Not logged in');
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send('Internal server error');
        }
        return res.status(200).send('Logged out');
    });
});

/** GET /user/list � returns list of users with limited info */
app.get("/user/list", (req, res) => {
    try {
        const users = models.userListModel() || [];
        const trimmed = users.map((u) => ({
            _id: u._id,
            first_name: u.first_name,
            last_name: u.last_name,
        }));
        res.status(200).json(trimmed);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});

/** GET /user/:id � returns user details or 400 on invalid ID */
app.get("/user/:id", (req, res) => {
    try {
        const { id } = req.params;
        const user = models.userModel(id);

        if (!user) {
            const body = "Not found";
            const len = Buffer.byteLength(body);
            res.writeHead(400, {
                "Content-Type": "text/plain",
                "Content-Length": String(len),
                "Connection": "close",
            });
            return res.end(body);
        }

        const sanitized = {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            location: user.location,
            description: user.description,
            occupation: user.occupation,
        };
        res.status(200).json(sanitized);
    } catch (err) {
        const body = "Not found";
        const len = Buffer.byteLength(body);
        res.writeHead(400, {
            "Content-Type": "text/plain",
            "Content-Length": String(len),
            "Connection": "close",
        });
        res.end(body);
    }
});

/**
 * POST /user
 * Register a new user.
 */
app.post('/user', async (req, res) => {
    try {
        const {
            login_name,
            password,
            first_name,
            last_name,
            location,
            description,
            occupation,
        } = req.body || {};

        if (!login_name || !login_name.trim()) return res.status(400).send('login_name is required.');
        if (!first_name || !first_name.trim()) return res.status(400).send('first_name is required.');
        if (!last_name || !last_name.trim()) return res.status(400).send('last_name is required.');
        if (!password || !password.trim()) return res.status(400).send('password is required.');

        const existing = await User.findOne({ login_name }).exec();
        if (existing) return res.status(400).send('That login_name already exists.');

        const user = new User({
            login_name,
            password,
            first_name,
            last_name,
            location: location || '',
            description: description || '',
            occupation: occupation || '',
        });

        const saved = await user.save();

        return res.status(200).json({ _id: saved._id, login_name: saved.login_name, first_name: saved.first_name, last_name: saved.last_name });
    } catch (err) {
        console.error('Error in POST /user:', err);
        return res.status(500).send('Internal server error');
    }
});

/** GET /photosOfUser/:id � returns user's photos or 400 on invalid ID */
app.get("/photosOfUser/:id", (req, res) => {
    try {
        const { id } = req.params;
        if (!userExists(id)) {
            const body = "Not found";
            const len = Buffer.byteLength(body);
            res.writeHead(400, {
                "Content-Type": "text/plain",
                "Content-Length": String(len),
                "Connection": "close",
            });
            return res.end(body);
        }

        const photos = models.photoOfUserModel(id) || [];
        const sanitizedPhotos = photos.map((p) => ({
            _id: p._id,
            date_time: p.date_time,
            file_name: p.file_name,
            user_id: p.user_id,
            comments: (p.comments || []).map((c) => ({
                _id: c._id,
                date_time: c.date_time,
                comment: c.comment,
                user: c.user
                    ? {
                        _id: c.user._id,
                        first_name: c.user.first_name,
                        last_name: c.user.last_name,
                    }
                    : undefined,
            })),
        }));

        res.status(200).json(sanitizedPhotos);
    } catch (err) {
        const body = "Not found";
        const len = Buffer.byteLength(body);
        res.writeHead(400, {
            "Content-Type": "text/plain",
            "Content-Length": String(len),
            "Connection": "close",
        });
        res.end(body);
    }

// Advanced feature: return all comments authored by a user with small photo info
app.get("/commentsOfUser/:id", (req, res) => {
    try {
        const userId = req.params.id;
        // Collect all comments authored by this user by scanning photos
        const photos = models.photoOfUserModel // just to reference module; we'll access via models.userListModel to get users
        // We don't have direct accessor for all photos; rebuild by iterating users and concatenating
        const users = models.userListModel() || [];
        const allPhotos = []
        users.forEach(u => {
            const arr = models.photoOfUserModel(u._id) || [];
            arr.forEach(p => allPhotos.push(p));
        });
        const result = [];
        allPhotos.forEach(photo => {
            (photo.comments || []).forEach(c => {
                if (c.user && c.user._id === userId) {
                    result.push({
                        _id: c._id,
                        comment: c.comment,
                        date_time: c.date_time,
                        photo: { _id: photo._id, user_id: photo.user_id, file_name: photo.file_name },
                    });
                }
            });
        });
        // sort by date_time ascending
        result.sort((a,b) => (new Date(a.date_time)) - (new Date(b.date_time)));
        res.status(200).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Advanced feature: counts for bubbles (photos per user and comments authored)
app.get("/counts", (req, res) => {
    try {
        const users = models.userListModel() || [];
        // Build photo counts quickly
        const counts = {};
        users.forEach(u => { counts[u._id] = { photoCount: 0, commentCount: 0 }; });
        users.forEach(u => {
            const photos = models.photoOfUserModel(u._id) || [];
            counts[u._id].photoCount = photos.length;
        });
        // For comments, walk all photos & increment based on comment.user._id
        const allPhotos = [];
        users.forEach(u => {
            const arr = models.photoOfUserModel(u._id) || [];
            arr.forEach(p => allPhotos.push(p));
        });
        allPhotos.forEach(photo => {
            (photo.comments || []).forEach(c => {
                if (c.user && c.user._id && counts[c.user._id]) {
                    counts[c.user._id].commentCount += 1;
                }
            });
        });
        res.status(200).json(counts);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * POST /commentsOfPhoto/:photo_id
 * Body: { comment: string }
 * Adds a comment to the in-memory photo model (modelData). This demo server
 * uses the in-memory models; the session stores model user IDs so we can
 * attach the corresponding user object to the comment.
 */
app.post('/commentsOfPhoto/:photo_id', async (req, res) => {
    const { photo_id } = req.params;
    const { comment } = req.body || {};

    if (!comment || !String(comment).trim()) {
        return res.status(400).send('Comment cannot be empty.');
    }

    if (!req.session || !req.session.user_id) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const users = models.userListModel() || [];
        let targetPhoto = null;
        // Find the photo across all users
        users.forEach((u) => {
            const photos = models.photoOfUserModel(u._id) || [];
            photos.forEach((p) => {
                if (p._id === photo_id) targetPhoto = p;
            });
        });

        if (!targetPhoto) {
            return res.status(400).send('Photo not found.');
        }

        // Try to resolve author from in-memory models first, then MongoDB User
        let author = null;
        try {
            author = models.userModel(req.session.user_id);
        } catch (e) {
            author = null;
        }

        if (!author) {
            try {
                const mongoUser = await User.findById(req.session.user_id).lean();
                if (mongoUser) {
                    author = { _id: String(mongoUser._id), first_name: mongoUser.first_name, last_name: mongoUser.last_name };
                }
            } catch (e) {
                // ignore
            }
        }

        // Ensure we always include a minimal user object to avoid frontend crashes
        const userForComment = author || { _id: String(req.session.user_id), first_name: 'Unknown', last_name: '' };

        const newComment = {
            _id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            comment: String(comment).trim(),
            date_time: new Date().toISOString(),
            user: { _id: userForComment._id, first_name: userForComment.first_name, last_name: userForComment.last_name },
        };

        if (!targetPhoto.comments) targetPhoto.comments = [];
        targetPhoto.comments.push(newComment);

        return res.status(200).json(newComment);
    } catch (err) {
        console.error('Error adding comment:', err);
        return res.status(500).send('Internal error');
    }
});

/**
 * POST /photos/new
 * Body: form-data with field 'uploadedphoto' (file)
 * Adds the saved file into ./images and appends a photo to the in-memory modelData
 */
app.post('/photos/new', (req, res) => {
    if (!req.session || !req.session.user_id) {
        return res.status(401).send('Unauthorized');
    }

    processFormBody(req, res, (err) => {
        if (err || !req.file) {
            console.error('processFormBody error:', err);
            return res.status(400).send('No file uploaded.');
        }

        const timestamp = new Date().valueOf();
        const filename = `U${String(timestamp)}${req.file.originalname}`;

        // Ensure images directory exists
        try {
            if (!fs.existsSync('./images')) {
                fs.mkdirSync('./images');
            }
        } catch (mkErr) {
            console.error('Error ensuring images directory:', mkErr);
        }

        fs.writeFile(`./images/${filename}`, req.file.buffer, (writeErr) => {
            if (writeErr) {
                console.error('Error writing file:', writeErr);
                return res.status(500).send('Error saving file.');
            }

            // Create a new photo object compatible with modelData
            const newPhoto = {
                _id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                date_time: new Date().toISOString(),
                file_name: filename,
                user_id: req.session.user_id,
            };

            try {
                if (typeof models.addPhoto === 'function') {
                    models.addPhoto(newPhoto);
                }
                return res.status(200).json(newPhoto);
            } catch (dbErr) {
                console.error('Error adding photo to modelData:', dbErr);
                return res.status(500).send('Error saving photo to server.');
            }
        });
    });
});
});

// Start server with short keep-alive to prevent lingering sockets
const server = app.listen(portno, () => {
    console.log(`Listening at http://localhost:${portno}`);
});
server.keepAliveTimeout = 1;
server.headersTimeout = 5000;
