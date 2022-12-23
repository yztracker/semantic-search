import { useRef, useState } from "react";
import BarLoader from "react-spinners/BarLoader";

function Upload({setText}) {
  const formRef = useRef();
  let [loading, setLoading] = useState(false);

  const handleSubmit = (event) => {
    setLoading(true);

    event.preventDefault();

    const formData = new FormData(formRef.current);

    fetch("http://localhost:5000/whisper", {
      method: "POST",
      body: formData,
    })
      .then((response) => 
        response.json()
      )
      .then((data) => {
        console.log("Success:", data);
        setLoading(false);
        setText(data.results[0].transcript)
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <div>
      <form ref={formRef} onSubmit={handleSubmit}>
        <label htmlFor="file">Choose a file:</label>
        <input type="file" id="file" name="file" />
        <button className="border-2" type="submit">
          Upload
        </button>
      </form>
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
    </div>
  );
}

export default Upload;
