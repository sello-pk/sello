import { Link } from "react-router-dom";
import { goThemBuyOrSell } from "../../assets/assets";
import { IoIosArrowRoundUp } from "react-icons/io";

const BuySellCards = () => {
  return (
    <section className="w-full bg-white py-12 md:py-16">
      <div className="max-w-8xl mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {goThemBuyOrSell.map((post, index) => (
            <article
              className="w-full rounded-2xl bg-white p-5 sm:p-6 md:p-7 border border-gray-100 shadow-sm"
              key={index}
            >
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                {post.title}
              </h3>
              <p className="text-sm md:text-base text-gray-600 leading-7 mb-6 md:mb-7">
                {post.description}
              </p>
              <div className="flex items-end justify-between gap-4">
                <Link
                  to={post.redirect}
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary-500 px-5 text-white font-semibold hover:opacity-90 transition-colors"
                  aria-label={`Get started ${post.title.toLowerCase().includes('looking') ? 'buying a car' : 'selling a car'}`}
                >
                  {post.title.toLowerCase().includes('looking') ? 'Browse Cars' : 'Sell Your Car'}
                  <IoIosArrowRoundUp className="text-xl rotate-[43deg]" />
                </Link>
                <img
                  src={post.image}
                  alt="go image buy or sell"
                  className="w-[70px] sm:w-[80px] md:w-[90px] object-contain shrink-0"
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BuySellCards;
