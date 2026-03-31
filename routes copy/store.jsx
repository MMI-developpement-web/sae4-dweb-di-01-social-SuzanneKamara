import Pricing from "../ui/Pricing";
import { useLoaderData } from "react-router-dom";
import { fetchPricingData } from "../lib/loaders";  

export async function loader(){
    const pricingdata = await fetchPricingData();
    return pricingdata;
}

export default function Store(){
    const data = useLoaderData();
    return(
        <section>
            <Pricing {...data}/>
        </section>
    )
}