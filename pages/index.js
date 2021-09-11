import Image from "next/image";
import router, { useRouter } from "next/router";

import styles from "../styles/Home.module.css";
import common from "../styles/common.module.css";
import React from "react";
import axios from "axios";
import useSWR from "swr";

function fetcher(url) {
    return axios.get(url).then((res) => res.data.data);
}

//https://www.educative.io/edpresso/how-to-use-the-debounce-function-in-javascript
function debounce(func, wait, immediate) {
    let timeout;

    return function executedFunction() {
        let context = this;
        let args = arguments;

        let later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };

        let callNow = immediate && !timeout;

        clearTimeout(timeout);

        timeout = setTimeout(later, wait);

        if (callNow) func.apply(context, args);
    };
}

export default function Home() {
    const router = useRouter();
    const { data, error } = useSWR(
        !router.isReady
            ? null
            : router.query.search
            ? `${process.env.NEXT_PUBLIC_MOVIE_API}list?page=${
                  router.query.page ? router.query.page : 1
              }&search=${router.query.search}`
            : `${process.env.NEXT_PUBLIC_MOVIE_API}list/popular?page=${
                  router.query.page ? router.query.page : 1
              }`,
        fetcher
    );

    const setSearchString = (searchString) => {
        router.replace({
            pathname: "/",
            search: searchString ? `?search=${searchString}&page=1` : "",
        });
    };

    const setPageIndex = (index) => {
        console.log(index);
        router.replace({
            pathname: "/",
            search: router.query.search
                ? `?search=${router.query.search}&page=${index}`
                : `?page=${index}`,
        });
    };

    const prev = () => {
        setPageIndex(router.query.page - 1);
    };

    const next = () => {
        setPageIndex(router.query.page ? Number(router.query.page) + 1 : 1);
    };

    let showLeft = false;
    let showRight = false;

    if (data) {
        if (data.page !== data.total_pages) {
            showRight = true;
        }
        if (data.page !== 1) {
            showLeft = true;
        }
    }

    return (
        <div className={styles.container}>
            <input
                defaultValue={router.query.search}
                placeholder={"Search"}
                className={styles.search}
                onChange={(e) => {
                    debounce(() => {
                        setSearchString(e.target.value);
                    }, 600)();
                }}
            />

            <div>
                <h3 className={common.heading}>
                    {router.query.search ? "Search" : "Popular"}
                </h3>
            </div>

            {!data && !error ? (
                <div className={styles.noData}>Loading</div>
            ) : !error ? (
                <>
                    <Nav
                        showLeft={showLeft}
                        showRight={showRight}
                        next={next}
                        prev={prev}
                    />
                    <div className={styles.movieContainer}>
                        {data.results.length > 0 ? (
                            data.results.map((movie) => {
                                return (
                                    <MovieCard
                                        id={movie.id}
                                        key={movie.id}
                                        original_title={movie.original_title}
                                        original_language={
                                            movie.original_language
                                        }
                                        vote_average={movie.vote_average}
                                        poster_path={movie.poster_path}
                                    />
                                );
                            })
                        ) : (
                            <div className={styles.noData}>No Data</div>
                        )}
                    </div>
                </>
            ) : error.response?.data?.msg ? (
                <div className={styles.noData}>{error.response?.data?.msg}</div>
            ) : (
                <div className={styles.noData}>Something went wrong</div>
            )}
        </div>
    );
}

function Nav({ prev, next, showLeft, showRight }) {
    return (
        <div className={styles.nav}>
            {showLeft && (
                <div onClick={prev} className={styles.navLeft}>
                    {"<"}
                </div>
            )}
            {showRight && (
                <div onClick={next} className={styles.navRight}>
                    {">"}
                </div>
            )}
        </div>
    );
}

function MovieCard({
    original_title,
    original_language,
    vote_average,
    poster_path,
    id,
}) {
    const router = useRouter();
    return (
        <div
            onClick={() => {
                router.push({ pathname: `/movie/${id}` });
            }}
            className={styles.movieCard}
            style={{
                backgroundImage: `url("https://image.tmdb.org/t/p/w500${poster_path}")`,
                backgroundSize: "cover",
            }}
        >
            <div className={styles.movieCardBody}>
                <div className={styles.movieName}>{original_title}</div>
                <div className={styles.starRating}>
                    <div style={{ height: 15, width: 15 }}>
                        <Image
                            className={styles.starImg}
                            height="15px"
                            width="15px "
                            alt="star"
                            src="/star.png"
                        />
                    </div>

                    <div className={styles.starRatingNumber}>
                        {vote_average}
                    </div>
                    <div
                        style={{ textTransform: "uppercase" }}
                        className={styles.starRatingNumber}
                    >
                        ({original_language})
                    </div>
                </div>
            </div>
        </div>
    );
}
