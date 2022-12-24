import React from "react";
import Scrape from "../components/Scrape";
import Query from "../components/Query";
import styles from "../styles/Home.module.css";
function Episode() {
  return (
    <>
      <main className={styles.main}>
        <div className="container mx-auto flex flex-col items-center px-4 py-16 text-center md:py-8 md:px-10 lg:px-32 xl:max-w-3xl">
          <Scrape />
        </div>
      </main>
      <Query />
    </>
  );
}

export default Episode;
