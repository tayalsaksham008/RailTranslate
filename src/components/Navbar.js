import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
// import image from "/Users/ameet/SIH-2023/src/assets/better.png";
import image from "../assets/better.png";

export default function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("flag"));
  const ref = useRef(null);
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem("flag", "");
    localStorage.setItem("access_token", "");
    navigate("/");
  };

  return (
    <div className="flex flex-row static no-scrollbar overflow-y-auto">
      <header className="absolute inset-x-0 top-0 z-50 bg-gradient-to-r from-blue-600 to-blue-800">
        <nav
          className="flex items-center justify-between p-2 mb-1 lg:px-8 "
          aria-label="Global"
        >
          <div className="flex lg:flex-1">
            <a className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
            </a>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>
          <div
            onClick={() => {
              navigate("/");
            }}
          >
            <img
              src={image}
              alt="indian rail logo"
              className="h-12 top-2 left-3 absolute"
            />
          </div>
          <div className="hidden lg:flex lg:gap-x-12"> 
            <a
              className="text-md font-semibold leading-6 text-gray-200 hover:font-extrabold hover:shadow-xl transition-all ease-in duration-100 p-2 rounded-lg "
              onClick={() => {
                navigate("/");
              }}
            >
              Home
            </a>

            {/* <a  className="text-sm font-semibold leading-6 text-gray-200 hover:font-extrabold hover:shadow-xl transition-all ease-in duration-100 p-2 rounded-lg">Find Jobs</a>*/}

            <a
              className="text-md font-semibold leading-6 text-gray-200 hover:font-extrabold hover:shadow-xl transition-all ease-in duration-100 p-2 rounded-lg"
              onClick={() => {
                navigate("/Manual");
              }}
            >
              User Manual
            </a>
          </div>
          {!isLoggedIn && (
            <div className="hidden lg:flex lg:flex-1 lg:justify-end">
              {/* <a
                className="text-sm font-semibold leading-6 text-gray-100 mr-2 p-2 hover:bg-blue-500 bg-blue-600  border-white rounded-md transition-all duration-500 ease-in-out border-2 "
                onClick={() => {
                  navigate("/Signup");
                }}
              >
                Sign Up <span aria-hidden="true"></span>
              </a> */}
              <a
                className="text-sm font-semibold leading-6 text-gray-100 p-2 hover:bg-blue-500 bg-blue-600   border-white rounded-md transition-all duration-500 ease-in-out border-2 "
                onClick={() => {
                  navigate("/Login");
                }}
              >
                PNR Status <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          )}
          {/* {isLoggedIn && (
            <div className="hidden lg:flex lg:flex-1 lg:justify-end">
              <a
                className="text-sm font-semibold leading-6 text-gray-100 mr-2 p-2 hover:bg-blue-500 bg-blue-600  border-white rounded-md transition-all duration-500 ease-in-out border-2 "
                onClick={handleLogout}
              >
                Log Out <span aria-hidden="true"></span>
              </a>
            </div>
          )} */}
        </nav>
      </header>
    </div>
  );
}
