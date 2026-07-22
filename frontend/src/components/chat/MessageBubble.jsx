import { useState } from "react";

import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";


const API = "http://127.0.0.1:8000";



function MessageBubble({ message }) {


    const [showSources, setShowSources] = useState(false);


    const [feedback, setFeedback] = useState(
        message.feedback || null
    );


    const [copied, setCopied] = useState(false);





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







    async function sendFeedback(type){


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


                        rating:type

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





                    const language = className

                    ? className.replace(
                        "language-",
                        ""
                    )

                    : "text";







                    return (


                        <div className="code-block">



                            <div className="code-header">


                                <span>
                                    {language}
                                </span>



                                <button

                                onClick={()=>
                                    copyCode(codeText)
                                }

                                >

                                    Copy

                                </button>


                            </div>





                            <SyntaxHighlighter


                            language={language}


                            style={vscDarkPlus}



                            customStyle={{

                                margin:0,

                                borderRadius:
                                "0 0 12px 12px",

                                fontSize:"14px"

                            }}



                            >

                                {codeText}


                            </SyntaxHighlighter>





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


                    onClick={()=>
                        sendFeedback("up")
                    }

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


                    onClick={()=>
                        sendFeedback("down")
                    }

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


        </div>


    );


}


export default MessageBubble;