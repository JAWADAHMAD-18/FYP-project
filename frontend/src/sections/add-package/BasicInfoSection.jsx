import FormSection from "../../components/adminDashboard/add-package/FormSection";
import TextInput from "../../components/adminDashboard/add-package/TextInput";
import TextArea from "../../components/adminDashboard/add-package/TextArea";

/**
 * BasicInfoSection – Title, description, location, city.
 */
const BasicInfoSection = ({ register, errors }) => {
  return (
    <FormSection
      title="Basic Information"
      subtitle="Core details that appear on the package card and detail page."
    >
      <TextInput
        label="Package Title"
        name="title"
        register={register}
        errors={errors}
        placeholder="e.g. Magical Northern Lights Adventure"
        validation={{ required: "Title is required" }}
      />

      <TextArea
        label="Description"
        name="description"
        register={register}
        errors={errors}
        rows={5}
        placeholder="Write a compelling description of this travel package…"
        validation={{ required: "Description is required" }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput
          label="Location"
          name="location"
          register={register}
          errors={errors}
          placeholder="e.g. Iceland"
          validation={{ required: "Location is required" }}
        />
        <TextInput
          label="City"
          name="city"
          register={register}
          errors={errors}
          placeholder="e.g. Reykjavik"
        />
      </div>
    </FormSection>
  );
};

export default BasicInfoSection;
