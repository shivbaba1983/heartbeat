
import axios from 'axios';

export async function myTestData(){

    const endPointUrl= '';

    let serviceResponse;
    try{
        serviceResponse = "Stay tuned........";// await axios.get(endPointUrl) ;
    }catch(error){
        console.log('---error--', error);
    }
    return serviceResponse
}