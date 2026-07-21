import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import ChatWindow from "./components/chat/ChatWindow";


export default function App(){

return (

<div className="flex h-screen bg-neutral-100">

    <Sidebar />

    <div className="flex flex-col flex-1">

        <Header />

        <ChatWindow />

    </div>

</div>

)

}