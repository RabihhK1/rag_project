function Header({ onStartTour }) {
    return (
        <header className="header" data-tour="header">
            <div className="header-title">Cybersecurity RAG Assistant</div>

            <div className="header-actions">
                <button className="tour-trigger" type="button" onClick={onStartTour}>
                    Take tour
                </button>

                <div className="status" aria-label="System status: online">
                    ● Online
                </div>
            </div>
        </header>
    );
}


export default Header;
