import React, { useState, useEffect, useRef } from "react";
import HtmlReactParser from "html-react-parser";

function PodcastList() {
  const [podcasts, setPodcasts] = useState(null);
  const queryRef = useRef(null);
  const nRef = useRef(null);

  const fetchPodcasts = async () => {
    const query = queryRef.current.value;
    const topk = nRef.current.value;
    const response = await fetch(
      `http://localhost:5000/toppodcasts?query=${query}&n=${topk}`
    );
    const html = await response.text();
    setPodcasts(HtmlReactParser(html));
  };
  //   useEffect(() => {
  //     async function fetchPodcasts() {
  //       const query = queryRef.current.value;
  //       const topk = nRef.current.value;
  //       const response = await fetch(`http://localhost:5000/toppodcasts?query=${query}&n=${topk}`);
  //       const html = await response.text();
  //       setPodcasts(HtmlReactParser(html));
  //     }
  //     fetchPodcasts();
  //   }, []);

  return (
    <>
      <div className="mx-auto">
        <div class="flex items-center  mb-4">
        <label className="font-bold">What topic ?</label>

          <input
            ref={queryRef}
            type="text"
            class="w-36 p-2 rounded-md border-2 border-gray-400"
            placeholder="Search by topic"
          />
          <label className="font-bold">How many you want ?</label>
          <input
            ref={nRef}
            type="text"
            class="w-12 p-2 rounded-md border-2 border-gray-400"
            placeholder="N"
          />
          {/* <input type="text" class="w-12 p-2 rounded-md border-2 border-gray-400" placeholder="Search by tag" /> */}
          <button
            onClick={fetchPodcasts}
            class="mx-4 px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700 focus:outline-none focus:shadow-outline-blue active:bg-blue-800"
            type="button"
          >
            Search
          </button>
        </div>
      </div>
      <div class="podcast">{podcasts}</div>
    </>
  );
}

export default PodcastList;
