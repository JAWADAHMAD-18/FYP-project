import FormSection from "../../components/adminDashboard/add-package/FormSection";
import TextArea from "../../components/adminDashboard/add-package/TextArea";

/**
 * HighlightsSection – Multi-line highlights textarea.
 */
const HighlightsSection = ({ register, errors }) => {
  return (
    <FormSection
      title="Highlights"
      subtitle="Key selling points — use one line per highlight."
    >
      <TextArea
        label="Package Highlights"
        name="highlights"
        register={register}
        errors={errors}
        rows={6}
        placeholder={`• Northern Lights viewing\n• Luxury glacier hotel\n• Private guided tours\n• Traditional Icelandic cuisine`}
        validation={{ required: "Highlights are required" }}
      />
    </FormSection>
  );
};

export default HighlightsSection;
