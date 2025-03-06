import React, { useContext, useState, useEffect } from "react";
import { ThemeContext } from "./ThemeContext";
import Navbar from "../Navbar/Navbar";
import "./Themes.css";

const Themes = () => {
  const { changeThemeColor } = useContext(ThemeContext);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedColor, setSelectedColor] = useState("");
  const [colorOptions, setColorOptions] = useState([]);
  const [customColor, setCustomColor] = useState("");

  // 🔹 Fetch the active theme on page load
  useEffect(() => {
    fetch("http://localhost:5000/api/get-active-theme")
      .then((response) => response.json())
      .then((data) => {
        if (data.color_code) {
          setSelectedColor(data.color_code);
          changeThemeColor(data.color_code);
        }
      })
      .catch((error) => console.error("Error fetching active theme:", error));
  }, []);

  // 🔹 Fetch all themes and filter duplicates
  useEffect(() => {
    fetch("http://localhost:5000/api/get-themes")
      .then((response) => response.json())
      .then((data) => {
        // Filter out duplicate color codes
        const uniqueColors = Array.from(
          new Map(data.map((color) => [color.color_code, color])).values()
        );
        setColorOptions(uniqueColors);
      })
      .catch((error) => console.error("Error fetching colors:", error));
  }, []);

  // 🔹 Apply and Save Selected Theme
  const handleApplyColor = async () => {
    const themeColor = customColor || selectedColor;
    if (!themeColor) return;

    // Apply the theme immediately
    changeThemeColor(themeColor);
    setSelectedColor(themeColor);

    try {
      const response = await fetch("http://localhost:5000/api/set-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          color_name: "Custom",
          color_code: themeColor,
          category: "Custom",
        }),
      });

      const result = await response.json();
      console.log("Theme updated successfully:", result);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  return (
    <div className="themes-container">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`themes-box ${collapsed ? "collapsed" : ""}`}>
        <h3>Select Theme Color</h3>

        {/* 🔹 Show Fetched Colors */}
        <div className="color-options">
  {colorOptions
    .filter((color, index, self) => 
      index === self.findIndex((c) => c.color_code === color.color_code) // 🔹 Removes duplicates
    )
    .map((color) => (
      <span
        key={color.color_code}
        className="color-box"
        style={{ backgroundColor: color.color_code, position: "relative", cursor: "pointer" }}
        onClick={() => setSelectedColor(color.color_code)}
      >
        {selectedColor === color.color_code && (
          <span className="checkmark" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "#fff", fontSize: "18px", fontWeight: "bold" }}>
            ✔
          </span>
        )}
      </span>
    ))}
</div>



        {/* 🔹 Custom Color Picker */}
        <div className="custom-color">
          <label>Or pick a custom color:</label>
          <input
            type="color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="color-picker"
          />
        </div>

        {/* 🔹 Apply Button */}
        <button onClick={handleApplyColor} className="apply-button">
          Apply Theme
        </button>
      </div>
    </div>
  );
};

export default Themes;
