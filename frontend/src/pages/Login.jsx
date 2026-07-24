function Login({ onLogin }) {
  return <main className="auth-page"><section className="auth-card"><p className="auth-eyebrow">CIS CONTROLS / RAG</p><h1>Security guidance, grounded in your sources.</h1><p>Sign in to access your conversations, citations, feedback, and response history.</p><button className="auth-google-button" type="button" onClick={onLogin}>Continue with Google</button></section></main>;
}

export default Login;
