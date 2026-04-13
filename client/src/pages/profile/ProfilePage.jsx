import ProfileHero from "../../components/sections/profile/ProfileHero";
import SEO from "../../components/common/SEO";

const ProfilePage = () => {
  return (
    <>
      <SEO
        title="My Profile - Account Settings & Preferences | Sello.pk"
        description="Manage your profile settings, update personal information, change password, and customize your Sello account preferences."
        keywords="profile, account settings, user profile, manage account, personal information"
        canonical="https://sello.pk/profile"
      />
      <div className="min-h-screen bg-gray-50">
        {/* Hidden H1 for SEO */}
        <h1 className="sr-only">My Profile - Account Settings</h1>
        <ProfileHero />
      </div>
    </>
  );
};

export default ProfilePage;
