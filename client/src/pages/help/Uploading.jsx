import React from "react";
import HelpArticlePage from "./HelpArticlePage";

const Uploading = () => {
  const content = (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Uploading Vehicle Photos</h2>
        <p className="text-gray-700 mb-4">
          Tips for uploading great photos:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
          <li>Use high-resolution images (minimum 800x600 pixels)</li>
          <li>Take photos in good lighting conditions</li>
          <li>Include multiple angles: front, back, sides, interior, engine</li>
          <li>Upload at least 5-10 photos for best results</li>
          <li>Ensure photos accurately represent the vehicle's condition</li>
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Supported File Formats</h2>
        <p className="text-gray-700 mb-4">
          We accept the following image formats:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>JPEG/JPG (recommended)</li>
          <li>PNG</li>
          <li>Maximum file size: 10MB per image</li>
          <li>Maximum total upload: 50 images per listing</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Uploading Documents</h2>
        <p className="text-gray-700 mb-4">
          For vehicle documentation:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Upload registration documents (PDF or images)</li>
          <li>Include service history records if available</li>
          <li>Upload insurance documents if applicable</li>
          <li>Supported formats: PDF, JPEG, PNG</li>
          <li>Maximum file size: 5MB per document</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Troubleshooting</h2>
        <p className="text-gray-700 mb-4">
          If you experience upload issues:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Check your internet connection</li>
          <li>Ensure file size is within limits</li>
          <li>Try a different browser or clear cache</li>
          <li>Compress large images before uploading</li>
          <li>Contact support if problems persist</li>
        </ul>
      </section>
    </div>
  );

  return (
    <HelpArticlePage
      title="Uploading Images & Documents"
      content={content}
      category="Uploading"
    />
  );
};

export default Uploading;
