import React, { useState, useEffect, useRef } from 'react';
import {
  Building2, Plus, Search, Filter, Edit3, Eye, ShieldCheck, CheckCircle2,
  XCircle, AlertTriangle, ArrowLeft, Save, Trash2, Upload, FileText,
  CreditCard, MapPin, Contact, Landmark, FileCheck2, Settings, History,
  Sparkles, Lock, ExternalLink, RefreshCw, Check, X, ChevronRight, HelpCircle,
  Clock, AlertCircle, Copy, Palette, EyeOff, Archive, Award, Globe, Phone, Mail,
  Calendar, Layers, Tag, Hash, ChevronDown
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { supabase } from '../../lib/supabase';
import { processFileForMetadata, formatBytes } from '../../lib/storageService';

const REGISTRATION_TYPES = [
  'PAN', 'GSTIN', 'CIN', 'LLPIN', 'TAN', 'IEC', 'Udyam', 'PF', 'ESIC', 'Professional Tax', 'Other'
];

const ADDRESS_TYPES = [
  'Registered Office', 'Corporate Office', 'Branch', 'Factory', 'Warehouse', 'Billing', 'Shipping', 'Other'
];

const CONTACT_TYPES = [
  'Key Managerial', 'Director', 'Tax / Finance', 'Operations', 'HR', 'Legal', 'Other'
];

const DOCUMENT_TYPES = [
  'PAN', 'GST Certificate', 'Incorporation Certificate', 'CIN / LLP documents',
  'TAN', 'Udyam', 'IEC', 'PF', 'ESIC', 'Professional Tax', 'Address Proof', 'Bank Proof', 'Other'
];

const BANK_ACCOUNT_TYPES = ['Current', 'Savings', 'CC', 'OD', 'ESCROW', 'Other'];

const GST_REGISTRATION_TYPES = [
  'Regular', 'Composition', 'SEZ Developer / Unit', 'Input Service Distributor (ISD)', 'Overseas / Non-Resident', 'Unregistered'
];

const STATE_CODES = [
  { code: '01', name: 'Jammu & Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '19', name: 'West Bengal' },
  { code: '24', name: 'Gujarat' },
  { code: '27', name: 'Maharashtra' },
  { code: '29', name: 'Karnataka' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
];

function isRealUuid(val) {
  return typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
}

function maskAccountNumber(accNum) {
  if (!accNum) return '••••••••';
  const clean = String(accNum).replace(/\s/g, '');
  if (clean.length <= 4) return `••••${clean}`;
  return `••••••••${clean.slice(-4)}`;
}

export default function CompanySettingsWorkspace() {
  const crm = useCrm();
  const {
    isDarkMode, tenantRole, userRole, currentUser,
    operatingCompanies = [], fetchOperatingCompanies
  } = crm || {};

  // Check Owner Access Security (Strict Owner restriction)
  const isOwner = (tenantRole || '').toUpperCase() === 'OWNER';

  // Navigation & View State
  const [currentView, setCurrentView] = useState('list'); // 'list' | 'create' | 'edit'
  const [activeTab, setActiveTab] = useState('identity');
  
  // List Landing Page State
  const [companyList, setCompanyList] = useState([]);
  const [isListLoading, setIsListLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive' | 'archived'

  // Edit / Form State
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modals State
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingTabChange, setPendingTabChange] = useState(null);
  const [statusModalCompany, setStatusModalCompany] = useState(null);

  // Form Initial State Generator
  const getInitialFormState = () => ({
    // Company Identity
    name: '',
    legal_name: '',
    display_name: '',
    trading_name: '',
    company_code: '',
    company_type: 'Private Limited',
    business_type: 'Contracting',
    industry: 'Fire Safety & Engineering',
    nature_of_business: '',
    description: '',
    status: 'active',

    // Contact
    official_email: '',
    official_phone: '',
    alternate_phone: '',
    website: '',

    // Business Info
    incorporation_date: '',
    commencement_date: '',
    employee_count: '',
    financial_year_start: '04-01',
    currency: 'INR',
    time_zone: 'Asia/Kolkata',
    is_primary: false,

    // Child Collections
    registrations: [],
    addresses: [],
    contacts: [],
    bank_profiles: [],

    // Tax & Statutory
    gst_registration_type: 'Regular',
    gst_filing_frequency: 'Monthly',
    tds_applicable: true,
    pf_applicable: true,
    esic_applicable: true,
    pt_applicable: true,
    default_tax_region: '36', // Telangana

    // Branding
    logo_file: null,
    favicon_file: null,
    primary_color: '#0284c7',
    secondary_color: '#4f46e5',
    accent_color: '#f59e0b',
    font_family: 'Inter',
    login_template: 'Modern Glass',
    welcome_message: 'Welcome to RAJIV Business OS',
    contact_display_text: 'Support: support@company.com | +91 40 2345 6789',

    // Documents
    documents: []
  });

  const [formData, setFormData] = useState(getInitialFormState);
  const [auditHistory, setAuditHistory] = useState([]);

  // Fetch Companies List on Mount & View Change
  useEffect(() => {
    fetchCompanyList();
  }, []);

  async function fetchCompanyList() {
    setIsListLoading(true);
    setErrorMessage('');
    try {
      // 1. Try querying tenant_companies
      const { data: tcData, error: tcErr } = await supabase
        .from('tenant_companies')
        .select('*')
        .order('created_at', { ascending: true });

      if (tcErr) {
        console.warn('[CompanySettings] Error reading tenant_companies:', tcErr);
      }

      if (tcData && tcData.length > 0) {
        // Fetch is_primary from company_profiles (since tenant_companies has no is_primary column)
        const cpMap = {};
        try {
          const { data: cpData } = await supabase
            .from('company_profiles')
            .select('tenant_company_id, is_primary');
          if (cpData) {
            cpData.forEach(cp => {
              if (cp.tenant_company_id) {
                cpMap[cp.tenant_company_id] = cp.is_primary;
              }
            });
          }
        } catch (e) {
          console.warn('[CompanySettings] company_profiles query notice:', e);
        }

        const enriched = tcData.map(tc => ({
          ...tc,
          is_primary: Boolean(cpMap[tc.id])
        }));
        setCompanyList(enriched);
      } else {
        // Fallback to operatingCompanies from Context or companies table
        const { data: compData } = await supabase
          .from('companies')
          .select('*')
          .order('created_at', { ascending: true });

        if (compData && compData.length > 0) {
          const mapped = compData.map(c => ({
            id: c.tenant_company_id || c.id,
            company_id: c.id,
            name: c.name,
            code: c.name?.substring(0, 4).toUpperCase() || 'COMP',
            status: 'active',
            is_primary: true,
            created_at: c.created_at
          }));
          setCompanyList(mapped);
        } else {
          setCompanyList(operatingCompanies || []);
        }
      }
    } catch (err) {
      console.error('[CompanySettings] Fetch list error:', err);
      setErrorMessage('Failed to load companies: ' + (err.message || err));
    } finally {
      setIsListLoading(false);
    }
  }

  // Load Detailed Company Settings (for Editing)
  async function loadCompanySettings(companyId) {
    setIsLoadingDetails(true);
    setErrorMessage('');
    setSelectedCompanyId(companyId);

    try {
      // 1. Call RPC get_owner_company_settings
      const { data: settingsData, error: settingsErr } = await supabase.rpc('get_owner_company_settings', {
        p_tenant_company_id: companyId
      });

      if (settingsErr) {
        console.warn('[CompanySettings] RPC get_owner_company_settings error:', settingsErr.message);
        setErrorMessage('Failed to load company settings: ' + settingsErr.message);
        setIsLoadingDetails(false);
        return;
      }

      if (settingsData) {
        const tc = settingsData.tenant_company || {};
        const cp = settingsData.profile || {};
        const cb = settingsData.branding || {};
        const cs = settingsData.settings || {};

        const finMonth = cp.financial_year_start_month || '04';

        setFormData({
          name: tc.name || cp.display_name || cp.legal_name || '',
          legal_name: cp.legal_name || '',
          display_name: cp.display_name || tc.name || '',
          trading_name: cp.trading_name || '',
          company_code: tc.code || '',
          company_type: cp.company_type || 'Private Limited',
          business_type: cp.business_type || 'Contracting',
          industry: cp.industry || 'Fire Safety & Engineering',
          nature_of_business: cp.nature_of_business || '',
          description: cp.description || '',
          status: tc.status || 'active',

          official_email: cp.official_email || '',
          official_phone: cp.official_phone || '',
          alternate_phone: cp.alternate_phone || '',
          website: cp.website || '',

          incorporation_date: cp.incorporation_date || '',
          commencement_date: cp.commencement_date || '',
          employee_count: cp.employee_count || '',
          financial_year_start_month: finMonth,
          financial_year_start: `${finMonth}-01`,
          currency_code: cp.currency_code || 'INR',
          currency: cp.currency_code || 'INR',
          timezone: cp.timezone || 'Asia/Kolkata',
          time_zone: cp.timezone || 'Asia/Kolkata',
          is_primary: Boolean(cp.is_primary),

          registrations: (settingsData.registrations || []).map(r => ({
            ...r,
            id: isRealUuid(r.id) ? r.id : undefined
          })),
          addresses: (settingsData.addresses || []).map(a => ({
            ...a,
            id: isRealUuid(a.id) ? a.id : undefined,
            address_line_1: a.address_line_1 || '',
            address_line_2: a.address_line_2 || '',
            postal_code: a.postal_code || ''
          })),
          contacts: (settingsData.contacts || []).map(c => ({
            ...c,
            id: isRealUuid(c.id) ? c.id : undefined
          })),
          bank_profiles: (settingsData.banks || []).map(b => ({
            ...b,
            id: isRealUuid(b.id) ? b.id : undefined,
            branch: b.branch_name || '',
            branch_name: b.branch_name || '',
            ifsc: b.ifsc_code || '',
            ifsc_code: b.ifsc_code || '',
            masked_account_number: maskAccountNumber(b.masked_account_number)
          })),

          date_format: cs.date_format || 'YYYY-MM-DD',
          number_format: cs.number_format || 'en-IN',
          default_address_id: cs.default_address_id || null,
          default_bank_profile_id: cs.default_bank_profile_id || null,
          gst_registration_type: cs.gst_registration_type || 'Regular',
          gst_filing_frequency: cs.gst_filing_frequency || 'Monthly',
          tds_applicable: cs.tds_applicable !== false,
          pf_applicable: cs.pf_applicable !== false,
          esic_applicable: cs.esic_applicable !== false,
          professional_tax_applicable: cs.professional_tax_applicable !== false,
          pt_applicable: cs.professional_tax_applicable !== false,
          default_tax_region: cs.default_tax_region || '36',

          logo_file: cb.logo_url ? { preview: cb.logo_url } : null,
          favicon_file: cb.favicon_url ? { preview: cb.favicon_url } : null,
          primary_color: cb.primary_color || '#0284c7',
          secondary_color: cb.secondary_color || '#4f46e5',
          accent_color: cb.accent_color || '#f59e0b',
          font_family: cb.font_family || 'Inter',
          login_template: cb.login_template || 'Modern Glass',
          welcome_message: cb.welcome_message || 'Welcome to RAJIV Business OS',
          contact_display_text: cb.contact_display_text || '',

          documents: (settingsData.documents || []).map(d => ({
            ...d,
            id: isRealUuid(d.id) ? d.id : undefined,
            verification_status: (d.verification_status || 'pending').toLowerCase()
          }))
        });
      }

      // 2. Separately fetch Audit History via get_owner_company_settings_audit
      try {
        const { data: auditData, error: auditErr } = await supabase.rpc('get_owner_company_settings_audit', {
          p_tenant_company_id: companyId
        });
        if (!auditErr && auditData) {
          setAuditHistory(auditData);
        }
      } catch (ae) {
        console.warn('[CompanySettings] get_owner_company_settings_audit notice:', ae);
      }

      setCurrentView('edit');
      setActiveTab('identity');
      setIsDirty(false);
    } catch (err) {
      console.error('[CompanySettings] Load details exception:', err);
      setErrorMessage('Failed to load company details: ' + (err.message || err));
    } finally {
      setIsLoadingDetails(false);
    }
  }

  // Archive child item via archive_owner_company_setting_item_atomic RPC
  async function archiveChildItem(entityType, item) {
    if (item && item.id && isRealUuid(item.id) && selectedCompanyId) {
      try {
        const { error } = await supabase.rpc('archive_owner_company_setting_item_atomic', {
          p_tenant_company_id: selectedCompanyId,
          p_entity: entityType,
          p_entity_id: item.id
        });
        if (error) console.warn(`[CompanySettings] Archive ${entityType} error:`, error.message);
      } catch (e) {
        console.warn(`[CompanySettings] Archive ${entityType} exception:`, e);
      }
    }
  }

  // Handle Input Changes with Dirty Flag
  function handleInputChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }

  // Open Create Flow
  function handleOpenCreate() {
    setSelectedCompanyId(null);
    setFormData(getInitialFormState());
    setAuditHistory([]);
    setCurrentView('create');
    setActiveTab('identity');
    setIsDirty(false);
    setErrorMessage('');
    setSuccessMessage('');
  }

  // Tab Switching with Unsaved Guard
  function handleTabClick(newTab) {
    if (newTab === activeTab) return;
    if (isDirty) {
      setPendingTabChange(newTab);
      setShowUnsavedModal(true);
    } else {
      setActiveTab(newTab);
    }
  }

  function confirmTabChange() {
    if (pendingTabChange) {
      setActiveTab(pendingTabChange);
      setPendingTabChange(null);
    }
    setShowUnsavedModal(false);
  }

  function handleBackToList() {
    if (isDirty) {
      setPendingTabChange('BACK_TO_LIST');
      setShowUnsavedModal(true);
    } else {
      setCurrentView('list');
      setSelectedCompanyId(null);
      setErrorMessage('');
      setSuccessMessage('');
    }
  }

  function confirmBackToList() {
    setCurrentView('list');
    setSelectedCompanyId(null);
    setIsDirty(false);
    setShowUnsavedModal(false);
    setPendingTabChange(null);
  }

  // Submit Save / Create Company Atomic Operation
  async function handleSubmit(e) {
    if (e) e.preventDefault();

    if (!isOwner) {
      setErrorMessage('Access denied: Owner privileges required to save company settings.');
      return;
    }

    if (!formData.name || !formData.name.trim()) {
      setErrorMessage('Company Name is required.');
      setActiveTab('identity');
      return;
    }

    if (!formData.company_code || !formData.company_code.trim()) {
      setErrorMessage('Company Code is required.');
      setActiveTab('identity');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const isEdit = currentView === 'edit';
      const finMonth = formData.financial_year_start ? formData.financial_year_start.substring(0, 2) : (formData.financial_year_start_month || '04');

      const profilePayload = {
        legal_name: formData.legal_name?.trim() || formData.name.trim(),
        display_name: formData.display_name?.trim() || formData.name.trim(),
        trading_name: formData.trading_name?.trim() || '',
        company_type: formData.company_type || 'Private Limited',
        business_type: formData.business_type || 'Contracting',
        industry: formData.industry || 'Fire Safety & Engineering',
        nature_of_business: formData.nature_of_business || '',
        description: formData.description || '',
        website: formData.website?.trim() || '',
        official_email: formData.official_email?.trim() || '',
        official_phone: formData.official_phone?.trim() || '',
        alternate_phone: formData.alternate_phone?.trim() || '',
        incorporation_date: formData.incorporation_date || null,
        commencement_date: formData.commencement_date || null,
        employee_count: formData.employee_count ? parseInt(formData.employee_count, 10) : null,
        financial_year_start_month: finMonth,
        currency_code: formData.currency_code || formData.currency || 'INR',
        timezone: formData.timezone || formData.time_zone || 'Asia/Kolkata',
        is_primary: Boolean(formData.is_primary)
      };

      let rpcName, rpcPayload;

      if (isEdit) {
        rpcName = 'update_owner_company_atomic';
        rpcPayload = {
          tenant_company_id: selectedCompanyId,
          name: formData.name.trim(),
          code: formData.company_code.trim().toUpperCase(),
          status: formData.status || 'active',
          profile: profilePayload
        };
      } else {
        rpcName = 'create_owner_company_atomic';
        rpcPayload = {
          tenant_id: crm?.tenantId || undefined,
          name: formData.name.trim(),
          code: formData.company_code.trim().toUpperCase(),
          profile: profilePayload
        };
      }

      const { data: rpcRes, error: rpcErr } = await supabase.rpc(rpcName, {
        p_payload: rpcPayload
      });

      if (rpcErr) {
        console.error(`[CompanySettings] RPC ${rpcName} error:`, rpcErr);
        setErrorMessage(`Company Settings could not be saved: ${rpcErr.message || rpcErr.details || 'Operation failed'}`);
        return;
      }

      // Determine created or updated company ID
      let targetCompanyId = selectedCompanyId;
      if (!isEdit && rpcRes) {
        if (typeof rpcRes === 'string') {
          targetCompanyId = rpcRes;
        } else if (rpcRes.tenant_company_id) {
          targetCompanyId = rpcRes.tenant_company_id;
        } else if (rpcRes.id) {
          targetCompanyId = rpcRes.id;
        }
      }

      if (!targetCompanyId) {
        setErrorMessage('Company Settings could not be saved: Target company ID missing');
        return;
      }

      // Build payload for save_owner_company_settings_details_atomic
      const detailsPayload = {
        tenant_company_id: targetCompanyId,

        registrations: (formData.registrations || []).map(r => ({
          ...(isRealUuid(r.id) ? { id: r.id } : {}),
          registration_type: r.registration_type,
          registration_number: r.registration_number,
          issuing_authority: r.issuing_authority || '',
          state_code: r.state_code || '',
          issue_date: r.issue_date || null,
          expiry_date: r.expiry_date || null,
          status: r.status || 'active',
          is_primary: Boolean(r.is_primary),
          notes: r.notes || ''
        })),

        addresses: (formData.addresses || []).map(a => ({
          ...(isRealUuid(a.id) ? { id: a.id } : {}),
          address_type: a.address_type || a.label || 'Office',
          label: a.label || 'Office',
          address_line_1: a.address_line_1 || a.address_line1 || '',
          address_line_2: a.address_line_2 || a.address_line2 || '',
          landmark: a.landmark || '',
          city: a.city || '',
          district: a.district || '',
          state: a.state || '',
          state_code: a.state_code || '',
          postal_code: a.postal_code || a.pincode || '',
          country: a.country || 'India',
          latitude: a.latitude ? parseFloat(a.latitude) : null,
          longitude: a.longitude ? parseFloat(a.longitude) : null,
          is_primary: Boolean(a.is_primary)
        })),

        contacts: (formData.contacts || []).map(c => ({
          ...(isRealUuid(c.id) ? { id: c.id } : {}),
          contact_type: c.contact_type || 'General',
          name: c.name || '',
          designation: c.designation || '',
          department: c.department || '',
          email: c.email || '',
          phone: c.phone || '',
          alternate_phone: c.alternate_phone || '',
          is_primary: Boolean(c.is_primary),
          notes: c.notes || ''
        })),

        bank_profiles: (formData.bank_profiles || formData.banks || []).map(b => ({
          ...(isRealUuid(b.id) ? { id: b.id } : {}),
          bank_name: b.bank_name || '',
          branch_name: b.branch_name || b.branch || '',
          account_name: b.account_name || '',
          masked_account_number: maskAccountNumber(b.masked_account_number || b.raw_account_number || b.account_number),
          ifsc_code: b.ifsc_code || b.ifsc || '',
          account_type: b.account_type || 'Current',
          upi_id: b.upi_id || '',
          is_primary: Boolean(b.is_primary),
          notes: b.notes || ''
        })),

        settings: {
          date_format: formData.date_format || 'YYYY-MM-DD',
          number_format: formData.number_format || 'en-IN',
          default_address_id: formData.default_address_id || null,
          default_bank_profile_id: formData.default_bank_profile_id || null,
          gst_registration_type: formData.gst_registration_type || 'Regular',
          gst_filing_frequency: formData.gst_filing_frequency || 'Monthly',
          tds_applicable: formData.tds_applicable !== false,
          pf_applicable: formData.pf_applicable !== false,
          esic_applicable: formData.esic_applicable !== false,
          professional_tax_applicable: formData.pt_applicable !== false && formData.professional_tax_applicable !== false,
          default_tax_region: formData.default_tax_region || '36',
          metadata: formData.settings_metadata || {}
        },

        branding: {
          logo_file_id: null,
          logo_url: null,
          favicon_file_id: null,
          favicon_url: null,
          primary_color: formData.primary_color || '#0284c7',
          secondary_color: formData.secondary_color || '#4f46e5',
          accent_color: formData.accent_color || '#f59e0b',
          font_family: formData.font_family || 'Inter',
          login_template: formData.login_template || 'Modern Glass',
          welcome_message: formData.welcome_message || 'Welcome to RAJIV Business OS',
          contact_display_text: formData.contact_display_text || ''
        },

        documents: (formData.documents || []).map(d => ({
          ...(isRealUuid(d.id) ? { id: d.id } : {}),
          document_type: d.document_type || 'Other',
          document_name: d.document_name || '',
          document_number: d.document_number || '',
          issue_date: d.issue_date || null,
          expiry_date: d.expiry_date || null,
          verification_status: (d.verification_status || 'pending').toLowerCase(),
          file_name: d.file_name || '',
          mime_type: d.mime_type || '',
          version: d.version || '1.0',
          is_archived: Boolean(d.is_archived),
          notes: d.notes || ''
        }))
      };

      const { error: detailsErr } = await supabase.rpc('save_owner_company_settings_details_atomic', {
        p_payload: detailsPayload
      });

      if (detailsErr) {
        console.error('[CompanySettings] RPC save_owner_company_settings_details_atomic error:', detailsErr);
        setErrorMessage(`Company Settings details could not be saved: ${detailsErr.message || detailsErr.details || 'Operation failed'}`);
        return;
      }

      setSuccessMessage(isEdit ? 'Company settings updated successfully!' : 'New company created successfully!');
      setIsDirty(false);

      await fetchCompanyList();
      if (fetchOperatingCompanies) await fetchOperatingCompanies();

      await loadCompanySettings(targetCompanyId);

      setTimeout(() => {
        setSuccessMessage('');
      }, 3500);

    } catch (err) {
      console.error('[CompanySettings] Submit error:', err);
      setErrorMessage('Company Settings could not be saved: ' + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  }

  // Handle Company Status Change (Active / Inactive / Archived)
  async function handleToggleStatus(company, targetStatus) {
    setStatusModalCompany({ company, targetStatus });
  }

  async function confirmStatusChange() {
    if (!statusModalCompany) return;
    const { company, targetStatus } = statusModalCompany;
    setStatusModalCompany(null);

    setIsListLoading(true);
    try {
      const { error } = await supabase
        .from('tenant_companies')
        .update({ status: targetStatus, updated_at: new Date().toISOString() })
        .eq('id', company.id);

      if (error) {
        // Fallback for demo context
        setCompanyList(prev => prev.map(c => c.id === company.id ? { ...c, status: targetStatus } : c));
      } else {
        await fetchCompanyList();
      }
      if (fetchOperatingCompanies) await fetchOperatingCompanies();
      setSuccessMessage(`Company status updated to ${targetStatus.toUpperCase()}.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('[CompanySettings] Status update error:', err);
      setErrorMessage('Status update failed: ' + (err.message || err));
    } finally {
      setIsListLoading(false);
    }
  }

  // Filtered Company List for Landing View
  const filteredCompanyList = companyList.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.code || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (c.status || 'active').toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Security Check Banner for Non-Owners
  if (!isOwner) {
    return (
      <div className="os-card p-8 text-center max-w-xl mx-auto my-12 border-rose-500/20 bg-rose-500/5">
        <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <Lock size={24} />
        </div>
        <h2 className="text-lg font-black text-rose-600 dark:text-rose-400">Owner Access Restricted</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          Company Settings workspace is strictly restricted to authenticated Business Owners and System Administrators.
          Please contact your organization Owner if you require company administration access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-12">

      {/* Top Banner Alert Feedback */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-between gap-3 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={17} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="p-1 hover:bg-rose-500/20 rounded-lg">
            <X size={14} />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between gap-3 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={17} className="shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="p-1 hover:bg-emerald-500/20 rounded-lg">
            <X size={14} />
          </button>
        </div>
      )}

      {/* VIEW 1: COMPANY LIST LANDING VIEW */}
      {currentView === 'list' && (
        <div className="space-y-4">
          
          {/* Header Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 os-card">
            <div className="flex flex-1 items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search size={15} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by company name or code..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border outline-none bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-sky-500 transition"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-rose-500">
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Status Filter Tabs */}
              <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                {['all', 'active', 'inactive', 'archived'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-extrabold capitalize transition cursor-pointer ${
                      statusFilter === st
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={fetchCompanyList}
                disabled={isListLoading}
                className="os-secondary py-2 px-3 cursor-pointer"
                title="Refresh list"
              >
                <RefreshCw size={14} className={isListLoading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={handleOpenCreate}
                className="os-primary py-2 px-4 flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus size={16} />
                <span>Add Company</span>
              </button>
            </div>
          </div>

          {/* Company Cards Grid */}
          {isListLoading ? (
            <div className="p-12 text-center os-card italic text-xs text-slate-400">
              Loading operating companies...
            </div>
          ) : filteredCompanyList.length === 0 ? (
            <div className="p-12 text-center os-card space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Building2 size={22} />
              </div>
              <h3 className="text-sm font-black">No operating companies found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery ? `No company matches "${searchQuery}"` : 'Add your primary operating company to configure identity, statutory tax settings, branding, and registration documents.'}
              </p>
              {!searchQuery && (
                <button onClick={handleOpenCreate} className="os-primary mx-auto cursor-pointer">
                  <Plus size={14} /> Add First Company
                </button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCompanyList.map((comp) => {
                const isAct = (comp.status || 'active').toLowerCase() === 'active';
                const isArch = (comp.status || '').toLowerCase() === 'archived';

                return (
                  <div
                    key={comp.id}
                    className="os-card p-5 hover:border-sky-300 dark:hover:border-sky-800 transition flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Row: Icon + Badges */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-600 text-white font-black text-base flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
                          {comp.name?.charAt(0).toUpperCase() || 'C'}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 justify-end">
                          {comp.is_primary && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black flex items-center gap-1">
                              <Award size={11} /> Primary
                            </span>
                          )}

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border capitalize ${
                            isAct
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              : isArch
                              ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                              : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                          }`}>
                            {comp.status || 'Active'}
                          </span>
                        </div>
                      </div>

                      {/* Title & Code */}
                      <h3 className="font-black text-base tracking-tight text-slate-900 dark:text-white group-hover:text-sky-500 transition line-clamp-1">
                        {comp.name}
                      </h3>
                      
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-bold text-[10px] text-slate-600 dark:text-slate-300">
                          CODE: {comp.code || 'COMP'}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => loadCompanySettings(comp.id)}
                          className="os-secondary py-1.5 px-3 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 size={13} /> Edit
                        </button>
                      </div>

                      <button
                        onClick={() => loadCompanySettings(comp.id)}
                        className="os-primary py-1.5 px-3 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Settings size={13} /> Open Company Settings
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: COMPANY FORM WORKSPACE (CREATE / EDIT) */}
      {(currentView === 'create' || currentView === 'edit') && (
        <div className="space-y-4">
          
          {/* Top Form Action Bar */}
          <div className="os-card p-4 flex items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-xl bg-white/90 dark:bg-slate-950/90 shadow-md">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToList}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition cursor-pointer"
                title="Back to Company List"
              >
                <ArrowLeft size={16} />
              </button>

              <div>
                <h2 className="text-base font-black flex items-center gap-2">
                  <span>{currentView === 'create' ? 'Add New Company' : `Settings: ${formData.name}`}</span>
                  {formData.is_primary && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-black">
                      Primary
                    </span>
                  )}
                </h2>
                <p className="text-[10px] text-slate-400">
                  {currentView === 'create' ? 'Create new operating company and identity profile' : `Code: ${formData.company_code || 'COMP'}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBackToList}
                className="os-secondary py-2 px-3 text-xs cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="os-primary py-2 px-4 text-xs flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                <Save size={15} />
                <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </div>

          {/* Form Tabs Navigation Bar */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar os-card p-2">
            {[
              ['identity', 'Identity', Building2],
              ['contact', 'Contact', Mail],
              ['business', 'Business Info', Globe],
              ['registrations', 'Registrations', FileText],
              ['addresses', 'Addresses', MapPin],
              ['contacts', 'Contact Persons', Contact],
              ['bank', 'Bank Profiles', Landmark],
              ['tax', 'Tax & Statutory', ShieldCheck],
              ['branding', 'Branding', Palette],
              ['documents', 'Documents', FileCheck2],
              ['audit', 'Audit History', History]
            ].map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => handleTabClick(id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === id
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <Icon size={14} />
                <span>{label}</span>
                {id === 'registrations' && formData.registrations?.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-white/20">{formData.registrations.length}</span>
                )}
                {id === 'addresses' && formData.addresses?.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-white/20">{formData.addresses.length}</span>
                )}
                {id === 'documents' && formData.documents?.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-white/20">{formData.documents.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Form Content Area */}
          <div className="os-card p-6">
            
            {/* TAB 1: IDENTITY */}
            {activeTab === 'identity' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 size={16} className="text-sky-500" />
                    Company Identity & Registration Details
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Primary legal name, codes, and business classification</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="os-label">Company Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajiv Fire Protection Systems Pvt Ltd"
                      value={formData.name}
                      onChange={e => handleInputChange('name', e.target.value)}
                      className="os-input"
                    />
                  </div>

                  <div>
                    <label className="os-label">Legal Name</label>
                    <input
                      type="text"
                      placeholder="Official registered legal entity name"
                      value={formData.legal_name}
                      onChange={e => handleInputChange('legal_name', e.target.value)}
                      className="os-input"
                    />
                  </div>

                  <div>
                    <label className="os-label">Display Name</label>
                    <input
                      type="text"
                      placeholder="Brand / Display name used on invoices"
                      value={formData.display_name}
                      onChange={e => handleInputChange('display_name', e.target.value)}
                      className="os-input"
                    />
                  </div>

                  <div>
                    <label className="os-label">Trading Name</label>
                    <input
                      type="text"
                      placeholder="DBA / Trade name if different"
                      value={formData.trading_name}
                      onChange={e => handleInputChange('trading_name', e.target.value)}
                      className="os-input"
                    />
                  </div>

                  <div>
                    <label className="os-label">Company Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. RAJIV-01"
                      value={formData.company_code}
                      onChange={e => handleInputChange('company_code', e.target.value)}
                      className="os-input uppercase font-mono"
                    />
                  </div>

                  <div>
                    <label className="os-label">Company Type</label>
                    <select
                      value={formData.company_type}
                      onChange={e => handleInputChange('company_type', e.target.value)}
                      className="os-input cursor-pointer"
                    >
                      <option value="Private Limited">Private Limited (Pvt Ltd)</option>
                      <option value="Public Limited">Public Limited (Ltd)</option>
                      <option value="Limited Liability Partnership">Limited Liability Partnership (LLP)</option>
                      <option value="Partnership">Partnership Firm</option>
                      <option value="Proprietorship">Sole Proprietorship</option>
                      <option value="One Person Company">One Person Company (OPC)</option>
                      <option value="Foreign Branch">Foreign Company / Branch</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="os-label">Business Type</label>
                    <select
                      value={formData.business_type}
                      onChange={e => handleInputChange('business_type', e.target.value)}
                      className="os-input cursor-pointer"
                    >
                      <option value="Contracting">Turnkey Engineering & Contracting (EPC)</option>
                      <option value="Manufacturing">Manufacturing & Assembly</option>
                      <option value="Trading">Trading & Material Supply</option>
                      <option value="Services">Maintenance & AMC Services</option>
                      <option value="Consulting">Design & Engineering Consulting</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="os-label">Industry Sector</label>
                    <input
                      type="text"
                      placeholder="e.g. Fire Safety & Mechanical Engineering"
                      value={formData.industry}
                      onChange={e => handleInputChange('industry', e.target.value)}
                      className="os-input"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="os-label">Nature of Business</label>
                    <input
                      type="text"
                      placeholder="e.g. Design, Supply, Installation, Testing & Commissioning of Fire Hydrant, Sprinkler & Alarm Systems"
                      value={formData.nature_of_business}
                      onChange={e => handleInputChange('nature_of_business', e.target.value)}
                      className="os-input"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="os-label">Company Description</label>
                    <textarea
                      rows={3}
                      placeholder="Executive summary or company profile description..."
                      value={formData.description}
                      onChange={e => handleInputChange('description', e.target.value)}
                      className="os-input resize-y"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CONTACT */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <Mail size={16} className="text-sky-500" />
                    Official Contact Channels
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Primary communication details for quotes, purchase orders, and tax invoices</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="os-label">Official Email Address</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="email"
                        placeholder="info@company.com"
                        value={formData.official_email}
                        onChange={e => handleInputChange('official_email', e.target.value)}
                        className="os-input pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="os-label">Official Phone Number</label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="tel"
                        placeholder="+91 40 2345 6789"
                        value={formData.official_phone}
                        onChange={e => handleInputChange('official_phone', e.target.value)}
                        className="os-input pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="os-label">Alternate Phone / Toll-Free</label>
                    <input
                      type="tel"
                      placeholder="+91 1800 123 4567"
                      value={formData.alternate_phone}
                      onChange={e => handleInputChange('alternate_phone', e.target.value)}
                      className="os-input"
                    />
                  </div>

                  <div>
                    <label className="os-label">Company Website URL</label>
                    <div className="relative">
                      <Globe size={15} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="url"
                        placeholder="https://www.company.com"
                        value={formData.website}
                        onChange={e => handleInputChange('website', e.target.value)}
                        className="os-input pl-9"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: BUSINESS INFO */}
            {activeTab === 'business' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <Globe size={16} className="text-sky-500" />
                    Business Operations & Financial Year Configuration
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Incorporation dates, currency, and primary company status</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="os-label">Date of Incorporation</label>
                    <input
                      type="date"
                      value={formData.incorporation_date}
                      onChange={e => handleInputChange('incorporation_date', e.target.value)}
                      className="os-input cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="os-label">Date of Commencement</label>
                    <input
                      type="date"
                      value={formData.commencement_date}
                      onChange={e => handleInputChange('commencement_date', e.target.value)}
                      className="os-input cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="os-label">Total Employee Count</label>
                    <input
                      type="number"
                      placeholder="e.g. 150"
                      value={formData.employee_count}
                      onChange={e => handleInputChange('employee_count', e.target.value)}
                      className="os-input"
                    />
                  </div>

                  <div>
                    <label className="os-label">Financial Year Start</label>
                    <select
                      value={formData.financial_year_start}
                      onChange={e => handleInputChange('financial_year_start', e.target.value)}
                      className="os-input cursor-pointer"
                    >
                      <option value="04-01">April 1st (India - Apr to Mar)</option>
                      <option value="01-01">January 1st (Calendar Year)</option>
                      <option value="07-01">July 1st</option>
                      <option value="10-01">October 1st</option>
                    </select>
                  </div>

                  <div>
                    <label className="os-label">Base Currency</label>
                    <select
                      value={formData.currency}
                      onChange={e => handleInputChange('currency', e.target.value)}
                      className="os-input cursor-pointer"
                    >
                      <option value="INR">INR (₹ - Indian Rupee)</option>
                      <option value="USD">USD ($ - US Dollar)</option>
                      <option value="EUR">EUR (€ - Euro)</option>
                      <option value="AED">AED (AED - UAE Dirham)</option>
                    </select>
                  </div>

                  <div>
                    <label className="os-label">Time Zone</label>
                    <select
                      value={formData.time_zone}
                      onChange={e => handleInputChange('time_zone', e.target.value)}
                      className="os-input cursor-pointer"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                      <option value="UTC">UTC (Universal Coordinated Time)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST +4:00)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-sky-300 transition">
                      <input
                        type="checkbox"
                        checked={formData.is_primary}
                        onChange={e => handleInputChange('is_primary', e.target.checked)}
                        className="h-4 w-4 text-sky-500 rounded border-slate-300 focus:ring-sky-500"
                      />
                      <div>
                        <span className="font-bold text-xs block text-slate-900 dark:text-white">Mark as Primary Operating Company</span>
                        <span className="text-[10px] text-slate-400 block">Primary company will serve as default header context for sales quotes and tax invoices</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: REGISTRATIONS */}
            {activeTab === 'registrations' && (
              <RegistrationsTab
                registrations={formData.registrations}
                onChange={regs => handleInputChange('registrations', regs)}
                onArchive={item => archiveChildItem('registration', item)}
              />
            )}

            {/* TAB 5: ADDRESSES */}
            {activeTab === 'addresses' && (
              <AddressesTab
                addresses={formData.addresses}
                onChange={addrs => handleInputChange('addresses', addrs)}
                onArchive={item => archiveChildItem('address', item)}
              />
            )}

            {/* TAB 6: CONTACT PERSONS */}
            {activeTab === 'contacts' && (
              <ContactsTab
                contacts={formData.contacts}
                onChange={conts => handleInputChange('contacts', conts)}
                onArchive={item => archiveChildItem('contact', item)}
              />
            )}

            {/* TAB 7: BANK PROFILES */}
            {activeTab === 'bank' && (
              <BankProfilesTab
                bankProfiles={formData.bank_profiles}
                onChange={banks => handleInputChange('bank_profiles', banks)}
                onArchive={item => archiveChildItem('bank', item)}
              />
            )}

            {/* TAB 8: TAX / STATUTORY */}
            {activeTab === 'tax' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck size={16} className="text-sky-500" />
                    GST, TDS & Statutory Tax Settings
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Filing frequency, tax applicability, and default state tax region</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="os-label">GST Registration Type</label>
                    <select
                      value={formData.gst_registration_type}
                      onChange={e => handleInputChange('gst_registration_type', e.target.value)}
                      className="os-input cursor-pointer"
                    >
                      {GST_REGISTRATION_TYPES.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="os-label">GST Filing Frequency</label>
                    <select
                      value={formData.gst_filing_frequency}
                      onChange={e => handleInputChange('gst_filing_frequency', e.target.value)}
                      className="os-input cursor-pointer"
                    >
                      <option value="Monthly">Monthly Filing (GSTR-1 & GSTR-3B)</option>
                      <option value="Quarterly">Quarterly Filing (QRMP Scheme)</option>
                    </select>
                  </div>

                  <div>
                    <label className="os-label">Default Tax State Code</label>
                    <select
                      value={formData.default_tax_region}
                      onChange={e => handleInputChange('default_tax_region', e.target.value)}
                      className="os-input cursor-pointer font-bold"
                    >
                      {STATE_CODES.map(s => (
                        <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                    {[
                      ['tds_applicable', 'TDS Applicable', 'Tax Deducted at Source'],
                      ['pf_applicable', 'PF Applicable', 'Employees Provident Fund'],
                      ['esic_applicable', 'ESIC Applicable', 'Employees State Insurance'],
                      ['pt_applicable', 'Professional Tax', 'State Professional Tax']
                    ].map(([field, label, sub]) => (
                      <label key={field} className="flex items-start gap-2.5 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-sky-300 transition cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(formData[field])}
                          onChange={e => handleInputChange(field, e.target.checked)}
                          className="mt-0.5 h-4 w-4 text-sky-500 rounded border-slate-300 focus:ring-sky-500"
                        />
                        <div>
                          <span className="font-bold text-xs block text-slate-900 dark:text-white">{label}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{sub}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 9: BRANDING */}
            {activeTab === 'branding' && (
              <BrandingTab
                formData={formData}
                handleInputChange={handleInputChange}
              />
            )}

            {/* TAB 10: DOCUMENTS */}
            {activeTab === 'documents' && (
              <DocumentsTab
                documents={formData.documents}
                onChange={docs => handleInputChange('documents', docs)}
                onArchive={item => archiveChildItem('document', item)}
              />
            )}

            {/* TAB 11: AUDIT HISTORY */}
            {activeTab === 'audit' && (
              <AuditHistoryTab auditHistory={auditHistory} />
            )}

          </div>

        </div>
      )}

      {/* UNSAVED CHANGES MODAL */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="os-card p-6 max-w-md w-full space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertTriangle size={24} />
              <h3 className="text-base font-black">Unsaved Changes</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              You have unsaved changes in your company settings. Are you sure you want to discard your changes and continue?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowUnsavedModal(false)}
                className="os-secondary py-2 px-4 text-xs cursor-pointer"
              >
                Keep Editing
              </button>
              <button
                onClick={pendingTabChange === 'BACK_TO_LIST' ? confirmBackToList : confirmTabChange}
                className="os-primary py-2 px-4 text-xs bg-rose-600 hover:bg-rose-500 cursor-pointer"
              >
                Discard & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS CONFIRMATION MODAL */}
      {statusModalCompany && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="os-card p-6 max-w-md w-full space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-sky-500">
              <AlertCircle size={24} />
              <h3 className="text-base font-black">Confirm Status Change</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to change status of <b>{statusModalCompany.company.name}</b> to{' '}
              <b className="uppercase text-sky-500">{statusModalCompany.targetStatus}</b>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setStatusModalCompany(null)}
                className="os-secondary py-2 px-4 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className="os-primary py-2 px-4 text-xs cursor-pointer"
              >
                Confirm Status
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* =========================================================================
   SUB-COMPONENT TAB IMPLEMENTATIONS (REGISTRATIONS, ADDRESSES, CONTACTS, etc.)
   ========================================================================= */

function RegistrationsTab({ registrations = [], onChange, onArchive }) {
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    registration_type: 'PAN',
    custom_type: '',
    registration_number: '',
    issuing_authority: '',
    state_code: '',
    issue_date: '',
    expiry_date: '',
    status: 'Active',
    is_primary: false,
    notes: ''
  });

  function handleSaveItem() {
    if (!form.registration_number) return;
    const item = {
      id: editingItem?.id || 'reg_' + Date.now(),
      registration_type: form.registration_type,
      custom_type: form.registration_type === 'Other' ? form.custom_type : '',
      registration_number: form.registration_number,
      issuing_authority: form.issuing_authority,
      state_code: form.state_code,
      issue_date: form.issue_date,
      expiry_date: form.expiry_date,
      status: form.status,
      is_primary: form.is_primary,
      notes: form.notes
    };

    if (editingItem) {
      onChange(registrations.map(r => r.id === editingItem.id ? item : r));
    } else {
      onChange([...registrations, item]);
    }
    setEditingItem(null);
    resetForm();
  }

  function resetForm() {
    setForm({
      registration_type: 'PAN',
      custom_type: '',
      registration_number: '',
      issuing_authority: '',
      state_code: '',
      issue_date: '',
      expiry_date: '',
      status: 'Active',
      is_primary: false,
      notes: ''
    });
  }

  function handleEdit(item) {
    setEditingItem(item);
    setForm(item);
  }

  function handleDelete(item) {
    if (onArchive && item) onArchive(item);
    onChange(registrations.filter(r => r.id !== item.id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <FileText size={16} className="text-sky-500" />
            Statutory & Tax Registrations
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">PAN, GSTIN, CIN, LLPIN, TAN, IEC, Udyam, PF, ESIC and other licenses</p>
        </div>
      </div>

      {/* Add / Edit Inline Form */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
        <h4 className="text-xs font-bold text-sky-500 uppercase tracking-wider">
          {editingItem ? 'Edit Registration Record' : 'Add Registration Record'}
        </h4>

        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="os-label">Registration Type *</label>
            <select
              value={form.registration_type}
              onChange={e => setForm(prev => ({ ...prev, registration_type: e.target.value }))}
              className="os-input cursor-pointer"
            >
              {REGISTRATION_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {form.registration_type === 'Other' && (
            <div>
              <label className="os-label">Custom Registration Name *</label>
              <input
                type="text"
                placeholder="e.g. Factory License"
                value={form.custom_type}
                onChange={e => setForm(prev => ({ ...prev, custom_type: e.target.value }))}
                className="os-input"
              />
            </div>
          )}

          <div>
            <label className="os-label">Registration Number *</label>
            <input
              type="text"
              placeholder="e.g. ABCDE1234F / 36ABCDE1234F1Z5"
              value={form.registration_number}
              onChange={e => setForm(prev => ({ ...prev, registration_number: e.target.value }))}
              className="os-input uppercase font-mono"
            />
          </div>

          <div>
            <label className="os-label">Issuing Authority</label>
            <input
              type="text"
              placeholder="e.g. Income Tax Dept / MCA"
              value={form.issuing_authority}
              onChange={e => setForm(prev => ({ ...prev, issuing_authority: e.target.value }))}
              className="os-input"
            />
          </div>

          <div>
            <label className="os-label">State Code</label>
            <select
              value={form.state_code}
              onChange={e => setForm(prev => ({ ...prev, state_code: e.target.value }))}
              className="os-input cursor-pointer font-bold"
            >
              <option value="">-- All India / N/A --</option>
              {STATE_CODES.map(s => (
                <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="os-label">Issue Date</label>
            <input
              type="date"
              value={form.issue_date}
              onChange={e => setForm(prev => ({ ...prev, issue_date: e.target.value }))}
              className="os-input cursor-pointer"
            />
          </div>

          <div>
            <label className="os-label">Expiry Date</label>
            <input
              type="date"
              value={form.expiry_date}
              onChange={e => setForm(prev => ({ ...prev, expiry_date: e.target.value }))}
              className="os-input cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={form.is_primary}
              onChange={e => setForm(prev => ({ ...prev, is_primary: e.target.checked }))}
              className="h-4 w-4 text-sky-500 rounded"
            />
            <span>Primary Registration for Type</span>
          </label>

          <div className="flex items-center gap-2">
            {editingItem && (
              <button
                type="button"
                onClick={() => { setEditingItem(null); resetForm(); }}
                className="os-secondary py-1.5 px-3 text-xs cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveItem}
              className="os-primary py-1.5 px-3 text-xs cursor-pointer"
            >
              <Plus size={14} /> {editingItem ? 'Update Registration' : 'Add Registration'}
            </button>
          </div>
        </div>
      </div>

      {/* Registrations List */}
      {registrations.length === 0 ? (
        <div className="p-6 text-center italic text-xs text-slate-400 os-card">
          No registration records added yet.
        </div>
      ) : (
        <div className="space-y-2">
          {registrations.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-sky-300 transition"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                    {item.registration_type === 'Other' ? (item.custom_type || 'Other') : item.registration_type}
                  </span>
                  <span className="font-mono text-xs font-bold text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                    {item.registration_number}
                  </span>
                  {item.is_primary && (
                    <span className="text-[9px] font-black text-amber-500 uppercase bg-amber-500/10 px-1.5 py-0.5 rounded">Primary</span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                  {item.issuing_authority && <span>Authority: {item.issuing_authority}</span>}
                  {item.state_code && <span>State: {item.state_code}</span>}
                  {item.expiry_date && <span>Expiry: {item.expiry_date}</span>}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleEdit(item)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-slate-800 transition"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddressesTab({ addresses = [], onChange, onArchive }) {
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    address_type: 'Registered Office',
    label: '',
    address_line_1: '',
    address_line_2: '',
    landmark: '',
    city: '',
    district: '',
    state: '',
    state_code: '36',
    postal_code: '',
    country: 'India',
    is_primary: false,
    is_active: true
  });

  function handleSaveItem() {
    if (!form.address_line_1 || !form.city || !form.state) return;
    const item = {
      id: editingItem?.id || 'addr_' + Date.now(),
      ...form
    };

    if (editingItem) {
      onChange(addresses.map(a => a.id === editingItem.id ? item : a));
    } else {
      onChange([...addresses, item]);
    }
    setEditingItem(null);
    resetForm();
  }

  function resetForm() {
    setForm({
      address_type: 'Registered Office',
      label: '',
      address_line_1: '',
      address_line_2: '',
      landmark: '',
      city: '',
      district: '',
      state: '',
      state_code: '36',
      postal_code: '',
      country: 'India',
      is_primary: false,
      is_active: true
    });
  }

  function handleDelete(item) {
    if (onArchive && item) onArchive(item);
    onChange(addresses.filter(a => a.id !== item.id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin size={16} className="text-sky-500" />
            Company Address Profiles
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Registered Office, Corporate Office, Factories, Warehouses, Billing and Shipping addresses</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
        <h4 className="text-xs font-bold text-sky-500 uppercase tracking-wider">
          {editingItem ? 'Edit Address' : 'Add Address Profile'}
        </h4>

        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="os-label">Address Type *</label>
            <select
              value={form.address_type}
              onChange={e => setForm(prev => ({ ...prev, address_type: e.target.value }))}
              className="os-input cursor-pointer"
            >
              {ADDRESS_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="os-label">Custom Label / Location Name</label>
            <input
              type="text"
              placeholder="e.g. Hyderabad H.O. Unit 4"
              value={form.label}
              onChange={e => setForm(prev => ({ ...prev, label: e.target.value }))}
              className="os-input"
            />
          </div>

          <div className="md:col-span-3">
            <label className="os-label">Address Line 1 *</label>
            <input
              type="text"
              required
              placeholder="Building, Plot No., Street, Area"
              value={form.address_line_1}
              onChange={e => setForm(prev => ({ ...prev, address_line_1: e.target.value }))}
              className="os-input"
            />
          </div>

          <div className="md:col-span-2">
            <label className="os-label">Address Line 2</label>
            <input
              type="text"
              placeholder="Industrial Estate, Phase / Extension"
              value={form.address_line_2}
              onChange={e => setForm(prev => ({ ...prev, address_line_2: e.target.value }))}
              className="os-input"
            />
          </div>

          <div>
            <label className="os-label">Landmark</label>
            <input
              type="text"
              placeholder="e.g. Near Metro Pillar 104"
              value={form.landmark}
              onChange={e => setForm(prev => ({ ...prev, landmark: e.target.value }))}
              className="os-input"
            />
          </div>

          <div>
            <label className="os-label">City *</label>
            <input
              type="text"
              required
              placeholder="e.g. Hyderabad"
              value={form.city}
              onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))}
              className="os-input"
            />
          </div>

          <div>
            <label className="os-label">State *</label>
            <input
              type="text"
              required
              placeholder="e.g. Telangana"
              value={form.state}
              onChange={e => setForm(prev => ({ ...prev, state: e.target.value }))}
              className="os-input"
            />
          </div>

          <div>
            <label className="os-label">Postal / PIN Code</label>
            <input
              type="text"
              placeholder="e.g. 500034"
              value={form.postal_code}
              onChange={e => setForm(prev => ({ ...prev, postal_code: e.target.value }))}
              className="os-input font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={form.is_primary}
              onChange={e => setForm(prev => ({ ...prev, is_primary: e.target.checked }))}
              className="h-4 w-4 text-sky-500 rounded"
            />
            <span>Set as Primary Address</span>
          </label>

          <div className="flex items-center gap-2">
            {editingItem && (
              <button
                type="button"
                onClick={() => { setEditingItem(null); resetForm(); }}
                className="os-secondary py-1.5 px-3 text-xs cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveItem}
              className="os-primary py-1.5 px-3 text-xs cursor-pointer"
            >
              <Plus size={14} /> {editingItem ? 'Update Address' : 'Add Address'}
            </button>
          </div>
        </div>
      </div>

      {/* Address List */}
      {addresses.length === 0 ? (
        <div className="p-6 text-center italic text-xs text-slate-400 os-card">
          No address profiles added yet.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {addresses.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 hover:border-sky-300 transition"
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin size={13} className="text-sky-500" />
                  {item.label || item.address_type}
                </span>
                {item.is_primary && (
                  <span className="text-[9px] font-black text-amber-500 uppercase bg-amber-500/10 px-1.5 py-0.5 rounded">Primary</span>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.address_line_1}{item.address_line_2 ? `, ${item.address_line_2}` : ''}, {item.city}, {item.state} - {item.postal_code}
              </p>

              <div className="pt-2 flex justify-end gap-1">
                <button
                  type="button"
                  onClick={() => { setEditingItem(item); setForm(item); }}
                  className="p-1 text-slate-400 hover:text-sky-500"
                >
                  <Edit3 size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  className="p-1 text-slate-400 hover:text-rose-500"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ContactsTab({ contacts = [], onChange, onArchive }) {
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    contact_type: 'Key Managerial',
    name: '',
    designation: '',
    department: '',
    email: '',
    phone: '',
    alternate_phone: '',
    is_primary: false,
    notes: ''
  });

  function handleSaveItem() {
    if (!form.name) return;
    const item = { id: editingItem?.id || 'cont_' + Date.now(), ...form };
    if (editingItem) onChange(contacts.map(c => c.id === editingItem.id ? item : c));
    else onChange([...contacts, item]);
    setEditingItem(null);
    setForm({ contact_type: 'Key Managerial', name: '', designation: '', department: '', email: '', phone: '', alternate_phone: '', is_primary: false, notes: '' });
  }

  function handleDelete(item) {
    if (onArchive && item) onArchive(item);
    onChange(contacts.filter(c => c.id !== item.id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <Contact size={16} className="text-sky-500" />
          Company Key Contact Persons
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">Directors, Key Executives, Finance and Authorized Signatories</p>
      </div>

      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="os-label">Contact Category</label>
            <select
              value={form.contact_type}
              onChange={e => setForm(prev => ({ ...prev, contact_type: e.target.value }))}
              className="os-input cursor-pointer"
            >
              {CONTACT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="os-label">Full Name *</label>
            <input type="text" placeholder="e.g. Rajiv Kumar" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} className="os-input" />
          </div>
          <div>
            <label className="os-label">Designation</label>
            <input type="text" placeholder="e.g. Managing Director" value={form.designation} onChange={e => setForm(prev => ({ ...prev, designation: e.target.value }))} className="os-input" />
          </div>
          <div>
            <label className="os-label">Email</label>
            <input type="email" placeholder="director@company.com" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} className="os-input" />
          </div>
          <div>
            <label className="os-label">Mobile Phone</label>
            <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))} className="os-input" />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button type="button" onClick={handleSaveItem} className="os-primary py-1.5 px-3 text-xs cursor-pointer">
            <Plus size={14} /> Add Contact Person
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {contacts.map(c => (
          <div key={c.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-start">
            <div>
              <span className="font-bold text-xs block">{c.name} ({c.designation || 'Contact'})</span>
              <span className="text-[10px] text-slate-400 block">{c.email} | {c.phone}</span>
            </div>
            <button type="button" onClick={() => handleDelete(c)} className="text-slate-400 hover:text-rose-500">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function BankProfilesTab({ bankProfiles = [], onChange, onArchive }) {
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    bank_name: '',
    branch: '',
    account_name: '',
    raw_account_number: '',
    ifsc: '',
    account_type: 'Current',
    upi_id: '',
    is_primary: false,
    notes: ''
  });

  function handleSaveItem() {
    if (!form.bank_name || !form.raw_account_number) return;
    const masked = maskAccountNumber(form.raw_account_number);
    const item = {
      id: editingItem?.id || 'bank_' + Date.now(),
      bank_name: form.bank_name,
      branch: form.branch,
      account_name: form.account_name,
      raw_account_number: form.raw_account_number,
      masked_account_number: masked,
      ifsc: form.ifsc,
      account_type: form.account_type,
      upi_id: form.upi_id,
      is_primary: form.is_primary,
      notes: form.notes
    };

    if (editingItem) onChange(bankProfiles.map(b => b.id === editingItem.id ? item : b));
    else onChange([...bankProfiles, item]);
    setEditingItem(null);
    setForm({ bank_name: '', branch: '', account_name: '', raw_account_number: '', ifsc: '', account_type: 'Current', upi_id: '', is_primary: false, notes: '' });
  }

  function handleDelete(item) {
    if (onArchive && item) onArchive(item);
    onChange(bankProfiles.filter(b => b.id !== item.id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <Landmark size={16} className="text-sky-500" />
          Company Bank Accounts & UPI Details
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">Masked banking profiles for client payments and accounts reconciliation</p>
      </div>

      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="os-label">Bank Name *</label>
            <input type="text" placeholder="e.g. HDFC Bank" value={form.bank_name} onChange={e => setForm(prev => ({ ...prev, bank_name: e.target.value }))} className="os-input" />
          </div>
          <div>
            <label className="os-label">Account Name *</label>
            <input type="text" placeholder="e.g. Rajiv Fire Protection Pvt Ltd" value={form.account_name} onChange={e => setForm(prev => ({ ...prev, account_name: e.target.value }))} className="os-input" />
          </div>
          <div>
            <label className="os-label">Account Number *</label>
            <input type="password" placeholder="Account Number (Masked automatically)" value={form.raw_account_number} onChange={e => setForm(prev => ({ ...prev, raw_account_number: e.target.value }))} className="os-input font-mono" />
          </div>
          <div>
            <label className="os-label">IFSC Code *</label>
            <input type="text" placeholder="HDFC0001234" value={form.ifsc} onChange={e => setForm(prev => ({ ...prev, ifsc: e.target.value }))} className="os-input uppercase font-mono" />
          </div>
          <div>
            <label className="os-label">Account Type</label>
            <select value={form.account_type} onChange={e => setForm(prev => ({ ...prev, account_type: e.target.value }))} className="os-input cursor-pointer">
              {BANK_ACCOUNT_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="os-label">UPI ID</label>
            <input type="text" placeholder="company@hdfcbank" value={form.upi_id} onChange={e => setForm(prev => ({ ...prev, upi_id: e.target.value }))} className="os-input" />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button type="button" onClick={handleSaveItem} className="os-primary py-1.5 px-3 text-xs cursor-pointer">
            <Plus size={14} /> Add Bank Profile
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {bankProfiles.map(b => (
          <div key={b.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-black text-xs">{b.bank_name} ({b.account_type})</span>
              <button type="button" onClick={() => handleDelete(b)} className="text-slate-400 hover:text-rose-500">
                <Trash2 size={13} />
              </button>
            </div>
            <p className="text-xs font-mono text-sky-500 font-bold">{b.masked_account_number}</p>
            <p className="text-[10px] text-slate-400">IFSC: {b.ifsc} | A/C Name: {b.account_name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BrandingTab({ formData, handleInputChange }) {
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const meta = await processFileForMetadata(file, 'branding_logo', formData.company_code);
    handleInputChange('logo_file', meta);
  }

  async function handleFaviconUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const meta = await processFileForMetadata(file, 'branding_favicon', formData.company_code);
    handleInputChange('favicon_file', meta);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <Palette size={16} className="text-sky-500" />
          Company Branding, Theme & Customization
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">Logo, favicon, color themes and invoice display text</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Logo Upload & Preview */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <label className="os-label">Company Logo (Header & Invoices)</label>
          <div
            onClick={() => logoInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-6 text-center hover:border-sky-500 cursor-pointer transition flex flex-col items-center justify-center min-h-[140px]"
          >
            {formData.logo_file?.preview ? (
              <img src={formData.logo_file.preview} alt="Logo Preview" className="h-16 object-contain mb-2" />
            ) : (
              <Upload size={24} className="text-slate-400 mb-2" />
            )}
            <span className="text-xs font-bold text-sky-500">Click to upload company logo</span>
            <span className="text-[10px] text-slate-400 mt-0.5">PNG, SVG, JPG up to 5MB</span>
            <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
          </div>

          {formData.logo_file && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-[10px] space-y-1 font-mono">
              <div>File: {formData.logo_file.file_name}</div>
              <div>Size: {formatBytes(formData.logo_file.file_size)}</div>
            </div>
          )}
        </div>

        {/* Favicon Upload & Preview */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <label className="os-label">Company Favicon (Browser Icon)</label>
          <div
            onClick={() => faviconInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-6 text-center hover:border-sky-500 cursor-pointer transition flex flex-col items-center justify-center min-h-[140px]"
          >
            {formData.favicon_file?.preview ? (
              <img src={formData.favicon_file.preview} alt="Favicon Preview" className="h-10 w-10 object-contain mb-2" />
            ) : (
              <Upload size={24} className="text-slate-400 mb-2" />
            )}
            <span className="text-xs font-bold text-sky-500">Click to upload favicon</span>
            <span className="text-[10px] text-slate-400 mt-0.5">ICO, PNG 32x32</span>
            <input type="file" ref={faviconInputRef} onChange={handleFaviconUpload} accept="image/*" className="hidden" />
          </div>

          {formData.favicon_file && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-[10px] space-y-1 font-mono">
              <div>File: {formData.favicon_file.file_name}</div>
            </div>
          )}
        </div>
      </div>

      {/* Colors & Palette */}
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="os-label">Primary Theme Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={formData.primary_color}
              onChange={e => handleInputChange('primary_color', e.target.value)}
              className="h-10 w-14 rounded-lg cursor-pointer bg-transparent border border-slate-200 dark:border-slate-800"
            />
            <input
              type="text"
              value={formData.primary_color}
              onChange={e => handleInputChange('primary_color', e.target.value)}
              className="os-input font-mono uppercase"
            />
          </div>
        </div>

        <div>
          <label className="os-label">Secondary Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={formData.secondary_color}
              onChange={e => handleInputChange('secondary_color', e.target.value)}
              className="h-10 w-14 rounded-lg cursor-pointer bg-transparent border border-slate-200 dark:border-slate-800"
            />
            <input
              type="text"
              value={formData.secondary_color}
              onChange={e => handleInputChange('secondary_color', e.target.value)}
              className="os-input font-mono uppercase"
            />
          </div>
        </div>

        <div>
          <label className="os-label">Accent Highlight Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={formData.accent_color}
              onChange={e => handleInputChange('accent_color', e.target.value)}
              className="h-10 w-14 rounded-lg cursor-pointer bg-transparent border border-slate-200 dark:border-slate-800"
            />
            <input
              type="text"
              value={formData.accent_color}
              onChange={e => handleInputChange('accent_color', e.target.value)}
              className="os-input font-mono uppercase"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentsTab({ documents = [], onChange, onArchive }) {
  const fileInputRef = useRef(null);
  const [selectedDocType, setSelectedDocType] = useState('GST Certificate');
  const [customType, setCustomType] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [isUploadingProgress, setIsUploadingProgress] = useState(false);

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingProgress(true);
    try {
      const meta = await processFileForMetadata(file, 'documents', 'company_doc');
      const newDoc = {
        id: 'doc_' + Date.now(),
        document_type: selectedDocType,
        custom_type: selectedDocType === 'Other' ? customType : '',
        document_name: file.name,
        document_number: docNumber || 'DOC-01',
        verification_status: 'verified',
        version: '1.0',
        is_current: true,
        is_archived: false,
        file_name: meta.file_name,
        mime_type: meta.mime_type,
        file_size: meta.file_size,
        preview: meta.preview,
        created_at: new Date().toISOString()
      };

      onChange([...documents, newDoc]);
      setDocNumber('');
    } catch (err) {
      console.error('Doc upload error:', err);
    } finally {
      setIsUploadingProgress(false);
    }
  }

  function handleDelete(item) {
    if (onArchive && item) onArchive(item);
    onChange(documents.filter(d => d.id !== item.id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <FileCheck2 size={16} className="text-sky-500" />
          Company Document Management & Verification
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">Upload, version and archive statutory documents and certificates</p>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 text-center space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-md mx-auto space-y-3">
          <Upload size={32} className="text-sky-500 mx-auto" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Drag & drop company document or browse file</h4>

          <div className="grid sm:grid-cols-2 gap-3 text-left">
            <div>
              <label className="os-label">Document Type</label>
              <select
                value={selectedDocType}
                onChange={e => setSelectedDocType(e.target.value)}
                className="os-input cursor-pointer"
              >
                {DOCUMENT_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="os-label">Document Number</label>
              <input
                type="text"
                placeholder="e.g. GSTIN12345"
                value={docNumber}
                onChange={e => setDocNumber(e.target.value)}
                className="os-input"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="os-primary py-2 px-4 mx-auto cursor-pointer"
          >
            Browse Document File
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
        </div>
      </div>

      {/* Documents Table List */}
      <div className="space-y-2">
        {documents.map((doc) => (
          <div key={doc.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-sky-500 shrink-0" />
              <div>
                <span className="font-bold text-xs block">{doc.document_type} - {doc.document_name}</span>
                <span className="text-[10px] text-slate-400 block">Number: {doc.document_number} | Size: {formatBytes(doc.file_size)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 capitalize">
                {doc.verification_status || 'verified'}
              </span>
              <button type="button" onClick={() => handleDelete(doc)} className="text-slate-400 hover:text-rose-500">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditHistoryTab({ auditHistory = [] }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <History size={16} className="text-sky-500" />
          Immutable Audit Log History
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">Read-only audit trail recording every change to company settings</p>
      </div>

      {auditHistory.length === 0 ? (
        <div className="p-8 text-center italic text-xs text-slate-400 os-card">
          No audit history entries recorded yet for this company.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400">
                <th className="py-2 px-3">Date / Time</th>
                <th className="py-2 px-3">User</th>
                <th className="py-2 px-3">Entity</th>
                <th className="py-2 px-3">Action</th>
                <th className="py-2 px-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {auditHistory.map(log => (
                <tr key={log.id} className="border-b last:border-0 border-slate-100 dark:border-slate-800/60">
                  <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-bold">{log.user || 'Owner'}</td>
                  <td className="py-2.5 px-3">{log.entity}</td>
                  <td className="py-2.5 px-3 font-bold text-sky-500">{log.action}</td>
                  <td className="py-2.5 px-3 text-[10px] text-slate-400 truncate max-w-xs">{log.new_value || log.details || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
