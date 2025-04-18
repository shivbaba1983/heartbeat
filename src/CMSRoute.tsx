import React, { Component } from "react";
import { Routes, Route } from 'react-router-dom';


import MainResponsiveLayout from "./main-responsive-layout/MainResponsiveLayout";
import './CMSRoute.scss';


const CMSRoute = () => {
   

    return (

        <div>
            <div className='complex-main-route-section'>
                {/* <nav className='tab-list'>
                    <ul className="cms-meganav-section">
                       {
                        Mega_Menu.map((link)=>(
                            <li key={link.id} className="meganav-sublist">
                                <a href={link.url}>{link.name}</a>
                            </li>
                        ))}                      

                    </ul>                    
                </nav> */}
                <div className='tab-list'>
                    {/* <div className='link-button'><a href='/cms/home'>Home</a></div>
                    <div className='link-button'><a href='/cms/attraction'>Attraction</a></div>
                    <div className='link-button'> <a href='/cms/facility'>Facility</a></div> */}
                </div>

            </div>

            <Routes>
                <Route path="*" element={<MainResponsiveLayout />} />
                {/* <Route path="/cms/home" element={<Home />} />
                <Route path="/cms/attraction" element={<Attraction />} />
                <Route path="/cms/facility" element={<Facility />} /> */}
            </Routes>
        </div>
    )
}

export default CMSRoute;