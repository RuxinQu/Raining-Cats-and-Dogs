const router = require('express').Router();
const withAuth = require('../../utils/auth');
const { Pet } = require('../../models/index');
const { Storage } = require('@google-cloud/storage');
const generateUniqueId = require('generate-unique-id');
const Multer = require('multer');

require('dotenv').config();

const storage = new Storage({
    projectId: process.env.GCLOUD_PROJECT,
    credentials: {
        client_email: process.env.GCLOUD_CLIENT_EMAIL,
        private_key: process.env.GCLOUD_PRIVATE_KEY
    }
});

const multer = Multer({ storage: Multer.memoryStorage() });

const bucket = storage.bucket(process.env.GCS_BUCKET);

//get the add pet page
router.get('/', withAuth, (req, res) => {
    res.render('newpet', { login: req.isAuthenticated(), username: req.user.username });
});

//add a new pet and upload the picture to google cloud storage bucket
router.post('/', withAuth, multer.single('petImg'), async (req, res) => {
    const { name, type, breed } = req.body;
    const owner_id = req.user.id;
    const fileName = generateUniqueId() + '-' + req.file.originalname;
    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream();

    // error handler
    blobStream.on('error', (err) => {
        res.status(500).send({ message: err.message });
    });

    // once it's finished, grab the url and save it to the database
    blobStream.on('finish', () => {
        const petImg = `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${blob.name}`;
        Pet.create({
            name, type, breed, petImg, owner_id
        }).then(() => { res.redirect('/dashboard'); });
    });

    blobStream.end(req.file.buffer);
});

//pick up a pet from the hotel
router.get('/pickup/:id', withAuth, async (req, res) => {
    try {
        await Pet.update({
            hotel_id: null
        }, {
            where: { id: req.params.id }
        });
        res.redirect('/dashboard');
    }
    catch (err) {
        res.status(500).send({ message: err });
    }
});

module.exports = router;