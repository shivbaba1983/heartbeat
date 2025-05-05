
import "./MainResponsiveLayout.scss";
import { useEffect, useState } from "react";
import NasdaqOptions from './../nasdaq/NasdaqOptions';
import NASDAQStock from './../nasdaq/NASDAQStock';
import JsonUpdater from './../LogWriter/JsonUpdater';
const MainResponsiveLayout = () => {
  const [isLogReading, setIsLogReading] = useState(false);

  return (
    <div className="application-level">

      <div className="main-container11">
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


        <JsonUpdater/>
        <NasdaqOptions />

      </div>


    </div>
  );
};

export default MainResponsiveLayout;