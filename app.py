import streamlit as st
import sys
from pathlib import Path
import time


# --------------------------------------------------
# Paths
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent

SRC_DIR = PROJECT_ROOT / "src"

sys.path.append(
    str(SRC_DIR)
)


# --------------------------------------------------
# Imports
# --------------------------------------------------

from rag_pipeline.retriever import Retriever
from rag_pipeline.generator import Generator



# --------------------------------------------------
# Page configuration
# --------------------------------------------------

st.set_page_config(

    page_title="CIS Security Assistant",

    page_icon="🛡️",

    layout="wide"

)



# --------------------------------------------------
# Custom CSS
# --------------------------------------------------

st.markdown(
"""
<style>

/* Main background */

.stApp {

    background:
    linear-gradient(
        135deg,
        #0b1220,
        #111827
    );

    color:#e5e7eb;

}



/* Header */

.main-title {

    font-size:42px;

    font-weight:800;

    color:#d1fae5;

    margin-bottom:0;

}



.subtitle {

    color:#94a3b8;

    font-size:18px;

}



/* Chat bubbles */

[data-testid="stChatMessage"] {

    background:

    rgba(30,41,59,0.55);

    border-radius:18px;

    padding:15px;

    margin-bottom:12px;

    border:

    1px solid rgba(255,255,255,0.05);

}



/* User message */

[data-testid="stChatMessage"]:has(div[data-testid="chatAvatarIcon-user"]) {

    background:

    rgba(30,64,175,0.25);

}



/* Assistant message */

[data-testid="stChatMessage"]:has(div[data-testid="chatAvatarIcon-assistant"]) {

    background:

    rgba(6,78,59,0.25);

}



/* Sidebar */

section[data-testid="stSidebar"] {

    background:

    linear-gradient(
        180deg,
        #111827,
        #020617
    );

}



/* Buttons */

.stButton button {

    background:

    #065f46;

    color:white;

    border-radius:12px;

    border:none;

    padding:10px 20px;

}



.stButton button:hover {

    background:

    #047857;

}



/* Expander */

.streamlit-expanderHeader {

    color:#a7f3d0;

}



/* Input */

.stChatInputContainer {

    border-radius:20px;

}



</style>
""",
unsafe_allow_html=True
)



# --------------------------------------------------
# Header
# --------------------------------------------------

st.markdown(

"""
<div class="main-title">
🛡️ CIS Security Assistant
</div>

<div class="subtitle">
Your AI assistant for CIS Critical Security Controls v8
<br>
Powered by RAG + Weaviate + Qwen
</div>

<br>
""",

unsafe_allow_html=True

)



# --------------------------------------------------
# General chat detection
# --------------------------------------------------

def is_general_chat(message):

    greetings = [

        "hello",
        "hi",
        "hey",
        "good morning",
        "good afternoon",
        "good evening",
        "thanks",
        "thank you"

    ]


    msg = message.lower().strip()


    return any(
        x in msg
        for x in greetings
    )



# --------------------------------------------------
# Load RAG
# --------------------------------------------------

@st.cache_resource
def load_pipeline():

    retriever = Retriever()

    generator = Generator()

    return retriever, generator



retriever, generator = load_pipeline()



# --------------------------------------------------
# Session state
# --------------------------------------------------

if "messages" not in st.session_state:

    st.session_state.messages = []



# --------------------------------------------------
# Welcome screen
# --------------------------------------------------

if len(st.session_state.messages) == 0:


    st.info(
"""
👋 Welcome!

Ask me anything about:

🔹 CIS Controls  
🔹 Implementation Groups  
🔹 Safeguards  
🔹 Vulnerability Management  
🔹 Access Control  
🔹 Security Best Practices

Example:

"What are the requirements of Control 6?"
"""
    )



# --------------------------------------------------
# Previous messages
# --------------------------------------------------

for message in st.session_state.messages:


    with st.chat_message(

        message["role"],

        avatar=
        "🧑‍💻"
        if message["role"]=="user"
        else "🛡️"

    ):

        st.markdown(
            message["content"]
        )



# --------------------------------------------------
# User input
# --------------------------------------------------

question = st.chat_input(

    "Ask your security question..."

)



if question:


    st.session_state.messages.append(

        {

            "role":"user",

            "content":question

        }

    )


    with st.chat_message(

        "user",

        avatar="🧑‍💻"

    ):

        st.markdown(
            question
        )



    # -----------------------------
    # Routing
    # -----------------------------

    if is_general_chat(question):


        answer = (

            "Hello! 👋\n\n"

            "I am your CIS Security Assistant. "

            "Ask me anything about "

            "CIS Critical Security Controls v8."

        )


        documents=[]



    else:


        with st.spinner(

            "🔎 Searching security knowledge..."

        ):


            documents = retriever.search(

                question

            )


        with st.spinner(

            "🧠 Thinking..."

        ):


            answer = generator.generate(

                question,

                documents

            )



    # -----------------------------
    # Response
    # -----------------------------

    with st.chat_message(

        "assistant",

        avatar="🛡️"

    ):


        st.markdown(

            answer

        )


        if documents:


            with st.expander(

                "📚 View retrieved evidence"

            ):


                st.caption(

                    f"{len(documents)} relevant sections found"

                )


                for i,doc in enumerate(

                    documents,

                    start=1

                ):


                    st.markdown(

                        f"### 🔹 Source {i}"

                    )


                    st.write(

                        doc.metadata

                    )


                    st.write(

                        doc.page_content[:600]

                    )


                    st.divider()



    st.session_state.messages.append(

        {

            "role":"assistant",

            "content":answer

        }

    )



# --------------------------------------------------
# Sidebar
# --------------------------------------------------

with st.sidebar:


    st.markdown(

    """

    ## 🛡️ Security Console

    """

    )


    st.write(

        "System Status"

    )


    st.success(

        "RAG Engine Online"

    )


    st.write(

        "Components"

    )


    st.write(

    """
    ✅ Weaviate Vector DB

    ✅ BGE Embeddings

    ✅ BGE Reranker

    ✅ Qwen Generator

    """

    )



    st.divider()



    if st.button(

        "🧹 Clear Conversation"

    ):


        st.session_state.messages=[]

        st.rerun()