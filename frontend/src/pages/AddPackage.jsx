import { useState, useCallback, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Package } from "lucide-react";

// Sections
import BasicInfoSection from "../sections/add-package/BasicInfoSection";
import PricingSection from "../sections/add-package/PricingSection";
import TripMetaSection from "../sections/add-package/TripMetaSection";
import HighlightsSection from "../sections/add-package/HighlightsSection";
import MediaSection from "../sections/add-package/MediaSection";

// Components
import SubmitBar from "../components/adminDashboard/add-package/SubmitBar";
import DeleteConfirmModal from "../components/adminDashboard/add-package/DeleteConfirmModal";

// Services
import { getPackageById } from "../services/package.service";
import {
  addPackage,
  updatePackage,
  deletePackage,
} from "../services/adminPackage.service";


const toDateInput = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
};

/** Build a FormData payload from RHF values + optional image File */
const buildFormData = (values, imageFile) => {
  const fd = new FormData();

  Object.entries(values).forEach(([key, val]) => {
    if (val === undefined || val === null || val === "") return;
    fd.append(key, val);
  });

  if (imageFile) {
    fd.append("image", imageFile);
  }

  return fd;
};

// ─── Default form values 

const DEFAULT_VALUES = {
  title: "",
  description: "",
  location: "",
  city: "",
  price: "",
  available_slot: "",
  durationDays: "",
  durationNights: "",
  available: false,
  trip_type: "",
  category: "",
  start_date: "",
  end_date: "",
  highlights: "",
};

// ─── Component 

const AddPackagePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // RHF
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: DEFAULT_VALUES });

  // State
  const [imageFile, setImageFile] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [pageLoading, setPageLoading] = useState(isEditMode);
  const [pageError, setPageError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Watched title for delete modal
  const watchedTitle = watch("title");

  // ── Fetch existing package (edit mode) 
  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    const fetchPackage = async () => {
      try {
        setPageLoading(true);
        setPageError(null);
        const pkg = await getPackageById(id);
        if (cancelled) return;

        // Map API response → form values
        reset({
          title: pkg.title || "",
          description: pkg.description || "",
          location: pkg.location || "",
          city: pkg.city || "",
          price: pkg.price ?? "",
          available_slot: pkg.available_slot ?? "",
          durationDays: pkg.durationDays ?? "",
          durationNights: pkg.durationNights ?? "",
          available: pkg.available ?? false,
          trip_type: pkg.trip_type || "",
          category: pkg.category || "",
          start_date: toDateInput(pkg.start_date),
          end_date: toDateInput(pkg.end_date),
          highlights: pkg.highlights || "",
        });

        setCurrentImageUrl(pkg.image || null);
      } catch (err) {
        if (!cancelled) {
          setPageError(
            err?.response?.data?.message ||
              err.message ||
              "Failed to load package",
          );
        }
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    };

    fetchPackage();
    return () => {
      cancelled = true;
    };
  }, [id, reset]);

  // ── Image handler 
  const handleFileSelect = useCallback((file) => {
    setImageFile(file);
    setImageError(null);
    if (file) {
      setCurrentImageUrl(null); // user chose a new file
    }
  }, []);

  // ── Submit (Create / Update) 
  const onSubmit = useCallback(
    async (values) => {
      // Validate image on create
      if (!isEditMode && !imageFile) {
        setImageError("Please upload an image");
        return;
      }

      try {
        setSubmitError(null);
        const formData = buildFormData(values, imageFile);

        if (isEditMode) {
          await updatePackage(id, formData);
        } else {
          await addPackage(formData);
        }

        navigate("/packages");
      } catch (err) {
        setSubmitError(
          err?.response?.data?.message || err.message || "Something went wrong",
        );
      }
    },
    [isEditMode, id, imageFile, navigate],
  );

  // ── Delete 
  const handleDeleteConfirm = useCallback(async () => {
    try {
      setIsDeleting(true);
      await deletePackage(id);
      setShowDeleteModal(false);
      navigate("/packages");
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to delete package",
      );
      setIsDeleting(false);
    }
  }, [id, navigate]);

  // ── Memoized section props 
  const sectionProps = useMemo(
    () => ({ register, errors }),
    [register, errors],
  );

  // ─── Loading state 
  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-teal-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading package data…</p>
        </div>
      </div>
    );
  }

  // ─── Error state 
  if (pageError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3 max-w-md px-4">
          <p className="text-red-600 font-medium">{pageError}</p>
          <button
            onClick={() => navigate("/packages")}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium underline"
          >
            ← Back to Packages
          </button>
        </div>
      </div>
    );
  }

  // ─── Render 
  return (
    <div className="min-h-screen bg-gray-50 mt-16">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-28 space-y-6"
        noValidate
      >
        {/* Page Header */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => navigate("/packages")}
            className="flex items-center gap-1.5 text-lg text-gray-800 hover:text-gray-900
                       transition-colors duration-200 mb-4"
          >
            <ArrowLeft size={16} />
            Back to Packages
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0A1A44] rounded-xl">
              <Package className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {isEditMode ? "Edit Package" : "Add New Package"}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {isEditMode
                  ? "Update the details of this travel package."
                  : "Fill in the details to create a new travel package."}
              </p>
            </div>
          </div>
        </div>

        {/* Submit Error Banner */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        {/* Sections */}
        <BasicInfoSection {...sectionProps} />
        <PricingSection {...sectionProps} watch={watch} />
        <TripMetaSection {...sectionProps} />
        <HighlightsSection {...sectionProps} />
        <MediaSection
          currentImageUrl={currentImageUrl}
          onFileSelect={handleFileSelect}
          imageError={imageError}
        />

        {/* Sticky bar */}
        <SubmitBar
          isEditMode={isEditMode}
          isSubmitting={isSubmitting}
          onDelete={() => setShowDeleteModal(true)}
        />
      </form>

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        isDeleting={isDeleting}
        packageTitle={watchedTitle}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default AddPackagePage;
