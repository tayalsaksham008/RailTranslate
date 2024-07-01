import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import SwiperCore from "swiper";
import "swiper/css";
import "swiper/css/navigation";

SwiperCore.use([Autoplay]);
SwiperCore.use([Navigation]);

export default function News() {
  const [articles, setArticles] = useState([]);
  const [placeholderImageUrl, setPlaceholderImageUrl] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=indian%20railways%20trains&from=2023-11-20&to=2023-12-20&sortBy=popularity&apiKey=baea8a5de1a74cfc93627e7a4ca3a4d4
          `
        );
        const data = await response.json();

        // Sort the articles by publishedAt
        const sortedArticles = data.articles.sort((a, b) => {
          const dateA = new Date(a.publishedAt);
          const dateB = new Date(b.publishedAt);
          return dateB - dateA;
        });

        setArticles(sortedArticles);

        if (sortedArticles.length > 0) {
          setPlaceholderImageUrl(sortedArticles[0].urlToImage);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const getTitleFontSize = (title) => {
    if (title.length > 10) {
      return "text-xs"; // Apply smaller font size for longer titles
    }
    return "text-md"; // Apply regular font size for shorter titles
  };

  return (
    <div className="">
      <Swiper
        spaceBetween={10}
        slidesPerView={3}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        modules={[Autoplay]}
        style={{ width: "100%", height: "300px" }}
      >
        {articles.slice(0, 21).map((article) => (
          <SwiperSlide
            key={article.title}
            style={{ width: "305px", height: "89%" }}
          >
            <div className="bg-gray-800 p-3 h-full rounded-lg flex flex-col justify-between overflow-y-auto no-scrollbar">
              <div className="flex-grow">
                <h2
                  className={`text-white text-left ${getTitleFontSize(
                    article.title
                  )} font-bold mb-4`}
                >
                  {article.title}
                </h2>
              </div>
              <div className="flex-shrink-0">
                {article.urlToImage ? (
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full h-auto rounded-lg"
                    style={{ aspectRatio: "16/9" }}
                  />
                ) : (
                  <img
                    src={placeholderImageUrl}
                    alt="Placeholder"
                    className="w-full h-auto rounded-lg"
                    style={{ aspectRatio: "16/9" }}
                  />
                )}
              </div>
              <a
                href={article.url}
                className="text-white bg-blue-600 rounded-lg px-4 py-1 mt-1 block text-center"
              >
                Read
              </a>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
