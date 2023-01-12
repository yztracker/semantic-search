import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";

export default function Podcast() {
  const router = useRouter();
  const { pid } = router.query;
  const queryRef = useRef(null);
  const nRef = useRef(null);

  //podcast detail content
  const [podcast, setPodcast] = useState(null);
  const [isSearch, setIsSearch] = useState(false);

  //query recommend
  const [queryRecommend, setQueryRecommend] = useState(null);
  useEffect(() => {
    async function fetchPodcast() {
      const response = await fetch(`http://localhost:5000/podcast?pid=${pid}`);
      const data = await response.json();
      setPodcast(data);
    }

    async function fetchQuery() {
      const response = await fetch(`http://localhost:5000/queries?pid=${pid}`);
      const data = await response.json();
      setQueryRecommend(data);
    }

    fetchPodcast();
    fetchQuery();
  }, [pid]);

  //topsegments
  const [segment, setSegment] = useState(null);
  const [span, setSpan] = useState(null);
  const handleOnclick = async () => {
    const query = queryRef.current.value;
    const n = nRef.current.value;

    await fetch(
      `http://localhost:5000/topsegments?query=${query}&n=${n}&pid=${pid}`
    )
      .then((response) => response.json())
      .then((json) => {
        setSegment(json);

        let requestSpan = {
          query: query,
          n: parseInt(n),
          segment: json.top_segments[0][0],
        };
        fetch(`http://localhost:5000/topspans`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify( ),
        })
          .then((response) => response.json())
          .then((json) => {
            setSpan(json.top_spans);
          });
      });
  };

  //summarise
  const [activeSummary, setActiveSummary] = useState(null);

  const [summarise, setSummarise] = useState(null);
  let data = { text: "text to summarise" };

  const handleSummarise = async (segment) => {
    let requestData = { text: segment };
    await fetch("http://localhost:5000/summarise", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => response.json())
      .then((data) => {
        setSummarise(data);
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  // highlight
  const highlight = (segment) => {
    let highlightedText = segment;
    span.forEach((text) => {
        highlightedText = highlightedText.replace(new RegExp(text, "gi"), "<span class='highlighted'>" + text + "</span>");
    });
    return highlightedText;
};

  return (
    <div>
      <div className="flex justify-center m-4">
        <span className="flex items-center font-bold text-green-600 mx-4">
          Query Segment{" "}
        </span>
        <div class="flex items-center  ">
          <input
            ref={queryRef}
            type="text"
            class="w-36 p-2 rounded-md border-2 border-gray-400"
            placeholder="Query"
          />
          <input
            ref={nRef}
            type="text"
            class="w-12 p-2 rounded-md border-2 border-gray-400"
            placeholder="N"
          />
          {/* <input type="text" class="w-12 p-2 rounded-md border-2 border-gray-400" placeholder="Search by tag" /> */}
          <button
            onClick={handleOnclick}
            class="px-4 py-2 font-bold text-white bg-gray-500 rounded-sm hover:bg-gray-700 focus:outline-none focus:shadow-outline-gray active:bg-gray-800"
            type="button"
          >
            Search
          </button>
          {/* <button
            onClick={handleSummarise}
            class="mx-12 px-4 py-2 font-bold text-white bg-blue-500 rounded-sm hover:bg-blue-700 focus:outline-none focus:shadow-outline-blue active:bg-blue-800"
            type="button"
          >
            Summarise
          </button> */}
        </div>
      </div>
      <div className="mx-36">
        <p className="font-bold">Query recommend : </p>
        {queryRecommend &&
          queryRecommend.queries.map((item) => (
            <p className="text-green-700">{item}</p>
          ))}
      </div>

      <div className="mx-36">
        <p className="font-bold">Top span : </p>
        {span && span.map((item) => <p className="text-gray-600">{item}</p>)}
      </div>
      
      {/* <div className="w-1/2 mx-auto border border-gray-600 rounded-lg p-4">
        {summarise && <p>{summarise.summary}</p>}
        </div> */}

      <ul className="px-36 m-4">
        {segment &&
          segment.top_segments.map(([segment],i) => (
            <div className=" justify-between my-2" key={i}>
        <div className={`font-bold text-2xl ${span.some(item => segment.includes(item)) ? "text-yellow-600" : ""}`}>
                {segment}
            </div>
              <div
                className={`mt-4 w-1/2 mx-auto border border-gray-600 rounded-lg p-4 ${
                  activeSummary === segment ? "block" : "hidden"
                }`}
              >
                {summarise && <p>{summarise.summary}</p>}
              </div>
              <button
                onClick={() => {
                  handleSummarise(segment);
                  setActiveSummary(segment);
                }}
                className="h-12 opacity-50 border-2 border-gray-600 hover:bg-slate-700"
              >
                Summarice
              </button>
            </div>
          ))}
      </ul>

      <ul className="px-36">
        {segment &&
          podcast &&
          podcast.podcast.map((item, index) => {
            let highlightedText = item;
            segment.top_segments.map((segment, i) => {
              highlightedText = highlightedText.replace(
                new RegExp(segment[0], "gi"),
                "<span class='highlighted'>" + segment[0] + "</span>"
              );
            });
            return (
              <li className="text-lg" key={index}>
                <p dangerouslySetInnerHTML={{ __html: highlightedText }} />
              </li>
            );
          })}
      </ul>
    </div>
  );
}
