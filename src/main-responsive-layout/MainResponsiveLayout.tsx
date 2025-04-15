
import "./MainResponsiveLayout.scss"
import NasdaqOptions from './../nasdaq/NasdaqOptions';

const MainResponsiveLayout = () => {
  return (
    <div className="application-level">

      <div className="main-container11">
          {/* <FormData/> */}
        {/* <NASDAQStock/> */}
        {/* <FinnhubOptions/> */}
        <NasdaqOptions />

   
      </div>


    </div>
  );
};

export default MainResponsiveLayout;