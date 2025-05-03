import Marquee from "react-fast-marquee";

const PriceMarquee = ({ lastPrice }) => {
  return (
    <div className="bg-black text-white p-2">
      <Marquee gradient={false} speed={200}>
        <span className="mx-4">${lastPrice}</span>
      </Marquee>
    </div>
  );
};

export default PriceMarquee;
