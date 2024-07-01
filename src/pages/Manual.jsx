import React from "react";
import Navbar from "../components/Navbar";
import image1 from "../assets/Chatbot.png";
import image2 from "../assets/Dashboard.png";
import image3 from "../assets/Translation.png";
import image4 from "../assets/PNR_Status.png";
const Manual = () => {
  return (
    <div className="flex flex-col bg-zinc-200 h-max p-10 items-center justify-center">
      <Navbar />

      <p className="flex flex-col items-center justify-center h-max p-20 text-bold text-black text-xl">
        The User Manual For Navigating through the application is as follows:
      </p>
      <p className="flex flex-col items-left justify-center h-max text-black text-xl m-1">
        1. CHAT BOT:
      </p>
      <img src={image1} alt="Chat bot landing image" className="w-4/6" />
      <br/><br/>
      <p className="flex flex-col items-left justify-center h-max text-black text-xl m-1">
        2. Railway Dashboard:
      </p>
      <img src={image2} alt="Chat bot landing image" className="w-4/6" />
      <br/><br/>
      <p className="flex flex-col items-left justify-center h-max text-black text-xl m-1">
        3. On the fly Translation Engine:
      </p>
      <img src={image3} alt="Chat bot landing image" className="w-4/6" />
      <br/><br/>
      <p className="flex flex-col items-left justify-center h-max text-black text-xl m-1">
        4. PNR Status:
      </p>
      <img src={image4} alt="Chat bot landing image" className="w-4/6" />
    </div>
  );
};

export default Manual;
