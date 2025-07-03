import React, { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import { adjectiveOptions } from '../lib/select_options/adjectiveOptions';

const ThreeBlocks = ({ randomIntent, setHowOften, setHowImp, setAdjectives }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [howOftenSelected, setHowOftenSelected] = useState(false);
  const [howImpSelected, setHowImpSelected] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [selectedHowOften, setSelectedHowOften] = useState(null);
  const [selectedHowImp, setSelectedHowImp] = useState(null);
  const [adjectives, setAdjectivesState] = useState([]);
  const [musicHoursPerDay, setMusicHoursPerDay] = useState(undefined);
  const [useSongs, setUseSongs] = useState(false);

  // Get daily music hours from localStorage userData
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("userData");
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          if (parsed.hours_listening_daily) {
            setMusicHoursPerDay(Number(parsed.hours_listening_daily));
          } else {
            setMusicHoursPerDay(1); // fallback to 1 hour/day
          }
        } catch {
          setMusicHoursPerDay(1);
        }
      } else {
        setMusicHoursPerDay(1);
      }
    }
  }, []);

  // If musicHoursPerDay is undefined, return null or a loading spinner
  if (musicHoursPerDay === undefined) {
    return null;
  }

  // Build dynamic choices for "How often" based on musicHoursPerDay and switch
  const getHowOftenOptions = () => {
    const percentages = [0.05, 0.15, 0.3, 0.6];
    const hours = Number(musicHoursPerDay) || 1;
    const totalMinutes = hours * 60;
    const totalSongs = Math.round(totalMinutes / 3);

    const formatMinutes = (min) => {
      if (min > 60) {
        return `${(min / 60).toFixed(1)} hours`;
      }
      return `${Math.round(min)} min`;
    };

    const options = percentages.map((percent, idx) => {
      let minuteValue = totalMinutes * percent;
      let songValue = Math.round(totalSongs * percent);
      if (!useSongs) {
        if (idx === 0) return `<${songValue} songs per day`;
        return `${songValue} songs per day`;
      } else {
        if (idx === 0) return `<${formatMinutes(minuteValue)} per day`;
        return `${formatMinutes(minuteValue)} per day`;
      }
    });
    // Add a "more than" option at the end
    let lastMinute = totalMinutes * percentages[percentages.length - 1];
    let lastSong = Math.round(totalSongs * percentages[percentages.length - 1]);
    options.push(
      !useSongs
        ? `> ${lastSong} songs per day`
        : `> ${formatMinutes(lastMinute)} per day`
    );
    return options;
  };

  const howOftenOptions = getHowOftenOptions();

  const handleHowOftenChange = (value) => {
    setHowOften(value);
    setHowOftenSelected(true);
    setSelectedHowOften(value);
    setShowAlert(false);
  };

  const handleHowImpChange = (value) => {
    setHowImp(value);
    setHowImpSelected(true);
    setSelectedHowImp(value);
    setShowAlert(false);
  };

  const handleAdjectivesChange = (newValue) => {
    setAdjectivesState(newValue);
    setAdjectives(newValue);
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
          <div className="p-4 bg-gray-100 rounded shadow relative">
            <h3 className="font-bold mb-2">Adjectives for Songs in this Intent</h3>
            <p className="text-gray-700">Please select or add new adjectives that describe the songs you will classify for this intent.</p>
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
              options={adjectiveOptions}
              value={adjectives}
              onChange={handleAdjectivesChange}
              placeholder="Type or select adjectives..."
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>

          {/* First Block: How often question with switch */}
          <div className="p-4 bg-gray-100 rounded shadow relative">
            <h3 className="font-bold mb-2">On average, how often do you listen to music with this intent per day?</h3>
            <div className="absolute top-2 right-2 group">
              <div className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full cursor-pointer">
                i
              </div>
              <div className="absolute top-8 right-0 hidden group-hover:block bg-white text-gray-700 text-sm p-4 rounded shadow-lg w-64 z-10">
                Please select the option that best matches your average daily listening for this intent.<br />
                Use the switch to toggle between minutes/hours and songs per day.
              </div>
            </div>
            <div className="flex items-center mb-2 space-x-4">
              <span className="text-xs text-gray-500">Songs/Minutes</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={useSongs}
                  onChange={() => setUseSongs(!useSongs)}
                />
                <div className="w-8 h-4 bg-gray-300 rounded-full peer peer-checked:bg-blue-200 transition-colors"></div>
                <span className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
              </label>
            </div>
            <div>
              {howOftenOptions.map((option, index) => (
                <label key={option} className="flex items-center space-x-3 text-gray-600">
                  <input
                    type="radio"
                    name="how-often"
                    className="hidden peer"
                    checked={selectedHowOften === index + 1}
                    onChange={() => handleHowOftenChange(index + 1)}
                  />
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 peer-checked:border-blue-300 peer-checked:bg-blue-300 peer-checked:ring-2 peer-checked:ring-blue-400"></div>
                  <span>{option}</span>
                </label>
              ))}
            </div>
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
              "Slightly important",
              "Moderately important",
              "Fairly important",
              "Very important",
            ].map((option, index) => (
              <label key={option} className="flex items-center space-x-3 text-gray-600">
                <input
                  type="radio"
                  name="how-imp"
                  className="hidden peer"
                  checked={selectedHowImp === index + 1}
                  onChange={() => handleHowImpChange(index + 1)}
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
