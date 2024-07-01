import React, { useState, useRef, useEffect } from "react";
import Tilt from "react-parallax-tilt";
import Chart from "chart.js/auto";

export default function Train({ ticker }) {
  const [loading, setLoading] = useState(false);
  const [lastClosePrice, setLastClosePrice] = useState("");
  const [secondLastClosePrice, setSecondLastClosePrice] = useState("");
  const [percentageChange, setPercentageChange] = useState("");

  const trainOptions = [
    { value: "BRTI.NS", label: "Bharti Airtel Limited" },
    { value: "POWERGRID.NS", label: "Power Grid Corporation of India" },
    { value: "ICICIBANK.NS", label: "ICICI Bank Limited" },
    { value: "ASIANPAINT.NS", label: "Asian Paints Limited" },
    { value: "BRITANNIA.NS", label: "Britannia Industries Limited" },
    { value: "INFY.NS", label: "Infosys Limited" },
    { value: "NTPC.NS", label: "NTPC Limited" },
    { value: "CIPLA.NS", label: "Cipla Limited" },
    { value: "ONGC.NS", label: "Oil and Natural Gas Corporation Limited" },
    { value: "HDFCBANK.NS", label: "HDFC Bank Limited" },
    { value: "SUNPHARMA.NS", label: "Sun Pharmaceutical Industries Limited" },
    { value: "EICHERMOT.NS", label: "Eicher Motors Limited" },
    { value: "TECHM.NS", label: "Tech Mahindra Limited" },
    { value: "M&M.NS", label: "Mahindra & Mahindra Limited" },
    { value: "AXISBANK.NS", label: "Axis Bank Limited" },
    { value: "RELIANCE.NS", label: "Reliance Industries Limited" },
    { value: "WIPRO.NS", label: "Wipro Limited" },
    { value: "HINDALCO.NS", label: "Hindalco Industries Limited" },
    { value: "HINDUNILVR.NS", label: "Hindustan Unilever Limited" },
    { value: "SBILIFE.NS", label: "SBI Life Insurance Company Limited" },
    { value: "ULTRACEMCO.NS", label: "UltraTech Cement Limited" },
    { value: "APOLLOHOSP.NS", label: "Apollo Hospitals Enterprise Limited" },
    {
      value: "HDFC.NS",
      label: "Housing Development Finance Corporation Limited",
    },
    { value: "BAJAJFINSV.NS", label: "Bajaj Finserv Limited" },
    { value: "COALINDIA.NS", label: "Coal India Limited" },
    { value: "DRREDDY.NS", label: "Dr. Reddy's Laboratories Limited" },
    { value: "ITC.NS", label: "ITC Limited" },
    { value: "HEROMOTOCO.NS", label: "Hero MotoCorp Limited" },
    { value: "DIVISLAB.NS", label: "Divi's Laboratories Limited" },
    { value: "GRASIM.NS", label: "Grasim Industries Limited" },
    { value: "HCLTECH.NS", label: "HCL Technologies Limited" },
    { value: "TCS.NS", label: "Tata Consultancy Services Limited" },
    { value: "UPL.NS", label: "UPL Limited" },
    { value: "KOTAKBANK.NS", label: "Kotak Mahindra Bank Limited" },
    { value: "TATACONSUM.NS", label: "Tata Consumer Products Limited" },
    { value: "INDUSINDBK.NS", label: "IndusInd Bank Limited" },
    { value: "JSWSTEEL.NS", label: "JSW Steel Limited" },
    { value: "LT.NS", label: "Larsen & Toubro Limited" },
    { value: "SBIN.NS", label: "State Bank of India" },
    { value: "TATAMOTORS.NS", label: "Tata Motors Limited" },
    { value: "HDFCLIFE.NS", label: "HDFC Life Insurance Company Limited" },
    { value: "MARUTI.NS", label: "Maruti Suzuki India Limited" },
    { value: "BPCL.NS", label: "Bharat Petroleum Corporation Limited" },
    { value: "TITAN.NS", label: "Titan Company Limited" },
    { value: "BAJFINANCE.NS", label: "Bajaj Finance Limited" },
    {
      value: "ADANIPORTS.NS",
      label: "Adani Ports and Special Economic Zone Limited",
    },
    { value: "NESTLEIND.NS", label: "Nestlé India Limited" },
    { value: "TATASTEEL.NS", label: "Tata Steel Limited" },
    { value: "ADANIENT.NS", label: "Adani Enterprises Limited" },
    { value: "BAJAJ-AUTO.NS", label: "Bajaj Auto Limited" },
  ];

  const trainOptionsDict = trainOptions.reduce((acc, option) => {
    acc[option.value] = option.label;
    return acc;
  }, {});

  const chartRef = useRef(null);

  const updateChart = (data) => {
    const ctx = chartRef.current?.getContext("2d");

    // Remove any existing chart
    if (window.myChart) {
      window.myChart.destroy();
    }

    // Create a new Bar chart
    if (ctx) {
      window.myChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: data.labels,
          datasets: [
            {
              label: "Price",
              data: data.datasets[0].data,
              backgroundColor: Array(data.datasets[0].data.length).fill(
                "white"
              ),
              borderWidth: 1,
            },
          ],
        },
        options: {
          indexAxis: "y",
          scales: {
            x: {
              display: false,
            },
            y: {
              display: true,
              stacked: true,
              ticks: {
                color: "white", // Set the color of the ticks
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      });
    }
  };

  // Mock data for the histogram
  const chartData = {
    labels: ["Satisfaction", "Cleanliness", "Punctuality", "Food", "Safety"],
    datasets: [
      {
        data: [5, 10, 15, 7, 20],
        backgroundColor: "rgba(255, 255, 255, 0.75)", // Adjust the color as needed
      },
    ],
  };

  const colour = percentageChange >= 0 ? "bg-green-600" : "bg-red-600";
  const stockLabel = trainOptionsDict[ticker];

  useEffect(() => {
    updateChart(chartData);
  }, [chartData]);

  return (
    <div>
      <Tilt tiltMaxAngleX={4} tiltMaxAngleY={4}>
        <li className="flex justify-between gap-x-6 p-5 rounded-lg bg-gray-700 mb-1">
          <div className="flex gap-x-4">
            {loading ? (
              <div className="animate-pulse">
                <div className="bg-gray-400 h-4 w-64 mb-2 rounded-md"></div>
                <div className="bg-gray-500 h-4 w-36 rounded-md"></div>
              </div>
            ) : (
              <div className="min-w-0 flex flex-col items-start">
                <p className="text-sm font-bold leading-5 text-white">
                  {ticker}
                </p>
                <p className="mt-1 truncate text-xs leading-5 text-slate-400 overflow-auto">
                  {stockLabel}
                </p>
              </div>
            )}
          </div>
          {!loading && (
            <div className="flex flex-row">
              <div className="hidden xl:block xl:w-48 xl:h-auto w-48 h-10 text-right mr-4">
                <canvas ref={chartRef}></canvas>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-sm font-bold leading-6 text-white">
                  {lastClosePrice}
                </p>
                <p
                  className={`mt-1 text-sm leading-5 ${colour} p-1 rounded-md text-white`}
                >
                  {percentageChange}%
                </p>
              </div>
            </div>
          )}
        </li>
      </Tilt>
    </div>
  );
}
