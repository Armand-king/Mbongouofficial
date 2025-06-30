// app/components/ImageCarousel.tsx
'use client';

import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

export default function ImageCarousel() {
  return (
    <div className="w-full max-w-md">
      <Carousel
        autoPlay
        infiniteLoop
        showThumbs={false}
        showStatus={false}
        interval={4000}
      >
        <div>
          <img src="conte.jpg" alt="Dashboard finances" />
        </div>
        <div>
          <img src="conten.webp" alt="Suivi budget" />
        </div>
        <div>
          <img src="contente.jpeg" alt="Objectifs d'épargne" />
        </div>
      </Carousel>
    </div>
  );
}
