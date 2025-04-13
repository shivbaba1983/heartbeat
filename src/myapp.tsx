
import React, { useEffect, useState } from 'react';
import { myTestData } from './service/FirstAPP.service'
function FirstAPP() {

    // const [myResponseData, setMyResponseData]= useState<any>();

    // useEffect(() => {
    //     async function fetchData() {
    //         const response = await myTestData();
    //         setMyResponseData(response)
    //     }
    //     fetchData();
    // })

    return (
        <div className="my-app-start-file">
            <h3> Hello world! Wel come to Bhyagyashree typescript world</h3>
            {/* <p> This is service response: {myResponseData}</p> */}
        </div>
    );
}

export default FirstAPP;
