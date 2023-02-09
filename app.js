const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDbObjectToResponseObject2 = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//Returns movie names
app.get("/movies/", async (request, response) => {
  const getMovies = `
    SELECT
      movie_name
    FROM
      movie;`;
  const movieNames = await db.all(getMovies);
  response.send(
    movieNames.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

//Add new movie
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addNewMovie = `
    INSERT INTO
      movie(director_id,movie_name,lead_actor)
    VALUES 
      ('${directorId}',
      '${movieName}',
      '${leadActor}');`;
  await db.run(addNewMovie);
  response.send("Movie Successfully Added");
});

//Returns movie based on movie_id

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovie = `
    SELECT
      *
    FROM
      movie
    WHERE 
      movie_id = ${movieId};`;
  const movie = await db.get(getMovie);
  response.send(convertDbObjectToResponseObject(movie));
});

//Updated details of movie
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieDetails = `
    UPDATE 
      movie 
    SET 
      director_id = '${directorId}',
      movie_name = '${movieName}',
      lead_actor = '${leadActor}'
    WHERE 
      movie_id = ${movieId};`;
  await db.run(updateMovieDetails);
  response.send("Movie Details Updated");
});

//delete movie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `
    DELETE FROM
      movie 
    WHERE 
      movie_id = '${movieId}';`;
  await db.run(deleteMovie);
  response.send("Movie Removed");
});

//list of all directors

app.get("/directors/", async (request, response) => {
  const getDirectorMovies = `
    SELECT
      *
    FROM
      director;`;
  const movieNames = await db.all(getDirectorMovies);
  response.send(
    movieNames.map((eachMovie) => convertDbObjectToResponseObject2(eachMovie))
  );
});

//list of movies of specific director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMov = `
    SELECT
      director_id,movie_name
    FROM
      movie
    WHERE 
      director_id = ${directorId};`;
  const directorMovieNames = await db.all(getDirectorMov);
  response.send(
    directorMovieNames.map((eachMovie) =>
      convertDbObjectToResponseObject(eachMovie)
    )
  );
});

module.exports = app;
