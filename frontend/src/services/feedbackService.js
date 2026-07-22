const API =
    "http://127.0.0.1:8000";



export async function getFeedbackStats(){


    const response =
        await fetch(
            `${API}/feedback/stats`
        );


    if(!response.ok){

        throw new Error(
            "Failed loading feedback statistics"
        );

    }


    return await response.json();

}






export async function getFeedbackList(){


    const response =
        await fetch(
            `${API}/feedback`
        );


    if(!response.ok){

        throw new Error(
            "Failed loading feedback list"
        );

    }


    return await response.json();

}