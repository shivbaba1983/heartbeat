import React,{useEffect} from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, A11y  } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./HeroSlider.scss"; // Import custom styles

import Sankul1 from './../assets/Sankul1.jpeg';
import Sankul2 from './../assets/Sankul2.jpeg';
import Sankul3 from './../assets/Sankul3.jpeg';

const heroSlides = [
  {
    id: 1,
    image: Sankul1,

  },
  {
    id: 2,
    image: Sankul2,

  },
  {
    id: 3,
    image: Sankul3,
  }
];


const HeroSlider = () => {

    useEffect(() => {
        document.addEventListener(
          "touchmove",
          (event) => event.preventDefault(),
          { passive: false }
        );
      }, []);

  return (
    <div className="hero-slider">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, A11y ]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
        slidesPerView={1}
        spaceBetween={10}
        className="swiper-container"    
        loop={true}
        grabCursor={true}
        allowTouchMove={true} // Ensures touch swipe is enabled    
      >
        {heroSlides.map(slide => (
          <SwiperSlide key={slide.id}>
            <div className="hero-slide" style={{ backgroundImage: `url(${slide.image})` }}>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

 export default HeroSlider;