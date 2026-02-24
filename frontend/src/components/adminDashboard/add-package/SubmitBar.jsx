import { memo } from "react";
import { Link } from "react-router-dom";
import { Save, Trash2, Loader2 } from "lucide-react";


const SubmitBar = ({ isEditMode, isSubmitting, onDelete }) => {
  return (
    <div className="sticky bottom-0 z-30 bg-white/80 backdrop-blur-md border-t border-gray-200 -mx-4 sm:-mx-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
        {/* Left: Cancel */}
        <Link
          to="/packages"
          className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100
                     rounded-xl hover:bg-gray-200 transition-colors duration-200"
        >
          Cancel
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Delete — edit mode only */}
          {isEditMode && (
            <button
              type="button"
              onClick={onDelete}
              className="px-5 py-2.5 text-sm font-medium text-red-600 bg-red-50
                         rounded-xl hover:bg-red-100 transition-colors duration-200
                         flex items-center gap-2"
            >
              <Trash2 size={16} />
              Delete
            </button>
          )}

          {/* Save / Update */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl
                       transition-all duration-200 flex items-center gap-2
                       disabled:opacity-60 disabled:cursor-not-allowed
                       bg-[#0A1A44] hover:bg-[#0D9488] active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {isEditMode ? "Updating…" : "Saving…"}
              </>
            ) : (
              <>
                <Save size={16} />
                {isEditMode ? "Update Package" : "Save Package"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(SubmitBar);
