import { Link, Navigate, useParams } from "react-router-dom";
import { vehicleCategoryConfig } from "../../config/vehicleCategoryConfig";
import SEO from "../../components/common/SEO";

// Legacy guide links open the matching inline card on the category page.
export default function CategoryGuideDetail() {
  const { categorySlug, blogId } = useParams();
  const config = vehicleCategoryConfig[categorySlug];
  const blog = config?.blogs?.find(item => String(item.id) === String(blogId));
  if (blog) {
    return <Navigate to={`/listings/${encodeURIComponent(categorySlug)}?guide=${encodeURIComponent(blog.id)}#listing-guides`} replace />;
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4">
      <SEO title="Guide Not Found | SELLO" description="The requested vehicle guide could not be found." robots="noindex, follow" />
      <h1 className="text-2xl font-bold">Guide not found</h1>
      <Link to={config ? `/listings/${encodeURIComponent(categorySlug)}` : "/listings"} className="text-primary-500 underline">Back to listings</Link>
    </div>
  );
}
