/**
 * WebServer for Project 2 (fixed version)
 * Handles:
 *   GET /user/list
 *   GET /user/:id
 *   GET /photosOfUser/:id
 */

import express from "express";
import models from "./modelData/photoApp.js";

const app = express();
const portno = 3001;

// Logging middleware
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Basic CORS (for browser testing)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();
    next();
});

// Helper: check if a user exists
function userExists(id) {
    try {
        return !!models.userModel(id);
    } catch {
        return false;
    }
}

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
});

// Start server with short keep-alive to prevent lingering sockets
const server = app.listen(portno, () => {
    console.log(`Listening at http://localhost:${portno}`);
});
server.keepAliveTimeout = 1;
server.headersTimeout = 5000;
