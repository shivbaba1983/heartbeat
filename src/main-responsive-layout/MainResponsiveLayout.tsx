
import "./MainResponsiveLayout.scss"
import NasdaqOptions from './../nasdaq/NasdaqOptions';
import NASDAQStock from './../nasdaq/NASDAQStock';
import JsonUpdater from './../LogWriter/JsonUpdater';
import MyComponent from './../awsamplify/MyComponent';
const MainResponsiveLayout = () => {
  return (
    <div className="application-level">

      <div className="main-container11">
          {/* <FormData/> */}
        {/* <NASDAQStock/> */}
        {/* <FinnhubOptions/> */}
<MyComponent/>

        <JsonUpdater/>
        <NasdaqOptions />

   
      </div>


    </div>
  );
};

export default MainResponsiveLayout;