/**
 * RTK Query cache invalidation for auth/session changes.
 * Lives in its own module so tokenManager does not statically import `api` (avoids circular init with api → tokenManager).
 */
import { store } from "../redux/store.js";
import { api } from "../redux/services/api.js";
import { adminApi } from "../redux/services/adminApi.js";

export function invalidateAuthCaches() {
  try {
    store.dispatch(api.util.invalidateTags(["User"]));
  } catch {
    // ignore
  }
  try {
    store.dispatch(adminApi.util.invalidateTags(["Users"]));
  } catch {
    // ignore
  }
}
