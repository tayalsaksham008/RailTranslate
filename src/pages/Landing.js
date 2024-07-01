import React from "react";
import Navbar from "../components/Navbar";
import Statement from "../components/Statement";

export default function Landing() {
  return (
    <div className="flex flex-col bg-gradient-to-r bg-cover bg-center from-blue-200 to-blue-100 h-max p-10">
      <Navbar />
      <div className="flex-grow">
        <Statement />
      </div>
    </div>
  );
}
