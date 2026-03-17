# Upload limits (listings & auctions)

## App limits

- **Max images per listing/car:** 15  
- **Max total size per request:** 35MB  
- **Max per file:** 35MB  
- **Formats:** JPG, PNG, WebP  

Used for: create/edit car (`POST/PUT /api/cars`), auction submit-car (`POST /api/auctions/submit-car`).

## Why uploads fail after 4–5 images

If uploads work for a few images then fail when adding more, the **reverse proxy** (e.g. nginx, Caddy, load balancer) is usually limiting the request body size. The app allows up to 15 images and 35MB; the proxy must allow at least that much.

### Fix (nginx)

In your server block (or `http` block):

```nginx
client_max_body_size 40m;
```

Then reload nginx:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### Other hosts

- **Vercel / Netlify:** Serverless payload limits apply; consider uploading in smaller batches or using a different host for listing creation.
- **Caddy:** `request_body 40mb` or equivalent.
- **Apache:** `LimitRequestBody 41943040` (40MB).

After increasing the limit, retry with up to 15 images (35MB total).
