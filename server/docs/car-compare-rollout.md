# Sello Car Compare rollout

Car Compare reads active `Category` makes and models and published `CarCatalogVariant` records. An exact comparison uses the existing variant ID and its stored model year. Model-only selections remain available before a version is published. The comparison does not require marketplace inventory. Supplementary approvals and audit history are stored separately under the variant ID.

## Configure and release

For local development against the updated Express server, set `VITE_COMPARE_API_URL=http://127.0.0.1:4000/api` in `client/.env.development.local` and use the port configured for your local API. Vite uses this override for catalogue and comparison requests only. Production builds use the regular API configuration.

1. Deploy the API and apply the updated frontend routing for `/cars/compare`. Verify the MongoDB unique index on the review variant ID and the lease TTL index. On Nginx, merge the comparison locations into the active configuration so direct share links reach the SPA with the noindex result shell.
2. Leave both AI switches off for the first comparison and check prices, approved specifications, sharing, and the running cost calculator. The public landing page has four default guides. Use the Car Catalogue settings to preview and publish replacements.
3. Car Compare reuses the price estimator's server-side `OPENAI_API_KEY` or `OPENAI_KEY`. With no saved settings, a configured key enables AI guidance and research. Saved switches take precedence. Model-only selections receive qualitative buying guidance. Exact year and trim selections can also retrieve missing specifications through OpenAI web search, or Brave Search when its optional key is configured.
4. In a staging catalogue, compare two versions with a known data gap. Check that AI values are marked pending, source links are visible only to reviewers, and approval reuses the stored values on subsequent requests. Verify Cloudinary image upload with the existing storage configuration.
5. Confirm the landing canonical and share-page noindex in raw HTML and the browser after deploying the production build.

## Initial population plan

Resolve each proposed model to an existing Sello category ID before creating or editing any catalogue record. Confirm exact Pakistani-market trim names, years, and import variants. The list below is a candidate queue. It does not imply that the records already exist or that their data has been verified.

| Batch | Candidate models |
| --- | --- |
| 1 | Suzuki Alto, Cultus, Wagon R, Swift, Every, Bolan, Mehran, Ravi. Toyota Corolla, Yaris, Fortuner, Hilux. Honda City, Civic, BR-V, HR-V. |
| 2 | KIA Sportage, Stonic, Picanto, Sorento. Hyundai Tucson, Elantra, Sonata, Santa Fe. Changan Alsvin, Oshan X7, Karvaan. MG HS, ZS EV, MG4. |
| 3 | Haval H6, Jolion. Proton Saga, X70. Toyota Aqua, Prius, Vitz, Corolla Cross. Daihatsu Mira, Move. Honda Vezel, Fit. |

Start with the most common exact trims from each model in Sello's own data. Use archived Pakistani brochures or authorized manufacturer releases for model-year specifications and official effective prices. Record used-market estimates separately and document the evidence and date internally. Record claimed and real-world fuel averages separately. An editor should review each trim before publishing and leave unsupported fields empty. Track coverage by exact year and trim rather than counting every model name as complete. Use approved, reusable images stored through Sello's image upload.

## First catalogue entries for editorial review

In the existing Car comparison catalogue, select the existing Honda model and check its saved versions before adding a draft. These Pakistan-market source notes are a starting point for the editor. Enter the verification date when the source is checked. A make logo is a different asset from a model photo.

| Model | Year | Version | Documented values | Manufacturer evidence |
| --- | --- | --- | --- | --- |
| Civic | 2022 | RS | 11th generation. Honda Sensing includes adaptive cruise control. | [Honda Atlas company history](https://www.honda.com.pk/investorRelation) |
| HR-V | 2022 | VTI | Manufacturer launch price PKR 5,999,000 effective 2022-10-22. | [Honda Atlas Pakistan launch announcement, grade and price table](https://www.honda.com.pk/newsandevents-all-new-honda-hrv-2022) |
| HR-V | 2022 | VTI-S | Manufacturer launch price PKR 6,199,000 effective 2022-10-22. | [Honda Atlas Pakistan launch announcement, grade and price table](https://www.honda.com.pk/newsandevents-all-new-honda-hrv-2022) |

For the HR-V entries use the manufacturer reference price type and the historical effective date. Leave used prices and fuel averages empty until there is evidence for the selected year and version. The three rows above are partial editorial candidates and do not count as fully populated vehicles.
