import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Typewriter } from "react-simple-typewriter";
import { resolvePath, useNavigate } from "react-router-dom";
import SelectTrain from "../components/SelectTrain";
import Datepicker from "react-tailwindcss-datepicker";
import { Puff } from "react-loader-spinner";

export default function TrainDash() {
  const navigate = useNavigate();
 
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [inputData, setInputData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // Function to handle the Search
  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const responseData = await fetch(
        "http://127.0.0.1:8888/get_train_data",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add any additional headers as needed
          },
          body: JSON.stringify({
            station_1: source,
            station_2: destination,
          }),
        }
      );

      if (responseData.ok) {
        const response = await responseData.json(); // Parse response JSON

        console.log(response);
        const train_data1 = {
          train_name: response.train_data1.train_name,
          train_no: response.train_data1.train_no,
        };

        const train_data2 = {
          Dep: response.train_data2.Dep,
          PFfrom: response.train_data2.PFfrom,
        };

        // Combine the data into an array of objects
        const trainData = train_data1.train_name.map((_, index) => ({
          trainNumber: train_data1.train_no[index],
          trainName: train_data1.train_name[index],
          platformNumber: train_data2.PFfrom[index],
          trainTime: train_data2.Dep[index],
        }));
        setInputData(trainData);
        console.log("Search successful");
      } else {
        // Handle error, e.g., show an error message
        console.error("Search failed");
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setIsLoading(false);
  };
  const [value, setValue] = useState({
    startDate: null,
    endDate: null,
  });
  const handleValueChange = (newValue) => {
    console.log("newValue:", newValue);
    setValue(newValue);
  };

  // To set the source value from Select Train using a Callback to make API call
  const handleSelectSource = (value) => {
    setSource(value);
    console.log(value);
  };

  // To set the destination value from Select Train using a Callback to make API call
  const handleSelectDestination = (value) => {
    setDestination(value);
    console.log(value);
  };

  // Function to handle the announcement
  const handleIVRS = async (train) => {
    try {
      const response = await fetch(
        "https://f248-34-143-168-214.ngrok-free.app/make_call",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add any additional headers as needed
          },
          body: JSON.stringify({
            train_name: train.trainName,
            train_no: train.trainNumber,
            platform_number: train.platformNumber,
            departure_time: train.trainTime,
          }),
        }
      );

      if (response.ok) {
        // Handle success, e.g., show a success message
        console.log("Announcement successful");
      } else {
        // Handle error, e.g., show an error message
        console.error("Announcement failed");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSMS = async (train) => {
    try {
      const response = await fetch(
        "https://f248-34-143-168-214.ngrok-free.app/make_SMS",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add any additional headers as needed
          },
          body: JSON.stringify({
            train_name: train.trainName,
            train_no: train.trainNumber,
            platform_number: train.platformNumber,
            departure_time: train.trainTime,
          }),
        }
      );

      if (response.ok) {
        console.log("Announcement successful");
      } else {
        // Handle error, e.g., show an error message
        console.error("Announcement failed");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleAnnouncement = (train) => {
    try {
      // Create a formatted string with train information
      const announcementString = `${train.trainName} (${train.trainNumber}) departing from ${train.platformNumber} at ${train.trainTime}`;

      // Navigate to Translateinfo component with the announcement string as props
      navigate("/Translate", {
        state: { announcement: announcementString },
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="relative flex flex-col md:flex-row min-h-screen bg-gray-900 bg-auto pb-6 hide-scrollbar">
      <Navbar />

      <div className="flex flex-col mt-12 p-5 items-left h-screen mb-10 rounded-lg overflow-y-auto overflow-x-hidden sm:w-1/3 bg-gray-800 no-scrollbar">
        <div className="flex flex-row justify-between">
          <p className="mt-2 p-3 text-left text-6xl font-extrabold tracking-tight text-white sm:text-3xl">
            <Typewriter
              words={["RAILWAY ADMIN PORTAL"]}
              cursor
              cursorStyle=""
              // loop={1}
            />
          </p>
        </div>

        <ul role="list" className="mt-4">
          <div className="mb-4">
            <label htmlFor="email" className="flex mb-2 font-bold text-white">
              Departure Station
            </label>
            <SelectTrain onSelect={handleSelectSource} />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="flex mb-2 font-bold text-white">
              Arrival Station
            </label>
            <SelectTrain onSelect={handleSelectDestination} />
          </div>
          <div className="z-10 mt-4 border-white border-2 rounded-lg">
            <Datepicker
              primaryColor={"blue"}
              useRange={false}
              asSingle={true}
              value={value}
              onChange={handleValueChange}
            />
          </div>
          <button
            className="hover:scale-105 w-full transition-transform duration-1000 bg-gradient-to-r  from-blue-600 to-blue-600 text-white font-bold p-3 mt-4 rounded-lg"
            onClick={handleSearch}
          >
            SEARCH
          </button>
        </ul>
        {isLoading && (
          <div className="flex items-center justify-center my-4">
            <Puff
              height="80"
              width="80"
              color="#009CFF"
              wrapperStyle={{}}
              wrapperClass=""
              visible={true}
              outerCircleColor=""
              innerCircleColor=""
              ariaLabel="circles-with-bar-loading"
            />
          </div>
        )}
      </div>

      <div className=" mt-14 py-2 flex-col justify-center items-center sm:w-3/5 mx-auto">
        <div className="flex justify-center items-center mx-auto p-2 my-4 rounded-3xl bg-gradient-to-r from-gray-400 via-gray-300 to-gray-500 w-5/6">
          <p className="text-gray-900 font-bold">
            Railway Dashboard to display the Station Announcements.
          </p>
        </div>
        <ul
          role="list"
          class="divide-y divide-gray-100 max-h-screen overflow-y-auto no-scrollbar"
        >
          {inputData.map((train, index) => (
            <li key={index} className="flex justify-between gap-x-6 py-5">
              <div className="flex min-w-0">
                <div className="min-w-0 flex-auto">
                  <h className="text-md leading-6 text-gray-200 max-w-[100px]">
                    <i>{train.trainNumber}</i>
                  </h>
                  <p className="text-lg font-semibold text-white max-w-[150px]">
                    {train.trainName}
                  </p>
                  <p className="mt-1 truncate text-lg leading-5 text-gray-500 max-w-[200px]">
                    {"Platform " + train.platformNumber}
                  </p>
                </div>
              </div>

              <div className="flex justify-evenly items-center gap-x-4 border-white border-2 h-10 rounded-lg p-2 my-auto">
                <p className="text-lg font-semibold text-white max-w-[100px]">
                  {train.trainTime}
                </p>
              </div>

              <div className="flex justify-evenly items-center gap-x-4">
                <button
                  className="py-3 px-2 text-white font-semibold bg-blue-500 rounded-xl"
                  onClick={() => handleAnnouncement(train)}
                >
                  Announcement
                </button>
                {/* <button
                  className="py-3 px-2 text-white font-semibold bg-yellow-500 rounded-xl"
                  onClick={() => handleSMS(train)}
                >
                  Send SMS
                </button> */}
                {/* <button
                  className="py-3 px-2 text-white font-semibold bg-green-500 rounded-xl"
                  onClick={() => handleIVRS(train)}
                >
                  IVRS (call)
                </button> */}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
