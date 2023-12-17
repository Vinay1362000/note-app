const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');




// Route -1: Get all the notes: GET "/api/notes/fetchallnotes". login required.

router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {

        const notes = await Note.find({ user: req.user.id });
        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.")
    }
})

// Route -2: Adding the new notes: POST "/api/notes/addnotes". login required.

router.post('/addnotes', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be of atleast 5 characters. ').isLength({ min: 5 }),
],
    async (req, res) => {
        try {

            const { title, description, tag } = req.body;
            // If there are errors , return bad request and the errors...
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const note = new Note({
                title, description, tag, user: req.user.id


            })
            const savedNote = await note.save();
            res.json(savedNote)
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error.")
        }
    })


// Route -3: Updating an existing note: PUT "/api/notes/updatenotes". login required.

router.put('/updatenotes/:id', fetchuser, async (req, res) => {

    try {

        const { title, description, tag } = req.body;
        // Create a new note object

        const newNote = {};
        if (title) { newNote.title = title }
        if (description) { newNote.description = description }
        if (tag) { newNote.tag = tag }

        // Find the note to be updated and update it.
        let note = await Note.findById(req.params.id);
        if (!note) { res.status(404).send("Not found"); }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not allowed")
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.")
    }
})
// Route -4: Delete an existing note: DELETE "/api/notes/deletenotes". login required.

router.delete('/deletenotes/:id', fetchuser, async (req, res) => {

    try {

        // Find the note to be deleted and delete it.
        let note = await Note.findById(req.params.id);
        if (!note) { res.status(404).send("Not found"); }

        // Allow deletetion only if user own this note.
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not allowed")
        }

        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Note has been deleted.", note: note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.")
    }
})

module.exports = router;