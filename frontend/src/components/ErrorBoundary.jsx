import React from "react";
import ErrorPage from "../pages/ErrorPage.jsx";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message ?? "An unexpected error occurred.",
    };
  }

  componentDidCatch(error, info) {
    // Placeholder — swap this out for Sentry.captureException(error, { extra: info }) later
    console.error("[TripFusion Error]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage message={this.state.errorMessage} />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
