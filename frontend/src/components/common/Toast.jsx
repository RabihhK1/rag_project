function Toast({toast}){


    if(!toast)
        return null;



    return (


        <div

        className={`toast ${toast.type}`}

        >


            <div className="toast-icon">

                ⚠

            </div>



            <div>

                <strong>
                    Connection Error
                </strong>


                <p>

                    {toast.message}

                </p>


            </div>



        </div>


    );


}


export default Toast;