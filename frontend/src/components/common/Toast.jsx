function Toast({ toast }) {


    if (!toast)
        return null;



    return (

        <div 
        className={`toast ${toast.type}`}
        >

            {
                toast.type === "error"
                &&
                "⚠ "
            }


            {
                toast.type === "success"
                &&
                "✓ "
            }


            {
                toast.type === "info"
                &&
                "ℹ "
            }


            {toast.message}


        </div>

    );


}


export default Toast;