import { useUploadCompareImageMutation } from "../redux/services/carCatalogApi.js";

export function useCompareImageUpload() {
  const [upload, state] = useUploadCompareImageMutation();
  return [async (file) => {
    const form = new FormData();
    form.append("file", file);
    const response = await upload(form).unwrap();
    if (!response.data?.url) throw Error("Image upload did not return a URL.");
    return response.data.url;
  }, state];
}
