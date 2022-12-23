import React, { useRef, useState } from "react";
import BarLoader from "react-spinners/BarLoader";

function Scrape() {
  const baseRef = useRef(null);
  const homeRef = useRef(null);
  let [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    setLoading(true);
    e.preventDefault();
    let data = {
      base_url: baseRef.current.value,
      home_url: homeRef.current.value,
    };
    fetch("http://localhost:5000/scrape", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        response.json();
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleEmbed = (e) => {
    setLoading(true);
    e.preventDefault();
    
    fetch("http://localhost:5000/Embed", {
        method: "GET",
      })
        .then((response) => {
          response.json();
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    };

  
  return (
    <>
      <div className="w-80">
        <label
          for="first_name"
          class="block mb-2 text-sm font-bold text-gray-900 dark:text-white "
        >
          Base Url
        </label>
        <input
          ref={baseRef}
          type="text"
          id="first_name"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Url"
          required
        />
      </div>
      <div className="m-4 w-80">
        <label
          for="last_name"
          class="block mb-2 text-sm font-bold text-gray-900 dark:text-white"
        >
          Home Url
        </label>
        <input
          ref={homeRef}
          type="text"
          id="last_name"
          class=" bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Url"
          required
        />
      </div>
      <div className="flex">
        <button
          onClick={handleSubmit}
          type="submit"
          class="mr-2 text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
        >
          Scrape
        </button>
        <button
          onClick={handleEmbed}
          type="submit"
          class="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
        >
          Embed
        </button>
      </div>

      <div className="flex justify-center m-4">
        <BarLoader
          height={4}
          width={150}
          color="#36d7b7"
          loading={loading}
          speedMultiplier={0.5}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
    </>
  );
}

export default Scrape;
