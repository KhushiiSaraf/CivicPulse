import { useState, useEffect } from "react";
import { CivicIssue, SeverityLevel, IssueStatus } from "../types";
import { MapPin, Calendar, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, FileText, Check, Clock, Eye, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface IssueFeedProps {
  issues: CivicIssue[];
  onStatusChange: (id: string, newStatus: IssueStatus) => void;
  onDeleteIssue?: (id: string) => void;
  selectedIssueId?: string | null;
}

export default function IssueFeed({ issues, onStatusChange, onDeleteIssue, selectedIssueId }: IssueFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Automatically expand and reset filters if an issue is selected via the map
  useEffect(() => {
    if (selectedIssueId) {
      setExpandedIssueId(selectedIssueId);
      setSelectedCategory("all");
      setSelectedStatus("all");
      setSelectedSeverity("all");

      // Small delay to ensure the DOM has updated/unfiltered before scrolling
      setTimeout(() => {
        const element = document.getElementById(`feed-card-${selectedIssueId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  }, [selectedIssueId]);

  // Status list
  const STATUSES: IssueStatus[] = ["Reported", "In Progress", "Resolved"];

  // Unique categories derived from issues list
  const categories = ["all", ...Array.from(new Set(issues.map((i) => i.category.toLowerCase())))];

  // Filters
  const filteredIssues = issues.filter((issue) => {
    const matchCat = selectedCategory === "all" || issue.category.toLowerCase() === selectedCategory;
    const matchStatus = selectedStatus === "all" || issue.status === selectedStatus;
    const matchSev = selectedSeverity === "all" || issue.severity === selectedSeverity;
    return matchCat && matchStatus && matchSev;
  });

  const getSeverityBadge = (level: SeverityLevel) => {
    switch (level) {
      case "Low":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Medium":
        return "bg-yellow-50 text-yellow-800 border-yellow-200";
      case "High":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "Critical":
        return "bg-red-50 text-red-700 border-red-200 animate-pulse font-bold";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusBadge = (status: IssueStatus) => {
    switch (status) {
      case "Reported":
        return "bg-slate-100 text-slate-800 border-slate-200";
      case "In Progress":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "Resolved":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: IssueStatus) => {
    switch (status) {
      case "Reported":
        return <Clock className="w-3.5 h-3.5" />;
      case "In Progress":
        return <Clock className="w-3.5 h-3.5 animate-spin" />;
      case "Resolved":
        return <Check className="w-3.5 h-3.5" />;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedIssueId === id) {
      setExpandedIssueId(null);
    } else {
      setExpandedIssueId(id);
    }
  };

  return (
    <div id="issue-feed-module" className="space-y-6">
      {/* Search & Filter Header */}
      <div className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-orange-50 pb-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">Issue Tracker Feed</h3>
            <p className="text-xs text-gray-500">Monitor citizen reports, update status levels, and review formal drafts.</p>
          </div>
          <span className="bg-orange-50 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-orange-100">
            Total Issues: {issues.length}
          </span>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs rounded-lg border border-gray-200 p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Severity</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full text-xs rounded-lg border border-gray-200 p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="all">All Severities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs rounded-lg border border-gray-200 p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="all">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards List Grid */}
      {filteredIssues.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-400">
          <AlertTriangle className="w-10 h-10 text-orange-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-gray-800">No matching issues found</h4>
          <p className="text-xs text-gray-500 mt-1">Adjust your filter options or add a new issue report using Module 1.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredIssues.map((issue) => {
              const isSelected = selectedIssueId === issue.id;
              return (
                <motion.div
                  key={issue.id}
                  id={`feed-card-${issue.id}`}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                    isSelected 
                      ? "border-orange-500 ring-4 ring-orange-500/15 shadow-md scale-[1.01]" 
                      : "border-orange-100/70 shadow-sm hover:shadow-md"
                  }`}
                >
                <div>
                  {/* Photo Banner if available */}
                  {issue.imageUrl && (
                    <div className="relative h-44 w-full bg-gray-50 overflow-hidden border-b border-orange-50">
                      <img
                        src={issue.imageUrl}
                        alt={issue.category}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm capitalize ${getSeverityBadge(issue.severity)} border`}>
                          {issue.severity}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs capitalize">
                          {issue.category}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-5 space-y-4">
                    {/* Header Details if no Image Banner */}
                    {!issue.imageUrl && (
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full capitalize ${getSeverityBadge(issue.severity)} border`}>
                            {issue.severity}
                          </span>
                          <span className="text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded-full capitalize">
                            {issue.category}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Summary and Description */}
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-gray-900 leading-snug line-clamp-1">{issue.summary}</h4>
                      <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{issue.description}</p>
                    </div>

                    {/* Metadata: Location and Date */}
                    <div className="space-y-1.5 text-xs text-gray-500 font-medium pt-3 border-t border-orange-50/50">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                        <span className="truncate">{issue.location}</span>
                      </div>
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                          <span>Reported: {formatDate(issue.createdAt)}</span>
                        </div>
                        {issue.reporterName && (
                          <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-md">
                            👤 {issue.reporterName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card footer controls */}
                <div className="bg-orange-50/20 border-t border-orange-100/50 p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    {/* Status selection widget */}
                    <div className="flex items-center space-x-1.5">
                      <span className={`flex items-center space-x-1 border text-[10px] font-bold px-2.5 py-1 rounded-full ${getStatusBadge(issue.status)}`}>
                        {getStatusIcon(issue.status)}
                        <span className="ml-0.5">{issue.status}</span>
                      </span>

                      {/* Dropdown status update */}
                      <select
                        value={issue.status}
                        onChange={(e) => onStatusChange(issue.id, e.target.value as IssueStatus)}
                        className="text-[10px] font-bold rounded-md border border-gray-200 py-1 px-1.5 bg-white text-gray-600 focus:outline-none"
                      >
                        {STATUSES.map((st) => (
                          <option key={st} value={st}>
                            Set: {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Read Complaint Accordion Button */}
                    <div className="flex items-center space-x-1">
                      {onDeleteIssue && (
                        <div className="relative flex items-center mr-1">
                          {deleteConfirmId === issue.id ? (
                            <div className="flex items-center space-x-1 bg-red-50 border border-red-200 rounded-lg p-0.5 animate-in fade-in zoom-in-95 duration-200">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteIssue(issue.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="text-[10px] font-extrabold text-red-600 hover:text-white hover:bg-red-600 bg-white px-2 py-1 rounded shadow-xs border border-red-100 transition-all"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmId(null);
                                }}
                                className="text-[10px] font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-1.5 py-1 rounded transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(issue.id);
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all focus:outline-none"
                              title="Delete issue"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(issue.id);
                        }}
                        className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-0.5 px-2 py-1 rounded hover:bg-orange-50 transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Letter</span>
                        {expandedIssueId === issue.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable formal letter panel */}
                  <AnimatePresence>
                    {expandedIssueId === issue.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-white rounded-xl border border-orange-100 p-3 mt-1"
                      >
                        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-orange-50">
                          <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-orange-500" />
                            Drafted Complaint Letter
                          </span>
                          <span className="text-[9px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                            Formatted PDF Draft
                          </span>
                        </div>
                        <p className="font-mono text-[10px] leading-relaxed text-gray-600 whitespace-pre-wrap max-h-48 overflow-y-auto">
                          {issue.complaintLetter}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )})}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
