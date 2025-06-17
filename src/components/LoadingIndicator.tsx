// components/LoadingIndicator.tsx
import React from "react";
import "./LoadingIndicator.scss";

const LoadingIndicator = () => {
  return (
    <div className="loading-indicator">
      <div className="spinner" />
      <span>Loading... Please wait</span>
    </div>
  );
};

export default LoadingIndicator;
