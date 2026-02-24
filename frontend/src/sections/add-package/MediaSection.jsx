import FormSection from "../../components/adminDashboard/add-package/FormSection";
import ImageUploader from "../../components/adminDashboard/add-package/ImageUploader";

/**
 * MediaSection – Image upload using ImageUploader component.
 *
 * @param {string|null} currentImageUrl – existing image URL in edit mode
 * @param {Function} onFileSelect – callback with File
 * @param {string|null} imageError – validation error message
 */
const MediaSection = ({ currentImageUrl, onFileSelect, imageError }) => {
  return (
    <FormSection
      title="Media"
      subtitle="Upload the main package image shown on cards and the detail page."
    >
      <ImageUploader
        currentImageUrl={currentImageUrl}
        onFileSelect={onFileSelect}
        error={imageError}
      />
    </FormSection>
  );
};

export default MediaSection;
