import React, { useState, useRef } from "react";
import { Bars, CirclesWithBar, Audio, Puff } from "react-loader-spinner";
import { FaMicrophone } from "react-icons/fa";
const Mic = () => {
  // State variables
  const [transcription, setTranscription] = useState("");

  //workaround to double click get route
  const [count, setCount] = useState(0);

  //For text field instead of voice
  const [textInput, setTextInput] = useState("");

  //Falcon 40B response
  const [falcon, setFalcon] = useState(null);

  //mic permission
  const [permission, setPermission] = useState(false);

  //recording inactive and paused are 3 states
  const [recordingStatus, setRecordingStatus] = useState("inactive");

  //audio from the getUserMedia function
  const [stream, setStream] = useState(null);

  //will contain encoded pieces of audio
  const [audioChunks, setAudioChunks] = useState([]);

  //blob url of the audio
  const [audio, setAudio] = useState(null);

  //blob url of reply
  const [audio1, setAudio1] = useState(null);

  //check if reply audio is playing and play loader
  const [isPlaying, setIsPlaying] = useState(false);

  const [clicktranscribe, setclicktranscribe] = useState(false);

  const [clickspeak, setclickspeak] = useState(false);

  //NER Endpoint useState
  const [ner, setNer] = useState([]);

  const mimeType = "audio/webm";
  const ngrokurl = "https://f0f4-34-125-149-216.ngrok-free.app";
  //in built api reference
  const mediaRecorder = useRef(null);

  const handleTextInputChange = (event) => {
    setTextInput(event.target.value);
  };

  // Function to request microphone permission
  const getMicrophonePermission = async () => {
    if ("MediaRecorder" in window) {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setPermission(true);
        setStream(streamData);
      } catch (err) {
        alert(err.message);
      }
    } else {
      alert("The MediaRecorder API is not supported in your browser.");
    }
  };

  // Function to start audio recording
  const startRecording = async () => {
    setRecordingStatus("recording");
    //create new Media recorder instance using the stream

    const media = new MediaRecorder(stream, { type: mimeType });
    //set the MediaRecorder instance to the mediaRecorder ref

    mediaRecorder.current = media;
    //invokes the start method to start the recording process

    let localAudioChunks = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;
      localAudioChunks.push(event.data);
    };
    setAudioChunks(localAudioChunks);

    mediaRecorder.current.start();
  };

  // Function to stop audio recording
  const stopRecording = () => {
    setRecordingStatus("inactive");
    //stops the recording instance

    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      //creates a blob file from the audiochunks data
      const audioBlob = new Blob(audioChunks, { type: mimeType });
      //creates a playable URL from the blob file.
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudio(audioUrl);

      const formData = new FormData();
      formData.append("file", audio);
      setAudioChunks([]);
    };
  };

  // Function to transcribe audio
  const handleTranscribe = async () => {
    setclicktranscribe(true);
    if (!audio && textInput) {
      setTranscription(textInput);
      setclicktranscribe(false);
    } else {
      // Create a Blob from the recorded audio
      const audioBlob = await fetch(audio).then((res) => res.blob());

      // Create a FormData object and append the Blob as "file"

      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");

      try {
        const response = await fetch(ngrokurl + "/transcribe/", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setTranscription(data.text);
        } else {
          alert("Transcription failed");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while transcribing the audio");
      }
      setclicktranscribe(false);
    }
    console.log(transcription);
  };

  const handleSound = async () => {
    console.log("outside falcon");
    setclickspeak(true);
    try {
      const response = await fetch(ngrokurl + "/coqui-tts/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Specify JSON content type
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
        },
        body: JSON.stringify({
          text: transcription,
          emotion: "Anger",
        }),
      });

      if (response.ok) {
        const nerData = await response.json();
        setNer(nerData.LOC);
        console.log(transcription);
        console.log(ner);
        const url = `https://www.google.com/maps/dir/${ner[0]}+station/${ner[1]}+station`;
        //to only open new window when double clicked
        if (count == 1) {
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

  const falconResponse = async () => {
    try {
      const response = await fetch(ngrokurl + "/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Specify JSON content type
        },
        body: JSON.stringify({
          text: transcription,
          emotion: "Neutral",
        }),
      });

      if (response.ok) {
        const falcon_response = await response.json();
        setFalcon(falcon_response.text);
        console.log(falcon_response);
      } else {
        alert("Model did not send a response");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error while fetching Model");
    }
  };

  return (
    <div className="bg-gradient-to-b bg-cover bg-center from-white via-blue-100 to-cyan-300 min-h-screen py-10 px-6">
      <div className="flex justify-center items-center mx-auto p-2 mb-4 rounded-3xl bg-gradient-to-r from-gray-400 via-gray-300 to-gray-500 w-1/6">
        <p className="text-gray-900 font-bold">Railway Buddy</p>
      </div>

      {transcription && (
        <div className="flex flex-row justify-end items-center ml-auto">
          <button
            onClick={falconResponse}
            className="bg-gradient-to-r from-pink-300 via-violet-300 to-purple-400 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow-md focus:outline-none focus:shadow-outline flex items-center"
          >
            Reply
          </button>
          <button
            onClick={handleNER}
            className="bg-gradient-to-r from-pink-300 via-violet-300 to-purple-400 hover:bg-blue-700 text-white font-bold py-2 px-6 mx-2 rounded-full shadow-md focus:outline-none focus:shadow-outline flex items-center"
          >
            Route <span className="mlc-2">&#10132;</span>
          </button>

          <div className="flex flex-col justify-start items-start w-1/2 bg-blue-200 rounded-lg p-3">
            <h2 className="text-lg font-semibold">You</h2>
            <p className="mt-2 text-sm">{transcription}</p>
          </div>
        </div>
      )}
      {falcon && (
        <div className="flex flex-row justify-start items-center mr-auto pt-2">
          <div className="flex flex-col justify-start items-start w-1/2 bg-gray-200 rounded-lg p-3">
            <h2 className="text-lg font-semibold">Railway Buddy 🤖</h2>
            <p className="mt-2 text-sm">{falcon}</p>
          </div>
          <button
            onClick={handleSound}
            className="bg-gradient-to-r from-pink-300 via-violet-300 to-purple-400 hover:bg-blue-700 text-white font-bold ml-4 py-2 px-6 rounded-full shadow-md focus:outline-none focus:shadow-outline flex items-center"
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
                className="text-blue-500 hover:text-blue-700"
              ></a>
            </div>
          ) : null}
        </div>
      )}
      <div className="fixed bottom-0 left-0 right-0 bg-blue-100 border-t border-gray-300">
        <div className="flex flex-row justify-between w-full m-2 p-4 ">
          <div className="audio-controls space-y-2 flex flex-row justify-center items-center">
            {!permission ? (
              <button
                onClick={getMicrophonePermission}
                type="button"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline"
              >
                Get Microphone
              </button>
            ) : null}
            {permission && recordingStatus === "inactive" ? (
              <button
                onClick={startRecording}
                type="button"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline"
              >
                Start Recording
              </button>
            ) : null}
            {recordingStatus === "recording" ? (
              <div className="flex justify-center items-center flex-row my-4">
                <button
                  onClick={stopRecording}
                  type="button"
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline mr-2"
                >
                  Stop Recording
                </button>

                <Bars
                  height="40"
                  width="40"
                  color="#009CFF"
                  ariaLabel="bars-loading"
                  wrapperStyle={{}}
                  wrapperClass=""
                  visible={true}
                />
              </div>
            ) : null}
          </div>
          <div className="flex flex-row justify-center items-center mb-4">
            <input
              type="text"
              value={textInput}
              onChange={handleTextInputChange}
              className="border border-gray-300 p-2 rounded-md w-96" // Adjusted class here
              placeholder="Type your message..."
            />
          </div>
          {audio ? (
            <div className="audio-container flex flex-row justify-center items-center">
              <audio src={audio} controls className="mb-2"></audio>
              <a
                download
                href={audio}
                className="text-blue-500 hover:text-blue-700"
              ></a>
            </div>
          ) : null}
          <div className="flex justify-center items-center flex-row my-4">
            {clicktranscribe && (
              <CirclesWithBar
                height="40"
                width="40"
                color="#009CFF"
                wrapperStyle={{}}
                wrapperClass=""
                visible={true}
                outerCircleColor=""
                innerCircleColor=""
                barColor=""
                ariaLabel="circles-with-bar-loading"
              />
            )}
            <button
              onClick={handleTranscribe}
              className=" hover:animate-pulse bg-gradient-to-r from-pink-300 via-violet-300 to-purple-400 hover:bg-blue-700 text-white font-bold shadow-md py-2 px-6 ml-2 rounded-full focus:outline-none focus:shadow-outline"
            >
              Transcribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mic;
