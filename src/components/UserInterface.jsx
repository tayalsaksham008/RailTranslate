import React, { useState, useRef, useEffect } from "react";
import { Bars, CirclesWithBar, Audio, Puff } from "react-loader-spinner";
import { FaMicrophone } from "react-icons/fa";
import ChatMessage from "./ChatMessage";

export const UserInterface = () => { 
  const [transcription, setTranscription] = useState("");
  //For text field instead of voice
  const [textInput, setTextInput] = useState("");

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

  const [clicktranscribe, setclicktranscribe] = useState(false);

  const [messages, setMessages] = useState([]); // New state for storing messages

  const [suggestions, setSuggestions] = useState([]);

  const mimeType = "audio/mp3";
  const ngrokurl = "http://localhost:8888";
  //in built api reference
  const mediaRecorder = useRef(null);

  async function query(data) { 
    const response = await fetch(
      "https://api-inference.huggingface.co/models/bert-base-uncased",
      {
        headers: {
          Authorization: "Bearer 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",
        },
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    const result = await response.json();
    return result;
  }

  useEffect(() => {
    let timer;

    async function delayedQuery() {
      if (textInput.trim() != "") {
        // Clear any previous timers
        clearTimeout(timer);

        // Set a new timer to execute the query after x milliseconds
        timer = setTimeout(() => {
          const inputText = textInput + " [MASK]."; // Append " [MASK]" to the input text
          query({ inputs: inputText }).then((response) => {
            try {
              response.forEach((item, index) => {
                setSuggestions((prevsuggestions) => [
                  ...prevsuggestions,
                  item.sequence.replace(".", "").split(" ").pop(),
                ]);
              });
            } catch (err) {
              console.log(err);
            }
          });
        }, 100);
      }
    }

    delayedQuery();

    return () => {
      clearTimeout(timer); // Clean up the timer on component unmount or when textInput changes
    };
  }, [textInput]);
  const handleTextInputChange = (event) => {
    setTextInput(event.target.value);
  };

  const handleSuggestionClick = (index) => {
    setTextInput(
      (prevTextInput) =>
        prevTextInput.trim() + " " + suggestions.slice(-5)[index]
    );
    setSuggestions([]);
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
    if (textInput) {
      setTranscription(textInput);
      setMessages([...messages, { type: "user", content: textInput }]);
      setclicktranscribe(false);
    } else {
      // Create a Blob from the recorded audio
      const audioBlob = await fetch(audio).then((res) => res.blob());

      // Create a FormData object and append the Blob as "file"

      const formData = new FormData();
      formData.append("file", audioBlob, "audio.mp3");

      try {
        const response = await fetch(ngrokurl + "/transcribe/", {
          method: "POST",
          headers: {
            token: localStorage.getItem("access_token"),
          },
          body: formData,
        });
        if (response.ok) {
          const data = await response.json();
          setTranscription(data.text);
          setMessages([...messages, { type: "user", content: data.text }]);
        } else {
          alert("Transcription failed");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while transcribing the audio");
      }
      setTextInput("");
      setclicktranscribe(false);
    }
    console.log(transcription);
  };

  const chatContainerRef = useRef(null);

  // Scroll to the bottom of the chat container whenever messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col bg-gradient-to-r bg-cover bg-center from-blue-200 to-blue-100  h-screen max-h-screen mt-6 pt-10 no-scrollbar overflow-y-auto ">
      <div className="flex justify-center items-center mx-auto p-2 my-4 rounded-3xl bg-gradient-to-r from-gray-400 via-gray-300 to-gray-500 w-3/6">
        <p className="text-gray-900 font-bold">
          Welcome to Railway Mitra - the chat assistant for real-time-queries.
        </p>
      </div>
      <p className="text-gray-800 font-semibold flex justify-center items-center mx-auto ">
        Ask any doubts regarding the Indian Railway by clicking &rarr; Get
        Microphone.
      </p>
      <div
        className="flex-grow chat-container overflow-y-auto no-scrollbar py-2"
        style={{ maxHeight: "calc(100vh - 160px)", overflow: "auto" }}
        ref={chatContainerRef}
      >
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            type={message.type}
            content={message.content}
          />
        ))}
      </div>
      <div className="justify-center items-center mx-auto flex bottom-0 left-0 right-0 bg-gray-200 border-1 py-6 px-2 w-5/6 rounded-3xl mb-6">
        <div className="flex flex-row justify-between w-full ">
          <div className="audio-controls space-y-2 flex flex-row justify-center items-center">
            {!permission ? (
              <button
                onClick={getMicrophonePermission}
                type="button"
                className="bg-cyan-400 hover:bg-cyan-300 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline"
              >
                Get Microphone
              </button>
            ) : null}
            {permission && recordingStatus === "inactive" ? (
              <button
                onClick={startRecording}
                type="button"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline"
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
          {audio ? (
            <div className="audio-container flex flex-row justify-center items-center">
              <audio src={audio} controls className="mb-2"></audio>
              <a
                download
                href={audio}
                className="text-cyan-500 hover:text-cyan-700"
              ></a>
            </div>
          ) : null}

          <div className="flex flex-col">
            <div className="flex flex-row justify-center items-center">
              <input
                type="text"
                value={textInput}
                onChange={handleTextInputChange}
                className="border border-gray-300 p-2 rounded-md w-96"
                placeholder="Type your message..."
              />
            </div>

            <div className="flex flex-row justify-center items-center mt-2">
              {suggestions.slice(-5).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(index)}
                  className="bg-blue-500 text-white font-semibold px-4 py-2 m-2 rounded-md"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

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
            {audio || textInput? (
              <button
                onClick={handleTranscribe}
                className=" hover:animate-pulse bg-gradient-to-r from-green-300 via-green-300 to-green-400 font-bold shadow-md py-2 px-6 ml-2 rounded-full focus:outline-none focus:shadow-outline"
              >
                Get Answer
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};