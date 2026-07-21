import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


function MessageBubble({ message }) {


    const [showSources, setShowSources] = useState(false);



    return (

        <div className={`message ${message.role}`}>

            <div className="bubble">


                <div className="message-content">


                    {
                        message.role === "assistant"

                        ?

                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                        >
                            {message.content}
                        </ReactMarkdown>


                        :

                        message.content
                    }


                </div>



                {
                    message.role === "assistant" &&
                    message.sources &&
                    message.sources.length > 0 &&


                    <div className="sources-wrapper">


                        <button

                            className="sources-button"

                            onClick={() =>
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
                                                Source {index + 1}
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
                                                {
                                                    Number(src.score)
                                                    .toFixed(3)
                                                }
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