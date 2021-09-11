const express = require("express");
const axios = require("axios");
const cors = require("cors");

const port = process.env.PORT;
const KEY = process.env.API_KEY;

const MOVIE_API_BASE = "https://api.themoviedb.org/3/movie/";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/ping", (req, res) => {
    res.send("pong");
});

app.get("/api/list", async (req, res) => {
    const search = req.query.search;
    if (!search) {
        return errorResponse(res, 400, "Movie name cannot be empty");
    }

    let page = req.query.page;

    if (page && Number.isNaN(Number(page))) {
        return errorResponse(res, 400, "Invalid page number");
    }

    if (!page) page = 1;

    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/search/movie?api_key=${KEY}&language=en-US&page=${page}&include_adult=false&query=${search}`
        );

        return successResponse(res, response.data);
    } catch (err) {
        if (err.response) {
            return handleMovieDbError(res, err.response);
        }
    }
});

app.get("/api/list/popular", async (req, res) => {
    let page = req.query.page;

    if (page && Number.isNaN(Number(page))) {
        return errorResponse(res, 400, "Invalid page number");
    }

    if (!page) page = 1;

    try {
        const response = await axios.get(
            `${MOVIE_API_BASE}popular?api_key=${KEY}&language=en-US&page=${page}`
        );

        return successResponse(res, response.data);
    } catch (err) {
        if (err.response) {
            return handleMovieDbError(res, err.response);
        }
    }
});

app.get("/api/info/:id", async (req, res) => {
    const movieId = req.params.id;
    if (!movieId) {
        return errorResponse(res, 400, "No movie id provided");
    }

    if (movieId && Number.isNaN(Number(movieId))) {
        return errorResponse(res, 400, "Invalid movie id");
    }

    try {
        const response = await axios.get(
            `${MOVIE_API_BASE}${movieId}?api_key=${KEY}&language=en-US`
        );

        return successResponse(res, response.data);
    } catch (err) {
        if (err.response) {
            return handleMovieDbError(res, err.response);
        }
    }
});

app.listen(port, () => {
    console.log("server started");
});

function successResponse(res, data) {
    res.send({ status: "SUCCESS", msg: "", data });
}

function errorResponse(res, code, msg) {
    res.status(code).send({ status: "FAILURE", msg });
}

function handleMovieDbError(res, errResponse) {
    const status = errResponse.status;
    if (errResponse.data.status_message) {
        return errorResponse(res, status, errResponse.data.status_message);
    } else if (errResponse.data.errors) {
        return errorResponse(res, status, errResponse.data.errors);
    } else {
        console.log(errResponse.data);
        return errorResponse(res, 500, "INTERNAL SERVER ERROR");
    }
}
