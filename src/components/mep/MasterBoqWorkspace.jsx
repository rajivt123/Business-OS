import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText, Upload, ChevronRight, Search, Filter, AlertCircle,
  CheckCircle2, Clock, Ban, ListChecks, ArrowRight,
  Database, FileBarChart, HardDrive, LayoutGrid, Eye, Check, X, RefreshCw, Plus
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCrm } from '../../context/CrmContext';
import { useInventory } from '../../context/InventoryContext';

export default function MasterBoqWorkspace({ isDarkMode = false }) {
  const crmContext = useCrm() || {};
  const { activeOperatingCompanyId, works = [] } = crmContext;

  const invContext = useInventory() || {};
  const { items = [] } = invContext;

  // View steps: 'SELECT_PROJECT' -> 'UPLOAD_SOURCE' -> 'MASTER_BOQ'
  const [currentView, setCurrentView] = useState('SELECT_PROJECT');
  
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDocs, setProjectDocs] = useState([]);
  const [selectedSourceId, setSelectedSourceId] = useState('');

  // Data states
  const [boqLines, setBoqLines] = useState([]);
  const [currentMasterBoqId, setCurrentMasterBoqId] = useState(null);
  const [masterBoqStatus, setMasterBoqStatus] = useState(null);

  // Loaders and Errors
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Review panel
  const [selectedLineForReview, setSelectedLineForReview] = useState(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [manualSelectedItemId, setManualSelectedItemId] = useState('');
  const [showChangeItem, setShowChangeItem] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    if (currentView === 'SELECT_PROJECT') {
      setSelectedProject(null);
      setSelectedSourceId('');
      setBoqLines([]);
      setCurrentMasterBoqId(null);
      setMasterBoqStatus(null);
      setSelectedLineForReview(null);
      setCandidates([]);
      setErrorMsg(null);
    }
  }, [currentView]);

  const handleProjectSelect = async (workId) => {
    setSelectedProject(workId);
    setCurrentView('UPLOAD_SOURCE');
    setIsLoadingDocs(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('file_attachments')
        .select('*')
        .eq('tenant_company_id', activeOperatingCompanyId)
        .eq('entity_type', 'work')
        .eq('entity_id', String(workId))
        .eq('is_current', true)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProjectDocs(data || []);
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleAIEntry = async () => {
    if (!selectedSourceId) {
      setErrorMsg('Please select a source document first.');
      return;
    }
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      // 1. Fetch extraction
      const { data: extData, error: extError } = await supabase
        .from('mep_document_extractions')
        .select('id')
        .eq('source_document_id', selectedSourceId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (extError || !extData) {
        throw new Error("Document extraction is not available for this document yet.");
      }

      // 2. Fetch extracted lines
      const { data: extLines, error: linesError } = await supabase
        .from('mep_extraction_lines')
        .select('*')
        .eq('extraction_id', extData.id);

      if (linesError || !extLines || extLines.length === 0) {
        throw new Error("No lines found in the extraction.");
      }

      // 3. Create Master BOQ draft
      const { data: createData, error: createError } = await supabase.functions.invoke('master-boq-service', {
        body: {
          action: "create",
          tenant_company_id: activeOperatingCompanyId,
          work_id: selectedProject,
          title: "AI Master BOQ",
          boq_code: "BOQ-" + new Date().getTime(),
          version: "1.0",
          source_document_id: selectedSourceId,
          source_extraction_id: extData.id,
          notes: "Created via AI Entry Workflow",
          lines: extLines.map(l => ({
            original_description: l.raw_description,
            quantity: l.extracted_qty,
            uom_code: l.extracted_uom,
            make: l.extracted_make,
            model: l.extracted_model,
            line_no: l.sequence_index?.toString() || ""
          }))
        }
      });

      if (createError) throw createError;
      if (createData?.error) throw new Error(createData.error);

      setCurrentMasterBoqId(createData.master_boq_id);
      setCurrentView('MASTER_BOQ');
      await fetchMasterBoq(createData.master_boq_id);
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualEntry = async () => {
    if (!selectedSourceId) {
      setErrorMsg('Please select a source document first.');
      return;
    }
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const { data: createData, error: createError } = await supabase.functions.invoke('master-boq-service', {
        body: {
          action: "create",
          tenant_company_id: activeOperatingCompanyId,
          work_id: selectedProject,
          title: "Manual Master BOQ",
          boq_code: "BOQ-" + new Date().getTime(),
          version: "1.0",
          source_document_id: selectedSourceId,
          source_extraction_id: null,
          notes: "Created via Manual Entry Workflow",
          lines: []
        }
      });
      
      if (createError) throw createError;
      if (createData?.error) throw new Error(createData.error);

      setCurrentMasterBoqId(createData.master_boq_id);
      setCurrentView('MASTER_BOQ');
      await fetchMasterBoq(createData.master_boq_id);
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchMasterBoq = async (id) => {
    try {
      const { data, error } = await supabase.functions.invoke('master-boq-service', {
        body: { action: 'get', master_boq_id: id }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      if (data?.boq) {
        setMasterBoqStatus(data.boq.status);
        const mappedLines = (data.boq.lines || []).map(l => ({
          id: l.id,
          lineNo: l.line_no || '',
          originalDescription: l.original_description || '',
          normalizedDescription: l.normalized_description || '',
          quantity: l.quantity || 0,
          uom: l.uom_code || '',
          make: l.make || '',
          model: l.model || '',
          specification: l.specification || '',
          masterItemCode: l.inventory_item_id ? items.find(i => i.id === l.inventory_item_id)?.item_code || 'Unknown Item' : '',
          inventoryItemId: l.inventory_item_id,
          matchStatus: l.match_status || 'unmatched',
          confidence: l.match_confidence || 0,
          matchMethod: l.match_method || '',
          matchReasons: l.match_explanation || ''
        }));
        setBoqLines(mappedLines);
        
        // Refresh selected line if open
        if (selectedLineForReview) {
          const updated = mappedLines.find(ml => ml.id === selectedLineForReview.id);
          setSelectedLineForReview(updated || null);
        }
      }
    } catch(e) {
      setErrorMsg("Failed to fetch BOQ: " + e.message);
    }
  };

  const handleStartIdentification = async (line) => {
    setIsIdentifying(true);
    setCandidates([]);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase.functions.invoke('mep-item-identification', {
        body: {
          action: "identify",
          tenant_company_id: activeOperatingCompanyId,
          raw_description: line.originalDescription,
          parsed_attributes: { make: line.make, model: line.model },
          domain_code: "MEP",
          source_type: "BOQ",
          source_id: selectedSourceId,
          source_line_id: line.id
        }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setCandidates(data.candidates || []);
    } catch (e) {
      setErrorMsg("Identification failed: " + e.message);
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleUpdateLine = async (lineId, inventoryItemId, decision, conf=0, method='', reasons='', overrideNormDesc='') => {
    try {
      const lineData = boqLines.find(l => l.id === lineId);
      if (!lineData) return;

      setIsProcessing(true);
      setErrorMsg(null);

      const { data, error } = await supabase.functions.invoke('master-boq-service', {
        body: {
          action: 'update-line',
          master_boq_line_id: lineId,
          inventory_item_id: inventoryItemId,
          normalized_description: overrideNormDesc || lineData.normalizedDescription,
          specification: lineData.specification,
          make: lineData.make,
          model: lineData.model,
          quantity: lineData.quantity,
          uom_code: lineData.uom,
          remarks: '',
          match_method: method,
          match_confidence: conf,
          match_explanation: reasons,
          decision: decision
        }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      await fetchMasterBoq(currentMasterBoqId);
      setCandidates([]);
      setShowChangeItem(false);
      setManualSelectedItemId('');
    } catch (e) {
      setErrorMsg("Update failed: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      setErrorMsg(null);
      const { data, error } = await supabase.functions.invoke('master-boq-service', {
        body: { action: 'approve', master_boq_id: currentMasterBoqId }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      await fetchMasterBoq(currentMasterBoqId);
    } catch (e) {
      setErrorMsg("Approval failed: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredLines = useMemo(() => {
    return boqLines.filter(line => {
      if (statusFilter !== 'ALL' && line.matchStatus !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (line.originalDescription?.toLowerCase().includes(q) || line.lineNo?.toLowerCase().includes(q));
      }
      return true;
    });
  }, [boqLines, statusFilter, searchQuery]);

  const StatusBadge = ({ status }) => {
    const config = {
      unmatched: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      candidate: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20',
      matched: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20',
      verified: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20',
      rejected: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20',
    };
    const c = config[status?.toLowerCase()] || config.unmatched;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border uppercase ${c}`}>
        {status || 'unmatched'}
      </span>
    );
  };

  const selectedWorkTitle = works.find(w => w.id === selectedProject)?.title || selectedProject;
  const selectedDocTitle = projectDocs.find(d => d.id === selectedSourceId)?.file_name || 'Document';

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
      {/* Header */}
      <div className="flex-none px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Master BOQ
            </h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 dark:text-slate-400">
              {currentView !== 'SELECT_PROJECT' && (
                <span>{selectedWorkTitle}</span>
              )}
              {currentView === 'MASTER_BOQ' && selectedSourceId && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span>{selectedDocTitle}</span>
                </>
              )}
              {masterBoqStatus === 'APPROVED' && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium tracking-wide">MASTER BOQ APPROVED</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {currentView === 'MASTER_BOQ' && (
              <>
                <button className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors">
                  Export BOQ
                </button>
                <button 
                  onClick={handleApprove}
                  disabled={isProcessing || masterBoqStatus === 'APPROVED'}
                  className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Approve Master BOQ'}
                </button>
              </>
            )}
          </div>
        </div>
        {errorMsg && (
          <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-none" />
            <span className="flex-1">{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)}><X className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden flex relative">
        {currentView === 'SELECT_PROJECT' && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 z-10 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-w-lg w-full p-6 max-h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4 flex-none">
                <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                  <Database className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Select Project</h2>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-none">
                Choose a project to begin building or reviewing its Master BOQ.
              </p>
              <div className="space-y-2 overflow-auto flex-1">
                {works.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No projects found.</p>
                ) : (
                  works.map(w => (
                    <button
                      key={w.id}
                      onClick={() => handleProjectSelect(w.id)}
                      className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                    >
                      <div className="font-medium text-slate-900 dark:text-slate-100">{w.title}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select to choose document</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {currentView === 'UPLOAD_SOURCE' && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 z-10 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-w-lg w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <FileBarChart className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Source BOQ Document</h2>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Select a document (Final BOQ, Client PO, etc.) from the project attachments.
              </p>
              
              {isLoadingDocs ? (
                <div className="py-8 flex justify-center"><RefreshCw className="w-6 h-6 animate-spin text-slate-400" /></div>
              ) : (
                <div className="mb-6 space-y-4">
                  <select 
                    value={selectedSourceId}
                    onChange={(e) => setSelectedSourceId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select Source Document --</option>
                    {projectDocs.map(doc => {
                      const sizeMB = doc.file_size_bytes ? (doc.file_size_bytes / 1024 / 1024).toFixed(2) + ' MB' : '';
                      const mime = doc.mime_type ? doc.mime_type.split('/').pop().toUpperCase() : 'FILE';
                      const label = `${doc.file_name} ${sizeMB ? `(${sizeMB}, ${mime})` : ''}`;
                      return (
                        <option key={doc.id} value={doc.id}>{label}</option>
                      );
                    })}
                  </select>
                </div>
              )}

              <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleManualEntry}
                  disabled={!selectedSourceId || isProcessing}
                  className="flex-1 py-3 px-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  Manual Entry
                </button>
                <button
                  onClick={handleAIEntry}
                  disabled={!selectedSourceId || isProcessing}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <HardDrive className="w-4 h-4" />}
                  AI Entry
                </button>
              </div>

              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => setCurrentView('SELECT_PROJECT')}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'MASTER_BOQ' && (
          <div className="flex-1 flex overflow-hidden">
            {/* BOQ Grid */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
              <div className="flex-none p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search descriptions, lines..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-slate-100"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="unmatched">Unmatched</option>
                  <option value="candidate">Candidate</option>
                  <option value="matched">Matched</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
                
                {/* Manual line add could be placed here if needed */}
                <div className="flex-1" />
                {masterBoqStatus !== 'APPROVED' && (
                  <button className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Line
                  </button>
                )}
              </div>
              
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700 shadow-sm">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Line No</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Original Description</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Norm. Desc</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">UOM</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Master Item</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Match Status</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Method</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredLines.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                          <LayoutGrid className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                          <p className="text-lg font-medium text-slate-900 dark:text-slate-100">No lines available</p>
                          <p className="text-sm mt-1">Manual entry mode or no lines extracted.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredLines.map((line) => (
                        <tr 
                          key={line.id} 
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${selectedLineForReview?.id === line.id ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                        >
                          <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100 font-medium">{line.lineNo}</td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate" title={line.originalDescription}>
                            {line.originalDescription}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate" title={line.normalizedDescription}>
                            {line.normalizedDescription || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{line.quantity}</td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{line.uom}</td>
                          <td className="px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400">
                            {line.masterItemCode || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <StatusBadge status={line.matchStatus} />
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                            {line.matchMethod || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => {
                                setSelectedLineForReview(line);
                                setCandidates([]);
                                setShowChangeItem(false);
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Review Panel */}
            {selectedLineForReview && (
              <div className="w-96 flex-none flex flex-col bg-slate-50 dark:bg-slate-800/50 border-l border-slate-200 dark:border-slate-800">
                <div className="flex-none px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-blue-500" />
                    Review Match
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedLineForReview(null);
                      setCandidates([]);
                      setShowChangeItem(false);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-auto p-4 space-y-6">
                  {/* Original Content */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Original BOQ Text</h4>
                    <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed">
                      {selectedLineForReview.originalDescription}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                        <div className="text-xs text-slate-500 dark:text-slate-400">Line No</div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">{selectedLineForReview.lineNo}</div>
                      </div>
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                        <div className="text-xs text-slate-500 dark:text-slate-400">Qty / UOM</div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">{selectedLineForReview.quantity} {selectedLineForReview.uom}</div>
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendation / Identification */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Document AI Identification</h4>
                      {selectedLineForReview.matchStatus === 'unmatched' && !isIdentifying && candidates.length === 0 && (
                        <button 
                          onClick={() => handleStartIdentification(selectedLineForReview)}
                          className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium flex items-center gap-1"
                        >
                          <HardDrive className="w-3 h-3" /> Start AI Match
                        </button>
                      )}
                    </div>

                    {isIdentifying && (
                      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center flex flex-col items-center">
                        <RefreshCw className="w-5 h-5 text-blue-500 animate-spin mb-2" />
                        <span className="text-xs text-slate-500">Querying AI model...</span>
                      </div>
                    )}

                    {!isIdentifying && candidates.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-500 px-1">Candidates suggested by AI:</p>
                        {candidates.map((c, i) => (
                          <div key={i} className="bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800/30">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="text-emerald-700 dark:text-emerald-400 font-semibold">{c.item_code}</div>
                                <div className="text-sm text-emerald-600/80 dark:text-emerald-300/80 mt-1">
                                  {c.item_name}
                                </div>
                              </div>
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-800/50 px-2 py-1 rounded">
                                {c.confidence_score}%
                              </span>
                            </div>
                            {c.match_reasons && (
                              <div className="mt-3 text-xs text-emerald-600/70 dark:text-emerald-300/70 bg-emerald-100/50 dark:bg-emerald-800/20 p-2 rounded">
                                <strong>Why:</strong> {c.match_reasons}
                              </div>
                            )}
                            <button 
                              onClick={() => handleUpdateLine(
                                selectedLineForReview.id, 
                                c.inventory_item_id, 
                                'verify', 
                                c.confidence_score, 
                                c.match_method, 
                                c.match_reasons, 
                                c.normalized_description
                              )}
                              className="mt-3 w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded transition-colors"
                            >
                              Confirm Match
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {!isIdentifying && candidates.length === 0 && selectedLineForReview.inventoryItemId && (
                      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Mapped: {selectedLineForReview.masterItemCode}</div>
                        <div className="text-xs text-slate-500 mt-2">Method: {selectedLineForReview.matchMethod}</div>
                        <div className="text-xs text-slate-500">Status: {selectedLineForReview.matchStatus}</div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {masterBoqStatus !== 'APPROVED' && (
                    <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                      
                      {!showChangeItem ? (
                        <>
                          <button 
                            onClick={() => setShowChangeItem(true)}
                            className="w-full py-2 px-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors shadow-sm"
                          >
                            Change Master Item (Manual)
                          </button>
                          
                          <div className="flex gap-3">
                            <button 
                              onClick={() => handleUpdateLine(selectedLineForReview.id, null, 'reject')}
                              className="flex-1 py-2 px-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors shadow-sm"
                            >
                              Reject
                            </button>
                            <button className="flex-1 py-2 px-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors shadow-sm">
                              Req. New Item
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Select Canonical Master Item</label>
                          <select 
                            value={manualSelectedItemId}
                            onChange={(e) => setManualSelectedItemId(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
                          >
                            <option value="">-- Choose Item --</option>
                            {items.map(i => (
                              <option key={i.id} value={i.id}>{i.item_code} - {i.item_name}</option>
                            ))}
                          </select>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleUpdateLine(selectedLineForReview.id, manualSelectedItemId, 'verify', 100, 'Manual')}
                              disabled={!manualSelectedItemId || isProcessing}
                              className="flex-1 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                              Verify Selection
                            </button>
                            <button 
                              onClick={() => setShowChangeItem(false)}
                              className="py-1.5 px-3 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded hover:bg-slate-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
