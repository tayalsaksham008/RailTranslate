import React, { useState, useRef, useEffect } from "react";
import { Bars, CirclesWithBar, Audio, Puff } from "react-loader-spinner";
import { FaMicrophone } from "react-icons/fa";
import TranslateMessage from "./TranslateMessage";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { useLocation } from "react-router-dom";

const animatedComponents = makeAnimated();

export const TranslateInterface = () => {
  const location = useLocation();
  const announcementString = location.state?.announcement || "";
  const [textInput, setTextInput] = useState(announcementString); // Set textInput with the announcement string
  const [transcription, setTranscription] = useState("");
  //For text field instead of voice

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
  const ngrokurl = "http://127.0.0.1:8888";
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
      console.log("message:"+messages); 
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
          setSrcLang(data.src_lang);
          setMessages([...messages, { type: "user", content: data.text }]);
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

  const chatContainerRef = useRef(null);

  // Scroll to the bottom of the chat container whenever messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const langList = [
    { value: "en_XX", label: "English" },
    //{ value: "gu_IN", label: "Gujarati" },
    { value: "hi_IN", label: "Hindi" },
    { value: "it_IT", label: "Italian" },
    { value: "ja_XX", label: "Japanese" },
    //{ value: "kk_KZ", label: "Kazakh" },
    { value: "ko_KR", label: "Korean" },
    //{ value: "lt_LT", label: "Lithuanian" },
    //{ value: "lv_LV", label: "Latvian" },
    // { value: "my_MM", label: "Burmese" },
    // { value: "ne_NP", label: "Nepali" },
    { value: "nl_XX", label: "Dutch" },
    { value: "ro_RO", label: "Romanian" },
    { value: "ru_RU", label: "Russian" },
    // { value: "si_LK", label: "Sinhala" },
    { value: "tr_TR", label: "Turkish" },
    // { value: "vi_VN", label: "Vietnamese" },
    { value: "zh_CN", label: "Chinese" },
    // { value: "af_ZA", label: "Afrikaans" },
    // { value: "az_AZ", label: "Azerbaijani" },
    // { value: "bn_IN", label: "Bengali" },
    // { value: "fa_IR", label: "Persian" },
    // { value: "he_IL", label: "Hebrew" },
    { value: "hr_HR", label: "Croatian" },
    { value: "id_ID", label: "Indonesian" },
    // { value: "ka_GE", label: "Georgian" },
    // { value: "km_KH", label: "Khmer" },
    // { value: "mk_MK", label: "Macedonian" },
    // { value: "ml_IN", label: "Malayalam" },
    // { value: "mn_MN", label: "Mongolian" },
    // { value: "mr_IN", label: "Marathi" },
    { value: "pl_PL", label: "Polish" },
    // { value: "ps_AF", label: "Pashto" },
    { value: "pt_XX", label: "Portuguese" },
    { value: "sv_SE", label: "Swedish" },
    // { value: "sw_KE", label: "Swahili" },
    { value: "ta_IN", label: "Tamil" },
    // { value: "te_IN", label: "Telugu" },
    // { value: "th_TH", label: "Thai" },
    // { value: "tl_XX", label: "Tagalog" },
    { value: "uk_UA", label: "Ukrainian" },
    // { value: "ur_PK", label: "Urdu" },
    // { value: "xh_ZA", label: "Xhosa" },
    // { value: "gl_ES", label: "Galician" },
    // { value: "sl_SI", label: "Slovene" },
  ];
  const [lang, setLang] = useState(null);
  const handleChoose = (selectedOptions) => {
    setLang(selectedOptions.value);
  };
  const [srcLang, setSrcLang] = useState("en_XX"); //set default to english for source

  return (
    <div className="flex flex-col bg-gradient-to-b bg-cover bg-center from-white to-blue-100 h-screen max-h-screen mt-6 pt-10 no-scrollbar overflow-y-auto ">
      <div className="flex justify-center items-center mx-auto p-2 my-4 rounded-3xl bg-gradient-to-r from-gray-400 via-gray-300 to-gray-500 w-3/6">
        <p className="text-gray-900 font-bold">On-the-fly Translation Engine</p>
      </div>
      <p className="text-gray-800 font-semibold flex justify-center items-center mx-auto ">
        Start Translation by clicking &rarr; <b> Get Microphone</b>.
      </p>
      <div
        className="flex-grow chat-container overflow-y-auto no-scrollbar py-2"
        style={{ maxHeight: "calc(100vh - 160px)", overflow: "auto" }}
        ref={chatContainerRef}
      >
        {messages.map((message, index) => (
          <TranslateMessage
            key={index}
            type={message.type}
            content={message.content}
            lang={lang}
            srcLang={srcLang}
          />
        ))}
      </div>
      <div className="justify-end bottom-0 left-0 right-0 bg-slate-100 border-1 py-6 px-2">
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
            <div className="flex flex-row justify-center items-center mt-2">
              <input
                type="text"
                value={textInput}
                onChange={handleTextInputChange}
                className="border border-gray-300 p-2 rounded-md w-96"
                placeholder="Type your message..."
              />
            </div>

            <div className="flex flex-row justify-center items-center">
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
            <div className=" w-80">
              <Select
                options={langList}
                closeMenuOnSelect={false}
                components={animatedComponents}
                onChange={handleChoose}
                menuPlacement="top"
                placeholder={"Select Language to translate to..."}
              />
            </div>
            {audio || textInput ? (
              <button
                onClick={handleTranscribe}
                className=" hover:animate-pulse bg-gradient-to-r from-green-300 via-green-300 to-green-400 text-white font-bold shadow-md py-2 px-6 ml-2 rounded-full focus:outline-none focus:shadow-outline"
              >
                Translate
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
