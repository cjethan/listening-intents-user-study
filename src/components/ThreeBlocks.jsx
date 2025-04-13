import React from 'react';

const ThreeBlocks = ({ randomIntent, setHowOften, setHowImp }) => {
  const handleHowOftenChange = (value) => {
    setHowOften(value);
    console.log("How often changed to:", value);
  };

  const handleHowImpChange = (value) => {
    setHowImp(value);
    console.log("How important changed to:", value);
  };

  return (
    <div className="grid grid-cols-3 gap-4 w-full">
      {/* First Block */}
      <div className="p-4 bg-gray-100 rounded shadow">
        <h3 className="font-bold mb-2">How often do you listen with this intent?</h3>
        {["0 songs/day", "3 songs/day", "9 songs/day", "18 songs/day", "72 songs/day", ">72 songs/day"].map((option, index) => (
          <label key={option} className="block text-gray-600">
            <input
              type="radio"
              name="how-often"
              className="mr-2"
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
  );
};

export default ThreeBlocks;
