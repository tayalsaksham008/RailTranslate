import React, { useState, useEffect } from "react";
import Threemodel from "./Threemodel";
import { Typewriter } from "react-simple-typewriter";
import { useNavigate } from "react-router-dom";

export default function Statement() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("flag"));
  return (
    <div>
      <div className="mx-auto max-w-2xl py-24 h-screen">
        <div className="hidden sm:mb-8 sm:flex sm:justify-center">
          <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
            For first time users{" "}
            <a href="/Manual" className="font-semibold text-indigo-600">
              <span className="absolute inset-0" aria-hidden="true" />
              Click for the manual <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-6xl font-bold tracking-tight text-gray-900 sm:text-8xl">
            Railway Mitron
          </h1>
        </div>
        <div className="flex flex-row items-center justify-center">
          <div className="py-10 min-h-42">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
                <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                  <button
                    className="flex justify-center items-center text-xl font-semibold leading-6 text-gray-200 py-3 px-12 bg-gradient-to-r bg-cover bg-center from-indigo-600 to-blue-600 hover:bg-blue-900 hover:animate-pulse rounded-md transition-all duration-150 ease-in-out border-2  border-blue-600"
                    onClick={() => {
                      navigate("/Assistant");
                    }}
                  >
                    Information through chatbots
                  </button>
                  <span aria-hidden="true">&uarr;</span>
                  <h1 className="text-lg font-bold tracking-tight text-gray-900 sm:text-lg">
                    Click to open the chat assistant for real-time-queries.
                  </h1>
                </div>
              </dl>
            </div>
          </div>

          <div className="py-10 min-h-42 mt-14">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
                <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                  <button
                    className="flex justify-center items-center text-xl font-semibold leading-6 text-gray-200 py-3 px-12 bg-blue-600 hover:bg-blue-900 hover:animate-pulse rounded-md transition-all duration-150 ease-in-out"
                    onClick={() => {
                        navigate("/dashboard");
                    }}
                  >
                    Railway Information Dashboard
                  </button>
                  <span aria-hidden="true">&uarr;</span>
                  <h1 className="text-lg font-bold tracking-tight text-gray-900 sm:text-lg">
                    Click to access the Railways Dashboard to display the Station
                    Announcements and train schedules.
                  </h1>
                </div>
              </dl>
            </div>
          </div>

          <div className="py-10 min-h-42">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
                <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                  <button
                    className="flex justify-center items-center text-xl font-semibold leading-6 text-gray-200 py-3 px-12 bg-gradient-to-r  from-blue-600 to-indigo-600 hover:bg-blue-900 hover:animate-pulse rounded-md transition-all duration-150 ease-in-out border-2  "
                    onClick={() => {
                      navigate("/Translate");
                    }}
                  >
                    On the fly translation Engine
                  </button>
                  <span aria-hidden="true">&uarr;</span>
                  <h1 className="text-lg font-bold tracking-tight text-gray-900 sm:text-lg">
                    Click for speech to speech translation in required
                    languages.
                  </h1>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
