function Header({ onStartTour }){

return (

<div className="header" data-tour="header">


<div className="header-title">
Cybersecurity RAG Assistant
</div>


<div className="header-actions">

<button className="tour-trigger" type="button" onClick={onStartTour}>
Take tour
</button>

<div className="status">
● Online
</div>

</div>


</div>

)

}


export default Header;
