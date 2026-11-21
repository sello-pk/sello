# Car Compare release report

Date: 21 November 2026, Pakistan time. Deployment is being handled by the owner.

## Release status

Implementation and local fixture acceptance are complete. Public release acceptance remains **blocked**. The final research revision has not passed the requested 20-vehicle live acceptance matrix because the configured OpenAI project returns `credit_balance_exhausted` / `insufficient_quota`. No successful live acceptance cases are claimed for that revision. An earlier 21-case run exposed a research validation contract problem and was invalidated; it must not be presented as a pass.

The last checked public `https://api.sello.pk/api/compare/config` returned 404. Updated routes and deployment configuration exist locally, but the public 404 cannot be declared fixed until the owner deploys and verifies them.

## Implemented behavior

- Select two or three distinct vehicles using searchable catalog brand, dependent model and year controls. Variant is optional in the UI and backend. An omitted variant requests only facts shared across supported Pakistan-market trims; it must not silently select one trim.
- The existing SELLO OpenAI credentials call `https://api.openai.com/v1/responses`, default model `gpt-4.1`. Each vehicle is researched independently with required live `web_search`. Cited research notes are converted by a separate structured Responses request into the 73-field schema. The formatter does not perform another search. Buying advice uses the returned research snapshots.
- Pakistan-market identity, model year and trim scope must match. Only supported typed fields with URLs actually returned by the research call are accepted. Unknown or rejected fields display “Not Available”. This validation reduces errors; it is not independent proof that every AI claim is correct. Live source accuracy still needs acceptance testing.
- Per-vehicle counts, retrieval dates, loading placeholders, retry/error states, stale-selection notices, difference filtering, grouped specifications and mobile vehicle switching are implemented. Desktop headers stay below the navigation bar. Brand accents use primary-500.
- Clickable source links use SELLO styling without source logos. New prices show documented dates and current/historical/undated labels; “current” means dated within 90 days. Used-market ranges are explicitly estimates. Research retrieval time does not become a price effective date.
- Recommendations explain reasons, trade-offs and available evidence. Changed priorities or cost inputs require an explicit recommendation update. Fuel/electricity calculations are deterministic and exclude other ownership costs.
- Signed research snapshots expire after 30 minutes and are used to validate recommendation inputs. Research data is not saved in MongoDB, pending records are not created, and approval is not required. Only existing catalog reads and separate editable guide/configuration content use MongoDB.
- Monitoring records API status, request IDs, durations, tokens, search calls and estimated USD costs through the existing logger and authenticated admin metrics. In-memory totals cover one process since startup; they reset on restart and do not aggregate multiple workers. Unknown pricing is labelled unpriced. Billing remains authoritative. No prompts, researched specifications or API keys are included in these events.
- More → Car Compare, application routes, static compare SEO shell, sitemap entry and scoped Nginx exceptions are included. Existing category management schemas and workflows are unchanged.

## Tests actually run

| Check | Result / scope |
| --- | --- |
| Backend targeted tests | Historically 18 passed, 0 failed, including frontend/backend constant agreement. The test files and fixture/QA scripts were subsequently removed at the owner's request. |
| HTTP test flow | Two/three selections, optional variant, independent research and signed recommendation snapshots; fixture OpenAI responses |
| Validation/error coverage | Unsupported sources, meaningful URL query parameters, tracking normalization, invalid fields, price dates/ranges, forged snapshots, missing key, timeout, exhausted quota and capacity errors |
| Monitoring | Cached token arithmetic, search cost, failures, unknown model rates, invalid search rate and defensive snapshot copies |
| Targeted frontend ESLint | Passed for comparison pages, monitoring, API service and shared searchable selector |
| Production build | Final `npm run build` passed, exit 0: Vite bundle, 100 static pages, 270 vehicle SEO shells with 0 errors, 192 sitemap URLs including Car Compare. Existing public API 429 retries delayed completion but recovered. |
| Real desktop browser | 1440×1000, searchable selection, blank variants, two/three cars, 12-of-73 fixture coverage, citations, historical/estimated prices, recommendation evidence, differences filter, cost changes and stale/incomplete selections |
| Real mobile browser | 390×844 and 320px width; vehicle switcher, one vehicle column, citation controls and no document horizontal overflow |
| Existing functionality smoke | Listings rendered 36 vehicles and filters; estimator initial form rendered; More menu navigated to comparison. Estimator paid submission and all unrelated website flows were not regression-tested. |
| Local normal proxy | `http://127.0.0.1:5173/api/compare/config` returned HTTP 200 after backend refresh |
| Local server routes | `/api/compare/config` JSON 200; `/cars/compare` HTML 200; unauthenticated `/api/compare/admin/metrics` rejected with 401 |
| Live research matrix | 21 planned, 2 attempted on final revision and blocked by exhausted credits, 19 unrun. See `car-compare-live-qa.json`. No final live research quality pass. |

