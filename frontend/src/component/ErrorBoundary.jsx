import React from "react";
import { BsShieldCheck, BsHouseDoorFill, BsArrowRepeat, BsExclamationTriangleFill } from "react-icons/bs";

/**
 * Enterprise Error Boundary
 * Intercepts uncaught runtime errors in React components, preventing blank white screens
 * and providing instant safe return to the Dashboard.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDiagnostics: false,
      copied: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React ErrorBoundary caught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReturnToDashboard = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/dashboard";
  };

  handleReload = () => {
    window.location.reload();
  };

  handleCopyDiagnostics = () => {
    const { error, errorInfo } = this.state;
    const text = `Error: ${error?.toString() || "Unknown"}\n\nComponent Stack:\n${errorInfo?.componentStack || "N/A"}`;
    navigator.clipboard.writeText(text);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
          padding: "24px",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          color: "#1e293b"
        }}>
          <div style={{
            maxWidth: "600px",
            width: "100%",
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            padding: "36px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 20px 45px -12px rgba(15, 23, 42, 0.12)",
            textAlign: "center"
          }}>
            {/* Glowing Recovery Shield Icon */}
            <div style={{
              width: "72px",
              height: "72px",
              margin: "0 auto 20px",
              borderRadius: "50%",
              backgroundColor: "rgba(124, 30, 46, 0.08)",
              border: "1px solid rgba(124, 30, 46, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#7c1e2e",
              fontSize: "32px",
              boxShadow: "0 0 25px rgba(124, 30, 46, 0.12)"
            }}>
              <BsShieldCheck />
            </div>

            <h1 style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: "8px",
              letterSpacing: "-0.02em"
            }}>
              Application Safely Recovered
            </h1>

            <p style={{
              color: "#64748b",
              fontSize: "0.95rem",
              lineHeight: 1.5,
              marginBottom: "28px"
            }}>
              An unexpected display issue occurred, but our enterprise crash guard intercepted it. Your business records and login session remain completely safe.
            </p>

            {/* Action Buttons */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginBottom: "24px"
            }}>
              <button
                onClick={this.handleReturnToDashboard}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "14px 24px",
                  background: "linear-gradient(135deg, #7c1e2e 0%, #611726 100%)",
                  color: "#ffffff",
                  fontSize: "1rem",
                  fontWeight: 700,
                  borderRadius: "12px",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(124, 30, 46, 0.25)",
                  transition: "all 0.2s ease"
                }}
              >
                <BsHouseDoorFill /> Return to Dashboard
              </button>

              <button
                onClick={this.handleReload}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "12px 20px",
                  backgroundColor: "#f1f5f9",
                  color: "#1e293b",
                  fontSize: "0.92rem",
                  fontWeight: 600,
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                <BsArrowRepeat /> Reload Page
              </button>
            </div>

            {/* Expandable Technical Diagnostics */}
            <div style={{ marginTop: "16px" }}>
              <button
                onClick={() => this.setState(prev => ({ showDiagnostics: !prev.showDiagnostics }))}
                style={{
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: "6px"
                }}
              >
                {this.state.showDiagnostics ? "Hide Technical Details ▲" : "View Technical Details ▼"}
              </button>

              {this.state.showDiagnostics && (
                <div style={{
                  marginTop: "12px",
                  padding: "14px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "10px",
                  textAlign: "left",
                  border: "1px solid #e2e8f0"
                }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px"
                  }}>
                    <span style={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: 700 }}>
                      <BsExclamationTriangleFill /> {this.state.error?.toString()}
                    </span>
                    <button
                      onClick={this.handleCopyDiagnostics}
                      style={{
                        padding: "4px 8px",
                        fontSize: "0.72rem",
                        backgroundColor: "#e2e8f0",
                        color: "#1e293b",
                        border: "1px solid #cbd5e1",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: 600
                      }}
                    >
                      {this.state.copied ? "Copied!" : "Copy Details"}
                    </button>
                  </div>
                  <pre style={{
                    fontSize: "0.72rem",
                    color: "#475569",
                    fontFamily: "monospace",
                    maxHeight: "150px",
                    overflowY: "auto",
                    margin: 0,
                    whiteSpace: "pre-wrap"
                  }}>
                    {this.state.errorInfo?.componentStack || "No stack information."}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              marginTop: "24px",
              paddingTop: "16px",
              borderTop: "1px solid #f1f5f9",
              fontSize: "0.75rem",
              color: "#94a3b8"
            }}>
              TSAR IT Billing &amp; ERP • High Availability Safe Mode
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
