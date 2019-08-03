const express = require("express");
const Post = require("./postDb.js");

const router = express.Router();

router.post("/", validatePost, (req, res) => {
    Post.insert(req.postInfo)
        .then(posted => res.status(201).json(req.postInfo))
        .catch(error => res.status(500).json(error));
})

router.get("/", (req, res) => {
    Post.get()
        .then(posts => res.status(200).json(posts))
        .catch(error => res.status(500).json(error));
});

router.get("/:id", validatePostId, (req, res) => {
    res.status(200).json(req.post);
});

router.delete("/:id", validatePostId, (req, res) => {
    Post.remove(req.id)
        .then(deleted => res.status(204).json({ message: `deleted post id: ${req.id}`}))
        .catch(error => res.status(500).json(error));
});

router.put("/:id", validatePostId, validatePost, (req, res) => {
    Post.update(req.id, req.postInfo)
        .then(updated => res.status(202).json(req.postInfo))
        .catch(error => res.status(500).json(error));
});

// custom middleware

async function validatePost(req, res, next) {
    try {
        const postInfo = req.body;

        if (postInfo.text && postInfo.user_id) {
            req.postInfo = postInfo;
            next();
        } else if (postInfo.text) {
            res.status(400).json({ message: "missing user_id info" });
        } else if (postInfo.user_id) {
            res.status(400).json({ message: "missing text info" });
        } else {
            res.status(400).json({ message: "missing text and user_id info" });
        }
    } catch (error) {
        res.status(500).json(error);
    }
}

async function validatePostId(req, res, next) {
    try {
        const { id } = req.params;

        const post = await Post.getById(id);

        if (post) {
            req.id = id;
            req.post = post;
            next();
        } else {
            res.status(400).json({ message: "invalid post id" });
        }
    } catch (error) {
        res.status(500).json(error);
    }
}

module.exports = router;
