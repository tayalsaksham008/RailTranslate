import React from "react";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { UserInterface } from "../components/UserInterface";

export const Test = () => {
  return ( 
    <div className="flex flex-col no-scrollbar no-scrollbar overflow-y-auto max-h-screen">
      <Navbar />
      <UserInterface />
    </div>
  );
};
