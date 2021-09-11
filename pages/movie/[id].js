import Image from "next/image";
import { useRouter } from "next/router";

import styles from "../../styles/Details.module.css";
import common from "../../styles/common.module.css";
import React from "react";
import axios from "axios";
import useSWR from "swr";
import { intervalToDuration } from "date-fns";

function fetcher(url) {
    return axios.get(url).then((res) => res.data.data);
}

export default function Movie() {
    const router = useRouter();

    const { data, error } = useSWR(
        router.query.id
            ? `http://localhost:3001/api/info/${router.query.id}`
            : null,
        fetcher
    );

    if (!data && !error) {
        return (
            <div className={common.container}>
                <div className={common.msg}>Loading</div>
            </div>
        );
    }

    if (error) {
        if (error?.response.data.msg) {
            return (
                <div className={common.container}>
                    <div className={common.msg}>{error?.response.data.msg}</div>
                </div>
            );
        }
        return (
            <div className={common.container}>
                <div className={common.msg}>Something went wrong</div>
            </div>
        );
    }

    const time = intervalToDuration({
        start: 0,
        end: data.runtime * 1000 * 60,
    });

    let timeString = "";
    for (let key in time) {
        if (time[key]) {
            timeString = timeString + ` ${time[key]} ${key}`;
        }
    }

    return (
        <div className={common.container}>
            <div className={styles.hero}>
                <Image
                    alt="hero"
                    height={"750px"}
                    width={"500px"}
                    src={`https://image.tmdb.org/t/p/w500${data.poster_path}`}
                />
                <div className={styles.star}>
                    <Image
                        alt="hero"
                        height={"16px"}
                        width={"16px"}
                        src={`/star.png`}
                    />
                    <span style={{ paddingLeft: 10 }}>{data.vote_average}</span>
                </div>
            </div>
            <div className={styles.tagContainer}>
                {data.genres.map((g) => (
                    <div className={styles.tag} key={g.name}>
                        {g.name}
                    </div>
                ))}
            </div>
            <div className={styles.section}>
                <div className={styles.sectionHeading}>
                    Language:
                    <span
                        style={{ textTransform: "uppercase", marginLeft: 10 }}
                    >
                        {data.original_language}
                    </span>
                </div>
            </div>
            <div className={styles.section}>
                <div className={styles.sectionHeading}>
                    Runtime:
                    <span style={{ marginLeft: 10 }}>{timeString}</span>
                </div>
            </div>
            <div className={styles.section}>
                <div className={styles.sectionHeading}>
                    Release Date:
                    <span
                        style={{ textTransform: "uppercase", marginLeft: 10 }}
                    >
                        {data.release_date}
                    </span>
                </div>
            </div>
            <div className={styles.section}>
                <div className={styles.sectionHeading}>Description</div>
                <div className={styles.sectionDescription}>{data.overview}</div>
            </div>
        </div>
    );
}
