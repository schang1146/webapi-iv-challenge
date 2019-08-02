const express = require("express");
const User = require("./userDb.js");

const router = express.Router();

router.post("/", validateUser, (req, res) => {
    const userInfo = req.body;
    User.insert(userInfo).then(res.status(200).json({ userInfo }));
});

router.post("/:id/posts", validateUserId, validatePost, (req, res) => {
    try {
        const { id } = req.params;
    } catch (error) {
        res.status(500).json(error);
    }
});

router.get("/", async (req, res) => {
    try {
        const users = await User.get();

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json(error);
    }
});

router.get("/:id", validateUserId, (req, res) => {
    res.status(200).json(req.user);
});

router.get("/:id/posts", validateUserId, async (req, res) => {
    try {
        const { id } = req.params;
        const posts = await User.getUserPosts(id);

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json(error);
    }
});

router.delete("/:id", validateUserId, (req, res) => {
    const { id } = req.params;

    User.remove(id)
        .then(res.status(204).json({ message: `deleted user id: ${id}` }))
});

router.put("/:id", validateUserId, validateUser, (req, res) => {
    const { id } = req.params;
    const userInfo = req.body;
    
    User.update(id, userInfo)
        .then(res.status(202).json({ message: `updated user id: ${id}`}))
});

//custom middleware

async function validateUserId(req, res, next) {
    try {
        const { id } = req.params;

        const user = await User.getById(id);

        if (user) {
            req.user = user;
            next();
        } else {
            res.status(400).json({ message: "invalid user id" });
        }
    } catch (error) {
        res.status(500).json(error);
    }
}

async function validateUser(req, res, next) {
    try {
        if (req.body) {
            if (req.body.name) {
                next();
            } else {
                res.status(400).json({
                    message: "missing required name field"
                });
            }
        } else {
            res.status(400).json({ message: "missing user data" });
        }
    } catch (error) {
        res.status(500).json(error);
    }
}

function validatePost(req, res, next) {
    try {
        if (req.body) {
            if (req.body.text) {
                next();
            } else {
                res.status(400).json({
                    message: "missing required text field"
                });
            }
        } else {
            res.status(400).json({ message: "missing post data" });
        }
    } catch (error) {
        res.status(500).json(error);
    }
}

module.exports = router;
