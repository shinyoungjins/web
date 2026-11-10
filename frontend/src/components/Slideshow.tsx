
import { useEffect, useState } from "react";
import "../styles/Slideshow.css";

import slideshow1 from "../assets/Slideshow/slideshow1.jpeg";
import slideshow2 from "../assets/Slideshow/slideshow2.jpeg";
import slideshow3 from "../assets/Slideshow/slideshow3.jpeg";
import slideshow4 from "../assets/Slideshow/slideshow4.jpeg";

const images = [
    slideshow1,
    slideshow2,
    slideshow3,
    slideshow4,
];

export default function Slideshow() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length);
        }, 4000);

        return () => clearInterval(timer);
    }, []);

    const previousSlide = () => {
        setCurrent((prev) =>
            (prev - 1 + images.length) % images.length
        );
    };

    const nextSlide = () => {
        setCurrent((prev) => (prev + 1) % images.length);
    };

    return (
        <section className="slideshow">
            {images.map((image, index) => (
                <div
                    key={index}
                    className={`slideshow-image ${
                        current === index ? "active" : ""
                    }`}
                    style={{ backgroundImage: `url(${image})` }}
                />
            ))}

            <button
                type="button"
                className="slide-arrow prev"
                onClick={previousSlide}
                aria-label="이전 사진"
            >
                &#10094;
            </button>

            <button
                type="button"
                className="slide-arrow next"
                onClick={nextSlide}
                aria-label="다음 사진"
            >
                &#10095;
            </button>

            <div className="slide-dots">
                {images.map((_, index) => (
                    <button
                        type="button"
                        key={index}
                        className={`slide-dot ${
                            current === index ? "active" : ""
                        }`}
                        onClick={() => setCurrent(index)}
                        aria-label={`${index + 1}번 사진`}
                    />
                ))}
            </div>
        </section>
    );
}
