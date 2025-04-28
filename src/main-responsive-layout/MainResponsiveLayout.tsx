
import "./MainResponsiveLayout.scss";
import { useEffect, useState } from "react";
import NasdaqOptions from './../nasdaq/NasdaqOptions';
import NASDAQStock from './../nasdaq/NASDAQStock';
import JsonUpdater from './../LogWriter/JsonUpdater';
import MyComponent from './../awsamplify/MyComponent';
import ReadSThreeBucket from './../awsamplify/ReadSThreeBucket';
import { IS_AUTOMATED_LOG } from './../constant/HeartbeatConstants';
const MainResponsiveLayout = () => {
  const [isLogReading, setIsLogReading] = useState(false);

  return (
    <div className="application-level">

      <div className="main-container11">
        {/* <FormData/> */}
        {/* <NASDAQStock/> */}
        {/* <FinnhubOptions/> */}
        <div>
          <label className="common-left-margin">
            <input
              type="checkbox"
              checked={isLogReading}
              onChange={() => setIsLogReading(!isLogReading)}
            />
            <span>Log Reading</span>
          </label>
        </div>
        {/* <MyComponent /> */}

        <JsonUpdater/>
        <NasdaqOptions />
{/* <ReadSThreeBucket/> */}

      </div>


    </div>
  );
};

export default MainResponsiveLayout;