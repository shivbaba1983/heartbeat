
import "./MainResponsiveLayout.scss"
import NasdaqOptions from './../nasdaq/NasdaqOptions';
import NASDAQStock from './../nasdaq/NASDAQStock';
import JsonUpdater from './../LogWriter/JsonUpdater';
import MyComponent from './../awsamplify/MyComponent';
import { IS_AUTOMATED_LOG } from './../constant/HeartbeatConstants';
const MainResponsiveLayout = () => {
  return (
    <div className="application-level">

      <div className="main-container11">
        {/* <FormData/> */}
        {/* <NASDAQStock/> */}
        {/* <FinnhubOptions/> */}
        <MyComponent />

        {IS_AUTOMATED_LOG && <JsonUpdater />}
        <NasdaqOptions />


      </div>


    </div>
  );
};

export default MainResponsiveLayout;