function FeedbackModal({

    isOpen,

    reason,

    setReason,

    comment,

    setComment,

    onClose,

    onSubmit

}) {


    if(!isOpen)
        return null;



    const reasons = [

        "Incorrect answer",

        "Missing information",

        "Wrong source",

        "Not relevant",

        "Other"

    ];





    return (


        <div className="modal-overlay">



            <div className="feedback-modal">



                <h2>

                    Tell us what went wrong

                </h2>



                <p>

                    Help improve the cybersecurity assistant.

                </p>





                <div className="feedback-reasons">


                {

                    reasons.map(item => (


                        <button

                        key={item}

                        className={
                            reason === item
                            ?
                            "reason active"
                            :
                            "reason"
                        }


                        onClick={()=>
                            setReason(item)
                        }

                        >

                            {item}

                        </button>


                    ))

                }


                </div>






                <textarea


                value={comment}


                onChange={
                    e =>
                    setComment(e.target.value)
                }


                placeholder=
                "Additional comments (optional)"


                />






                <div className="modal-actions">



                    <button

                    className="cancel-btn"

                    onClick={onClose}

                    >

                        Cancel

                    </button>





                    <button

                    className="submit-btn"

                    disabled={!reason}

                    onClick={onSubmit}

                    >

                        Submit

                    </button>



                </div>






            </div>



        </div>


    );


}


export default FeedbackModal;