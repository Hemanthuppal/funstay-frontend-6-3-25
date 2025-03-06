import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();
import { baseURL } from "../../Apiservices/Api";

export const ThemeProvider = ({ children }) => {
  const [themeColor, setThemeColor] = useState(null); // Start with null instead of default color
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    fetch(`${baseURL}/api/get-active-theme`)
      .then((response) => response.json())
      .then((data) => {
        if (data.color_code) {
          setThemeColor(data.color_code);
          document.documentElement.style.setProperty("--theme-color", data.color_code);
        }
      })
      .catch((error) => console.error("Error fetching active theme:", error))
      .finally(() => setLoading(false)); // Mark loading as complete
  }, []);

  const changeThemeColor = (color) => {
    setThemeColor(color);
    document.documentElement.style.setProperty("--theme-color", color);

    fetch(`${baseURL}/api/set-theme`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        color_name: "Custom",
        color_code: color,
        category: "Custom",
      }),
    })
      .then((response) => response.json())
      .then((data) => console.log("Theme updated:", data))
      .catch((error) => console.error("Error updating theme:", error));
  };

  if (loading) return null; // Prevent rendering until theme is loaded

  return (
    <ThemeContext.Provider value={{ themeColor, changeThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
