
import "./MainResponsiveLayout.scss"
import ComplexHeader from '../header/ComplexHeader';
import ExpandCollapseControl from '../components/ExpandCollapseControl';
import CustomSlider from '../components/CustomSlider';
import CustomMarquee from '../components/CustomMarquee';
import ContactInfo from '../contact-us/ContactInfo';
import LeafletMap from '../leafletmap/LeafletMap';
import HeroSlider from '../hero-slider/HeroSlider';
import NasdaqOptions from './../nasdaq/NasdaqOptions';
import FormData from './../nasdaq/FormData';
import DataTable from './../nasdaq/DataTable';
import NASDAQStock from './../nasdaq/NASDAQStock';
import FinnhubOptions from './../nasdaq/FinnhubOptions';
const MainResponsiveLayout = () => {
  return (
    <div className="application-level">

      <div className="main-container11">
        {/* <DataTable/> */}
        {/* <FormData/> */}
        {/* <NASDAQStock/> */}
        {/* <FinnhubOptions/> */}
        <NasdaqOptions />
      </div>


    </div>
  );
};

export default MainResponsiveLayout;