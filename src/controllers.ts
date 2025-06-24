import { sql } from "./config/db.js";
import TryCatch from "./TryCatch.js";
import {redisClient} from "./index.js"; 

export const getAllAlbum = TryCatch(async(req, res) => {
    let albums;
    const CACHE_EXPIRY = 1800;

    if(redisClient.isReady){
        albums = await redisClient.get("albums");
    }

    if(albums){
        console.log("Cache hit");
        res.json(JSON.parse(albums));
    } else {
        console.log("Cache miss");
        albums = await sql`SELECT * FROM albums`;
        
        if(redisClient.isReady){
            await redisClient.set("albums", JSON.stringify(albums), {
                EX: CACHE_EXPIRY,
            });
        }
         
        res.json(albums);
        return;
    }
});

export const getAllsongs = TryCatch(async(req, res) => {
    let songs;
    const CACHE_EXPIRY = 1800;

    if(redisClient.isReady){
        songs = await redisClient.get("songs");
    }

    if(songs){
        console.log("Cache hit");
        res.json(JSON.parse(songs));
    } else {
        console.log("Cache miss");
        songs = await sql`SELECT * FROM songs`;

        if(redisClient.isReady){
            await redisClient.set("songs", JSON.stringify(songs), {
                EX: CACHE_EXPIRY,
            });
        }
        res.json(songs);
        return;
    }
});

export const getAllSongsofAlbum = TryCatch(async(req,res) => {
    const {id} = req.params;
    const CACHE_EXPIRY = 1800;

    let album , songs;

    if(redisClient.isReady){
       const cachedData = await redisClient.get(`album_songs_${id}`);
       if(cachedData){
        console.log('cache hit');
        res.json(JSON.parse(cachedData));
        return;
       }
    }

    album = await sql`SELECT * FROM albums WHERE id = ${id}`;
    
    if(album.length === 0){
        res.status(404).json({
            message: "No album with this id",
        });
        return;
    }

    songs = await sql`SELECT * FROM songs WHERE album_id = ${id}`;

    const response = {songs, album: album[0]};

    if(redisClient.isReady){
       await redisClient.set(`album_songs_${req.params.id}`, JSON.stringify(response), {
        EX: CACHE_EXPIRY,
       });
    }
    console.log("Cache miss");
    res.json(response);
});

export const getSingleSong = TryCatch(async(req, res) => {
    const CACHE_EXPIRY = 1800;

    if(redisClient.isReady){
      const cachedData = await redisClient.get(`song_${req.params.id}`);
      if(cachedData){
        console.log("Cache hit");
        res.json(JSON.parse(cachedData));
        return;
      }
    }

    const result = await sql`SELECT * FROM songs where id = ${req.params.id}`;
    const song = result[0];

    if(!song){
        res.status(404).json({
            message: "song not found",
        });
        return;
    }

    if(redisClient.isReady){
        await redisClient.set(`song_${req.params.id}`, JSON.stringify(song), {
            EX: CACHE_EXPIRY,
        });
    }
    
    console.log("Cache miss")

    res.json(song);
});