import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetMeQuery } from "../../../redux/services/api";
import { useSubmitReviewMutation } from "../../../redux/services/api";
import toast from "react-hot-toast";

const CustomerReview = () => {
  const navigate = useNavigate();
  const [currentReview, setCurrentReview] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    text: "",
    rating: 5,
  });

  // Get user authentication state
  const token = localStorage.getItem("token");
  const { data: user } = useGetMeQuery(undefined, {
    skip: !token,
  });

  // Check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(!!user && !!token);

  // Update login state when user or token changes
  useEffect(() => {
    const loginState = !!user && !!token;
    setIsLoggedIn(loginState);
  }, [user, token]);

  // Submit review mutation
  const [submitReview, { isLoading: isSubmitting }] = useSubmitReviewMutation();

  // Static reviews data
  const staticReviews = [
    {
      id: 1,
      name: "Salman Ch.",
      location: "Lahore",
      text: "Sello.pk made it easy to find a genuine car for sale in Karachi. The listings were clear, and I connected with the seller directly without any hassle.",
      rating: 5,
      avatar: "SC",
    },
    {
      id: 2,
      name: "Aqsa Batool",
      location: "Rawalpindi",
      text: "I listed my used car on Sello.pk and received serious inquiries within days. It's a reliable platform for anyone looking to sell a car in Pakistan.",
      rating: 5,
      avatar: "AB",
    },
    {
      id: 3,
      name: "Farzam Zafar",
      location: "Karachi",
      text: "Good experience overall. The search filters helped me compare cars for sale in Pakistan quickly, and the process felt transparent and secure.",
      rating: 4,
      avatar: "FZ",
    },
  ];

  // Combine static and dynamic reviews (for now just static)
  const allReviews = staticReviews;

  // Auto-play slider for mobile only
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % allReviews.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [allReviews.length]);

  // Pre-fill form with user data if logged in
  useEffect(() => {
    if (user?.name) {
      setFormData((prev) => ({
        ...prev,
        name: user.name,
      }));
    }
  }, [user]);

  const handleOpenReviewForm = () => {
    if (!isLoggedIn) {
      toast.error("Please login to write a review");
      navigate("/login");
      return;
    }
    setShowReviewForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rating" ? parseInt(value) : value,
    }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      toast.error("Please login to submit a review");
      navigate("/login");
      return;
    }

    if (!formData.name || !formData.text) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("role", formData.role || "");
      formDataToSend.append("text", formData.text);
      formDataToSend.append("rating", formData.rating);

      await submitReview(formDataToSend).unwrap();
      toast.success(
        "Review submitted successfully! It will be published after admin approval."
      );
      setFormData({ name: user?.name || "", role: "", text: "", rating: 5 });
      setShowReviewForm(false);
    } catch (error) {
      toast.error(
        error?.data?.message || "Failed to submit review. Please try again."
      );
    }
  };

  return (
    <section className="relative px-3 sm:px-4 md:px-6 lg:px-8 py-16 bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:50px_50px]"></div>
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-1/4 w-72 h-72  rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Real experiences from genuine buyers and sellers across Pakistan
          </p>
        </div>

        {/* Review Cards - 3 cards on desktop, slider on mobile */}
        <div className="relative max-w-6xl mx-auto">
          {/* Desktop: Show 3 cards */}
          <div className="hidden lg:grid lg:grid-cols-3 lg:gap-8 mb-12">
            {allReviews.map((review, index) => (
              <div
                key={review.id}
                className="group relative bg-gradient-to-br from-white via-white to-primary-50/30 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 h-full flex flex-col justify-between hover:shadow-2xl hover:shadow-primary-500/20 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100/20 to-primary-200/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary-50/30 to-transparent rounded-full blur-xl group-hover:scale-125 transition-transform duration-700"></div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Quote icon and rating */}
                  <div className="flex items-start justify-between mb-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary-500 rounded-2xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                        <svg
                          className="w-7 h-7"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-full border border-white/50">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 transition-all duration-200 ${
                            i < review.rating
                              ? "text-primary-500 drop-shadow-sm"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-xs font-semibold text-primary-600 ml-1">
                        {review.rating}.0
                      </span>
                    </div>
                  </div>

                  {/* Review text */}
                  <div className="flex-1 mb-8">
                    <p className="text-base text-slate-700 leading-relaxed font-medium group-hover:text-slate-800 transition-colors duration-300">
                      <span className="text-black font-bold text-lg">"</span>
                      {review.text}
                      <span className="text-black font-bold text-lg">"</span>
                    </p>
                  </div>

                  {/* Author info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full blur-md opacity-60"></div>
                        <div className="relative w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center border-2 border-white/50 shadow-md">
                          <span className="text-slate-700 font-bold text-sm">
                            {review.avatar}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-primary-700 transition-colors duration-300">
                          {review.name}
                        </h4>
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-3 h-3 text-slate-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="text-xs text-slate-600 font-medium">
                            {review.location}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Verified badge */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-200/50 shadow-sm">
                      <svg
                        className="w-3.5 h-3.5 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs font-bold text-green-800">
                        Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            ))}
          </div>

          {/* Mobile: Slider */}
          <div className="lg:hidden">
            <div className="relative h-[400px]">
              {allReviews.map((review, index) => (
                <div
                  key={review.id}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
                    index === currentReview
                      ? "opacity-100 translate-x-0 scale-100"
                      : index < currentReview
                      ? "opacity-0 -translate-x-full scale-95"
                      : "opacity-0 translate-x-full scale-95"
                  }`}
                >
                  <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 h-full flex flex-col justify-between">
                    {/* Quote icon */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${
                              i < review.rating
                                ? "text-primary-500"
                                : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>

                    {/* Review text */}
                    <div className="flex-1 mb-8">
                      <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-medium">
                        <span className="text-black">"</span>
                        {review.text}
                        <span className="text-black">"</span>
                      </p>
                    </div>

                    {/* Author info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                          <span className="text-slate-600 font-semibold text-sm">
                            {review.avatar}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900">
                            {review.name}
                          </h4>
                          <p className="text-sm text-slate-600">
                            {review.location}
                          </p>
                        </div>
                      </div>

                      {/* Verified badge */}
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-xs font-medium text-green-800">
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Navigation dots */}
            <div className="flex justify-center gap-3 mt-8">
              {allReviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentReview(index)}
                  className={`relative transition-all duration-300 ${
                    index === currentReview ? "w-12 h-3" : "w-3 h-3"
                  }`}
                  aria-label={`Go to review ${index + 1}`}
                >
                  <div
                    className={`absolute inset-0 rounded-full transition-all duration-300 ${
                      index === currentReview
                        ? "bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-500/25"
                        : "bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                  {index === currentReview && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 animate-pulse" />
                  )}
                </button>
              ))}
            </div>

            {/* Mobile Navigation arrows */}
            <button
              onClick={() =>
                setCurrentReview(
                  (prev) => (prev - 1 + allReviews.length) % allReviews.length
                )
              }
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 hover:scale-105 group"
              aria-label="Previous review"
            >
              <svg
                className="w-6 h-6 text-slate-600 group-hover:text-slate-900 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() =>
                setCurrentReview((prev) => (prev + 1) % allReviews.length)
              }
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 hover:scale-105 group"
              aria-label="Next review"
            >
              <svg
                className="w-6 h-6 text-slate-600 group-hover:text-slate-900 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Add Review Button */}
        <div className="text-center mt-12">
          {token ? (
            <button
              onClick={handleOpenReviewForm}
              className="bg-primary-500 hover:opacity-90 text-white px-8 py-4 rounded font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              Write a Review
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <p className="text-slate-700 font-medium">
                Want to share your experience?
              </p>
              <button
                onClick={() => navigate("/login")}
                className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                Login to Write a Review
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              4.8/5
            </div>
            <div className="text-sm text-slate-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              10,000+
            </div>
            <div className="text-sm text-slate-600">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              98%
            </div>
            <div className="text-sm text-slate-600">Satisfaction Rate</div>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && isLoggedIn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-gray-800">
                Write a Review
              </h3>
              <button
                onClick={() => {
                  setShowReviewForm(false);
                  setFormData({
                    name: user?.name || "",
                    role: "",
                    text: "",
                    rating: 5,
                  });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Role/Title (optional)
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  placeholder="e.g., Designer, Developer, Customer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating *
                </label>
                <div className="flex gap-2 items-center">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, rating }))
                      }
                      className={`text-4xl transition-all hover:scale-110 ${
                        rating <= formData.rating
                          ? "text-primary-500"
                          : "text-gray-300"
                      }`}
                      aria-label={`Rate ${rating} stars`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="ml-2 text-gray-600 font-medium">
                    {formData.rating} / 5
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review *
                </label>
                <textarea
                  name="text"
                  value={formData.text}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  placeholder="Share your experience with us..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.text.length} characters
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    "Submit Review"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewForm(false);
                    setFormData({
                      name: user?.name || "",
                      role: "",
                      text: "",
                      rating: 5,
                    });
                  }}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom styles for blob animation */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
};

export default CustomerReview;
