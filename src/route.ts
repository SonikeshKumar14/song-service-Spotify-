import express from 'express';
import { getAllAlbum, getAllsongs, getAllSongsofAlbum, getSingleSong } from './controllers.js';

const router = express.Router();

router.get("/album/all", getAllAlbum);
router.get("/song/all", getAllsongs);
router.get("/album/:id", getAllSongsofAlbum);
router.get("/song/:id", getSingleSong); 

export default router;