import React from 'react';
import { motion } from 'framer-motion';
import { images } from '../../assets/assets';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 xl:w-2/3 bg-primary-500 p-8 lg:p-12 xl:p-20 flex-col justify-between">
        <div>
          <img 
            src={images.logo} 
            alt="Sello Logo" 
            className="w-32 h-auto mb-8"
          />
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Welcome to Sello
          </h1>
          <p className="text-white text-opacity-90 text-lg lg:text-xl">
            Your trusted partner in finding the perfect vehicle
          </p>
        </div>
        <div className="mt-8">
          <img 
            src={images.authHero} 
            alt="Authentication" 
            className="w-full h-auto max-w-2xl mx-auto"
          />
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 xl:w-1/3 bg-white p-6 sm:p-8 md:p-12 flex flex-col justify-center">
        <div className="md:hidden mb-8 text-center">
          <img 
            src={images.logo} 
            alt="Sello Logo" 
            className="w-28 h-auto mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          {subtitle && (
            <p className="text-gray-600 mt-2">{subtitle}</p>
          )}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full mx-auto"
        >
          <div className="hidden md:block mb-8">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            {subtitle && (
              <p className="text-gray-600 mt-2">{subtitle}</p>
            )}
          </div>
          
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
