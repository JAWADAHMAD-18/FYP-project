import FormSection from "../../components/adminDashboard/add-package/FormSection";
import SelectInput from "../../components/adminDashboard/add-package/SelectInput";
import TextInput from "../../components/adminDashboard/add-package/TextInput";

const TRIP_TYPE_OPTIONS = [
  { value: "domestic", label: "Domestic" },
  { value: "international", label: "International" },
];

const CATEGORY_OPTIONS = [
  { value: "accommodations", label: "Accommodations" },
  { value: "flights", label: "Flights" },
  { value: "experiences", label: "Experiences" },
];

/**
 * TripMetaSection – Trip type, category, start/end dates.
 */
const TripMetaSection = ({ register, errors }) => {
  return (
    <FormSection
      title="Trip Details"
      subtitle="Categorize the trip and set travel dates."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectInput
          label="Trip Type"
          name="trip_type"
          register={register}
          errors={errors}
          options={TRIP_TYPE_OPTIONS}
          placeholder="Select type…"
          validation={{ required: "Trip type is required" }}
        />
        <SelectInput
          label="Category"
          name="category"
          register={register}
          errors={errors}
          options={CATEGORY_OPTIONS}
          placeholder="Select category…"
          validation={{ required: "Category is required" }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput
          label="Start Date"
          name="start_date"
          type="date"
          register={register}
          errors={errors}
          validation={{ required: "Start date is required" }}
        />
        <TextInput
          label="End Date"
          name="end_date"
          type="date"
          register={register}
          errors={errors}
          validation={{ required: "End date is required" }}
        />
      </div>
    </FormSection>
  );
};

export default TripMetaSection;
