import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


const API = "http://127.0.0.1:8000";



function MessageBubble({ message }) {


    const [showSources, setShowSources] = useState(false);


    const [feedback, setFeedback] = useState(
        message.feedback || null
    );


    const [copied, setCopied] = useState(false);



    // ============================
    // Feedback Modal State
    // ============================

    const [showFeedbackModal, setShowFeedbackModal] =
        useState(false);



    const [feedbackReason, setFeedbackReason] =
        useState("");



    const [feedbackComment, setFeedbackComment] =
        useState("");








    async function copyMessage(){


        try{


            await navigator.clipboard.writeText(
                message.content
            );


            setCopied(true);


            setTimeout(()=>{

                setCopied(false);

            },1500);



        }

        catch(error){

            console.error(
                "Copy failed:",
                error
            );

        }

    }









    async function copyCode(code){


        try{

            await navigator.clipboard.writeText(
                code
            );

        }

        catch(error){

            console.error(
                "Code copy failed:",
                error
            );

        }

    }









    async function sendFeedback(
        type,
        reason=null,
        comment=null
    ){


        try{


            const response = await fetch(

                `${API}/feedback`,

                {

                    method:"POST",

                    headers:{

                        "Content-Type":
                        "application/json"

                    },


                    body:JSON.stringify({

                        conversation_id:
                            message.conversation_id,


                        message_id:
                            message.message_id,


                        rating:
                            type,


                        reason,

                        comment

                    })

                }

            );



            if(!response.ok){

                console.error(
                    await response.text()
                );

                return;

            }




            setFeedback(type);



        }


        catch(error){


            console.error(
                "Feedback failed:",
                error
            );


        }


    }









    function submitNegativeFeedback(){


        sendFeedback(

            "down",

            feedbackReason,

            feedbackComment

        );


        setShowFeedbackModal(false);


    }









    function renderMarkdown(){


        return (

            <ReactMarkdown

            remarkPlugins={[remarkGfm]}


            components={{


                code({

                    inline,

                    className,

                    children,

                    ...props

                }){


                    const codeText =
                    String(children)
                    .replace(/\n$/,"");



                    if(inline){


                        return (

                            <code

                            className="inline-code"

                            {...props}

                            >

                                {children}

                            </code>

                        );

                    }





                    return (

                        <div className="code-block">


                            <div className="code-header">


                                <span>
                                    Code
                                </span>


                                <button

                                onClick={()=>
                                    copyCode(codeText)
                                }

                                >

                                    Copy

                                </button>


                            </div>



                            <pre>

                                <code

                                className={className}

                                {...props}

                                >

                                    {children}

                                </code>

                            </pre>


                        </div>

                    );


                }


            }}


            >

                {message.content}


            </ReactMarkdown>

        );


    }









    const isWelcome =
        message.message_id === "welcome";



    const isThinking =
        message.role === "assistant" &&
        message.content === "" &&
        !isWelcome;









    return (


        <div className={`message ${message.role}`}>


            <div className="bubble">



                <div className="message-content">



                {

                    isThinking ?


                    <div className="typing">

                        <span className="dot"></span>

                        <span className="dot"></span>

                        <span className="dot"></span>


                    </div>



                    :



                    message.role === "assistant"

                    ?

                    renderMarkdown()


                    :

                    message.content


                }



                </div>









                {
                message.role === "assistant" &&
                !isWelcome &&
                message.content !== "" &&


                <div className="message-actions">



                    <button
                    onClick={copyMessage}
                    >

                        {
                        copied
                        ?
                        "Copied ✓"
                        :
                        "📋 Copy"
                        }


                    </button>






                    <button

                    className={
                        feedback === "up"
                        ?
                        "active-feedback"
                        :
                        ""
                    }


                    onClick={()=>sendFeedback("up")}

                    >

                        👍

                    </button>






                    <button

                    className={
                        feedback === "down"
                        ?
                        "active-feedback"
                        :
                        ""
                    }


                    onClick={()=>setShowFeedbackModal(true)}

                    >

                        👎

                    </button>



                </div>

                }









                {

                message.role === "assistant" &&

                message.sources &&

                message.sources.length > 0 &&



                <div className="sources-wrapper">


                    <button

                    className="sources-button"

                    onClick={()=>
                        setShowSources(!showSources)
                    }

                    >

                        {
                        showSources
                        ?
                        "Hide Sources"
                        :
                        `View Sources (${message.sources.length})`
                        }


                    </button>





                    {
                    showSources &&


                    <div className="sources-drawer">


                    {
                    message.sources.map(

                    (src,index)=>(


                        <div

                        className="source-item"

                        key={index}

                        >

                            <strong>
                                Source {index+1}
                            </strong>


                            <p>
                                📄 Page: {src.page}
                            </p>


                            <p>
                                📌 {src.section}
                            </p>


                            <p>
                                🔎 Score:
                                {" "}
                                {Number(src.score).toFixed(3)}
                            </p>


                        </div>


                    )


                    )

                    }


                    </div>


                    }



                </div>


                }



            </div>









            {/* ============================
                FEEDBACK MODAL
            ============================ */}


            {

            showFeedbackModal &&


            <div className="feedback-overlay">


                <div className="feedback-modal">


                    <h3>
                        Help improve the answer
                    </h3>


                    <p>
                        What was wrong?
                    </p>



                    <select

                    value={feedbackReason}

                    onChange={(e)=>
                        setFeedbackReason(e.target.value)
                    }

                    >


                        <option value="">
                            Select reason
                        </option>


                        <option value="incorrect">
                            Incorrect answer
                        </option>


                        <option value="not_relevant">
                            Not relevant
                        </option>


                        <option value="missing_information">
                            Missing information
                        </option>


                        <option value="other">
                            Other
                        </option>


                    </select>




                    <textarea

                    placeholder="Optional comment"

                    value={feedbackComment}

                    onChange={(e)=>
                        setFeedbackComment(e.target.value)
                    }

                    />





                    <div className="feedback-buttons">


                        <button

                        onClick={()=>
                            setShowFeedbackModal(false)
                        }

                        >

                            Cancel

                        </button>




                        <button

                        onClick={submitNegativeFeedback}

                        >

                            Submit

                        </button>



                    </div>



                </div>


            </div>


            }



        </div>


    );


}


export default MessageBubble;