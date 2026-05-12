/**
 * RTK Query cache invalidation for auth/session changes.
 * Keep imports lazy to avoid initialization cycles in production bundles.
 */
export function invalidateAuthCaches() {
  void Promise.all([
    import("../redux/store.js"),
    import("../redux/services/api.js"),
    import("../redux/services/adminApi.js"),
  ])
    .then(([storeMod, apiMod, adminMod]) => {
      try {
        storeMod.store.dispatch(apiMod.api.util.invalidateTags(["User"]));
      } catch {
        // ignore
      }
      try {
        storeMod.store.dispatch(
          adminMod.adminApi.util.invalidateTags(["Users"]),
        );
      } catch {
        // ignore
      }
    })
    .catch(() => {});
}
