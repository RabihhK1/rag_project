function Header({ onStartTour, user, onLogout }) {
  return (
    <header className="header" data-tour="header">
      <div className="header-title">Cybersecurity RAG Assistant</div>

      <div className="header-actions">
        <button className="tour-trigger" type="button" onClick={onStartTour}>
          Take tour
        </button>
        <div className="user-menu">{user?.avatar_url && <img src={user.avatar_url} alt="" />}<span>{user?.display_name}</span><button type="button" onClick={onLogout}>Log out</button></div>

        <div className="status" aria-label="System status: online">
          ● Online
        </div>
      </div>
    </header>
  );
}

export default Header;
