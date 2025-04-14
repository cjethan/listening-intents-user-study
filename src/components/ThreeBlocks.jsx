import React, { useState } from 'react';

const ThreeBlocks = ({ randomIntent, setHowOften, setHowImp }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [howOftenSelected, setHowOftenSelected] = useState(false);
  const [howImpSelected, setHowImpSelected] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [selectedHowOften, setSelectedHowOften] = useState(null);
  const [selectedHowImp, setSelectedHowImp] = useState(null);

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
          <div className="p-4 bg-gray-100 rounded shadow">
            <h3 className="font-bold mb-2">How often do you listen with this intent?</h3>
            {["0 songs/day", "3 songs/day", "9 songs/day", "18 songs/day", "72 songs/day", ">72 songs/day"].map((option, index) => (
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
          <div className="p-4 bg-gray-100 rounded shadow">
            <h3 className="font-bold mb-2">How important is the fulfillment of this intent?</h3>
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
          <div className="p-4 bg-gray-100 rounded shadow">
            <h3 className="font-bold mb-2">Additional Information</h3>
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
