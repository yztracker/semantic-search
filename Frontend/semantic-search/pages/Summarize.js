import React from "react";
import PodcastItem from '../components/PodcastItem'
import styles from "../styles/Home.module.css";

function Episode() {
  return (
    <>
      <main className={styles.main}>
        <div className="container mx-auto flex flex-col items-center px-4 py-16 text-center md:py-8 md:px-10 lg:px-32 xl:max-w-3xl">
          <PodcastItem />
        </div>
      </main>
    </>
  );
}

export default Episode;
