import React, { useState, useRef, useEffect } from "react";
import { Bars, CirclesWithBar, Audio, Puff, Dna } from "react-loader-spinner";
import { FaMicrophone } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
  
const ChatMessage = ({ type, content }) => {
  // State variables
  //console.log(localStorage.getItem("access_token"));
  const [transcription, setTranscription] = useState("");

  //workaround to double click get route
  const [count, setCount] = useState(0);

  //Falcon 40B response
  const [falcon, setFalcon] = useState(null);

  //blob url of reply
  const [audio1, setAudio1] = useState(null);

  //check if reply audio is playing and play loader
  const [isPlaying, setIsPlaying] = useState(false);

  const [clickspeak, setclickspeak] = useState(false);

  //NER Endpoint useState
  const [ner, setNer] = useState([]);

  const [correctedText, setCorrectedText] = useState("");

  const mimeType = "audio/mp3";
  const ngrokurl = "http://localhost:8888";
  //in built api reference
  const mediaRecorder = useRef(null);

  const handleSound = async () => {
    setclickspeak(true);
    try {
      const response = await fetch(ngrokurl + "/labs-tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("access_token"),
          // Specify JSON content type
        },
        body: JSON.stringify({
          text: falcon,
          emotion: "cheerful",
        }), 
      });

      if (response.ok) {
        const responseData = await response.blob(); // Get the binary response data
        const audioUrl = URL.createObjectURL(responseData); // Create a URL for the blob
        setAudio1(audioUrl);
      } else {
        alert("Reply Failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while replying to the audio");
    }
    setclickspeak(false);
  };

  // Get Location via NER API CALL
  const handleNER = async () => {
    try {
      const response = await fetch(ngrokurl + "/ner/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Specify JSON content type
          token: localStorage.getItem("access_token"),
        },
        body: JSON.stringify({
          text: content,
          emotion: "Anger",
        }),
      });

      if (response.ok) {
        const nerData = await response.json();
        setNer(nerData.LOC);
        console.log(content);
        console.log(nerData.LOC);
        const url = `https://www.google.com/maps/dir/${nerData.LOC[0]}+station/${nerData.LOC[1]}+station`;
        //to only open new window when double clicked
        if (true) {
          window.open(url, "_blank", "noreferrer");
          setCount(0);
        } else {
          setCount(count + 1);
          console.log(count);
        }
      } else {
        alert("NER failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error while fetching location");
    }
  };

  const [loading, setLoading] = useState(false); // New loading state

  const falconResponse = async () => {
    try {
      setLoading(true); // Set loading to true when the request starts

      const response = await fetch(ngrokurl + "/gemini/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("access_token"),
        },
        body: JSON.stringify({
          text: content,
          emotion: "Neutral",
        }),
      });

      if (response.ok) {
        const falcon_response = await response.json();
        setFalcon(falcon_response.text);
        console.log(falcon_response);
      } else {
        console.log("model dead");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false); // Set loading to false regardless of success or failure
    }
  };

  useEffect(() => {
    // Check if content is available and falcon is not set
    if (content && !falcon) {
      falconResponse();
    }
  }, [content, falcon]);

  return (
    <div className="px-2 no-scrollbar overflow-y-auto">
      <div
        className={`flex flex-row my-2 mr-1 ${
          type === "user" ? "justify-end" : "justify-start"
        } items-center ml-auto`}
      >
        <button
          className="bg-gradient-to-r from-pink-300 via-violet-300 to-purple-400 hover:bg-blue-700 text-white font-bold py-2 px-6 mx-2 rounded-full shadow-md focus:outline-none focus:shadow-outline flex items-center"
        >
          Route <span className="mlc-2">&#10132;</span>
        </button>
        <div
          className={`flex flex-col ${
            type != "user" ? "items-end" : "items-start"
          } w-7/12 bg-${
            type === "user" ? "blue-200" : "gray-300"
          } rounded-lg p-3`}
        >
          <h2 className="text-lg font-semibold">
            {type === "user" ? " You " : " Railway Buddy 🚞 "}
          </h2>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
        <div className="mx-1 p-5 rounded-full border-blue-200 border-4"></div>
      </div>

      <div className="flex flex-row justify-start items-center mr-auto pt-2 ml-1">
        <div className="mx-1 p-5 rounded-full border-gray-300 border-4"></div>
        <div className="flex flex-col justify-start items-start w-7/12 bg-gray-300 rounded-lg p-3">
          <h2 className="text-lg font-semibold">Railway Mitra Chat🤖</h2>
          {loading ? (
            <Dna
              visible={true}
              height="50"
              width="80"
              ariaLabel="dna-loading"
              wrapperStyle={{}}
              wrapperClass="dna-wrapper"
            />
          ) : (
            <p className="mt-2 text-sm">{falcon}</p>
          )}
        </div>
        <button
          onClick={handleSound}
          className="bg-gradient-to-r from-pink-300 via-violet-300 to-purple-400 hover:bg-cyan-700 text-white font-bold ml-4 py-2 px-6 rounded-full shadow-md focus:outline-none focus:shadow-outline flex items-center"
        >
          {clickspeak && (
            <Puff
              height="25"
              width="25"
              radius={2}
              color="#009CFF"
              ariaLabel="puff-loading"
              wrapperStyle={{}}
              wrapperClass=""
              visible={true}
              className="mr-2"
            />
          )}
          Speak <FaMicrophone />
        </button>
        {audio1 ? (
          <div className="audio-container flex flex-row items-center mt-2 mx-4">
            {isPlaying && (
              <Audio
                height="40"
                width="40"
                color="#009CFF"
                ariaLabel="audio-loading"
                wrapperStyle={{}}
                wrapperClass="wrapper-class"
                visible={true}
              />
            )}
            <audio
              src={audio1}
              controls
              onPlay={() => {
                setIsPlaying(true);
              }}
              onPause={() => {
                setIsPlaying(false);
              }}
              className="mb-2"
            ></audio>
            <a
              download
              href={audio1}
              className="text-cyan-500 hover:text-cyan-700"
            ></a>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ChatMessage;