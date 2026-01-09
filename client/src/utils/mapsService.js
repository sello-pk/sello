import axios from "axios";
import { API_BASE_URL } from "@redux/config";

/**
 * Maps API Service - Secure proxy for Google Maps API
 * All API calls go through our backend to protect API keys
 */

export const mapsService = {
  /**
   * Geocode an address to coordinates
   * @param {string} address - The address to geocode
   * @returns {Promise} Geocoding results
   */
  async geocode(address) {
    const response = await axios.get(`${API_BASE_URL}/maps/geocode`, {
      params: { address },
    });
    return response.data;
  },

  /**
   * Search for places using Google Places API
   * @param {string} query - Search query
   * @param {string} location - Center location for search (optional)
   * @param {number} radius - Search radius in meters (default: 5000)
   * @returns {Promise} Places search results
   */
  async searchPlaces(query, location, radius = 5000) {
    const response = await axios.get(`${API_BASE_URL}/maps/places`, {
      params: { query, location, radius },
    });
    return response.data;
  },

  /**
   * Get distance matrix between origins and destinations
   * @param {string} origins - Origin addresses or coordinates
   * @param {string} destinations - Destination addresses or coordinates
   * @param {string} mode - Travel mode (driving, walking, bicycling, transit)
   * @returns {Promise} Distance matrix results
   */
  async getDistanceMatrix(origins, destinations, mode = "driving") {
    const response = await axios.get(`${API_BASE_URL}/maps/distancematrix`, {
      params: { origins, destinations, mode },
    });
    return response.data;
  },

  /**
   * Get static map image
   * @param {Object} params - Map parameters
   * @returns {Promise} Static map image URL
   */
  async getStaticMap(params) {
    const response = await axios.get(`${API_BASE_URL}/maps/static-map`, {
      params,
      responseType: "blob",
    });
    return URL.createObjectURL(response.data);
  },
};

export default mapsService;
