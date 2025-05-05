import React, { useState } from 'react';
import CreatableSelect from 'react-select/creatable';

const ThreeBlocks = ({ randomIntent, setHowOften, setHowImp, setAdjectives }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [howOftenSelected, setHowOftenSelected] = useState(false);
  const [howImpSelected, setHowImpSelected] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [selectedHowOften, setSelectedHowOften] = useState(null);
  const [selectedHowImp, setSelectedHowImp] = useState(null);
  const [usePlaceholderLabels2, setUsePlaceholderLabels2] = useState(false);
  const [adjectives, setAdjectivesState] = useState([]);

  const handleHowOftenChange = (value) => {
    setHowOften(value);
    setHowOftenSelected(true); // Mark question as answered
    setSelectedHowOften(value);
    setShowAlert(false);
    console.log("How often changed to:", value);
  };

  const handleHowImpChange = (value) => {
    setHowImp(value);
    setHowImpSelected(true); // Mark question as answered
    setSelectedHowImp(value);
    setShowAlert(false);
    console.log("How important changed to:", value);
  };

  const handleAdjectivesChange = (newValue) => {
    setAdjectivesState(newValue);
    setAdjectives(newValue); // Update parent state
    setShowAlert(false);
  };

  const toggleCollapse = () => {
    if (howOftenSelected && howImpSelected && adjectives.length > 0) {
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
            Please select an option for both questions and at least one adjective before collapsing.
          </p>
        )}
      </div>
      {!isCollapsed && (
        <div className="grid grid-cols-3 gap-4">
          {/* Multi-select Autocomplete for Adjectives */}
          <div className="p-4 bg-gray-100 rounded shadow relative">
            <h3 className="font-bold mb-2">Adjectives for Songs in this Intent</h3>
            <div className="absolute top-2 right-2 group">
              <div className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full cursor-pointer">
                i
              </div>
              <div className="absolute top-8 right-0 hidden group-hover:block bg-white text-gray-700 text-sm p-4 rounded shadow-lg w-64 z-10">
                Select or add adjectives that describe the songs you will classify for this intent.
              </div>
            </div>
            <CreatableSelect
              isMulti
              options={[
                { value: 'happy', label: 'Happy' },
                { value: 'sad', label: 'Sad' },
                { value: 'melancholic', label: 'Melancholic' },
              ]}
              value={adjectives}
              onChange={handleAdjectivesChange}
              placeholder="Type or select adjectives..."
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>

          {/* First Block */}
          <div className="p-4 bg-gray-100 rounded shadow relative">
            <h3 className="font-bold mb-2">How often do you listen with this intent?</h3>
            <div className="absolute top-2 right-2 group">
              <div className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full cursor-pointer">
                i
              </div>
              <div className="absolute top-8 right-0 hidden group-hover:block bg-white text-gray-700 text-sm p-4 rounded shadow-lg w-64 z-10">
                Approximate how much you listen to music with this intent. <br />
                Choose songs/minutes according to how it is easier to answer for you.
              </div>
            </div>
            <div className="flex items-center mb-4 space-x-6">
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
            {[
              usePlaceholderLabels2 ? "<9 min/week" : "<3 songs/week",
              usePlaceholderLabels2 ? "9 min/week" : "3 songs/week",
              usePlaceholderLabels2 ? "27 min/week" : "9 songs/week",
              usePlaceholderLabels2 ? "54 min/week" : "18 songs/week",
              usePlaceholderLabels2 ? "72 min/week" : "24 songs/week",
              usePlaceholderLabels2 ? ">72 min/week" : ">24 songs/week",
            ].map((option, index) => (
              <label key={option} className="flex items-center space-x-3 text-gray-600">
                <input
                  type="radio"
                  name="how-often"
                  className="hidden peer"
                  checked={selectedHowOften === index + 1}
                  onChange={() => handleHowOftenChange(index + 1)} // Save as 1-6
                />
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 peer-checked:border-blue-300 peer-checked:bg-blue-300 peer-checked:ring-2 peer-checked:ring-blue-400"></div>
                <span>{option}</span>
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
              "Relatively important",
              "Very important",
            ].map((option, index) => (
              <label key={option} className="flex items-center space-x-3 text-gray-600">
                <input
                  type="radio"
                  name="how-imp"
                  className="hidden peer"
                  checked={selectedHowImp === index + 1}
                  onChange={() => handleHowImpChange(index + 1)} // Save as 1-5
                />
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 peer-checked:border-blue-300 peer-checked:bg-blue-300 peer-checked:ring-2 peer-checked:ring-blue-400"></div>
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeBlocks;
