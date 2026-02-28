import HeroFilter from "../../utils/HeroFilter";
import hero from "../../../assets/images/hero.png";

const Hero = () => {
  return (
    <section className="relative w-full overflow-hidden md:min-h-[55vh]">
      <img
        src={hero}
        alt="hero image"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="bg-slate-900/70 absolute inset-0" />
      <div className="relative z-10 flex flex-col items-center justify-center px-2 py-8 sm:py-10 md:min-h-[55vh] md:py-16">
        <h1 className="mb-4 text-center text-4xl font-bold text-white md:text-5xl">
          Buy and Sell Cars in Pakistan
        </h1>
        <HeroFilter />
      </div>
    </section>
  );
};

export default Hero;
