import Marquee from "react-fast-marquee";

// const PriceMarquee = ({ lastPrice , selectedTicker}) => {
//   return (
//     <div className="bg-black text-white p-2">
//       <Marquee gradient={false} speed={50}>
//         <span className="mx-4">{selectedTicker} {lastPrice}</span>
//       </Marquee>
//     </div>
//   );
// };

// export default PriceMarquee;

import React from "react";
import "./PriceMarquee.scss";

const PriceMarquee = ({ lastPrice , selectedTicker}) => {
  return (
    <div className="sticky-marquee">
      <div className="marquee-content">
        <span className="mx-4">{selectedTicker} {lastPrice} </span><span className="marathi-title">             !!स्वामी समर्थ!! ---- !!शिव बाबा!!</span>
      </div>
    </div>
  );
};

export default PriceMarquee;