Browser screenshots are **fixture-only UI evidence**, not evidence of actual vehicle specifications: `car-compare-desktop.jpg` and `car-compare-mobile.jpg`. The temporary browser fixture API prevented MongoDB writes and was never imported by production startup. Temporary fixture listeners were stopped after testing; the fixture files were subsequently removed at the owner's request.

## Owner deployment checklist

1. Restore OpenAI API project credits or configure an existing funded SELLO key in the backend environment. Keep credentials server-side. Optional settings and cost rate overrides are documented in `server/.env.example`.
2. Deploy the backend using the existing `server` folder structure. Comparison constants live in `server/constants/carCompare.js`; frontend constants live independently in `client/src/constants/carCompare.js`. There is no root-level shared folder or cross-application production import. Install locked dependencies using the existing deployment procedure and restart the existing backend process manager. No AI-result migration is required.
3. Confirm public `GET https://api.sello.pk/api/compare/config` returns JSON HTTP 200. A remaining 404 usually indicates an old backend, wrong API upstream, or incorrect mounted route. Ensure the existing reverse proxy allows research request durations (backend limits are up to 100 seconds).
4. Build the frontend with its normal production `VITE_API_URL=https://api.sello.pk/api`, then deploy the complete `client/dist` output. Apply the specific `/cars/compare` and `/cars/compare/` exceptions from `client/deploy/nginx-sello.conf.sample` to the existing site configuration. Preserve existing TLS and other routes. These exceptions must precede the generic `/cars/` handling that returns 404 for unknown listings. Validate Nginx configuration before reload.
5. Verify public `/cars/compare` and a shared comparison URL load directly and after refresh. Test desktop and mobile against the deployed frontend, not only localhost. Confirm source links, optional variants, loading/errors and buying advice.
6. With API credits restored, manually verify at least 20 Pakistan vehicle/year/variant combinations through the comparison UI. The automated QA runner was removed at the owner's request. Review actual values against linked sources; coverage counts alone cannot certify accuracy. Resolve mismatches and rerun affected cases before approving release.
7. Review authenticated monitoring and server log events for latency, failures and reported token/cost data. Confirm credentials, quota, proxy timeouts and API rate limits are appropriate for expected traffic.

## Remaining limitations

- The requested 20+ successful live research tests, source accuracy review and final live buying-advice evaluation remain incomplete due exhausted OpenAI credits.
- Deployment and deployed public URL/browser acceptance remain owner tasks. Production 404 resolution has not been verified.
- Monitoring provides process-local metrics and existing logs, not a new durable cross-worker dashboard or alerting service.
- Aborting a frontend request does not guarantee that already submitted OpenAI work stops billing. Research is not cached persistently; later comparisons perform fresh research.
- Local browser acceptance used simulated research results. No claim is made that all existing SELLO functionality was exhaustively regression-tested.

The folder-structure correction was rebuilt on 21 November 2026 at 10:48 Pakistan time. The root `shared` folder was removed, all production imports now remain inside their own application, and all 18 targeted tests passed. See `client/compare-release-build.log`. Syntax checks passed for the comparison services, constants, router and sitemap script. These are local build results, not a deployed-public verification.
