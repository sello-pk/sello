/**
 * Single safe hook for listing SEO side-effects.
 * Never throws into HTTP handlers. IndexNow is fire-and-forget;
 * sitemap cache bust is best-effort.
 */

import { notifyIndexNowForCar } from "./indexNow.js";
import Logger from "./logger.js";

export function onListingSeoChange(car, options = {}) {
  if (!car?._id) return;
  try {
    notifyIndexNowForCar(car, options);
  } catch (error) {
    Logger.warn("IndexNow notify skipped", { message: error?.message });
  }

  setImmediate(() => {
    import("../controllers/metaCatalogFeedController.js")
      .then((mod) => {
        if (typeof mod.invalidateCarsSitemapCache === "function") {
          mod.invalidateCarsSitemapCache();
        }
      })
      .catch((error) => {
        Logger.warn("Cars sitemap cache invalidate skipped", {
          message: error?.message,
        });
      });
  });
}
