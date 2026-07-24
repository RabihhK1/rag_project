import { API_URL } from "./api";



export async function getFeedbackStats(){


    const response =
        await fetch(
            `${API_URL}/feedback/stats`
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
            `${API_URL}/feedback`
        );


    if(!response.ok){

        throw new Error(
            "Failed loading feedback list"
        );

    }


    return await response.json();

}
