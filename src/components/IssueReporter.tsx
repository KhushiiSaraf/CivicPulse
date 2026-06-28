import React, { useState, useRef, useEffect } from "react";
import { Upload, MapPin, Image as ImageIcon, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

// Sample photos that users can click to test instantly
const SAMPLE_PHOTOS = [
  {
    name: "Pothole",
    url: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=400",
    desc: "Severe deep crater on the main road lane."
  },
  {
    name: "Broken Light",
    url: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=400",
    desc: "Flickering streetlights creating unsafe darkness."
  },
  {
    name: "Garbage Pile",
    url: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=400",
    desc: "Overflowing trash and debris on public walk path."
  },
  {
    name: "Water Leakage",
    url: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&q=80&w=400",
    desc: "Water main rupture flooding local neighborhood road."
  }
];

interface IssueReporterProps {
  onSubmit: (data: { description: string; location: string; image: string | null; mapX?: number; mapY?: number; lat?: number; lng?: number }) => void;
  isSubmitting?: boolean;
  prefilledLocation?: string;
  prefilledX?: number;
  prefilledY?: number;
  prefilledLat?: number;
  prefilledLng?: number;
}

export default function IssueReporter({ 
  onSubmit, 
  isSubmitting = false,
  prefilledLocation = "",
  prefilledX,
  prefilledY,
  prefilledLat,
  prefilledLng
}: IssueReporterProps) {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mapX, setMapX] = useState<number | undefined>(prefilledX);
  const [mapY, setMapY] = useState<number | undefined>(prefilledY);
  const [lat, setLat] = useState<number | undefined>(prefilledLat);
  const [lng, setLng] = useState<number | undefined>(prefilledLng);

  // Sync with clicked location coordinates from Map
  useEffect(() => {
    if (prefilledLocation) {
      setLocation(prefilledLocation);
    }
    if (prefilledX !== undefined) {
      setMapX(prefilledX);
    }
    if (prefilledY !== undefined) {
      setMapY(prefilledY);
    }
    if (prefilledLat !== undefined) {
      setLat(prefilledLat);
    }
    if (prefilledLng !== undefined) {
      setLng(prefilledLng);
    }
  }, [prefilledLocation, prefilledX, prefilledY, prefilledLat, prefilledLng]);

  // Convert files to base64
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (PNG, JPG, JPEG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size exceeds 5MB limit.");
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSelectSample = (url: string, desc: string) => {
    setImage(url);
    if (!description) {
      setDescription(desc);
    }
  };

  // Simulate or grab real GPS coordinates and translate them to mock address
  const handleGpsLocation = () => {
    setGpsLoading(true);
    setError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(5);
          const lng = position.coords.longitude.toFixed(5);
          setLocation(`Latitude ${lat}, Longitude ${lng} (Near Maple Boulevard)`);
          setGpsLoading(false);
        },
        () => {
          // Fallback if browser permission is denied or iframe blocks
          setTimeout(() => {
            const randomStreets = [
              "842 Oakwood Drive, Sector 4",
              "15 Broad Avenue, Near West Mall",
              "Parkside Corner, opposite Green Park Gate 2",
              "290 Riverway Lane, near Municipal Water Plant"
            ];
            const randomStreet = randomStreets[Math.floor(Math.random() * randomStreets.length)];
            setLocation(randomStreet);
            setGpsLoading(false);
          }, 800);
        },
        { timeout: 5000 }
      );
    } else {
      setLocation("842 Oakwood Drive, Sector 4");
      setGpsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please describe the civic issue.");
      return;
    }
    if (!location.trim()) {
      setError("Please specify the location of the issue.");
      return;
    }

    setError(null);
    onSubmit({
      description: description.trim(),
      location: location.trim(),
      image,
      mapX,
      mapY,
      lat,
      lng
    });
  };

  const handleClear = () => {
    setDescription("");
    setLocation("");
    setImage(null);
    setError(null);
    setMapX(undefined);
    setMapY(undefined);
    setLat(undefined);
    setLng(undefined);
  };

  return (
    <div id="issue-reporter-module" className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 max-w-2xl mx-auto">
      <div className="flex items-center space-x-3 border-b border-orange-50 pb-4 mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
          <ImageIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Report a Civic Issue</h2>
          <p className="text-xs text-gray-500">Provide details and photos to report potholes, garbage piles, or utility outages.</p>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 text-red-700 p-3 rounded-lg flex items-start space-x-2 text-sm mb-4 border border-red-100"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. PHOTO UPLOAD SECTION */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Upload Photo <span className="text-gray-400 font-normal">(Optional, but highly recommended for Gemini AI)</span>
          </label>
          
          {!image ? (
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                dragActive 
                  ? "border-orange-500 bg-orange-50/50" 
                  : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/10"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleChange}
              />
              <Upload className="w-10 h-10 text-orange-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700">
                Drag and drop your image here, or{" "}
                <button
                  type="button"
                  className="text-orange-600 font-semibold hover:underline focus:outline-none"
                  onClick={() => fileInputRef.current?.click()}
                >
                  browse files
                </button>
              </p>
              <p className="text-xs text-gray-400 mt-1">Supports PNG, JPG, JPEG up to 5MB</p>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-orange-200 bg-orange-50/10 p-3">
              <div className="relative aspect-video max-h-64 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                <img
                  src={image}
                  alt="Civic issue preview"
                  className="object-contain w-full h-full"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-md transition-all transform hover:scale-105"
                  onClick={() => setImage(null)}
                  title="Remove image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center space-x-2 text-xs text-orange-700 mt-2 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
                <span>Photo loaded successfully! Ready for Gemini AI analysis.</span>
              </div>
            </div>
          )}

          {/* Prompt options for sandbox testing */}
          <div className="mt-4 bg-orange-50/40 border border-orange-100/60 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-orange-800 uppercase tracking-wider mb-2 flex items-center">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-1.5 animate-pulse"></span>
              Or Select a Sample Photo to Test Instantly
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_PHOTOS.map((photo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(photo.url, photo.desc)}
                  className="group relative h-16 rounded-lg overflow-hidden border border-gray-200 hover:border-orange-500 text-left transition-all focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-end p-1">
                    <span className="text-[10px] font-bold text-white tracking-tight leading-none truncate w-full">
                      {photo.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. DESCRIPTION */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-800 mb-1">
            Describe the Issue <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-gray-400"
            placeholder="Please explain what is wrong, how long it has been there, and the hazards it creates..."
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-[11px] text-gray-400">Be as specific as possible for better AI categorisation.</p>
            <p className="text-xs font-medium text-gray-500">{description.length} characters</p>
          </div>
        </div>

        {/* 3. LOCATION */}
        <div>
          <label htmlFor="location" className="block text-sm font-semibold text-gray-800 mb-1">
            Location / Landmark <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-gray-200 pl-10 pr-32 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-gray-400"
              placeholder="e.g. Near Sunnyvale Park West Gate, Maple Avenue"
            />
            <div className="absolute left-3.5 top-3.5 text-gray-400">
              <MapPin className="w-4.5 h-4.5 text-gray-400" />
            </div>
            <button
              type="button"
              onClick={handleGpsLocation}
              disabled={gpsLoading}
              className="absolute right-2 top-2 bg-orange-50 hover:bg-orange-100 text-orange-700 disabled:opacity-60 rounded-lg px-2.5 py-1.5 text-xs font-semibold flex items-center space-x-1 border border-orange-200/50 transition-all"
            >
              <MapPin className={`w-3.5 h-3.5 ${gpsLoading ? "animate-bounce" : ""}`} />
              <span>{gpsLoading ? "Locating..." : "Auto-Fill GPS"}</span>
            </button>
          </div>
        </div>

        {/* 4. ACTIONS */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-orange-50">
          <button
            type="button"
            onClick={handleClear}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all"
            disabled={isSubmitting}
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !description.trim() || !location.trim()}
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all duration-150 flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Gemini Analyzing...</span>
              </>
            ) : (
              <span>Submit Civic Report</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
