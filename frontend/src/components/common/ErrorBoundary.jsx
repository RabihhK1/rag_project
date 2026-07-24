import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="app-error" role="alert">
          <p className="app-error-eyebrow">Cyber RAG Assistant</p>
          <h1>Something went wrong.</h1>
          <p>Refresh the page to return to your conversations.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Refresh page
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
