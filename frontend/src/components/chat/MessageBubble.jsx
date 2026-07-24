import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import FeedbackModal from "../common/FeedbackModal";
import { API_URL } from "../../services/api";


function MessageBubble({
    message,
    onRegenerate,
    regeneratingFor,
    onSelectVersion,
    onFeedbackSubmitted,
}) {


    const [showSources, setShowSources] = useState(false);


    const [feedbackOverrides, setFeedbackOverrides] = useState({});



    const [copied, setCopied] =
        useState(false);



    // Feedback modal

    const [showFeedbackModal, setShowFeedbackModal] =
        useState(false);



    const [feedbackReason, setFeedbackReason] =
        useState("");



    const [feedbackComment, setFeedbackComment] =
        useState("");

    const replyVersions = Array.isArray(message.versions) && message.versions.length
        ? message.versions
        : [message];
    const rootMessageId = message.root_message_id || message.message_id;
    const selectedReplyIndex = Math.min(
        Math.max(message.selected_version_index ?? 0, 0),
        replyVersions.length - 1
    );
    const isRegenerating = regeneratingFor === rootMessageId;

    const feedback =
        feedbackOverrides[message.message_id] ?? message.feedback ?? null;






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


            const response =
                await fetch(

                    `${API_URL}/feedback`,

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



                            reasons:
                                reason
                                ?
                                [reason]
                                :
                                [],



                            comment:
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





            setFeedbackOverrides((previous) => ({
                ...previous,
                [message.message_id]: type,
            }));
            onFeedbackSubmitted?.(message.message_id, type);



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



        setFeedbackReason("");

        setFeedbackComment("");



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

                    isThinking


                    ?


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
                    {replyVersions.length > 1 && (
                        <div className="response-versions" aria-label="Response versions">
                            <button
                                type="button"
                                aria-label="Previous response version"
                                disabled={isRegenerating || selectedReplyIndex === 0}
                                onClick={() => onSelectVersion?.(
                                    rootMessageId,
                                    selectedReplyIndex - 1
                                )}
                            >
                                ←
                            </button>
                            <span>
                                {selectedReplyIndex + 1} / {replyVersions.length}
                            </span>
                            <button
                                type="button"
                                aria-label="Next response version"
                                disabled={
                                    isRegenerating ||
                                    selectedReplyIndex === replyVersions.length - 1
                                }
                                onClick={() => onSelectVersion?.(
                                    rootMessageId,
                                    selectedReplyIndex + 1
                                )}
                            >
                                →
                            </button>
                        </div>
                    )}

                    <button
                        disabled={isRegenerating}
                        onClick={() => onRegenerate?.(
                            message.message_id,
                            message.conversation_id
                        )}
                    >
                        {isRegenerating ? "🔄 Regenerating…" : "🔄 Regenerate"}
                    </button>

                    <button onClick={copyMessage}>
                        {copied ? "Copied ✓" : "📋 Copy"}
                    </button>

                    <button
                        className={feedback === "up" ? "active-feedback" : ""}
                        disabled={isRegenerating}
                        onClick={() => sendFeedback("up")}
                    >
                        👍
                    </button>

                    <button
                        className={feedback === "down" ? "active-feedback" : ""}
                        disabled={isRegenerating}
                        onClick={() => setShowFeedbackModal(true)}
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

                                📄 Page:
                                {" "}
                                {src.page}

                            </p>





                            <p>

                                📌
                                {" "}
                                {src.section}

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








            <FeedbackModal


                isOpen={
                    showFeedbackModal
                }



                reason={
                    feedbackReason
                }



                setReason={
                    setFeedbackReason
                }



                comment={
                    feedbackComment
                }



                setComment={
                    setFeedbackComment
                }



                onClose={()=>{

                    setShowFeedbackModal(false);

                }}



                onSubmit={
                    submitNegativeFeedback
                }



            />






        </div>


    );


}



export default MessageBubble;
