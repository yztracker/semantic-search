import React,{ useState, useRef } from "react";

function Query() {
  const searchRef = useRef(null);
  const [result, setResult] = useState([])
  console.log(result)
  const handleSearch = (e) => {
    e.preventDefault();
    let data = {
      query: searchRef.current.value,
    };
    fetch("http://localhost:5000/query", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => 
        response.json()
      )
      .then((data)=>{
        console.log(data);
        setResult(data)
      })
      .catch((error) => {
        console.error("Error:", error);
      });

  }
  return (
    <>
    <form className="max-w-3xl mx-auto">
      <label
        for="default-search"
        class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
      >
        Search
      </label>
      <div class="relative">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            aria-hidden="true"
            class="w-5 h-5 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
        <input
          ref={searchRef}
          type="search"
          id="default-search"
          class="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="What ideas are you interested in exploring?"
          required
        />
        <button
          onClick={handleSearch}
          type="submit"
          class="text-white absolute right-2.5 bottom-2.5 bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
        >
          Search
        </button>
      </div>
    </form>
    <div>
    <div className="flex justify-center items-center p-4 text-lg font-bold text-red-700">
            <span>Top 5 recommendations</span>
          </div>

      {result && result.map((article,index) => (
        <div key={article.id} className=" p-4 border-b border-gray-300">

          <div className="flex justify-center items-center p-4 text-lg font-bold text-green-700">
            <span>{index+1}.</span>
            <a href={article.url}>{article.title}</a>
          </div>
          <div className="flex justify-center items-center p-4 text-base text-gray-700">
            {article.text}
          </div>
        </div>
      ))}
    </div>

</>
    
  );
}

export default Query;
