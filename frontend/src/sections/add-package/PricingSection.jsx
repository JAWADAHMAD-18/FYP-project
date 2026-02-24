import FormSection from "../../components/adminDashboard/add-package/FormSection";
import NumberInput from "../../components/adminDashboard/add-package/NumberInput";

/**
 * PricingSection – Price, slots, duration, availability toggle.
 */
const PricingSection = ({ register, errors, watch }) => {
  return (
    <FormSection
      title="Pricing & Availability"
      subtitle="Set the price, slot limits, and trip duration."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput
          label="Price (USD)"
          name="price"
          register={register}
          errors={errors}
          min={0}
          step={1}
          placeholder="e.g. 1299"
          validation={{
            required: "Price is required",
            min: { value: 0, message: "Price must be positive" },
          }}
        />
        <NumberInput
          label="Available Slots"
          name="available_slot"
          register={register}
          errors={errors}
          min={0}
          step={1}
          placeholder="e.g. 20"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput
          label="Duration (Days)"
          name="durationDays"
          register={register}
          errors={errors}
          min={1}
          step={1}
          placeholder="e.g. 5"
          validation={{
            required: "Duration days is required",
            min: { value: 1, message: "At least 1 day" },
          }}
        />
        <NumberInput
          label="Duration (Nights)"
          name="durationNights"
          register={register}
          errors={errors}
          min={0}
          step={1}
          placeholder="e.g. 4"
          validation={{
            required: "Duration nights is required",
            min: { value: 0, message: "Cannot be negative" },
          }}
        />
      </div>

      {/* Available toggle */}
      <div className="flex items-center gap-3 pt-2">
        <label
          htmlFor="available"
          className="relative inline-flex items-center cursor-pointer"
        >
          <input
            id="available"
            type="checkbox"
            {...register("available")}
            className="sr-only peer"
          />
          <div
            className="w-11 h-6 bg-gray-200 rounded-full peer
            peer-checked:bg-teal-500 peer-focus:ring-2 peer-focus:ring-teal-300
            after:content-[''] after:absolute after:top-[2px] after:left-[2px]
            after:bg-white after:rounded-full after:h-5 after:w-5
            after:transition-all peer-checked:after:translate-x-full
            transition-colors duration-200"
          />
        </label>
        <span className="text-sm text-gray-700 font-medium">
          Mark as Available
        </span>
      </div>
    </FormSection>
  );
};

export default PricingSection;
