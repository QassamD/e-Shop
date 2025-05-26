import React from "react";

export default class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error:", error, errorInfo);
  }

  render() {
    return this.state.hasError ? (
      <div className="error">
        <h2>Application Error</h2>
        <button onClick={() => window.location.reload()}>
          Reload App
        </button>
      </div>
    ) : this.props.children;
  }
}