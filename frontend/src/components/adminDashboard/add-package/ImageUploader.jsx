import { memo, useState, useCallback, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";


const ImageUploader = ({ currentImageUrl, onFileSelect, error }) => {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback(
    (file) => {
      if (!file || !file.type.startsWith("image/")) return;
      setFileName(file.name);
      onFileSelect(file);

      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    },
    [onFileSelect],
  );

  const handleChange = useCallback(
    (e) => {
      handleFile(e.target.files?.[0]);
    },
    [handleFile],
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFile(e.dataTransfer.files?.[0]);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const clearImage = useCallback(() => {
    setPreview(null);
    setFileName("");
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [onFileSelect]);

  const displayImage = preview || currentImageUrl;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Package Image <span className="text-red-500">*</span>
      </label>

      {/* Preview */}
      {displayImage && (
        <div className="relative group w-full max-w-md">
          <img
            src={displayImage}
            alt="Package preview"
            className="w-full h-48 object-cover rounded-xl border border-gray-200"
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full
                       shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200
                       hover:bg-red-50 hover:text-red-600"
          >
            <X size={14} />
          </button>
          {fileName && (
            <div
              className="absolute bottom-2 left-2 px-2.5 py-1 bg-white/90 backdrop-blur-sm
                            rounded-lg text-xs text-gray-700 font-medium shadow-sm max-w-[80%] truncate"
            >
              {fileName}
            </div>
          )}
        </div>
      )}

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-2 px-6 py-8
          border-2 border-dashed rounded-xl cursor-pointer
          transition-all duration-200
          ${
            isDragOver
              ? "border-teal-400 bg-teal-50/50"
              : error
                ? "border-red-300 bg-red-50/30"
                : "border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-50"
          }
        `}
      >
        <div
          className={`p-3 rounded-xl transition-colors duration-200 ${
            isDragOver
              ? "bg-teal-100 text-teal-600"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {displayImage ? <ImageIcon size={24} /> : <Upload size={24} />}
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            {displayImage ? "Change image" : "Upload an image"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Drag & drop or click to browse · JPG, PNG, WebP
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <svg
            className="w-3.5 h-3.5 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default memo(ImageUploader);
