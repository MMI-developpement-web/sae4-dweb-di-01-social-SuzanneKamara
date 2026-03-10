import Team from '../ui/Team';
import { Suspense } from 'react';
import { useLoaderData,defer, Await } from 'react-router-dom';
import {fetchOurTeams} from '../lib/loaders.js';
import { fetchTestimonialData } from '../lib/loaders.js';
import TeamSkeleton from '../ui/Team/TeamSkeleton.jsx'
import Testimonial from '../ui/Testimonial'


export async function loader({params}){
    const ourteams =  fetchOurTeams(params.teamName);
    const testimonialData = await fetchTestimonialData(params.teamName);
    return defer({team: ourteams, testimonial: testimonialData});
}   

export default function OurTeams(){
    
    const data = useLoaderData();
    
    return (
        <section>
            <Suspense fallback={<TeamSkeleton />}>
            <Await resolve={data.team} errorElement={<div>Error loading teams</div>}>
             {teamData => <Team {...teamData}  />}
            </Await>
            </Suspense>
            <Testimonial data={data.testimonial} />
        </section>
    );
}  