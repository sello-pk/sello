import HeroFilter from "../../utils/HeroFilter";
import hero from "../../../assets/images/hero.webp";

const Hero = () => {
  return (
    <section className="relative w-full overflow-hidden min-h-[48vh] md:h-[48vh]">
      <img
        src={hero}
        alt="hero image"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        fetchpriority="high"
        decoding="async"
        width="1200"
        height="600"
      />
      <div className="bg-slate-900/70 absolute inset-0" />
      <div className="relative z-10 flex min-h-[48vh] md:h-[48vh] flex-col items-center justify-center px-2 py-6 sm:py-8 md:py-10">
        <h1 className="mb-4 text-center text-4xl font-bold text-white md:text-5xl">
          Buy and Sell Cars in Pakistan
        </h1>
        <HeroFilter />
      </div>
    </section>
  );
};

export default Hero;
