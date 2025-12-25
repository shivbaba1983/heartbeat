
import "./MainResponsiveLayout.scss";
import { useEffect, useState } from "react";
import NasdaqOptions from './../nasdaq/NasdaqOptions';
import NASDAQStock from './../nasdaq/NASDAQStock';
import JsonUpdater from './../LogWriter/JsonUpdater';
import NSEHome from './../nse/nse-home';
import OCRReader from './../image-processing/OCRReader';
import OCRVolumeExtractor from './../image-processing/OCRVolumeExtractor';
const MainResponsiveLayout = () => {
  const [isLogReading, setIsLogReading] = useState(false);
  const [showUSA, setUSA] = useState(true);
  const [showNSE, setShowNSE] = useState(false);

  return (
    <div className="application-level">

      <div className="main-container">
        {/* <FormData/> */}
        {/* <NASDAQStock/> */}
        {/* <FinnhubOptions/> */}
        {/* <div>
          <label className="common-left-margin">
            <input
              type="checkbox"
              checked={isLogReading}
              onChange={() => setIsLogReading(!isLogReading)}
            />
            <span>Log Reading</span>
          </label>
        </div> */}        
        {/* {showUSA && <JsonUpdater />} */}
        {showUSA && <NasdaqOptions />}
        {/* <NSEHome/> */}
        <div className="market-data-checkbox">
          <label className="">
            <input
              type="checkbox"
              checked={showUSA}
              onChange={() => setUSA(!showUSA)}
            />
            <span>Nasdaq</span>
          </label>
          <label className="">
            <input
              type="checkbox"
              checked={showNSE}
              onChange={() => setShowNSE(!showNSE)}
            />
            <span>NSE</span>
          </label>
        </div>
        <div>
          {showNSE && <NSEHome />}
        </div>
        <OCRVolumeExtractor />
        {/* <OCRReader/> */}
      </div>
    </div>
  );
};

export default MainResponsiveLayout;