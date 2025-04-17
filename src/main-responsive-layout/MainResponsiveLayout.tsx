
import "./MainResponsiveLayout.scss"
import NasdaqOptions from './../nasdaq/NasdaqOptions';
import HoodMain from './../hood/HoodMain';
const MainResponsiveLayout = () => {
  return (
    <div className="application-level">

      <div className="main-container11">
          {/* <FormData/> */}
        {/* <NASDAQStock/> */}
        {/* <FinnhubOptions/> */}
        <NasdaqOptions />
{/* <HoodMain/> */}
   
      </div>


    </div>
  );
};

export default MainResponsiveLayout;