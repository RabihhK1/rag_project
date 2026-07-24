import {
    useEffect,
    useState
} from "react";


import {

    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer

} from "recharts";


import {

    getFeedbackStats,
    getFeedbackList

} from "../services/feedbackService";


import {

    exportFeedbackCSV

} from "../services/exportService";






function Analytics({goBack}) {



    const [stats,setStats] = useState(null);


    const [feedback,setFeedback] = useState([]);


    const [filteredFeedback,setFilteredFeedback] = useState([]);


    const [selectedFeedback,setSelectedFeedback] = useState(null);


    const [loading,setLoading] = useState(true);


    const [error,setError] = useState("");







    async function loadAnalytics(){


        try{


            const statsData =
                await getFeedbackStats();



            const feedbackData =
                await getFeedbackList();



            setStats(statsData);


            setFeedback(feedbackData);


            setFilteredFeedback(feedbackData);



        }


        catch(err){


            console.error(err);


            setError(
                "Failed loading analytics"
            );


        }


        finally{


            setLoading(false);


        }


    }









useEffect(()=>{


const timer = window.setTimeout(() => {

void loadAnalytics();

}, 0);


return () => window.clearTimeout(timer);


},[]);








    function changeFilter(type){


        if(type==="all"){


            setFilteredFeedback(
                feedback
            );


            return;


        }






        setFilteredFeedback(


            feedback.filter(

                item =>
                item.rating === type

            )


        );



    }









    if(loading){


        return (

            <div className="dashboard-page">


                <div className="dashboard-header">


                    <h2>
                        Loading Analytics...
                    </h2>


                </div>


            </div>

        );


    }







    if(error){


        return (

            <div className="dashboard-page">


                <div className="dashboard-header">


                    <button

                    className="back-button"

                    onClick={goBack}

                    >

                        ←

                    </button>



                    <h2>
                        {error}
                    </h2>



                </div>


            </div>

        );


    }







    const chartData = [


        {

            name:"Positive",

            value:stats.positive

        },


        {

            name:"Negative",

            value:stats.negative

        }


    ];






    const pieData = [


        {

            name:"Positive",

            value:stats.positive

        },


        {

            name:"Negative",

            value:stats.negative

        }


    ];









    return (



        <div className="dashboard-page">







            {/* HEADER */}



            <div className="analytics-topbar">



                <button

                className="icon-back"

                onClick={goBack}

                title="Back"

                >

                    ←

                </button>




                <h1>

                    Feedback Analytics

                </h1>



            </div>












            <div className="dashboard-content">







                {/* KPI CARDS */}




                <div className="analytics-cards">





                    <div className="analytics-card">


                        <h3>
                            Total Feedback
                        </h3>


                        <p>
                            {stats.total_feedback}
                        </p>


                    </div>








                    <div className="analytics-card positive">


                        <h3>
                            Positive
                        </h3>


                        <p>
                            {stats.positive}
                        </p>


                    </div>








                    <div className="analytics-card negative">


                        <h3>
                            Negative
                        </h3>


                        <p>
                            {stats.negative}
                        </p>


                    </div>








                    <div className="analytics-card">


                        <h3>
                            Satisfaction
                        </h3>


                        <p>
                            {stats.satisfaction_rate}%
                        </p>


                    </div>




                </div>












                {/* CHARTS */}





                <div className="charts-container">






                    <div className="chart-box">


                        <h2>
                            Ratings Overview
                        </h2>





                        <ResponsiveContainer

                        width="100%"

                        height={320}

                        >



                            <BarChart

                            data={chartData}

                            >




                                <XAxis

                                dataKey="name"

                                />



                                <YAxis />



                                <Tooltip

                                contentStyle={{

                                    background:"#171717",

                                    border:"1px solid #333",

                                    borderRadius:"12px",

                                    color:"white"

                                }}

                                />




                                <Bar

                                dataKey="value"

                                fill="#3b82f6"

                                radius={[8,8,0,0]}

                                />





                            </BarChart>



                        </ResponsiveContainer>




                    </div>














                    <div className="chart-box">


                        <h2>
                            Feedback Ratio
                        </h2>






                        <ResponsiveContainer

                        width="100%"

                        height={320}

                        >



                            <PieChart>




                                <Pie


                                data={pieData}


                                dataKey="value"


                                nameKey="name"


                                cx="50%"


                                cy="50%"


                                outerRadius={110}


                                innerRadius={60}


                                paddingAngle={5}


                                label={({name,percent}) =>

                                `${name} ${(percent*100).toFixed(0)}%`

                                }


                                >




                                    <Cell

                                    fill="#22c55e"

                                    />



                                    <Cell

                                    fill="#ef4444"

                                    />




                                </Pie>







                                <Tooltip


                                contentStyle={{


                                    background:"#171717",


                                    border:"1px solid #333",


                                    borderRadius:"12px",


                                    color:"white"


                                }}



                                />







                                <Legend

                                verticalAlign="bottom"

                                height={40}

                                />




                            </PieChart>





                        </ResponsiveContainer>





                    </div>







                </div>












                {/* FILTERS */}




                <div className="table-toolbar">





                    <div className="filters">


                        <button

                        onClick={()=>
                            changeFilter("all")
                        }

                        >

                            All

                        </button>





                        <button

                        onClick={()=>
                            changeFilter("up")
                        }

                        >

                            👍 Positive

                        </button>





                        <button

                        onClick={()=>
                            changeFilter("down")
                        }

                        >

                            👎 Negative

                        </button>



                    </div>








                    <button

                    className="export-btn"

                    onClick={()=>
                        exportFeedbackCSV(feedback)
                    }

                    >

                        Export CSV

                    </button>




                </div>













                {/* TABLE */}




                <div className="feedback-table">


                    <h2>
                        Feedback History
                    </h2>





                    <table>



                        <thead>


                            <tr>


                                <th>
                                    Rating
                                </th>


                                <th>
                                    Comment
                                </th>


                                <th>
                                    Reasons
                                </th>


                                <th>
                                    Date
                                </th>


                            </tr>


                        </thead>







                        <tbody>




                        {

                        filteredFeedback.map(

                        (item,index)=>(



                            <tr

                            key={index}

                            onClick={()=>


                            setSelectedFeedback(item)


                            }

                            >



                                <td>


                                    {

                                    item.rating==="up"

                                    ?

                                    "👍"

                                    :

                                    "👎"

                                    }



                                </td>





                                <td>


                                    {

                                    item.comment ||

                                    "No comment"

                                    }


                                </td>





                                <td>


                                    {

                                    item.reasons?.join(", ")

                                    ||

                                    "-"

                                    }


                                </td>





                                <td>


                                    {

                                    new Date(

                                    item.created_at

                                    )

                                    .toLocaleDateString()


                                    }


                                </td>





                            </tr>



                        )


                        )



                        }




                        </tbody>





                    </table>




                </div>








            </div>












            {

            selectedFeedback &&



            <div className="modal-overlay">



                <div className="feedback-modal">



                    <h2>
                        Feedback Details
                    </h2>




                    <p>

                        Rating:

                        {" "}

                        {selectedFeedback.rating}

                    </p>





                    <p>

                        Comment:

                        {" "}

                        {

                        selectedFeedback.comment ||

                        "No comment"

                        }


                    </p>






                    <p>

                        Reasons:

                        {" "}

                        {

                        selectedFeedback.reasons?.join(", ")

                        ||

                        "-"

                        }


                    </p>







                    <button

                    className="cancel-btn"

                    onClick={()=>


                    setSelectedFeedback(null)


                    }

                    >

                        Close

                    </button>





                </div>




            </div>



            }




        </div>


    );


}





export default Analytics;
