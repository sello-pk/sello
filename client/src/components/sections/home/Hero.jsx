import HeroFilter from "../../utils/HeroFilter";
import heroBundled from "../../../assets/images/hero.webp";
import heroMobileBundled from "../../../assets/images/heroMobile.webp";

const heroDesktop = import.meta.env.PROD ? "/lcp/hero.webp" : heroBundled;
const heroMobile = import.meta.env.PROD
  ? "/lcp/heroMobile.webp"
  : heroMobileBundled;

const Hero = () => {
  return (
    <section className="sello-hero-shell relative flex min-h-[48vh] w-full flex-col justify-center overflow-hidden">
      <picture className="absolute inset-0 block h-full w-full">
        <source media="(min-width: 768px)" srcSet={heroDesktop} />
        <img
          src={heroMobile}
          alt="hero image"
          className="absolute inset-0 h-full w-full object-cover"
          fetchpriority="high"
          loading="eager"
          decoding="async"
          width="768"
          height="600"
          sizes="100vw"
        />
      </picture>
      <div className="bg-slate-900/70 absolute inset-0" />
      <div className="relative z-10 flex w-full flex-col items-center gap-4 px-3 py-6 sm:px-6 sm:py-8 lg:gap-6 lg:py-10">
        <h1 className="text-center text-2xl font-bold text-white sm:text-3xl lg:text-5xl">
          Buy and Sell Cars in Pakistan
        </h1>
        <HeroFilter />
      </div>
    </section>
  );
};

export default Hero;
