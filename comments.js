// Create web server
const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Object to store comments
const commentsByPostId = {};

// Route handler for GET requests to /posts/:id/comments
app.get('/posts/:id/comments', (req, res) => {
    res.send(commentsByPostId[req.params.id] || []);
});

// Route handler for POST requests to /posts/:id/comments
app.post('/posts/:id/comments', async (req, res) => {
    // Generate a random ID for the comment
    const commentId = randomBytes(4).toString('hex');

    // Get the comment data from the request body
    const { content } = req.body;

    // Get the array of comments for the current post
    const comments = commentsByPostId[req.params.id] || [];

    // Push the new comment into the comments array
    comments.push({ id: commentId, content, status: 'pending' });

    // Update the comments object
    commentsByPostId[req.params.id] = comments;

    // Send a comment moderated event to the event bus
    await axios.post('http://localhost:4005/events', {
        type: 'CommentCreated',
        data: {
            id: commentId,
            content,
            postId: req.params.id,
            status: 'pending'
        }
    });

    // Respond to the client with the new comment
    res.status(201).send(comments);
});

// Route handler for POST requests to /events
app.post('/events', async (req, res) => {
    console.log('Received event:', req.body.type);

    // Get the event data from the request body
    const { type, data } = req.body;

    // Check if the event is a comment moderation event
    if (type === 'CommentModerated') {
        // Get the comment object
        const { postId, id, status, content } = data;

        // Get the comments array for the current post
        const comments = commentsByPostId[postId];

        // Get the comment object from the comments array
        const comment = comments.find(comment => {
            return comment.id === id;
        });

        //