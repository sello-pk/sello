import { Link, Navigate, useParams } from "react-router-dom";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import SEO from "../../components/common/SEO";
import { auctionBlogPosts } from "../../components/features/auctions/AuctionBlogsSection";

// Keep existing bookmarks working while all guide reading happens inline.
export default function AuctionGuideDetail() {
  const { blogId } = useParams();
  const post = auctionBlogPosts.find(item => String(item.id) === String(blogId));

  if (post) {
    return <Navigate to={`/auctions?guide=${encodeURIComponent(post.id)}#auction-guides`} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <SEO title="Auction Guide Not Found | Sello" description="The requested auction guide could not be found. Browse SELLO’s auction guides." robots="noindex, follow" />
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Guide not found</h1>
        <Link to="/auctions#auction-guides" className="inline-flex items-center gap-2 font-medium text-primary-500 hover:underline">
          <HiOutlineArrowLeft /> Back to Auctions
        </Link>
      </div>
    </div>
  );
}
