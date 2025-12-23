import { CV_Loading } from "../Backend/SI_data_loader.js"; 

const CV_div = document.getElementById("CV_Data");
const CV_loader_div = document.getElementById("CV_Loader");



function updatedata()
{

    if(CV_Loading==true){
    CV_div.classList.remove("p-4");
    CV_loader_div.classList.remove("hidden");
    }
    else if(CV_Loading==false )
    {
        CV_div.classList.add("p-4");
        CV_loader_div.classList.add("hidden");

    }
    else{
        return CV_Loading;
    }

    console.log(CV_Loading);

}   

setInterval(updatedata,100);