import React, { createContext, useState, useEffect } from "react";

// Create a context
export const FontSizeContext = createContext();

export const FontSizeProvider = ({ children }) => {
  // Initialize font size from local storage or use a default value
  const [fontSize, setFontSize] = useState(
    localStorage.getItem("fontSize") || "16px"
  );

  // Update local storage whenever font size changes
  useEffect(() => {
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
};
