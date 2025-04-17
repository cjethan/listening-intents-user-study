import React, { useState } from 'react';

const ThreeBlocks = ({ randomIntent, setHowOften, setHowImp }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [howOftenSelected, setHowOftenSelected] = useState(false);
  const [howImpSelected, setHowImpSelected] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [selectedHowOften, setSelectedHowOften] = useState(null);
  const [selectedHowImp, setSelectedHowImp] = useState(null);
  const [usePlaceholderLabels1, setUsePlaceholderLabels1] = useState(false);
  const [usePlaceholderLabels2, setUsePlaceholderLabels2] = useState(false);

  const handleHowOftenChange = (value) => {
    setHowOften(value);
    setHowOftenSelected(true);
    setSelectedHowOften(value);
    setShowAlert(false);
    console.log("How often changed to:", value);
  };

  const handleHowImpChange = (value) => {
    setHowImp(value);
    setHowImpSelected(true);
    setSelectedHowImp(value);
    setShowAlert(false);
    console.log("How important changed to:", value);
  };

  const toggleCollapse = () => {
    if (howOftenSelected && howImpSelected) {
      setIsCollapsed(!isCollapsed);
    } else {
      setShowAlert(true);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div
          onClick={toggleCollapse}
          className="cursor-pointer flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={`w-6 h-6 transform transition-transform ${isCollapsed ? "rotate-180" : ""}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
          <span className="ml-2 text-sm font-semibold">{isCollapsed ? "Expand" : "Collapse"}</span>
        </div>
        {showAlert && (
          <p className="text-red-500 text-sm ml-4">
            Please select an option for both questions before collapsing.
          </p>
        )}
      </div>
      {!isCollapsed && (
        <div className="grid grid-cols-3 gap-4">
          {/* First Block */}
          <div className="p-4 bg-gray-100 rounded shadow relative">
            <h3 className="font-bold mb-2">How often do you listen with this intent?</h3>
            <div className="absolute top-2 right-2 group">
              <div className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full cursor-pointer">
                i
              </div>
              <div className="absolute top-8 right-0 hidden group-hover:block bg-white text-gray-700 text-sm p-4 rounded shadow-lg w-64 z-10">
                Aproximate how much you listen to music with this intent. <br />
                Choose days/weeks or songs/minutes acording to how it is easier to answer for you.
              </div>
            </div>
            {/* Stylish, smaller switches */}
            <div className="flex items-center mb-4 space-x-6">
              <div className="flex items-center">
                <span className="text-gray-600 text-sm mr-2">Days/Weeks</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={usePlaceholderLabels1}
                    onChange={() => setUsePlaceholderLabels1(!usePlaceholderLabels1)}
                  />
                  <div className="w-8 h-4 bg-gray-300 rounded-full peer peer-checked:bg-blue-200 transition-colors"></div>
                  <span className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
                </label>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 text-sm mr-2">Songs/Minutes</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={usePlaceholderLabels2}
                    onChange={() => setUsePlaceholderLabels2(!usePlaceholderLabels2)}
                  />
                  <div className="w-8 h-4 bg-gray-300 rounded-full peer peer-checked:bg-blue-200 transition-colors"></div>
                  <span className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
                </label>
              </div>
            </div>
            {/* Determine labels based on switches */}
            {[
              usePlaceholderLabels1 && usePlaceholderLabels2
                ? "<63 min/week"
                : usePlaceholderLabels1
                ? "<21 songs/week"
                : usePlaceholderLabels2
                ? "<9 min/day"
                : "<3 songs/day",
              usePlaceholderLabels1 && usePlaceholderLabels2
                ? "63 min/week"
                : usePlaceholderLabels1
                ? "21 songs/week"
                : usePlaceholderLabels2
                ? "9 min/day"
                : "3 songs/day",
              usePlaceholderLabels1 && usePlaceholderLabels2
                ? "189 min/week"
                : usePlaceholderLabels1
                ? "49 songs/week"
                : usePlaceholderLabels2
                ? "27 min/day"
                : "9 songs/day",
              usePlaceholderLabels1 && usePlaceholderLabels2
                ? "378 min/week"
                : usePlaceholderLabels1
                ? "126 songs/week"
                : usePlaceholderLabels2
                ? "54 min/day"
                : "18 songs/day",
              usePlaceholderLabels1 && usePlaceholderLabels2
                ? "504 min/week"
                : usePlaceholderLabels1
                ? "168 songs/week"
                : usePlaceholderLabels2
                ? "72 min/day"
                : "24 songs/day",
              usePlaceholderLabels1 && usePlaceholderLabels2
                ? ">504 min/week"
                : usePlaceholderLabels1
                ? ">168 songs/week"
                : usePlaceholderLabels2
                ? ">72 min/day"
                : ">24 songs/day",
            ].map((option, index) => (
              <label key={option} className="block text-gray-600">
                <input
                  type="radio"
                  name="how-often"
                  className="mr-2"
                  checked={selectedHowOften === index + 1}
                  onChange={() => handleHowOftenChange(index + 1)} // Save as 1-6
                />
                {option}
              </label>
            ))}
          </div>

          {/* Second Block */}
          <div className="p-4 bg-gray-100 rounded shadow relative">
            <h3 className="font-bold mb-2">How important is the fulfillment of this intent to you?</h3>
            <div className="absolute top-2 right-2 group">
              <div className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full cursor-pointer">
                i
              </div>
              <div className="absolute top-8 right-0 hidden group-hover:block bg-white text-gray-700 text-sm p-4 rounded shadow-lg w-64 z-10">
                When you listen to music with this intent, how important is the fulfillment of this intent to you?
              </div>
            </div>
            {[
              "Not important / Never listening with this intent",
              "Little important",
              "Medium important",
              "Somewhat important",
              "Very important",
            ].map((option, index) => (
              <label key={option} className="block text-gray-600">
                <input
                  type="radio"
                  name="how-imp"
                  className="mr-2"
                  checked={selectedHowImp === index + 1}
                  onChange={() => handleHowImpChange(index + 1)} // Save as 1-5
                />
                {option}
              </label>
            ))}
          </div>

          {/* Third Block */}
          <div className="p-4 bg-gray-100 rounded shadow relative">
            <h3 className="font-bold mb-2">Additional Information</h3>
            <div className="absolute top-2 right-2 group">
              <div className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full cursor-pointer">
                i
              </div>
              <div className="absolute top-8 right-0 hidden group-hover:block bg-white text-gray-700 text-sm p-4 rounded shadow-lg w-64 z-10">
                Additional ideas about how to categorize songs with this intent.
              </div>
            </div>
            <p className="italic text-gray-700">
              {randomIntent ? randomIntent.main_listening_function : 'No intent available'}
            </p>
            <p className="text-gray-700">
              {randomIntent?.listening_functions.slice(0, 3).map((functionName, index) => (
                functionName && functionName !== randomIntent.main_listening_function ? (
                  <React.Fragment key={index}>
                    {functionName}<br />
                  </React.Fragment>
                ) : null
              ))}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeBlocks;
