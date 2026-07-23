export function exportFeedbackCSV(feedback){


    if(!feedback || feedback.length === 0){

        return;

    }



    const headers = [

        "Rating",
        "Comment",
        "Reasons",
        "Date"

    ];





    const rows = feedback.map(item => [


        item.rating === "up"
        ?
        "Positive"
        :
        "Negative",



        item.comment || "No comment",



        item.reasons && item.reasons.length > 0
        ?
        item.reasons.join(" | ")
        :
        "No reasons",



        item.created_at
        ?
        new Date(item.created_at)
        .toLocaleString()
        :
        ""



    ]);







    const csvContent = [


        headers,


        ...rows


    ]

    .map(row =>


        row.map(field =>


            `"${String(field)
            .replace(/"/g,'""')}"`


        )

        .join(",")


    )

    .join("\n");








    const blob = new Blob(

        [csvContent],

        {
            type:"text/csv;charset=utf-8;"
        }

    );



    const url = URL.createObjectURL(blob);



    const link = document.createElement("a");


    link.href=url;


    link.download="feedback_report.csv";


    document.body.appendChild(link);


    link.click();



    document.body.removeChild(link);


    URL.revokeObjectURL(url);



}