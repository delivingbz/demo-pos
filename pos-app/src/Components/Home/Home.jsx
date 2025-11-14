import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const handleOrderNow = () => {
    navigate("/order");
  };

  return (
    <div className="relative w-full h-screen">
      {/* Background image layer */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60')] bg-cover bg-center" />

      {/* Semi-transparent overlay to control opacity */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Content sits above the image and overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
        <div className="text-center">
          {/* <h3 className="text-4xl font-bold">Premium Bite</h3>
          <p className="mt-2">Your favorite food delivered hot & fresh</p> */}

          <h2
            className="text-4xl md:text-5xl text-yellow-400 mb-2"
            style={{ fontFamily: "Great Vibes, cursive" }}
          >
            Premium
          </h2>
          <p
            className="tracking-[0.3em] text-sm uppercase mb-4"
            style={{ fontFamily: "Open Sans, sans-serif" }}
          >
            Quality
          </p>
          <h1
            className="text-5xl md:text-7xl leading-tight"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Restaurant & Dishes
          </h1>
        </div>

        <div className="mt-6">
          <button
            onClick={handleOrderNow}
            className="px-6 py-2 bg-yellow-400 text-black rounded"
          >
            Order Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
