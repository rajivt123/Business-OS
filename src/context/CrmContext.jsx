import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import {
  uploadBusinessAttachment,
  replaceBusinessAttachment,
  listBusinessAttachments,
  createBusinessAttachmentDownloadUrl,
  archiveBusinessAttachment,
  isRealUuid
} from '../lib/storageService';

const CrmContext = createContext();

export function useCrm() {
  return useContext(CrmContext);
}

/**
 * Role Normalization Layer (Step 9)
 * Maps DB tenant roles (OWNER, ADMIN, MANAGER, TEAM, VIEWER) to legacy UI expectations (admin, team, viewer, guest).
 */
export function normalizeRole(tenantRole, profileRole) {
  if (!tenantRole && !profileRole) return 'guest';
  const tRole = (tenantRole || '').toUpperCase();
  if (tRole === 'OWNER' || tRole === 'ADMIN') return 'admin';
  if (tRole === 'MANAGER' || tRole === 'TEAM') return 'team';
  if (tRole === 'VIEWER') return 'viewer';

  // Fallback to profileRole if tenantRole is not set
  const pRole = (profileRole || '').toLowerCase();
  if (pRole === 'admin' || pRole === 'owner') return 'admin';
  if (pRole === 'team' || pRole === 'member' || pRole === 'manager') return 'team';
  if (pRole === 'viewer') return 'viewer';
  return 'guest';
}

export function getUserDisplayName(userOrId, profiles = [], tenantMembers = [], currentUser = null) {
  if (!userOrId) return 'Unknown User';

  if (typeof userOrId === 'object' && userOrId !== null) {
    const directEmail = userOrId.email || userOrId.user_email || userOrId.invited_email || userOrId.member_email || userOrId.email_address;
    if (directEmail && String(directEmail).trim()) return String(directEmail).trim();
  }

  const rawId = typeof userOrId === 'string' ? userOrId : (userOrId?.id || userOrId?.user_id);
  if (!rawId) return 'Unknown User';
  const normId = String(rawId).trim().toLowerCase();
  const obj = typeof userOrId === 'object' ? userOrId : null;

  // 1. Prioritize tenantMembers directly (authoritative tenant email source: match m.user_id === normId or m.id === normId)
  const matchedTenantMember = (tenantMembers || []).find(m =>
    (m.user_id && String(m.user_id).trim().toLowerCase() === normId) ||
    (m.id && String(m.id).trim().toLowerCase() === normId)
  ) || (tenantMembers || []).find(m =>
    m.email && obj?.email && String(m.email).trim().toLowerCase() === String(obj.email).trim().toLowerCase()
  );

  // 2. Profile lookup fallback
  const matchedProfile = (profiles || []).find(p =>
    (p.id && String(p.id).trim().toLowerCase() === normId) ||
    (p.user_id && String(p.user_id).trim().toLowerCase() === normId)
  );

  // 3. Current user lookup fallback
  const normCurrentId = String(currentUser?.id || currentUser?.user_id || '').trim().toLowerCase();
  const matchedCurrentUser = (currentUser && normCurrentId && normCurrentId === normId) ? currentUser : null;

  const tenantMember = matchedTenantMember;
  const profile = matchedProfile || obj;
  const currUser = matchedCurrentUser;

  // MVP DISPLAY RULE: EMAIL ONLY
  const email =
    tenantMember?.email || tenantMember?.user_email || tenantMember?.email_address || tenantMember?.invited_email || tenantMember?.member_email ||
    (Array.isArray(tenantMember?.profiles) ? tenantMember?.profiles[0]?.email : tenantMember?.profiles?.email) ||
    tenantMember?.user?.email ||
    profile?.email || profile?.user_email || profile?.email_address ||
    currUser?.email || currUser?.user_metadata?.email ||
    obj?.email || obj?.user_email || obj?.email_address;

  if (email && String(email).trim()) return String(email).trim();

  // If tenantMembers and profiles are not yet populated (loading state before fetch completes), return 'Loading...'
  if ((!tenantMembers || tenantMembers.length === 0) && (!profiles || profiles.length === 0)) {
    return 'Loading...';
  }

  // Truncated UUID fallback (only when data has loaded and email is genuinely missing)
  if (typeof rawId === 'string' && rawId.length >= 8) {
    return `User (${rawId.slice(0, 8)}...)`;
  }
  return String(rawId);
}

export function CrmProvider({ children, session: sessionProp, isDarkMode, setIsDarkMode, onSignOut }) {
  // --- Authenticated Context State ---
  const [session, setSession] = useState(sessionProp || null);
  const [currentUser, setCurrentUser] = useState(sessionProp?.user || null);
  const [authLoading, setAuthLoading] = useState(true);

  // Tenant State (public.tenant_memberships)
  const [tenantId, setTenantId] = useState(null);
  const [tenantMembership, setTenantMembership] = useState(null);
  const [tenantRole, setTenantRole] = useState(null);

  // Operating Company State (public.tenant_companies - OUR OWN OPERATING COMPANIES)
  const [operatingCompanies, setOperatingCompanies] = useState([]);
  const [activeOperatingCompanyId, setActiveOperatingCompanyIdState] = useState(null);

  // Derived Active Operating Company object
  const activeOperatingCompany = operatingCompanies.find(c => c.id === activeOperatingCompanyId) || null;

  const setActiveOperatingCompanyId = (newId) => {
    if (newId === null || operatingCompanies.some(c => c.id === newId)) {
      setActiveOperatingCompanyIdState(newId);
      if (newId) {
        localStorage.setItem('crm_active_operating_company_id', newId);
      } else {
        localStorage.setItem('crm_active_operating_company_id', 'ALL');
      }
    } else {
      console.warn(`[OperatingCompanyContext]: Refused selection of unauthorized operating company ID: ${newId}`);
    }
  };

  const [userRole, setUserRole] = useState('guest');

  // AI State
  const [aiSummary, setAiSummary] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am your RAJIV CRM Google AI Assistant. Ask me anything about your clients, active projects, pipeline status, open snags, tasks, or missing data.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isAiChatSending, setIsAiChatSending] = useState(false);

  // Hierarchy State (public.companies = CLIENT / CUSTOMER ORGANIZATIONS)
  const [companies, setCompanies] = useState([]);
  const [activeCompanyId, setActiveCompanyId] = useState(null);
  const [units, setUnits] = useState([]);
  const [activeUnitId, setActiveUnitId] = useState(null);
  const [works, setWorks] = useState([]);
  const [activeWorkId, setActiveWorkId] = useState(null);

  // View States
  const [centerView, setCenterView] = useState('pipeline');
  const [rightView, setRightView] = useState('tasks');

  // Custom Modals State
  const [promptModal, setPromptModal] = useState({ isOpen: false, title: '', placeholder: '', defaultValue: '', resolvePromise: null });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', resolvePromise: null });

  // Modals & Forms State
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [editingWorkId, setEditingWorkId] = useState(null);
  const [workForm, setWorkForm] = useState({ title: '', po_number: '', wo_number: '', boq_url: '', po_file_url: '', wo_file_url: '' });
  const [boqFile, setBoqFile] = useState(null);
  const [poFile, setPoFile] = useState(null);
  const [woFile, setWoFile] = useState(null);
  const [isWorkUploading, setIsWorkUploading] = useState(false);
  
  const [isStageManagerOpen, setIsStageManagerOpen] = useState(false);
  const [editedStages, setEditedStages] = useState([]);
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  // Issues State
  const [issues, setIssues] = useState([]);
  const [activeIssueId, setActiveIssueId] = useState(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueTitleInput, setIssueTitleInput] = useState('');

  // Logs State
  const [logs, setLogs] = useState([]);
  const [logInput, setLogInput] = useState('');
  const [editingLogId, setEditingLogId] = useState(null);
  const [editLogContent, setEditLogContent] = useState('');
  const [historyLog, setHistoryLog] = useState(null);
  const [isBinModalOpen, setIsBinModalOpen] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Reminders & Missing Data State
  const [reminders, setReminders] = useState([]);
  const [missingData, setMissingData] = useState([]);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderForm, setReminderForm] = useState({ 
    content: '', target_date: '', company_id: '', unit_id: '', work_id: '', log_id: '', stage_name: '' 
  });
  const [modalUnits, setModalUnits] = useState([]);
  const [modalWorks, setModalWorks] = useState([]);

  // --- Contacts, Enquiries, Follow-ups State (Phase P0) ---
  const [contacts, setContacts] = useState([]);
  const [isContactsLoading, setIsContactsLoading] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '', company_id: '', unit_id: '', email: '', phone: '', designation: '', department: '', is_primary: false, notes: ''
  });

  const [enquiries, setEnquiries] = useState([]);
  const [isEnquiriesLoading, setIsEnquiriesLoading] = useState(false);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState(null);
  const [enquiryForm, setEnquiryForm] = useState({
    title: '', company_id: '', contact_id: '', description: '', source: 'website', status: 'new', priority: 'medium', assigned_to: '', enquiry_date: new Date().toISOString().slice(0, 10), next_followup_date: ''
  });

  const [followUps, setFollowUps] = useState([]);
  const [isFollowUpsLoading, setIsFollowUpsLoading] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState(null);
  const [followUpForm, setFollowUpForm] = useState({
    activity_type: 'call', company_id: '', enquiry_id: '', due_date: new Date().toISOString().slice(0, 16), notes: '', assigned_to: '', status: 'pending'
  });

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // --- CRM Workspace & Customer Lifecycle State ---
  const [crmSummary, setCrmSummary] = useState(null);
  const [isCrmWorkspaceLoading, setIsCrmWorkspaceLoading] = useState(false);
  const [crmWorkspaceError, setCrmWorkspaceError] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerForm, setCustomerForm] = useState({
    id: null,
    name: '',
    legal_name: '',
    display_name: '',
    trading_name: '',
    company_type: 'private_limited',
    business_type: '',
    industry: '',
    gstin: '',
    pan: '',
    cin: '',
    website: '',
    official_email: '',
    official_phone: '',
    billing_address: { street: '', city: '', state: '', pincode: '', country: 'India' },
    shipping_address: { street: '', city: '', state: '', pincode: '', country: 'India' },
    notes: '',
    status: 'active'
  });

  // Project Assignments State (public.project_assignments)
  const [projectAssignments, setProjectAssignments] = useState([]);
  const [isAssignmentsLoading, setIsAssignmentsLoading] = useState(false);
  const [isProjectTeamModalOpen, setIsProjectTeamModalOpen] = useState(false);

  // Task Architecture Foundation (7F)
  const [tasks, setTasks] = useState([]);
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [isTaskEditorOpen, setIsTaskEditorOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', status: 'not_started', priority: 'medium', due_date: '', stage_id: ''
  });
  const [taskAssignees, setTaskAssignees] = useState([]);
  const [isTaskAssigneesLoading, setIsTaskAssigneesLoading] = useState(false);
  const [taskAssigneeForm, setTaskAssigneeForm] = useState({ user_id: '', role: 'assignee' });

  // Stage Definitions / Stage Assignments (Phase 1C)
  // stage_definitions is the normalized source of truth; works.stages remains legacy compatibility data.
  const [stageDefinitions, setStageDefinitions] = useState([]);
  const [isStageDefinitionsLoading, setIsStageDefinitionsLoading] = useState(false);
  const [stageAssignments, setStageAssignments] = useState([]);
  const [isStageAssignmentsLoading, setIsStageAssignmentsLoading] = useState(false);
  const [isStageAssignmentModalOpen, setIsStageAssignmentModalOpen] = useState(false);
  const [stageAssignmentTargetId, setStageAssignmentTargetId] = useState(null);

  // Tenant Members State (public.tenant_memberships where tenant_id = activeTenant and status = 'active')
  const [tenantMembers, setTenantMembers] = useState([]);
  const [isFetchingTenantMembers, setIsFetchingTenantMembers] = useState(false);

  // Notifications State (Phase 3)
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);

  // My Profile V1 State & RPC Layer
  const [myProfile, setMyProfile] = useState(null);
  const [myProfileMembership, setMyProfileMembership] = useState(null);
  const [isMyProfileLoading, setIsMyProfileLoading] = useState(false);
  const [myProfileError, setMyProfileError] = useState(null);

  const fetchMyProfile = async () => {
    setIsMyProfileLoading(true);
    setMyProfileError(null);
    try {
      const { data, error } = await supabase.rpc('get_my_profile_atomic');
      if (error) {
        setMyProfileError(error.message || 'Failed to fetch profile');
        setMyProfile(null);
        setMyProfileMembership(null);
        return { success: false, error: error.message };
      }
      if (data) {
        setMyProfile(data.profile || null);
        setMyProfileMembership(data.membership || null);
        setMyProfileError(null);
        return { success: true, data };
      } else {
        setMyProfile(null);
        setMyProfileMembership(null);
        setMyProfileError('No profile data returned');
        return { success: false, error: 'No profile data returned' };
      }
    } catch (err) {
      const msg = err?.message || 'Error executing get_my_profile_atomic';
      setMyProfileError(msg);
      setMyProfile(null);
      setMyProfileMembership(null);
      return { success: false, error: msg };
    } finally {
      setIsMyProfileLoading(false);
    }
  };

  const updateMyProfile = async (payload) => {
    setIsMyProfileLoading(true);
    setMyProfileError(null);
    try {
      const { data, error } = await supabase.rpc('update_my_profile_atomic', {
        p_payload: payload
      });
      if (error) {
        setMyProfileError(error.message || 'Failed to update profile');
        setIsMyProfileLoading(false);
        return { success: false, error: error.message };
      }
      // Refresh profile after successful update
      await fetchMyProfile();
      return { success: true, data };
    } catch (err) {
      const msg = err?.message || 'Error executing update_my_profile_atomic';
      setMyProfileError(msg);
      setIsMyProfileLoading(false);
      return { success: false, error: msg };
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchMyProfile();
    } else {
      setMyProfile(null);
      setMyProfileMembership(null);
      setMyProfileError(null);
    }
  }, [currentUser?.id]);

  // Navigation State
  const [pendingNav, setPendingNav] = useState(null);

  // --- Auth & Tenant Context Resolution (Steps 1, 2, 3, 4, 6, 8) ---
  const authInitializationRef = useRef({
    sessionKey: null,
    promise: Promise.resolve(),
    generation: 0
  });
  const authEventGenerationRef = useRef(0);

  const isCurrentAuthInitialization = (generation) =>
    authInitializationRef.current.generation === generation;

  const initializeAuthAndTenantContext = async (currentSession, generation) => {
    if (!isCurrentAuthInitialization(generation)) return;

    if (!currentSession?.user) {
      setSession(null);
      setCurrentUser(null);
      setTenantId(null);
      setTenantMembership(null);
      setTenantRole(null);
      setOperatingCompanies([]);
      setActiveOperatingCompanyIdState(null);
      localStorage.setItem('crm_active_operating_company_id', 'ALL');
      setUserRole('guest');
      setAiSummary('');
      setIsAiLoading(false);
      setIsAiChatOpen(false);
      setAiChatMessages([{
        id: 'welcome',
        sender: 'ai',
        text: 'Hello! I am your RAJIV CRM Google AI Assistant. Ask me anything about your clients, active projects, pipeline status, open snags, tasks, or missing data.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsAiChatSending(false);
      setCompanies([]);
      setActiveCompanyId(null);
      setUnits([]);
      setActiveUnitId(null);
      setWorks([]);
      setActiveWorkId(null);
      setIssues([]);
      setActiveIssueId(null);
      setLogs([]);
      setReminders([]);
      setNotifications([]);
      setMissingData([]);
      setProjectAssignments([]);
      setTasks([]);
      setTaskAssignees([]);
      setIsTaskEditorOpen(false);
      setEditingTaskId(null);
      setTaskForm({ title: '', description: '', status: 'not_started', priority: 'medium', due_date: '', stage_id: '' });
      setTaskAssigneeForm({ user_id: '', role: 'assignee' });
      setStageDefinitions([]);
      setStageAssignments([]);
      setStageAssignmentTargetId(null);
      setTenantMembers([]);
      setProfiles([]);
      setSearchQuery('');
      setSearchResults([]);
      setPendingNav(null);
      setActiveStageIndex(0);
      setCenterView('pipeline');
      setRightView('tasks');
      setLogInput('');
      setAttachment(null);
      setEditingLogId(null);
      setEditLogContent('');
      setHistoryLog(null);
      setIssueTitleInput('');
      setReminderForm({ content: '', target_date: '', company_id: '', unit_id: '', work_id: '', log_id: '', stage_name: '' });
      setModalUnits([]);
      setModalWorks([]);
      setWorkForm({ title: '', po_number: '', wo_number: '', boq_url: '', po_file_url: '', wo_file_url: '' });
      setBoqFile(null);
      setPoFile(null);
      setWoFile(null);
      setIsWorkUploading(false);
      setIsUploading(false);
      setAuthLoading(false);
      return;
    }

    setSession(currentSession);
    setCurrentUser(currentSession.user);
    setAuthLoading(true);
    console.log('[NOTIF TRACE 2] auth resolved:', currentSession.user.id);

    try {
      // Step 2: Load Active Tenant Membership from public.tenant_memberships
      const { data: membershipData, error: membershipError } = await supabase
        .from('tenant_memberships')
        .select('*')
        .eq('user_id', currentSession.user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (!isCurrentAuthInitialization(generation)) return;

      if (membershipError) {
        console.error('[Supabase Query Error - tenant_memberships]:', membershipError);
      }

      let resolvedTenantId = null;
      let resolvedTenantRole = null;
      let resolvedMembership = null;
      let resolvedOpCoId = null;

      if (membershipData) {
        resolvedTenantId = membershipData.tenant_id;
        resolvedTenantRole = membershipData.role;
        resolvedMembership = membershipData;
      }

      setTenantId(resolvedTenantId);
      setTenantRole(resolvedTenantRole);
      setTenantMembership(resolvedMembership);

      // Load profile for fallback role mapping
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentSession.user.id)
        .maybeSingle();

      if (!isCurrentAuthInitialization(generation)) return;

      if (profileError) {
        console.error('[Supabase Query Error - profiles]:', profileError);
      }

      // Step 9: Map role compatibility for UI
      const mappedRole = normalizeRole(resolvedTenantRole, profileData?.role);
      setUserRole(mappedRole);

      // Step 3: Load Authorized Operating Companies from public.tenant_companies
      if (resolvedTenantId) {
        const { data: opCompData, error: opCompError } = await supabase
          .from('tenant_companies')
          .select('*')
          .eq('tenant_id', resolvedTenantId)
          .eq('status', 'active')
          .order('created_at', { ascending: true });

        if (!isCurrentAuthInitialization(generation)) return;

        if (opCompError) {
          console.error('[Supabase Query Error - tenant_companies]:', opCompError);
          setOperatingCompanies([]);
          setActiveOperatingCompanyIdState(null);
        } else if (opCompData) {
          setOperatingCompanies(opCompData);

          // Step 4: Resolve Active Operating Company (supports specific UUID and ALL COMPANIES)
          const savedOpCompId = localStorage.getItem('crm_active_operating_company_id');
          const isSavedAuthorized = opCompData.some(c => c.id === savedOpCompId);

          if (savedOpCompId === 'ALL') {
            resolvedOpCoId = null;
          } else if (savedOpCompId && isSavedAuthorized) {
            resolvedOpCoId = savedOpCompId;
          } else {
            // Default to ALL COMPANIES (null) for global context
            resolvedOpCoId = null;
            localStorage.setItem('crm_active_operating_company_id', 'ALL');
          }
          setActiveOperatingCompanyIdState(resolvedOpCoId);
        }
      } else {
        setOperatingCompanies([]);
        setActiveOperatingCompanyIdState(null);
      }

      // Step 6 & 8: Perform authenticated data fetching only after session & auth context are ready
      const crmWorkspaceRes = await fetchCrmWorkspace(resolvedOpCoId, undefined, undefined, generation, resolvedTenantId);
      const isRpcSuccess = crmWorkspaceRes?.success;

      const secondaryFetches = [
        fetchReminders(resolvedOpCoId, generation),
        fetchNotifications(resolvedOpCoId, generation),
        fetchMissingData(resolvedOpCoId, generation),
        fetchProfiles(generation),
        fetchTenantMembers(resolvedTenantId, generation)
      ];

      if (!isRpcSuccess) {
        secondaryFetches.push(
          fetchCompanies(resolvedOpCoId, generation),
          fetchContacts(resolvedOpCoId, generation),
          fetchEnquiries(resolvedOpCoId, generation),
          fetchFollowUps(resolvedOpCoId, generation)
        );
      }

      await Promise.all(secondaryFetches);
    } catch (err) {
      console.error('[AuthContext Initialization Error]:', err);
      throw err;
    } finally {
      if (isCurrentAuthInitialization(generation)) {
        setAuthLoading(false);
      }
    }
  };

  const loadAuthAndTenantContext = (currentSession) => {
    const sessionKey = currentSession?.user
      ? currentSession.user.id
      : 'signed-out';
    const authInitialization = authInitializationRef.current;

    if (authInitialization.sessionKey === sessionKey) {
      if (currentSession?.user && authInitialization.promise) {
        setSession(currentSession);
        setCurrentUser(currentSession.user);
      }
      return authInitialization.promise;
    }

    const generation = authInitialization.generation + 1;
    const nextInitialization = authInitialization.promise
      .catch(() => {})
      .then(() => initializeAuthAndTenantContext(currentSession, generation))
      .catch((error) => {
        if (authInitializationRef.current.promise === nextInitialization) {
          authInitializationRef.current.sessionKey = null;
        }
        console.error('[AuthContext Initialization Error]:', error);
      });

    authInitializationRef.current = {
      sessionKey,
      promise: nextInitialization,
      generation
    };

    return nextInitialization;
  };

  useEffect(() => {
    console.log('[NOTIF TRACE 1] CrmContext mounted');
    const initialAuthEventGeneration = authEventGenerationRef.current;
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (authEventGenerationRef.current !== initialAuthEventGeneration) return;
      loadAuthAndTenantContext(initialSession);
    }).catch(err => {
      console.error('[Auth Initialization Error]:', err);
      if (authEventGenerationRef.current === initialAuthEventGeneration) {
        setAuthLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      authEventGenerationRef.current += 1;
      loadAuthAndTenantContext(newSession);
    });

    return () => authListener?.subscription?.unsubscribe();
  }, []);

  // --- Operating Company Context Change Effect (Step 5) ---
  const isFirstOpCoMount = useRef(true);
  useEffect(() => {
    if (isFirstOpCoMount.current) {
      isFirstOpCoMount.current = false;
      return;
    }
    if (!authLoading && session?.user) {
      setProjectAssignments([]);
      setStageDefinitions([]);
      setStageAssignments([]);
      setStageAssignmentTargetId(null);
      fetchCrmWorkspace(activeOperatingCompanyId).then(res => {
        if (!res?.success) {
          fetchCompanies(activeOperatingCompanyId);
          fetchContacts(activeOperatingCompanyId);
          fetchEnquiries(activeOperatingCompanyId);
          fetchFollowUps(activeOperatingCompanyId);
        }
      });
      fetchReminders(activeOperatingCompanyId);
      fetchNotifications(activeOperatingCompanyId);
      fetchMissingData(activeOperatingCompanyId);
    }
  }, [activeOperatingCompanyId]);

  // Sticky Log Inputs Fix: Clear input & attachment when switching company, unit, project, stage, or issue
  useEffect(() => {
    setLogInput('');
    setAttachment(null);
  }, [activeCompanyId, activeUnitId, activeWorkId, activeStageIndex, activeIssueId, centerView]);

  // Sidebar State (Exported for Mobile & Desktop Navigation)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Admin Panel State
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [isFetchingProfiles, setIsFetchingProfiles] = useState(false);

  // Move Log Stage State
  const [moveLogModal, setMoveLogModal] = useState({ isOpen: false, log: null });

  // Edit / Reschedule Reminder State
  const [editReminderModal, setEditReminderModal] = useState({ isOpen: false, reminder: null });
  const [editReminderForm, setEditReminderForm] = useState({ content: '', target_date: '' });
  // Font Size Scaling State ('80' | '90' | '100' | '110' | '120' | '130')
  const FONT_SCALES = ['80', '90', '100', '110', '120', '130'];
  const [fontSize, setFontSizeState] = useState(() => {
    const saved = localStorage.getItem('crm_font_size');
    if (saved === 'sm') return '90';
    if (saved === 'md') return '100';
    if (saved === 'lg') return '110';
    if (saved === 'xl') return '120';
    if (saved === '2xl') return '130';
    return saved || '100';
  });

  const applyFontSizeClass = (size) => {
    ['80', '90', '100', '110', '120', '130', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'].forEach(s => {
      document.documentElement.classList.remove(`font-scale-${s}`);
      if (document.body) document.body.classList.remove(`font-scale-${s}`);
    });
    document.documentElement.classList.add(`font-scale-${size}`);
    if (document.body) document.body.classList.add(`font-scale-${size}`);
  };

  const setFontSize = (size) => {
    setFontSizeState(size);
    localStorage.setItem('crm_font_size', size);
    applyFontSizeClass(size);
  };

  const increaseFontSize = () => {
    const currentIndex = FONT_SCALES.indexOf(fontSize);
    if (currentIndex < FONT_SCALES.length - 1 && currentIndex >= 0) {
      setFontSize(FONT_SCALES[currentIndex + 1]);
    } else if (currentIndex < 0) {
      setFontSize('110');
    }
  };

  const decreaseFontSize = () => {
    const currentIndex = FONT_SCALES.indexOf(fontSize);
    if (currentIndex > 0) {
      setFontSize(FONT_SCALES[currentIndex - 1]);
    } else if (currentIndex < 0) {
      setFontSize('90');
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('crm_font_size') || '100';
    applyFontSizeClass(saved);
  }, []);

  // Document Instant Preview Modal State
  const [docPreviewModal, setDocPreviewModal] = useState({
    isOpen: false,
    title: '',
    url: ''
  });

  const openDocPreview = (url, title = 'Document Preview') => {
    if (!url) return;
    setDocPreviewModal({ isOpen: true, title, url });
  };

  const closeDocPreview = () => {
    setDocPreviewModal({ isOpen: false, title: '', url: '' });
  };

  // --- Centralized Topmost Modal Close & Mobile Back Button / Esc Key Handlers ---
  function closeTopmostModal() {
    if (docPreviewModal?.isOpen) { closeDocPreview(); return true; }
    if (confirmModal?.isOpen) { closeConfirm(false); return true; }
    if (promptModal?.isOpen) { closePrompt(null); return true; }
    if (isCustomerModalOpen) { closeCustomerModal(); return true; }
    if (isContactModalOpen) { setIsContactModalOpen(false); return true; }
    if (isEnquiryModalOpen) { setIsEnquiryModalOpen(false); return true; }
    if (isFollowUpModalOpen) { setIsFollowUpModalOpen(false); return true; }
    if (isProjectTeamModalOpen) { setIsProjectTeamModalOpen(false); return true; }
    if (isStageAssignmentModalOpen) { closeStageAssignmentModal(); return true; }
    if (editReminderModal?.isOpen) { setEditReminderModal({ isOpen: false, reminder: null }); return true; }
    if (moveLogModal?.isOpen) { setMoveLogModal({ isOpen: false, log: null }); return true; }
    if (historyLog) { setHistoryLog(null); return true; }
    if (isAiChatOpen) { setIsAiChatOpen(false); return true; }
    if (isAdminPanelOpen) { setIsAdminPanelOpen(false); return true; }
    if (isBinModalOpen) { setIsBinModalOpen(false); return true; }
    if (isStageManagerOpen) { setIsStageManagerOpen(false); return true; }
    if (isWorkModalOpen) {
      setPoFile(null);
      setWoFile(null);
      setBoqFile(null);
      setIsWorkModalOpen(false);
      return true;
    }
    if (isReminderModalOpen) { setIsReminderModalOpen(false); return true; }
    if (isIssueModalOpen) { setIsIssueModalOpen(false); return true; }
    if (isSidebarOpen) { setIsSidebarOpen(false); return true; }
    return false;
  }

  // 1. Escape Key Listener (for PC keyboard)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        const closed = closeTopmostModal();
        if (closed) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    docPreviewModal, confirmModal, promptModal, isProjectTeamModalOpen, isStageAssignmentModalOpen, editReminderModal, moveLogModal, historyLog,
    isAiChatOpen, isAdminPanelOpen, isBinModalOpen, isStageManagerOpen,
    isWorkModalOpen, isReminderModalOpen, isIssueModalOpen, isSidebarOpen
  ]);

  // Toast Notifications & Mobile Hardware Back Button Handling
  const [toastMessage, setToastMessage] = useState(null);
  const [lastBackPress, setLastBackPress] = useState(0);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2500);
  };

  const refreshAllData = async () => {
    try {
      await Promise.all([
        fetchCompanies(),
        fetchReminders(),
        fetchMissingData(),
        fetchContacts(),
        fetchEnquiries(),
        fetchFollowUps()
      ]);
      if (activeCompanyId) {
        const { data: unitData } = await supabase.from('units').select('*').eq('company_id', activeCompanyId).order('created_at', { ascending: true });
        if (unitData) setUnits(unitData);
      }
      if (activeUnitId) {
        const { data: workData } = await supabase.from('works').select('*').eq('unit_id', activeUnitId).order('created_at', { ascending: true });
        if (workData) setWorks(workData);
      }
      showToast('Workspace data refreshed!');
    } catch (e) {
      console.error("Refresh error:", e);
    }
  };

  // 2. Mobile Hardware / Browser Back Button Listener (History API & popstate)
  const hasAnyModalOpen = Boolean(
    docPreviewModal?.isOpen || confirmModal?.isOpen || promptModal?.isOpen || isStageAssignmentModalOpen || editReminderModal?.isOpen ||
    moveLogModal?.isOpen || historyLog || isAiChatOpen || isAdminPanelOpen ||
    isBinModalOpen || isStageManagerOpen || isWorkModalOpen || isReminderModalOpen ||
    isIssueModalOpen || isSidebarOpen
  );

  useEffect(() => {
    // Push dummy history entry on mount so hardware back button can be intercepted
    window.history.pushState({ crmRoot: true }, '');
  }, []);

  useEffect(() => {
    if (hasAnyModalOpen) {
      window.history.pushState({ crmModalActive: true }, '');
    }
  }, [hasAnyModalOpen]);

  useEffect(() => {
    const handlePopState = (e) => {
      const closed = closeTopmostModal();
      if (closed) {
        return;
      }

      // No modal is open: handle double back button press to exit app
      const now = Date.now();
      if (now - lastBackPress < 2000) {
        // Second press within 2s -> Allow browser/PWA to go back / exit
        window.history.back();
      } else {
        // First press -> Intercept and warn user
        setLastBackPress(now);
        showToast('Press back again to exit CRM app');
        window.history.pushState({ crmRoot: true }, '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    hasAnyModalOpen, lastBackPress,
    docPreviewModal, confirmModal, promptModal, editReminderModal, moveLogModal, historyLog,
    isAiChatOpen, isAdminPanelOpen, isBinModalOpen, isStageManagerOpen,
    isWorkModalOpen, isReminderModalOpen, isIssueModalOpen, isSidebarOpen
  ]);

  // --- Navigation Effects ---
  useEffect(() => {
    if (activeCompanyId) {
      supabase.from('units').select('*').eq('company_id', activeCompanyId).order('created_at', { ascending: true }).then(({ data }) => {
        if (data) {
          setUnits(data);
          setActiveUnitId(prev => (data.some(u => u.id === prev) ? prev : (data.length > 0 ? data[0].id : null)));
        }
      });
    } else { 
      setUnits([]); 
      setActiveUnitId(null); 
    }
  }, [activeCompanyId]);

  useEffect(() => {
    if (activeUnitId) {
      supabase.from('works').select('*').eq('unit_id', activeUnitId).order('created_at', { ascending: true }).then(({ data }) => {
        if (data) {
          setWorks(data);
          setActiveWorkId(prev => (data.some(w => w.id === prev) ? prev : (data.length > 0 ? data[0].id : null)));
        }
      });
    } else { 
      setWorks([]); 
      setActiveWorkId(null); 
    }
  }, [activeUnitId]);

  // --- PIPELINE STAGE NAVIGATION ---
  // stage_definitions is the normalized source of truth. Legacy works.stages is used
  // only as a compatibility fallback while the normalized rows are loading.
  const activeStageDefinitions = stageDefinitions
    .filter(s => s.status === 'active')
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  useEffect(() => {
    if (!activeWorkId) {
      setStageDefinitions([]);
      setStageAssignments([]);
      setStageAssignmentTargetId(null);
      return;
    }
    fetchStageDefinitions(activeWorkId);
    fetchStageAssignments(activeWorkId);
  }, [activeWorkId]);

  // Reset pipeline stage to 0 when switching projects unless a navigation request
  // explicitly targets a stage.
  useEffect(() => {
    if (pendingNav && pendingNav.workId === activeWorkId) return;
    setActiveStageIndex(0);
    setStageAssignmentTargetId(null);
    setCenterView('pipeline');
  }, [activeWorkId]);

  // Execute navigation to a stage by normalized stage name first, then legacy data.
  useEffect(() => {
    if (!pendingNav || pendingNav.workId !== activeWorkId) return;

    const targetName = pendingNav.stageName;
    const normalizedIndex = activeStageDefinitions.findIndex(
      s => s.name === targetName
    );

    if (normalizedIndex >= 0) {
      setActiveStageIndex(normalizedIndex);
    } else {
      const legacyStages = works.find(w => w.id === pendingNav.workId)?.stages || [];
      const legacyIndex = legacyStages.indexOf(targetName);
      setActiveStageIndex(legacyIndex >= 0 ? legacyIndex : 0);
    }

    setPendingNav(null);
  }, [activeWorkId, stageDefinitions, works, pendingNav]);

  useEffect(() => {
    if (!activeWorkId) {
      setLogs([]);
      setIssues([]);
      setProjectAssignments([]);
      setStageAssignments([]);
      return;
    }

    fetchIssues(activeWorkId);
    fetchProjectAssignments(activeWorkId);

    if (centerView === 'pipeline') {
      const stageName =
        activeStageDefinitions[activeStageIndex]?.name ||
        works.find(w => w.id === activeWorkId)?.stages?.[activeStageIndex];

      if (stageName) {
        fetchLogs(activeWorkId, stageName, null);
      } else {
        setLogs([]);
      }
    } else if (centerView === 'issues') {
      if (activeIssueId) {
        fetchLogs(activeWorkId, 'Issue', activeIssueId);
      } else {
        setLogs([]);
      }
    }
  }, [activeWorkId, activeStageIndex, centerView, activeIssueId, works, stageDefinitions]);

  useEffect(() => {
    if (!session?.user || !tenantId || !activeWorkId) {
      setTasks([]);
      setTaskAssignees([]);
      setIsTaskEditorOpen(false);
      setEditingTaskId(null);
      return;
    }
    setTaskAssignees([]);
    fetchTasks(activeWorkId, activeOperatingCompanyId);
  }, [session?.user?.id, tenantId, activeWorkId, activeOperatingCompanyId]);

  // Notifications Lifecycle Effect: Re-fetch when authenticated user ID changes, clear on logout
  useEffect(() => {
    const authUserId = session?.user?.id || currentUser?.id;
    if (!authUserId) {
      setNotifications([]);
      return;
    }
    fetchNotifications(authUserId);
  }, [session?.user?.id, currentUser?.id]);

  // --- Database Fetches ---
  async function fetchOperatingCompanies(authGeneration) {
    if (authGeneration !== undefined && !isCurrentAuthInitialization(authGeneration)) return;
    const currentTenantId = tenantId;
    if (!currentTenantId) return;
    try {
      const { data, error } = await supabase
        .from('tenant_companies')
        .select('*')
        .eq('tenant_id', currentTenantId)
        .order('created_at', { ascending: true });
      if (authGeneration !== undefined && !isCurrentAuthInitialization(authGeneration)) return;
      if (error) {
        console.error('[Supabase Query Error - tenant_companies]:', error);
        return;
      }
      if (data) {
        setOperatingCompanies(data);
      }
    } catch (err) {
      console.error('[CrmContext] Error fetching operating companies:', err);
    }
  }

  async function fetchCompanies(targetOpCoId, authGeneration) {
    if (authGeneration !== undefined && !isCurrentAuthInitialization(authGeneration)) return;
    const opCoId = targetOpCoId !== undefined ? targetOpCoId : activeOperatingCompanyId;
    let query = supabase.from('companies').select('*').order('created_at', { ascending: true });
    if (opCoId) {
      query = query.eq('tenant_company_id', opCoId);
    }
    const { data, error } = await query;
    if (authGeneration !== undefined && !isCurrentAuthInitialization(authGeneration)) return;
    if (error) {
      console.error('[Supabase Query Error - companies (client)]:', error);
      return;
    }
    if (data) { 
      setCompanies(data); 
      setActiveCompanyId(prev => {
        if (prev && data.some(c => c.id === prev)) {
          return prev;
        }
        return data.length > 0 ? data[0].id : null;
      });
    } 
  }

  // --- CRM RPC Operations (Atomic Workspace & Upsert Customer Profile) ---
  async function fetchCrmWorkspace(targetOpCoId, targetCompId, targetUnitId, authGeneration, resolvedTenantId) {
    if (authGeneration !== undefined && !isCurrentAuthInitialization(authGeneration)) return { success: false };
    const opCoId = targetOpCoId !== undefined ? targetOpCoId : activeOperatingCompanyId;
    const compId = targetCompId !== undefined ? targetCompId : activeCompanyId;
    const unitId = targetUnitId !== undefined ? targetUnitId : activeUnitId;

    setIsCrmWorkspaceLoading(true);
    setCrmWorkspaceError(null);
    try {
      const params = {
        p_tenant_id: resolvedTenantId !== undefined ? resolvedTenantId : (tenantId || null),
        p_tenant_company_id: opCoId || null,
        p_company_id: compId || null,
        p_unit_id: unitId || null
      };

      const { data, error } = await supabase.rpc('crm_get_workspace_atomic', params);

      if (authGeneration !== undefined && !isCurrentAuthInitialization(authGeneration)) return { success: false };

      if (error) {
        console.error('[CrmContext] crm_get_workspace_atomic error:', error);
        setCrmWorkspaceError(error.message || 'Failed to fetch CRM workspace payload');
        showToast(`CRM Data Fetch Error: ${error.message}`);
        // CRITICAL: DO NOT silently fall back to direct table queries!
        return { success: false, error };
      }

      if (data) {
        setCrmSummary(data.summary || null);
        if (Array.isArray(data.customers)) setCompanies(data.customers);
        else if (Array.isArray(data.companies)) setCompanies(data.companies);

        if (Array.isArray(data.contacts)) setContacts(data.contacts);
        if (Array.isArray(data.enquiries)) setEnquiries(data.enquiries);

        if (Array.isArray(data.follow_ups)) setFollowUps(data.follow_ups);
        else if (Array.isArray(data.followups)) setFollowUps(data.followups);

        if (Array.isArray(data.works)) setWorks(data.works);
        if (Array.isArray(data.tasks)) setTasks(data.tasks);
        if (Array.isArray(data.issues)) setIssues(data.issues);

        if (Array.isArray(data.logs)) setLogs(data.logs);
        else if (Array.isArray(data.activities)) setLogs(data.activities);
      }
      return { success: true, data };
    } catch (err) {
      console.error('[CrmContext] Exception in fetchCrmWorkspace:', err);
      setCrmWorkspaceError(err.message || 'Unexpected CRM fetch error');
      showToast(`CRM Fetch Failed: ${err.message || err}`);
      return { success: false, error: err };
    } finally {
      setIsCrmWorkspaceLoading(false);
    }
  }

  async function handleUpsertCustomerProfile(customPayload = null) {
    const form = customPayload || customerForm;
    const nameToUse = (form.name || form.display_name || form.legal_name || '').trim();
    if (!nameToUse) {
      const msg = 'Customer name or legal name is required.';
      showToast(msg);
      alert(msg);
      return { success: false, message: msg };
    }

    const payload = {
      tenant_id: tenantId,
      tenant_company_id: activeOperatingCompanyId || null,
      company_id: form.id || form.company_id || null,
      name: nameToUse,
      profile: {
        legal_name: form.legal_name ? form.legal_name.trim() : null,
        display_name: form.display_name ? form.display_name.trim() : nameToUse,
        trading_name: form.trading_name ? form.trading_name.trim() : null,
        company_type: form.company_type || 'private_limited',
        business_type: form.business_type ? form.business_type.trim() : null,
        industry: form.industry ? form.industry.trim() : null,
        gstin: form.gstin ? form.gstin.trim().toUpperCase() : null,
        pan: form.pan ? form.pan.trim().toUpperCase() : null,
        cin: form.cin ? form.cin.trim().toUpperCase() : null,
        website: form.website ? form.website.trim() : null,
        official_email: form.official_email ? form.official_email.trim() : null,
        official_phone: form.official_phone ? form.official_phone.trim() : null,
        billing_address: typeof form.billing_address === 'object' ? form.billing_address : null,
        shipping_address: typeof form.shipping_address === 'object' ? form.shipping_address : null,
        notes: form.notes ? form.notes.trim() : null,
        status: form.status || 'active'
      }
    };

    try {
      const { data, error } = await supabase.rpc('crm_customer_upsert_atomic', { p_payload: payload });

      if (error) {
        console.error('[CrmContext] crm_customer_upsert_atomic error:', error);
        showToast(`Error saving customer profile: ${error.message}`);
        alert(`Error saving customer profile: ${error.message}`);
        return { success: false, error };
      }

      showToast(form.id ? 'Customer profile updated successfully!' : 'Customer created successfully!');
      setIsCustomerModalOpen(false);
      await fetchCrmWorkspace();
      return { success: true, data };
    } catch (err) {
      console.error('[CrmContext] Exception in handleUpsertCustomerProfile:', err);
      showToast(`Save customer profile failed: ${err.message || err}`);
      alert(`Save customer profile failed: ${err.message || err}`);
      return { success: false, error: err };
    }
  }

  function openNewCustomerModal() {
    setEditingCustomer(null);
    setCustomerForm({
      id: null,
      name: '',
      legal_name: '',
      display_name: '',
      trading_name: '',
      company_type: 'private_limited',
      business_type: '',
      industry: '',
      gstin: '',
      pan: '',
      cin: '',
      website: '',
      official_email: '',
      official_phone: '',
      billing_address: { street: '', city: '', state: '', pincode: '', country: 'India' },
      shipping_address: { street: '', city: '', state: '', pincode: '', country: 'India' },
      notes: '',
      status: 'active'
    });
    setIsCustomerModalOpen(true);
  }

  function openEditCustomerModal(customer) {
    setEditingCustomer(customer);
    const prof = customer.profile || customer.corporate_profile || {};
    setCustomerForm({
      id: customer.id,
      name: customer.name || '',
      legal_name: prof.legal_name || customer.legal_name || customer.name || '',
      display_name: prof.display_name || customer.display_name || customer.name || '',
      trading_name: prof.trading_name || customer.trading_name || '',
      company_type: prof.company_type || customer.company_type || 'private_limited',
      business_type: prof.business_type || customer.business_type || '',
      industry: prof.industry || customer.industry || '',
      gstin: prof.gstin || customer.gstin || '',
      pan: prof.pan || customer.pan || '',
      cin: prof.cin || customer.cin || '',
      website: prof.website || customer.website || '',
      official_email: prof.official_email || customer.official_email || customer.email || '',
      official_phone: prof.official_phone || customer.official_phone || customer.phone || '',
      billing_address: prof.billing_address || customer.billing_address || { street: '', city: '', state: '', pincode: '', country: 'India' },
      shipping_address: prof.shipping_address || customer.shipping_address || { street: '', city: '', state: '', pincode: '', country: 'India' },
      notes: prof.notes || customer.notes || '',
      status: prof.status || customer.status || 'active'
    });
    setIsCustomerModalOpen(true);
  }

  function closeCustomerModal() {
    setIsCustomerModalOpen(false);
    setEditingCustomer(null);
  }

  function openCustomerWorkspace(customerId) {
    setSelectedCustomerId(customerId);
    setActiveCompanyId(customerId);
    setCenterView('customer_profile');
  }

  function closeCustomerWorkspace() {
    setSelectedCustomerId(null);
    setCenterView('customers');
  }

  // --- CRM P0 Database Operations (Contacts, Enquiries, Follow-ups) ---

  async function fetchContacts(targetOpCoId, authGeneration) {
    if (authGeneration !== undefined && !isCurrentAuthInitialization(authGeneration)) return [];
    const opCoId = targetOpCoId !== undefined ? targetOpCoId : activeOperatingCompanyId;
    setIsContactsLoading(true);
    try {
      let query = supabase
        .from('contacts')
        .select('*, company:companies(id, name), unit:units(id, name)')
        .order('created_at', { ascending: false });

      if (tenantId) query = query.eq('tenant_id', tenantId);
      if (opCoId) query = query.eq('tenant_company_id', opCoId);

      const { data, error } = await query;
      if (authGeneration !== undefined && !isCurrentAuthInitialization(authGeneration)) return [];
      if (error) {
        console.error('[Supabase Query Error - contacts]:', error);
        showToast(`Failed to load contacts: ${error.message}`);
        setContacts([]);
        return [];
      }
      setContacts(data || []);
      return data || [];
    } catch (err) {
      console.error('[Fetch Contacts Error]:', err);
      showToast(`Fetch contacts error: ${err.message || err}`);
      setContacts([]);
      return [];
    } finally {
      setIsContactsLoading(false);
    }
  }

  async function saveContact(contactData) {
    if (!contactData.name || !contactData.company_id) {
      const msg = 'Contact name and customer company are required.';
      showToast(msg);
      alert(msg);
      return { success: false, message: msg };
    }

    const payload = {
      tenant_id: tenantId,
      tenant_company_id: activeOperatingCompanyId || contactData.tenant_company_id || null,
      company_id: contactData.company_id,
      unit_id: contactData.unit_id || null,
      name: contactData.name.trim(),
      email: contactData.email ? contactData.email.trim() : null,
      phone: contactData.phone ? contactData.phone.trim() : null,
      designation: contactData.designation ? contactData.designation.trim() : null,
      department: contactData.department ? contactData.department.trim() : null,
      is_primary: Boolean(contactData.is_primary),
      notes: contactData.notes ? contactData.notes.trim() : null,
      created_by: currentUser?.id || null,
      updated_at: new Date().toISOString()
    };

    try {
      let result;
      if (contactData.id) {
        result = await supabase
          .from('contacts')
          .update(payload)
          .eq('id', contactData.id)
          .select('*, company:companies(id, name), unit:units(id, name)');
      } else {
        result = await supabase
          .from('contacts')
          .insert([payload])
          .select('*, company:companies(id, name), unit:units(id, name)');
      }

      if (result.error) {
        console.error('[Supabase Save Contact Error]:', result.error);
        showToast(`Error saving contact: ${result.error.message}`);
        alert(`Error saving contact: ${result.error.message}`);
        return { success: false, error: result.error };
      }

      showToast(contactData.id ? 'Contact updated successfully!' : 'Contact created successfully!');
      setIsContactModalOpen(false);
      await fetchContacts();
      return { success: true, data: result.data?.[0] };
    } catch (err) {
      console.error('[Save Contact Exception]:', err);
      showToast(`Save contact failed: ${err.message || err}`);
      alert(`Save contact failed: ${err.message || err}`);
      return { success: false, error: err };
    }
  }

  async function handleDeleteContact(contactId) {
    if (!contactId) return;
    const confirmed = await showConfirm('Are you sure you want to delete this contact?');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) {
        console.error('[Supabase Delete Contact Error]:', error);
        showToast(`Error deleting contact: ${error.message}`);
        alert(`Error deleting contact: ${error.message}`);
        return { success: false, error };
      }
      showToast('Contact deleted successfully');
      await fetchContacts();
      return { success: true };
    } catch (err) {
      console.error('[Delete Contact Exception]:', err);
      showToast(`Delete contact failed: ${err.message || err}`);
      return { success: false, error: err };
    }
  }

  function openNewContactModal(initialCompanyId = null, initialUnitId = null) {
    setEditingContact(null);
    setContactForm({
      name: '',
      company_id: initialCompanyId || activeCompanyId || (companies[0]?.id || ''),
      unit_id: initialUnitId || activeUnitId || '',
      email: '',
      phone: '',
      designation: '',
      department: '',
      is_primary: false,
      notes: ''
    });
    setIsContactModalOpen(true);
  }

  function openEditContactModal(contact) {
    setEditingContact(contact);
    setContactForm({
      id: contact.id,
      name: contact.name || '',
      company_id: contact.company_id || '',
      unit_id: contact.unit_id || '',
      email: contact.email || '',
      phone: contact.phone || '',
      designation: contact.designation || '',
      department: contact.department || '',
      is_primary: Boolean(contact.is_primary),
      notes: contact.notes || ''
    });
    setIsContactModalOpen(true);
  }

  async function fetchEnquiries(targetOpCoId, authGeneration) {
    if (authGeneration !== undefined && !isCurrentAuthInitialization(authGeneration)) return [];
    const opCoId = targetOpCoId !== undefined ? targetOpCoId : activeOperatingCompanyId;
    setIsEnquiriesLoading(true);
    try {
      let query = supabase
        .from('enquiries')
        .select('*, company:companies(id, name), contact:contacts(id, name, email, phone)')
        .order('created_at', { ascending: false });

      if (tenantId) query = query.eq('tenant_id', tenantId);
      if (opCoId) query = query.eq('tenant_company_id', opCoId);

      const { data, error } = await query;
      if (authGeneration !== undefined && !isCurrentAuthInitialization(authGeneration)) return [];
      if (error) {
        console.error('[Supabase Query Error - enquiries]:', error);
        showToast(`Failed to load enquiries: ${error.message}`);
        setEnquiries([]);
        return [];
      }
      setEnquiries(data || []);
      return data || [];
    } catch (err) {
      console.error('[Fetch Enquiries Error]:', err);
      showToast(`Fetch enquiries error: ${err.message || err}`);
      setEnquiries([]);
      return [];
    } finally {
      setIsEnquiriesLoading(false);
    }
  }

  async function saveEnquiry(enquiryData) {
    if (!enquiryData.title || !enquiryData.company_id) {
      const msg = 'Enquiry title and customer company are required.';
      showToast(msg);
      alert(msg);
      return { success: false, message: msg };
    }

    const payload = {
      tenant_id: tenantId,
      tenant_company_id: activeOperatingCompanyId || enquiryData.tenant_company_id || null,
      company_id: enquiryData.company_id,
      contact_id: enquiryData.contact_id || null,
      title: enquiryData.title.trim(),
      description: enquiryData.description ? enquiryData.description.trim() : null,
      source: enquiryData.source || 'website',
      status: enquiryData.status || 'new',
      priority: enquiryData.priority || 'medium',
      assigned_to: enquiryData.assigned_to || currentUser?.id || null,
      enquiry_date: enquiryData.enquiry_date || new Date().toISOString(),
      next_followup_date: enquiryData.next_followup_date || null,
      created_by: currentUser?.id || null,
      updated_at: new Date().toISOString()
    };

    try {
      let result;
      if (enquiryData.id) {
        result = await supabase
          .from('enquiries')
          .update(payload)
          .eq('id', enquiryData.id)
          .select('*, company:companies(id, name), contact:contacts(id, name, email, phone)');
      } else {
        result = await supabase
          .from('enquiries')
          .insert([payload])
          .select('*, company:companies(id, name), contact:contacts(id, name, email, phone)');
      }

      if (result.error) {
        console.error('[Supabase Save Enquiry Error]:', result.error);
        showToast(`Error saving enquiry: ${result.error.message}`);
        alert(`Error saving enquiry: ${result.error.message}`);
        return { success: false, error: result.error };
      }

      showToast(enquiryData.id ? 'Enquiry updated successfully!' : 'Enquiry created successfully!');
      setIsEnquiryModalOpen(false);
      await fetchEnquiries();
      return { success: true, data: result.data?.[0] };
    } catch (err) {
      console.error('[Save Enquiry Exception]:', err);
      showToast(`Save enquiry failed: ${err.message || err}`);
      alert(`Save enquiry failed: ${err.message || err}`);
      return { success: false, error: err };
    }
  }

  async function handleDeleteEnquiry(enquiryId) {
    if (!enquiryId) return;
    const confirmed = await showConfirm('Are you sure you want to delete this enquiry?');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('enquiries')
        .delete()
        .eq('id', enquiryId);

      if (error) {
        console.error('[Supabase Delete Enquiry Error]:', error);
        showToast(`Error deleting enquiry: ${error.message}`);
        alert(`Error deleting enquiry: ${error.message}`);
        return { success: false, error };
      }
      showToast('Enquiry deleted successfully');
      await fetchEnquiries();
      return { success: true };
    } catch (err) {
      console.error('[Delete Enquiry Exception]:', err);
      showToast(`Delete enquiry failed: ${err.message || err}`);
      return { success: false, error: err };
    }
  }

  function openNewEnquiryModal(initialCompanyId = null, initialContactId = null) {
    setEditingEnquiry(null);
    setEnquiryForm({
      title: '',
      company_id: initialCompanyId || activeCompanyId || (companies[0]?.id || ''),
      contact_id: initialContactId || '',
      description: '',
      source: 'website',
      status: 'new',
      priority: 'medium',
      assigned_to: currentUser?.id || '',
      enquiry_date: new Date().toISOString().slice(0, 10),
      next_followup_date: ''
    });
    setIsEnquiryModalOpen(true);
  }

  function openEditEnquiryModal(enquiry) {
    setEditingEnquiry(enquiry);
    setEnquiryForm({
      id: enquiry.id,
      title: enquiry.title || '',
      company_id: enquiry.company_id || '',
      contact_id: enquiry.contact_id || '',
      description: enquiry.description || '',
      source: enquiry.source || 'website',
      status: enquiry.status || 'new',
      priority: enquiry.priority || 'medium',
      assigned_to: enquiry.assigned_to || '',
      enquiry_date: enquiry.enquiry_date ? enquiry.enquiry_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      next_followup_date: enquiry.next_followup_date ? enquiry.next_followup_date.slice(0, 10) : ''
    });
    setIsEnquiryModalOpen(true);
  }

  async function fetchFollowUps(targetOpCoId, authGeneration) {
    if (authGeneration !== undefined && !isCurrentAuthInitialization(authGeneration)) return [];
    const opCoId = targetOpCoId !== undefined ? targetOpCoId : activeOperatingCompanyId;
    setIsFollowUpsLoading(true);
    try {
      let query = supabase
        .from('follow_ups')
        .select('*, enquiry:enquiries(id, title), company:companies(id, name)')
        .order('due_date', { ascending: true });

      if (tenantId) query = query.eq('tenant_id', tenantId);
      if (opCoId) query = query.eq('tenant_company_id', opCoId);

      const { data, error } = await query;
      if (authGeneration !== undefined && !isCurrentAuthInitialization(authGeneration)) return [];
      if (error) {
        console.error('[Supabase Query Error - follow_ups]:', error);
        showToast(`Failed to load follow-ups: ${error.message}`);
        setFollowUps([]);
        return [];
      }
      setFollowUps(data || []);
      return data || [];
    } catch (err) {
      console.error('[Fetch Follow-ups Error]:', err);
      showToast(`Fetch follow-ups error: ${err.message || err}`);
      setFollowUps([]);
      return [];
    } finally {
      setIsFollowUpsLoading(false);
    }
  }

  async function saveFollowUp(followUpData) {
    if (!followUpData.activity_type || !followUpData.due_date || !followUpData.company_id) {
      const msg = 'Activity type, due date, and customer company are required.';
      showToast(msg);
      alert(msg);
      return { success: false, message: msg };
    }

    const payload = {
      tenant_id: tenantId,
      tenant_company_id: activeOperatingCompanyId || followUpData.tenant_company_id || null,
      company_id: followUpData.company_id,
      enquiry_id: followUpData.enquiry_id || null,
      assigned_to: followUpData.assigned_to || currentUser?.id || null,
      activity_type: followUpData.activity_type || 'call',
      due_date: followUpData.due_date,
      notes: followUpData.notes ? followUpData.notes.trim() : null,
      status: followUpData.status || 'pending',
      completed_at: followUpData.status === 'completed' ? (followUpData.completed_at || new Date().toISOString()) : null,
      created_by: currentUser?.id || null,
      updated_at: new Date().toISOString()
    };

    try {
      let result;
      if (followUpData.id) {
        result = await supabase
          .from('follow_ups')
          .update(payload)
          .eq('id', followUpData.id)
          .select('*, enquiry:enquiries(id, title), company:companies(id, name)');
      } else {
        result = await supabase
          .from('follow_ups')
          .insert([payload])
          .select('*, enquiry:enquiries(id, title), company:companies(id, name)');
      }

      if (result.error) {
        console.error('[Supabase Save Follow-up Error]:', result.error);
        showToast(`Error saving follow-up: ${result.error.message}`);
        alert(`Error saving follow-up: ${result.error.message}`);
        return { success: false, error: result.error };
      }

      showToast(followUpData.id ? 'Follow-up updated successfully!' : 'Follow-up created successfully!');
      setIsFollowUpModalOpen(false);
      await fetchFollowUps();
      return { success: true, data: result.data?.[0] };
    } catch (err) {
      console.error('[Save Follow-up Exception]:', err);
      showToast(`Save follow-up failed: ${err.message || err}`);
      alert(`Save follow-up failed: ${err.message || err}`);
      return { success: false, error: err };
    }
  }

  async function toggleFollowUpStatus(followUpId, currentStatus) {
    if (!followUpId) return;
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;

    try {
      const { error } = await supabase
        .from('follow_ups')
        .update({
          status: newStatus,
          completed_at: completedAt,
          updated_at: new Date().toISOString()
        })
        .eq('id', followUpId);

      if (error) {
        console.error('[Supabase Toggle Follow-up Error]:', error);
        showToast(`Failed to update follow-up: ${error.message}`);
        return { success: false, error };
      }

      showToast(`Follow-up marked as ${newStatus}`);
      await fetchFollowUps();
      return { success: true };
    } catch (err) {
      console.error('[Toggle Follow-up Exception]:', err);
      showToast(`Toggle follow-up failed: ${err.message || err}`);
      return { success: false, error: err };
    }
  }

  async function handleDeleteFollowUp(followUpId) {
    if (!followUpId) return;
    const confirmed = await showConfirm('Are you sure you want to delete this follow-up?');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('follow_ups')
        .delete()
        .eq('id', followUpId);

      if (error) {
        console.error('[Supabase Delete Follow-up Error]:', error);
        showToast(`Error deleting follow-up: ${error.message}`);
        alert(`Error deleting follow-up: ${error.message}`);
        return { success: false, error };
      }
      showToast('Follow-up deleted successfully');
      await fetchFollowUps();
      return { success: true };
    } catch (err) {
      console.error('[Delete Follow-up Exception]:', err);
      showToast(`Delete follow-up failed: ${err.message || err}`);
      return { success: false, error: err };
    }
  }

  function openNewFollowUpModal(initialCompanyId = null, initialEnquiryId = null) {
    setEditingFollowUp(null);
    const tom = new Date();
    tom.setDate(tom.getDate() + 1);
    setFollowUpForm({
      activity_type: 'call',
      company_id: initialCompanyId || activeCompanyId || (companies[0]?.id || ''),
      enquiry_id: initialEnquiryId || '',
      due_date: tom.toISOString().slice(0, 16),
      notes: '',
      assigned_to: currentUser?.id || '',
      status: 'pending'
    });
    setIsFollowUpModalOpen(true);
  }

  function openEditFollowUpModal(followUp) {
    setEditingFollowUp(followUp);
    setFollowUpForm({
      id: followUp.id,
      activity_type: followUp.activity_type || 'call',
      company_id: followUp.company_id || '',
      enquiry_id: followUp.enquiry_id || '',
      due_date: followUp.due_date ? new Date(followUp.due_date).toISOString().slice(0, 16) : '',
      notes: followUp.notes || '',
      assigned_to: followUp.assigned_to || '',
      status: followUp.status || 'pending'
    });
    setIsFollowUpModalOpen(true);
  }

  async function fetchProfiles(authGeneration) {
    if (authGeneration !== undefined && !isCurrentAuthInitialization(authGeneration)) return;
    setIsFetchingProfiles(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (authGeneration !== undefined && !isCurrentAuthInitialization(authGeneration)) return;
    if (error) {
      console.error('[Supabase Query Error - profiles]:', error);
    } else if (data) {
      setProfiles(data);
    }
    setIsFetchingProfiles(false);
  }

  async function fetchTenantMembers(targetTenantId, authGeneration) {
    if (authGeneration !== undefined && !isCurrentAuthInitialization(authGeneration)) return;
    const tId = targetTenantId || tenantId;
    if (!tId) {
      setTenantMembers([]);
      return;
    }
    setIsFetchingTenantMembers(true);
    try {
      const { data: rawMembers, error } = await supabase
        .from('tenant_memberships')
        .select('*')
        .eq('tenant_id', tId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (authGeneration !== undefined && !isCurrentAuthInitialization(authGeneration)) return;

      if (error) {
        console.error('[Supabase Query Error - tenant_memberships]:', error);
        setTenantMembers([]);
      } else if (rawMembers && rawMembers.length > 0) {
        const userIds = rawMembers.map(m => m.user_id || m.id).filter(Boolean);
        const { data: profData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds);

        const profMap = new Map();
        (profData || []).forEach(p => {
          if (p.id) profMap.set(String(p.id).trim().toLowerCase(), p.email || p.user_email);
          if (p.user_id) profMap.set(String(p.user_id).trim().toLowerCase(), p.email || p.user_email);
        });

        const mergedMembers = rawMembers.map(m => {
          const uid = String(m.user_id || m.id || '').trim().toLowerCase();
          const email = m.email || m.user_email || m.invited_email || m.member_email || profMap.get(uid);
          return {
            ...m,
            email: email || m.email
          };
        });

        setTenantMembers(mergedMembers);
      } else {
        setTenantMembers([]);
      }
    } catch (err) {
      console.error('[Fetch Tenant Members Error]:', err);
      setTenantMembers([]);
    } finally {
      setIsFetchingTenantMembers(false);
    }
  }

  async function handleUpdateUserRole(userId, newRole) {
    const { data, error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId).select();
    if (error) {
      alert("Failed to update role: " + error.message);
      return;
    }
    if (data) {
      setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role: newRole } : p));
      const currentSession = await supabase.auth.getSession();
      if (currentSession?.data?.session?.user?.id === userId) {
        setUserRole(newRole);
      }
    }
  }

  async function handleApproveUser(userId, role = 'member') {
    await handleUpdateUserRole(userId, role);
  }

  async function handleTerminateUser(userId) {
    const confirmed = await showConfirm("Are you sure you want to terminate access for this user?");
    if (!confirmed) return;
    await handleUpdateUserRole(userId, 'terminated');
  }

  async function handleAdminCreateUser(newEmail, newRole = 'Team') {
    if (!newEmail || !newEmail.trim()) {
      alert("Please enter a valid email address.");
      return false;
    }
    const cleanEmail = newEmail.trim().toLowerCase();
    
    // Create user in Supabase auth with default password crm12345
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: 'crm12345'
    });

    if (authError) {
      alert("Error creating user account: " + authError.message);
      return false;
    }

    const newUserId = authData?.user?.id;
    if (newUserId) {
      const { error: profileError } = await supabase.from('profiles').upsert([
        { id: newUserId, email: cleanEmail, role: newRole || 'Team' }
      ]);
      if (profileError) {
        console.warn("Profile creation warning:", profileError.message);
      }
    }

    await fetchProfiles();
    alert(`Success! Created user account for "${cleanEmail}" with default password: crm12345`);
    return true;
  }

  async function fetchLogs(workId, stageName, issueId) { 
    let query = supabase.from('logs').select('*').eq('work_id', workId).order('created_at', { ascending: false });
    if (issueId) {
      query = query.eq('issue_id', issueId);
    } else {
      query = query.eq('stage_name', stageName).is('issue_id', null);
    }
    const { data, error } = await query;
    if (error) {
      console.error('[Supabase Query Error - logs]:', error);
      return;
    }
    if (data) setLogs(data);
  }

  async function fetchIssues(workId) { 
    const { data, error } = await supabase.from('issues').select('*').eq('work_id', workId).order('created_at', { ascending: false });
    if (error) {
      console.error('[Supabase Query Error - issues]:', error);
      return;
    }
    if (data) { 
      setIssues(data); 
      if (data.length > 0 && !activeIssueId) setActiveIssueId(data[0].id);
    } 
  }

  // --- Stage Definitions Handlers (Step 7D application integration) ---

  async function fetchStageDefinitions(workId) {
    if (!workId) {
      setStageDefinitions([]);
      return [];
    }

    setIsStageDefinitionsLoading(true);
    try {
      const { data, error } = await supabase
        .from('stage_definitions')
        .select('*')
        .eq('work_id', workId)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('[Supabase Query Error - stage_definitions]:', error);
        setStageDefinitions([]);
        return [];
      }

      const rows = data || [];
      setStageDefinitions(rows);
      return rows;
    } catch (err) {
      console.error('[Fetch Stage Definitions Error]:', err);
      setStageDefinitions([]);
      return [];
    } finally {
      setIsStageDefinitionsLoading(false);
    }
  }

  async function openStageManager() {
    if (!activeWorkId) return;
    const rows = await fetchStageDefinitions(activeWorkId);
    setEditedStages(
      (rows || [])
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        .map(stage => ({ ...stage, _isNew: false }))
    );
    setIsStageManagerOpen(true);
  }

  function updateStageName(index, newName) {
    setEditedStages(prev => prev.map((stage, i) =>
      i === index ? { ...stage, name: newName } : stage
    ));
  }

  function updateStageDescription(index, description) {
    setEditedStages(prev => prev.map((stage, i) =>
      i === index ? { ...stage, description } : stage
    ));
  }

  function moveStage(index, direction) {
    setEditedStages(prev => {
      const next = [...prev];
      if (direction === 'up' && index > 0) {
        [next[index - 1], next[index]] = [next[index], next[index - 1]];
      } else if (direction === 'down' && index < next.length - 1) {
        [next[index + 1], next[index]] = [next[index], next[index + 1]];
      }
      return next.map((stage, i) => ({ ...stage, display_order: i + 1 }));
    });
  }

  function removeStage(index) {
    setEditedStages(prev => prev.map((stage, i) =>
      i === index ? { ...stage, status: 'inactive' } : stage
    ));
  }

  function addNewStage() {
    setEditedStages(prev => [
      ...prev,
      {
        id: null,
        tenant_id: tenantId,
        tenant_company_id: activeOperatingCompanyId,
        work_id: activeWorkId,
        name: 'New Stage',
        description: '',
        display_order: prev.length + 1,
        status: 'active',
        created_by: currentUser?.id || null,
        _isNew: true
      }
    ]);
  }

  function restoreStage(index) {
    setEditedStages(prev => prev.map((stage, i) =>
      i === index ? { ...stage, status: 'active' } : stage
    ));
  }

  async function saveStages() {
    if (!activeWorkId || !tenantId) return;

    const activeDrafts = editedStages
      .filter(s => s.status === 'active' && s.name?.trim())
      .map((s, i) => ({ ...s, name: s.name.trim(), display_order: i + 1 }));

    const removedExisting = editedStages.filter(s => s.id && s.status === 'inactive');

    // Normalize duplicate/blank names before touching the database.
    const seenNames = new Set();
    for (const stage of activeDrafts) {
      const key = stage.name.toLowerCase();
      if (!key || seenNames.has(key)) {
        alert(`Duplicate stage name: "${stage.name}". Stage names must be unique within this project.`);
        return;
      }
      seenNames.add(key);
    }

    try {
      // The active display_order index is unique. Move existing active rows out of
      // the way first so reordering cannot collide with another active row.
      const existingActive = stageDefinitions.filter(s => s.status === 'active');
      if (existingActive.length > 0) {
        const offset = 10000;
        for (let i = 0; i < existingActive.length; i++) {
          const { error } = await supabase
            .from('stage_definitions')
            .update({ display_order: offset + i + 1 })
            .eq('id', existingActive[i].id);
          if (error) throw error;
        }
      }

      // Update/create active rows.
      for (const stage of activeDrafts) {
        if (stage.id) {
          const { error } = await supabase
            .from('stage_definitions')
            .update({
              name: stage.name,
              description: stage.description || null,
              display_order: stage.display_order,
              status: 'active'
            })
            .eq('id', stage.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('stage_definitions')
            .insert([{
              tenant_id: tenantId,
              tenant_company_id: stage.tenant_company_id || activeOperatingCompanyId,
              work_id: activeWorkId,
              name: stage.name,
              description: stage.description || null,
              display_order: stage.display_order,
              status: 'active',
              created_by: currentUser?.id || null
            }]);
          if (error) throw error;
        }
      }

      // Removed stages are intentionally deactivated, never deleted.
      for (const stage of removedExisting) {
        const { error } = await supabase
          .from('stage_definitions')
          .update({
            status: 'inactive',
            display_order: stage.display_order
          })
          .eq('id', stage.id);
        if (error) throw error;
      }

      const refreshed = await fetchStageDefinitions(activeWorkId);

      // Keep legacy works.stages synchronized when permitted. If the legacy
      // compatibility column is unavailable/protected, normalized stage data
      // remains authoritative and the failure is non-blocking.
      const legacyStages = refreshed
        .filter(s => s.status === 'active')
        .sort((a, b) => a.display_order - b.display_order)
        .map(s => s.name);

      const legacyResult = await supabase
        .from('works')
        .update({ stages: legacyStages })
        .eq('id', activeWorkId);

      if (!legacyResult.error) {
        setWorks(prev => prev.map(w =>
          w.id === activeWorkId ? { ...w, stages: legacyStages } : w
        ));
      } else {
        console.warn('[Legacy works.stages sync skipped]:', legacyResult.error.message);
      }

      const newActiveIndex = Math.min(
        activeStageIndex,
        Math.max(0, legacyStages.length - 1)
      );
      setActiveStageIndex(newActiveIndex);
      setIsStageManagerOpen(false);
      showToast('Pipeline stages saved successfully.');
    } catch (err) {
      console.error('[Save Stage Definitions Error]:', err);
      alert(`Failed to save pipeline stages: ${err.message || err}`);
      await fetchStageDefinitions(activeWorkId);
    }
  }

  // --- Stage Assignments Handlers (Step 7E application integration) ---

  async function fetchStageAssignments(workId, stageId = null) {
    if (!workId) {
      setStageAssignments([]);
      return [];
    }

    setIsStageAssignmentsLoading(true);
    try {
      let query = supabase
        .from('stage_assignments')
        .select('*')
        .eq('work_id', workId)
        .order('created_at', { ascending: false });

      if (stageId) query = query.eq('stage_id', stageId);

      const { data, error } = await query;

      if (error) {
        console.error('[Supabase Query Error - stage_assignments]:', error);
        setStageAssignments([]);
        return [];
      }

      setStageAssignments(data || []);
      return data || [];
    } catch (err) {
      console.error('[Fetch Stage Assignments Error]:', err);
      setStageAssignments([]);
      return [];
    } finally {
      setIsStageAssignmentsLoading(false);
    }
  }

  function openStageAssignmentModal(stageId) {
    if (!stageId) return;
    setStageAssignmentTargetId(stageId);
    setIsStageAssignmentModalOpen(true);
    fetchStageAssignments(activeWorkId);
  }

  function closeStageAssignmentModal() {
    setIsStageAssignmentModalOpen(false);
    setStageAssignmentTargetId(null);
  }

  async function assignUserToStage({ workId, stageId, userId, stageRole = 'responsible' }) {
    const targetWorkId = workId || activeWorkId;
    const targetStageId = stageId || stageAssignmentTargetId;

    if (!targetWorkId || !targetStageId || !userId) {
      const message = 'Project, stage, and user are required.';
      alert(message);
      return { success: false, message };
    }

    const activeProjectTeam = getActiveProjectAssignments(targetWorkId);
    const isProjectTeamMember = activeProjectTeam.some(a => a.user_id === userId);

    if (!isProjectTeamMember && !['OWNER', 'ADMIN'].includes((tenantRole || '').toUpperCase())) {
      const message = 'Stage assignees must first be assigned to the project team.';
      alert(message);
      return { success: false, message };
    }

    const duplicate = stageAssignments.some(
      a => a.work_id === targetWorkId &&
           a.stage_id === targetStageId &&
           a.user_id === userId &&
           a.status === 'active'
    );

    if (duplicate) {
      const message = 'User is already assigned to this stage.';
      showToast(message);
      return { success: false, message };
    }

    try {
      const targetWork = works.find(w => w.id === targetWorkId);
      const opCoId =
        targetWork?.tenant_company_id ||
        activeOperatingCompanyId ||
        operatingCompanies[0]?.id;

      const { data, error } = await supabase
        .from('stage_assignments')
        .insert([{
          tenant_id: tenantId,
          tenant_company_id: opCoId,
          work_id: targetWorkId,
          stage_id: targetStageId,
          user_id: userId,
          assigned_by: currentUser?.id,
          stage_role: stageRole,
          status: 'active'
        }])
        .select();

      if (error) {
        console.error('[Supabase Insert Error - stage_assignments]:', error);
        const message = error.code === '23505'
          ? 'User is already assigned to this stage.'
          : (error.code === '42501' || error.message?.includes('row-level security')
              ? 'Permission denied: only Managers or the authorized Project Lead can assign stage users.'
              : error.message);
        alert(`Failed to assign stage user: ${message}`);
        return { success: false, error, message };
      }

      await fetchStageAssignments(targetWorkId);
      showToast('User assigned to stage successfully.');
      if (userId && userId !== (currentUser?.id || session?.user?.id)) {
        createNotification({
          recipientId: userId,
          actorId: currentUser?.id || session?.user?.id,
          tenantId,
          tenantCompanyId: opCoId,
          type: 'stage_assigned',
          title: 'Assigned to Pipeline Stage',
          message: `You have been assigned as ${stageRole} to stage on project "${targetWork?.title || 'Project'}".`,
          entityType: 'stage_assignment',
          entityId: data?.[0]?.id || targetWorkId
        });
      }
      return { success: true, data: data?.[0] };
    } catch (err) {
      console.error('[Assign Stage User Error]:', err);
      alert(`Failed to assign stage user: ${err.message || err}`);
      return { success: false, error: err };
    }
  }

  async function endStageAssignment(assignmentId) {
    if (!assignmentId) return { success: false };

    const confirmed = await showConfirm('End this stage assignment?');
    if (!confirmed) return { success: false };

    try {
      const { data, error } = await supabase
        .from('stage_assignments')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', assignmentId)
        .select();

      if (error) {
        console.error('[Supabase Update Error - endStageAssignment]:', error);
        const message = error.code === '42501' || error.message?.includes('row-level security')
          ? 'Permission denied: only Managers or the authorized Project Lead can end stage assignments.'
          : error.message;
        alert(`Failed to end stage assignment: ${message}`);
        return { success: false, error };
      }

      await fetchStageAssignments(activeWorkId);
      showToast('Stage assignment ended.');
      return { success: true, data: data?.[0] };
    } catch (err) {
      console.error('[End Stage Assignment Error]:', err);
      alert(`Failed to end stage assignment: ${err.message || err}`);
      return { success: false, error: err };
    }
  }

  function getStageAssignments(workIdParam, stageIdParam) {
    const targetWork = workIdParam || activeWorkId;
    const targetStage = stageIdParam || stageAssignmentTargetId;
    return (stageAssignments || []).filter(
      a => a.work_id === targetWork &&
           (!targetStage || a.stage_id === targetStage)
    );
  }

  // --- Project Assignments Handlers (Step 7C) ---
  async function fetchProjectAssignments(workId) {
    if (!workId) {
      setProjectAssignments([]);
      return;
    }
    setIsAssignmentsLoading(true);
    try {
      if (!profiles || profiles.length === 0) {
        await fetchProfiles();
      }

      const { data, error } = await supabase
        .from('project_assignments')
        .select('*')
        .eq('work_id', workId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Supabase Query Error - project_assignments]:', error);
        setProjectAssignments([]);
      } else if (data) {
        setProjectAssignments(data);
      }
    } catch (err) {
      console.error('[Fetch Project Assignments Error]:', err);
      setProjectAssignments([]);
    } finally {
      setIsAssignmentsLoading(false);
    }
  }

  async function assignUserToProject({ workId, userId, projectRole = 'member' }) {
    const targetWorkId = workId || activeWorkId;
    if (!targetWorkId) {
      const msg = "No active project selected.";
      alert(msg);
      return { success: false, message: msg };
    }
    if (!userId) {
      const msg = "Please select a user to assign.";
      alert(msg);
      return { success: false, message: msg };
    }
    if (!tenantId) {
      const msg = "Tenant context not found. Please log in again.";
      alert(msg);
      return { success: false, message: msg };
    }

    // Check if user is already actively assigned locally
    const isAlreadyAssigned = (projectAssignments || []).some(
      a => a.work_id === targetWorkId && a.user_id === userId && a.status === 'active'
    );
    if (isAlreadyAssigned) {
      const msg = "User is already assigned to this project.";
      showToast(msg);
      alert(msg);
      return { success: false, message: msg };
    }

    const targetWork = (works || []).find(w => w.id === targetWorkId);
    const targetOpCoId = targetWork?.tenant_company_id || activeOperatingCompanyId || (operatingCompanies || [])[0]?.id;

    if (!targetOpCoId) {
      const msg = "Operating company context missing.";
      alert(msg);
      return { success: false, message: msg };
    }

    const payload = {
      tenant_id: tenantId,
      tenant_company_id: targetOpCoId,
      work_id: targetWorkId,
      user_id: userId,
      assigned_by: currentUser?.id,
      project_role: projectRole,
      status: 'active'
    };

    try {
      const { data, error } = await supabase
        .from('project_assignments')
        .insert([payload])
        .select();

      if (error) {
        console.error('[Supabase Insert Error - project_assignments]:', error);
        let errorMsg = error.message;
        if (error.code === '23505' || error.message?.includes('uq_project_assignments_active_user_work')) {
          errorMsg = "User is already assigned to this project.";
        } else if (error.message?.includes('row-level security') || error.code === '42501') {
          errorMsg = "Permission denied: Only Managers and Admins can assign users to projects.";
        }
        showToast(`Failed to assign user: ${errorMsg}`);
        alert(`Failed to assign user: ${errorMsg}`);
        return { success: false, error, message: errorMsg };
      }

      if (data && data.length > 0) {
        showToast("User assigned to project successfully!");
        await fetchProjectAssignments(targetWorkId);
        if (userId && userId !== (currentUser?.id || session?.user?.id)) {
          createNotification({
            recipientId: userId,
            actorId: currentUser?.id || session?.user?.id,
            tenantId,
            tenantCompanyId: targetOpCoId,
            type: 'project_assigned',
            title: 'Assigned to Project',
            message: `You have been assigned as ${projectRole} to project "${targetWork?.title || 'Project'}".`,
            entityType: 'work',
            entityId: targetWorkId
          });
        }
        return { success: true, data: data[0] };
      }
    } catch (err) {
      console.error('[Assign User Error]:', err);
      showToast(`Unexpected error: ${err.message || err}`);
      return { success: false, error: err };
    }
    return { success: false };
  }

  async function endProjectAssignment(assignmentId) {
    if (!assignmentId) return { success: false };
    const confirmed = await showConfirm("Are you sure you want to end this project assignment?");
    if (!confirmed) return { success: false };

    try {
      const { data, error } = await supabase
        .from('project_assignments')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', assignmentId)
        .select();

      if (error) {
        console.error('[Supabase Update Error - endProjectAssignment]:', error);
        let errorMsg = error.message;
        if (error.message?.includes('row-level security') || error.code === '42501') {
          errorMsg = "Permission denied: Only Managers and Admins can end project assignments.";
        }
        showToast(`Failed to end assignment: ${errorMsg}`);
        alert(`Failed to end assignment: ${errorMsg}`);
        return { success: false, error };
      }

      if (data && data.length > 0) {
        showToast("Project assignment ended.");
        await fetchProjectAssignments(activeWorkId);
        return { success: true, data: data[0] };
      }
    } catch (err) {
      console.error('[End Assignment Error]:', err);
      showToast(`Unexpected error: ${err.message || err}`);
      return { success: false, error: err };
    }
    return { success: false };
  }

  function getActiveProjectAssignments(workIdParam) {
    const targetId = workIdParam || activeWorkId;
    return (projectAssignments || []).filter(a => a.status === 'active' && (!targetId || a.work_id === targetId));
  }

  async function fetchTasks(workIdParam = activeWorkId, targetOpCoId = activeOperatingCompanyId) {
    if (!workIdParam || !tenantId) {
      setTasks([]);
      return [];
    }
    setIsTasksLoading(true);
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('work_id', workIdParam)
        .order('created_at', { ascending: false });

      if (targetOpCoId) query = query.eq('tenant_company_id', targetOpCoId);

      const { data, error } = await query;
      if (error) {
        console.error('[Supabase Query Error - tasks]:', error);
        setTasks([]);
        return [];
      }
      setTasks(data || []);
      return data || [];
    } catch (err) {
      console.error('[Fetch Tasks Error]:', err);
      setTasks([]);
      return [];
    } finally {
      setIsTasksLoading(false);
    }
  }

  async function fetchTaskAssignees(taskId) {
    if (!taskId || !tenantId) {
      setTaskAssignees([]);
      return [];
    }
    setIsTaskAssigneesLoading(true);
    try {
      const { data, error } = await supabase
        .from('task_assignees')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('task_id', taskId)
        .order('status', { ascending: true })
        .order('assigned_at', { ascending: false });
      if (error) {
        console.error('[Supabase Query Error - task_assignees]:', error);
        setTaskAssignees([]);
        return [];
      }
      setTaskAssignees(data || []);
      return data || [];
    } catch (err) {
      console.error('[Fetch Task Assignees Error]:', err);
      setTaskAssignees([]);
      return [];
    } finally {
      setIsTaskAssigneesLoading(false);
    }
  }

  function canManageTask(workId = activeWorkId) {
    const normalizedTenantRole = (tenantRole || '').toUpperCase();
    if (['OWNER', 'ADMIN', 'MANAGER'].includes(normalizedTenantRole) || userRole === 'admin') return true;
    return getActiveProjectAssignments(workId).some(assignment =>
      assignment.user_id === currentUser?.id &&
      assignment.status === 'active' &&
      assignment.project_role === 'lead'
    );
  }

  function openNewTask() {
    if (!activeWorkId) {
      showToast('Select a project before creating a task.');
      return;
    }
    if (!canManageTask(activeWorkId)) {
      showToast('Only Managers or the active Project Lead can manage tasks.');
      return;
    }
    setEditingTaskId(null);
    setTaskForm({
      title: '', description: '', status: 'not_started', priority: 'medium', due_date: '', stage_id: ''
    });
    setTaskAssignees([]);
    setTaskAssigneeForm({ user_id: '', role: 'assignee' });
    setIsTaskEditorOpen(true);
    fetchProjectAssignments(activeWorkId);
  }

  function openEditTask(task) {
    setEditingTaskId(task.id);
    setTaskForm({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'not_started',
      priority: task.priority || 'medium',
      due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '',
      stage_id: task.stage_id || ''
    });
    setTaskAssigneeForm({ user_id: '', role: 'assignee' });
    setIsTaskEditorOpen(true);
    fetchTaskAssignees(task.id);
    fetchProjectAssignments(task.work_id || activeWorkId);
  }

  function closeTaskEditor() {
    setIsTaskEditorOpen(false);
    setEditingTaskId(null);
    setTaskAssignees([]);
    setTaskAssigneeForm({ user_id: '', role: 'assignee' });
  }

  async function saveTask() {
    const title = taskForm.title.trim();
    const targetWork = (works || []).find(work => work.id === activeWorkId);
    if (!title || !targetWork || !tenantId) {
      showToast('Task title, project, and tenant context are required.');
      return { success: false };
    }
    if (!canManageTask(activeWorkId)) {
      showToast('Only Managers or the active Project Lead can manage tasks.');
      return { success: false };
    }

    const selectedStage = taskForm.stage_id
      ? (stageDefinitions || []).find(stage => stage.id === taskForm.stage_id && stage.work_id === activeWorkId)
      : null;
    if (taskForm.stage_id && !selectedStage) {
      showToast('Selected stage does not belong to the active project.');
      return { success: false };
    }

    const targetOpCoId =
      targetWork?.tenant_company_id ||
      (companies || []).find(c => c.id === targetWork?.company_id)?.tenant_company_id ||
      activeOperatingCompanyId ||
      (operatingCompanies || [])[0]?.id ||
      null;

    if (!targetOpCoId) {
      showToast('Failed to save task: Could not resolve operating company context.');
      return { success: false };
    }

    let parsedDueDate = null;
    if (taskForm.due_date) {
      const d = new Date(taskForm.due_date);
      if (!isNaN(d.getTime())) {
        parsedDueDate = d.toISOString();
      }
    }

    const payload = {
      tenant_id: tenantId,
      tenant_company_id: targetOpCoId,
      work_id: activeWorkId,
      stage_id: selectedStage?.id || null,
      title,
      description: taskForm.description.trim() || null,
      status: taskForm.status,
      priority: taskForm.priority,
      due_date: parsedDueDate
    };

    console.log('[saveTask Diagnostic Request]:', {
      table: 'tasks',
      payload,
      created_by: currentUser?.id || session?.user?.id || null
    });

    try {
      let response;
      if (editingTaskId) {
        response = await supabase.from('tasks').update({
          stage_id: payload.stage_id,
          title: payload.title,
          description: payload.description,
          status: payload.status,
          priority: payload.priority,
          due_date: payload.due_date
        }).eq('id', editingTaskId).eq('tenant_id', tenantId).eq('work_id', activeWorkId).select('*');
      } else {
        response = await supabase.from('tasks').insert([{ ...payload, created_by: currentUser?.id || session?.user?.id || null }]).select('*');
      }

      if (response.error) {
        console.error('[Supabase Mutation Error - tasks]:', response.error);
        let errorMsg = response.error.message;
        if (response.error.message?.includes('row-level security') || response.error.code === '42501') {
          errorMsg = "Permission denied to save task.";
        }
        showToast(`Failed to save task: ${errorMsg}`);
        return { success: false, error: response.error };
      }

      await fetchTasks(activeWorkId, activeOperatingCompanyId);
      showToast(editingTaskId ? 'Task updated.' : 'Task created.');
      closeTaskEditor();
      return { success: true, data: response.data?.[0] };
    } catch (err) {
      console.error('[Save Task Exception]:', err);
      showToast(`Failed to save task: ${err.message || err}`);
      return { success: false, error: err };
    }
  }

  function getEligibleTaskAssignees(taskId = editingTaskId) {
    const task = (tasks || []).find(item => item.id === taskId);
    const targetWorkId = task?.work_id || activeWorkId;
    const activeMembers = getActiveProjectAssignments(targetWorkId);
    return activeMembers
      .map(member => {
        const tm = (tenantMembers || []).find(m =>
          (m.user_id && String(m.user_id).trim().toLowerCase() === String(member.user_id).trim().toLowerCase()) ||
          (m.id && String(m.id).trim().toLowerCase() === String(member.user_id).trim().toLowerCase())
        );
        const email = tm?.email || tm?.user_email || tm?.invited_email || tm?.member_email ||
          getUserDisplayName(member.user_id, profiles, tenantMembers);
        return {
          user_id: member.user_id,
          email,
          project_role: member.project_role
        };
      })
      .filter((member, index, all) => all.findIndex(item => item.user_id === member.user_id) === index);
  }

  async function assignUserToTask({ taskId = editingTaskId, userId, role = 'assignee' }) {
    const task = (tasks || []).find(item => item.id === taskId);
    if (!task || !tenantId || !userId) {
      alert('Task and assignee are required.');
      return { success: false };
    }
    if (!canManageTask(task.work_id)) {
      alert('Only Managers or the active Project Lead can manage task assignees.');
      return { success: false };
    }

    const activeProjectMember = getActiveProjectAssignments(task.work_id).some(member => member.user_id === userId);
    if (!activeProjectMember) {
      alert('Task assignees must be active project members.');
      return { success: false };
    }

    if (role === 'accountable') {
      const existingAccountable = (taskAssignees || []).some(assignment => assignment.status === 'active' && assignment.role === 'accountable');
      if (existingAccountable) {
        alert('Only one active accountable assignee is allowed per task.');
        return { success: false };
      }
      if (task.stage_id) {
        const stageEligible = (stageAssignments || []).some(assignment =>
          assignment.status === 'active' && assignment.work_id === task.work_id && assignment.stage_id === task.stage_id && assignment.user_id === userId
        );
        if (!stageEligible) {
          alert('A stage-specific accountable assignee must have an active assignment to that stage.');
          return { success: false };
        }
      }
    }

    const duplicate = (taskAssignees || []).some(assignment => assignment.status === 'active' && assignment.user_id === userId && assignment.role === role);
    if (duplicate) {
      showToast('This user already has that active task role.');
      return { success: false };
    }

    const targetWork = (works || []).find(work => work.id === task.work_id);
    const assignedUserId = userId;
    const authenticatedUserId = currentUser?.id || session?.user?.id;
    const targetTenantCompanyId = task.tenant_company_id || targetWork?.tenant_company_id || activeOperatingCompanyId;

    console.log('[TASK ASSIGN TRACE 1] assignment requested', {
      taskId: task.id,
      assignedUserId,
      role
    });

    const assignPayload = {
      tenant_id: task.tenant_id || tenantId,
      tenant_company_id: targetTenantCompanyId,
      task_id: task.id,
      user_id: assignedUserId,
      role,
      status: 'active',
      assigned_by: authenticatedUserId
    };

    console.log('[TASK ASSIGN TRACE 2] inserting task_assignee', assignPayload);

    try {
      const { data, error } = await supabase.from('task_assignees').insert([assignPayload]).select();
      
      console.log('[TASK ASSIGN TRACE 3] task_assignee result', {
        data,
        error
      });

      if (error) {
        console.error('[Supabase Mutation Error - task_assignees]:', error);
        alert(`Failed to assign task user: ${error.message}`);
        return { success: false, error };
      }
      await fetchTaskAssignees(task.id);
      showToast('Task assignee added.');

      // AFTER and ONLY AFTER task_assignees INSERT succeeds, execute notification INSERT
      if (assignedUserId && assignedUserId !== authenticatedUserId) {
        const notifPayload = {
          tenant_id: task.tenant_id || tenantId,
          tenant_company_id: targetTenantCompanyId,
          recipient_id: assignedUserId,
          actor_id: authenticatedUserId,
          type: 'task_assigned',
          title: 'New Task Assigned',
          message: `You have been assigned a task: ${task.title}`,
          entity_type: 'task',
          entity_id: task.id,
          is_read: false
        };

        console.log('[TASK NOTIF TRACE 1] creating notification', {
          recipient_id: assignedUserId,
          actor_id: authenticatedUserId,
          task_id: task.id,
          tenant_company_id: targetTenantCompanyId
        });

        const { data: notifData, error: notifError } = await supabase
          .from('notifications')
          .insert([notifPayload])
          .select();

        console.log('[TASK NOTIF TRACE 2] notification result', {
          data: notifData,
          error: notifError
        });

        if (notifError) {
          console.error('[Supabase Mutation Error - notification insert failed]:', {
            message: notifError.message,
            details: notifError.details,
            hint: notifError.hint,
            code: notifError.code
          });
        }
      } else if (assignedUserId === authenticatedUserId) {
        console.log('[NOTIF EVENT] skipped self-assignment notification for actor:', authenticatedUserId);
      }

      return { success: true, data: data?.[0] };
    } catch (err) {
      console.error('[Assign Task User Error]:', err);
      alert(`Failed to assign task user: ${err.message || err}`);
      return { success: false, error: err };
    }
  }

  async function endTaskAssignment(assignmentId) {
    if (!assignmentId) return { success: false };
    if (!canManageTask()) {
      alert('Only Managers or the active Project Lead can end task assignments.');
      return { success: false };
    }
    const confirmed = await showConfirm('End this task assignment?');
    if (!confirmed) return { success: false };
    try {
      const { data, error } = await supabase.from('task_assignees').update({
        status: 'ended',
        ended_by: currentUser?.id,
        ended_at: new Date().toISOString()
      }).eq('id', assignmentId).eq('tenant_id', tenantId).select();
      if (error) {
        console.error('[Supabase Mutation Error - end task assignment]:', error);
        alert(`Failed to end task assignment: ${error.message}`);
        return { success: false, error };
      }
      await fetchTaskAssignees(editingTaskId);
      showToast('Task assignment ended.');
      return { success: true, data: data?.[0] };
    } catch (err) {
      console.error('[End Task Assignment Error]:', err);
      alert(`Failed to end task assignment: ${err.message || err}`);
      return { success: false, error: err };
    }
  }

  async function fetchReminders(targetOpCoId, authGeneration) {
    if (authGeneration !== undefined && !isCurrentAuthInitialization(authGeneration)) return;
    const opCoId = targetOpCoId !== undefined ? targetOpCoId : activeOperatingCompanyId;
    const userId = currentUser?.id || session?.user?.id;

    let query = supabase
      .from('reminders')
      .select(`*, companies!fk_reminders_company_scoped(name), units!fk_reminders_unit_scoped(name), works!fk_reminders_work_scoped(title, po_number, wo_number)`)
      .order('created_at', { ascending: false });

    if (opCoId) {
      query = query.eq('tenant_company_id', opCoId);
    }

    if (userId) {
      query = query.or(`created_by.eq.${userId},created_by.is.null`);
    }

    const { data, error } = await query;
    if (authGeneration !== undefined && !isCurrentAuthInitialization(authGeneration)) return;
    if (error) {
      console.error('[Supabase Query Error - reminders]:', error);
      showToast(`Failed to fetch personal reminders: ${error.message}`);
      return;
    }
    if (data) setReminders(data);
  }

  // --- Notifications Functions (Phase 3) ---
  async function fetchNotifications(targetOpCoId, authGeneration) {
    if (authGeneration !== undefined && !isCurrentAuthInitialization(authGeneration)) return;
    const opCoId = targetOpCoId !== undefined ? targetOpCoId : activeOperatingCompanyId;
    const authUserId = currentUser?.id || session?.user?.id;

    console.log('[NOTIF TRACE 3] fetchNotifications called:', { opCoId, authGeneration, authUserId });

    if (!authUserId) {
      console.warn('[NOTIFICATIONS DEBUG] No authenticated user yet');
      setNotifications([]);
      return;
    }

    console.log('[NOTIF TRACE 4] querying recipient:', authUserId, 'opCoId:', opCoId);

    setIsNotificationsLoading(true);
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', authUserId)
        .order('created_at', { ascending: false });

      if (opCoId) {
        query = query.eq('tenant_company_id', opCoId);
      }

      const { data, error } = await query;

      if (authGeneration !== undefined && !isCurrentAuthInitialization(authGeneration)) return;

      console.log('[NOTIF TRACE 5] query result:', { count: data?.length, error, data });

      if (error) {
        console.warn('[Supabase Query Notice - notifications]:', error.message);
        setNotifications([]);
      } else if (data) {
        console.log('[NOTIF TRACE 6] setting notifications:', data?.length);
        setNotifications(data);
      }
    } catch (err) {
      console.warn('[Fetch Notifications Notice]:', err);
      setNotifications([]);
    } finally {
      setIsNotificationsLoading(false);
    }
  }

  async function markNotificationAsRead(notificationId) {
    if (!notificationId) return;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .select();

      if (error) {
        console.error('[Supabase Mutation Error - mark notification read]:', error);
        showToast(`Failed to mark notification as read: ${error.message}`);
        return { success: false, error };
      }
      setNotifications(prev => (prev || []).map(n => n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n));
      return { success: true, data: data?.[0] };
    } catch (err) {
      console.error('[Mark Notification Read Error]:', err);
      return { success: false, error: err };
    }
  }

  async function markAllNotificationsAsRead() {
    const userId = currentUser?.id || session?.user?.id;
    if (!userId) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('recipient_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('[Supabase Mutation Error - mark all notifications read]:', error);
        showToast(`Failed to mark notifications as read: ${error.message}`);
        return { success: false, error };
      }
      setNotifications(prev => (prev || []).map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
      return { success: true };
    } catch (err) {
      console.error('[Mark All Notifications Read Error]:', err);
      return { success: false, error: err };
    }
  }

  async function createNotification({
    recipientId,
    actorId,
    tenantId: overrideTenantId,
    tenantCompanyId: overrideTenantCompanyId,
    type,
    title,
    message,
    entityType,
    entityId
  }) {
    if (!recipientId) return { success: false, reason: 'No recipientId provided' };

    const actor = actorId || currentUser?.id || session?.user?.id || null;
    const tId = overrideTenantId || tenantId || null;
    const tcId = overrideTenantCompanyId || activeOperatingCompanyId || null;

    const payload = {
      recipient_id: recipientId,
      actor_id: actor,
      tenant_id: tId,
      tenant_company_id: tcId,
      type: type || 'system',
      title: title || 'Notification',
      message: message || '',
      entity_type: entityType || null,
      entity_id: entityId || null,
      is_read: false,
      created_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase.from('notifications').insert([payload]).select();
      if (error) {
        console.warn('[Supabase Notification Trigger Notice]:', error.message);
        return { success: false, error };
      }
      console.log('[NOTIF EVENT] notification inserted:', data?.[0]);
      return { success: true, data: data?.[0] };
    } catch (err) {
      console.warn('[Notification Trigger Exception]:', err);
      return { success: false, error: err };
    }
  }

  async function fetchMissingData(targetOpCoId, authGeneration) {
    if (authGeneration !== undefined && !isCurrentAuthInitialization(authGeneration)) return;
    const opCoId = targetOpCoId !== undefined ? targetOpCoId : activeOperatingCompanyId;
    let query = supabase
      .from('works')
      .select('id, title, company_id, unit_id, po_number, wo_number, boq_url')
      .or('po_number.eq."",po_number.is.null,wo_number.eq."",wo_number.is.null,boq_url.eq."",boq_url.is.null');

    if (opCoId) {
      query = query.eq('tenant_company_id', opCoId);
    }

    const { data, error } = await query;
    if (authGeneration !== undefined && !isCurrentAuthInitialization(authGeneration)) return;
    if (error) {
      console.error('[Supabase Query Error - missingData]:', error);
      return;
    }
    if (data) setMissingData(data);
  }

  function navigateToContext(companyId, unitId, workId, issueId = null, stageName = null) {
    if (companyId) setActiveCompanyId(companyId);
    if (unitId) setActiveUnitId(unitId);
    if (workId) setActiveWorkId(workId);
    
    if (issueId) { 
      setCenterView('issues'); 
      setActiveIssueId(issueId);
    } else { 
      setCenterView('pipeline');
      if (stageName) {
        setPendingNav({ workId, stageName });
        // Immediate jump if work is already active and loaded
        const targetWork = works.find(w => w.id === workId);
        if (targetWork && targetWork.stages) {
          const idx = targetWork.stages.indexOf(stageName);
          if (idx !== -1) {
            setActiveStageIndex(idx);
          }
        }
      }
    }
  }

  // --- Custom Modals Helpers ---
  const showPrompt = (title, placeholder = '', defaultValue = '') => {
    return new Promise((resolve) => setPromptModal({ isOpen: true, title, placeholder, defaultValue, resolvePromise: resolve }));
  };

  const closePrompt = (value) => {
    if (promptModal.resolvePromise) promptModal.resolvePromise(value);
    setPromptModal({ isOpen: false, title: '', placeholder: '', defaultValue: '', resolvePromise: null });
  };

  const showConfirm = (message) => {
    return new Promise((resolve) => setConfirmModal({ isOpen: true, message, resolvePromise: resolve }));
  };

  const closeConfirm = (value) => {
    if (confirmModal.resolvePromise) confirmModal.resolvePromise(value);
    setConfirmModal({ isOpen: false, message: '', resolvePromise: null });
  };

  // --- Reminders Handlers ---
  function openGlobalReminderModal() { 
    setReminderForm({ content: '', target_date: '', company_id: '', unit_id: '', work_id: '', log_id: '', stage_name: '' }); 
    setModalUnits([]); 
    setModalWorks([]); 
    setIsReminderModalOpen(true); 
  }

  function openReminderForLog(log) {
    setReminderForm({ 
      content: `Follow up on: "${(log.content || '').substring(0, 40)}..."`, 
      target_date: '', 
      company_id: activeCompanyId || '', 
      unit_id: activeUnitId || '', 
      work_id: activeWorkId || '',
      log_id: log.id, 
      stage_name: log.stage_name || ''
    });
    supabase.from('units').select('*').eq('company_id', activeCompanyId).then(({data}) => setModalUnits(data||[]));
    supabase.from('works').select('*').eq('unit_id', activeUnitId).then(({data}) => setModalWorks(data||[]));
    setIsReminderModalOpen(true);
  }

  async function handleModalCompanyChange(compId) { 
    setReminderForm({ ...reminderForm, company_id: compId, unit_id: '', work_id: '' }); 
    const { data } = await supabase.from('units').select('*').eq('company_id', compId); 
    setModalUnits(data || []); 
    setModalWorks([]); 
  }

  async function handleModalUnitChange(uId) { 
    setReminderForm({ ...reminderForm, unit_id: uId, work_id: '' }); 
    const { data } = await supabase.from('works').select('*').eq('unit_id', uId); 
    setModalWorks(data || []); 
  }

  async function submitReminder(e) {
    e.preventDefault();
    if (!reminderForm.content.trim()) return;

    const selectedWork = (modalWorks || []).find(w => w.id === reminderForm.work_id) || (works || []).find(w => w.id === reminderForm.work_id);
    const selectedCompany = (companies || []).find(c => c.id === reminderForm.company_id);
    const activeWorkObj = (works || []).find(w => w.id === activeWorkId);
    const activeCompanyObj = (companies || []).find(c => c.id === activeCompanyId);

    const resolvedTenantCompanyId =
      selectedWork?.tenant_company_id ||
      selectedCompany?.tenant_company_id ||
      activeWorkObj?.tenant_company_id ||
      activeCompanyObj?.tenant_company_id ||
      activeOperatingCompanyId ||
      (operatingCompanies || [])[0]?.id ||
      null;

    if (!resolvedTenantCompanyId) {
      showToast("Failed to save scheduled task: Could not resolve operating company context. Please select a company.");
      return;
    }

    const payload = {
      tenant_id: tenantId || null,
      tenant_company_id: resolvedTenantCompanyId,
      created_by: currentUser?.id || session?.user?.id || null,
      content: reminderForm.content.trim(),
      target_date: reminderForm.target_date || null,
      company_id: reminderForm.company_id || null,
      unit_id: reminderForm.unit_id || null,
      work_id: reminderForm.work_id || null,
      log_id: reminderForm.log_id || null,
      stage_name: reminderForm.stage_name || null
    };

    const { data, error } = await supabase
      .from('reminders')
      .insert([payload])
      .select(`*, companies!fk_reminders_company_scoped(name), units!fk_reminders_unit_scoped(name), works!fk_reminders_work_scoped(title, po_number, wo_number)`);

    if (error) {
      console.error('[Supabase Mutation Error - reminders]:', error);
      let errorMsg = error.message;
      if (error.message?.includes('row-level security') || error.code === '42501') {
        errorMsg = "Permission denied to save scheduled task.";
      }
      showToast(`Failed to save scheduled task: ${errorMsg}`);
      return;
    }

    if (data && data.length > 0) {
      setReminders([data[0], ...(reminders || [])]);
      setIsReminderModalOpen(false);
      showToast("Scheduled task saved successfully.");
      fetchReminders(activeOperatingCompanyId);
    }
  }

  async function toggleReminder(id, currentStatus) {
    const { data, error } = await supabase.from('reminders').update({ is_completed: !currentStatus }).eq('id', id).select(`*, companies!fk_reminders_company_scoped(name), units!fk_reminders_unit_scoped(name), works!fk_reminders_work_scoped(title, po_number, wo_number)`);
    if (error) {
      console.error('[Supabase Mutation Error - toggle reminder]:', error);
      showToast(`Failed to update task: ${error.message}`);
      return;
    }
    if (data && data.length > 0) setReminders((reminders || []).map(r => r.id === id ? data[0] : r));
  }

  async function handleDeleteReminder(id) {
    const confirmed = await showConfirm("Move this task to the Recycle Bin?");
    if (!confirmed) return;
    const { data, error } = await supabase.from('reminders').update({ is_deleted: true }).eq('id', id).select(`*, companies!fk_reminders_company_scoped(name), units!fk_reminders_unit_scoped(name), works!fk_reminders_work_scoped(title, po_number, wo_number)`);
    if (error) {
      console.error('[Supabase Mutation Error - delete reminder]:', error);
      showToast(`Failed to move task to Recycle Bin: ${error.message}`);
      return;
    }
    if (data && data.length > 0) setReminders((reminders || []).map(r => r.id === id ? data[0] : r));
  }

  async function handleRestoreReminder(id) {
    const { data, error } = await supabase.from('reminders').update({ is_deleted: false }).eq('id', id).select(`*, companies!fk_reminders_company_scoped(name), units!fk_reminders_unit_scoped(name), works!fk_reminders_work_scoped(title, po_number, wo_number)`);
    if (error) {
      console.error('[Supabase Mutation Error - restore reminder]:', error);
      showToast(`Failed to restore task: ${error.message}`);
      return;
    }
    if (data && data.length > 0) setReminders((reminders || []).map(r => r.id === id ? data[0] : r));
  }

  async function handlePermanentDeleteReminder(id) { 
    if (userRole !== 'admin') return alert("Only Admins can permanently delete tasks."); 
    const confirmed = await showConfirm("Permanently delete this task?");
    if (!confirmed) return; 
    const { error } = await supabase.from('reminders').delete().eq('id', id); 
    if (error) {
      console.error('[Supabase Mutation Error - permanent delete reminder]:', error);
      showToast(`Failed to permanently delete task: ${error.message}`);
      return;
    }
    setReminders((reminders || []).filter(r => r.id !== id));
  }

  // --- Issues Handlers ---
  async function handleAddIssue(e) { 
    e.preventDefault(); 
    if (!issueTitleInput.trim() || !activeWorkId) return; 
    const { data } = await supabase.from('issues').insert([{ work_id: activeWorkId, title: issueTitleInput, status: 'open' }]).select(); 
    if (data) { 
      setIssues([data[0], ...issues]); 
      setActiveIssueId(data[0].id); 
      setIssueTitleInput(''); 
      setIsIssueModalOpen(false);
    } 
  }

  async function toggleIssueStatus(id, currentStatus) { 
    const newStatus = currentStatus === 'open' ? 'resolved' : 'open'; 
    const { data } = await supabase.from('issues').update({ status: newStatus }).eq('id', id).select(); 
    if (data) setIssues(issues.map(i => i.id === id ? data[0] : i));
  }

  // --- Logs Handlers ---
  async function handleAddLog(e) {
    if (e && e.preventDefault) e.preventDefault(); 
    if ((!logInput.trim() && !attachment) || !activeWorkId) return; 

    const activeWork = works.find(w => w.id === activeWorkId);
    const resolvedTenantCompanyId =
      activeWork?.tenant_company_id ||
      activeOperatingCompanyId ||
      operatingCompanies?.[0]?.id ||
      null;

    if (!tenantId || !resolvedTenantCompanyId) {
      const msg = "Operating company context could not be resolved. Please refresh or select the project again.";
      console.error('[CrmContext] Cannot post log without tenant and company context:', {
        tenantId,
        resolvedTenantCompanyId,
        activeWorkId,
        activeOperatingCompanyId,
        operatingCompaniesCount: operatingCompanies?.length
      });
      showToast(msg);
      alert(msg);
      return;
    }

    setIsUploading(true); 
    
    const resolvedStageName = centerView === 'pipeline'
      ? (activeStageDefinitions[activeStageIndex]?.name || activeWork?.stages?.[activeStageIndex] || 'General')
      : 'Issue';

    let payload = {
      tenant_id: tenantId,
      tenant_company_id: resolvedTenantCompanyId,
      work_id: activeWorkId,
      content: logInput || (attachment ? `Attached file: ${attachment.name}` : "Attached a file."),
      attachment_url: null, // Legacy column remains for historical data; new uploads use R2 file_attachments
      stage_name: resolvedStageName
    };

    if (centerView !== 'pipeline') { 
      if (!activeIssueId) { 
        setIsUploading(false); 
        const issueMsg = "Select an issue first.";
        showToast(issueMsg);
        alert(issueMsg);
        return;
      }
      payload.issue_id = activeIssueId;
    }
    
    const { data, error } = await supabase.from('logs').insert([payload]).select(); 
    if (error) {
      console.error('[CrmContext] Supabase log insert error:', error);
      const isPermission =
        error.code === '42501' ||
        error.message?.toLowerCase().includes('permission') ||
        error.message?.toLowerCase().includes('policy') ||
        error.message?.toLowerCase().includes('security');
      const errorMsg = isPermission
        ? "Unable to post log: you do not have permission to add logs for this project."
        : `Unable to post log: ${error.message || 'Unknown error'}`;
      showToast(errorMsg);
      alert(errorMsg);
      setIsUploading(false);
      return;
    }

    if (data && data[0]) { 
      const newLog = data[0];

      // If a file was attached, upload directly to Cloudflare R2 via business-file-storage
      if (attachment) {
        try {
          const r2Attachment = await uploadBusinessAttachment({
            tenantCompanyId: resolvedTenantCompanyId,
            entityType: 'log',
            entityId: newLog.id,
            fieldKey: 'attachment',
            file: attachment
          });
          newLog.r2_attachment = r2Attachment;
        } catch (uploadErr) {
          console.error('[CrmContext] Error uploading log attachment to R2:', uploadErr);
          showToast(`Log saved, but file attachment failed: ${uploadErr.message}`);
        }
      }

      setLogs([newLog, ...(logs || [])]); 
      setLogInput(''); 
      setAttachment(null);
    }
    setIsUploading(false);
  }

  // --- AI HANDLER ---
  // Ask Google which Gemini models are currently available instead of
  // hard-coding an old model name. This prevents the CRM from breaking
  // when Google retires or changes a model.
  // Multi-Model Fallback for Google Gemini API
  async function getAvailableGeminiModels(apiKey) {
    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models',
        { method: 'GET', headers: { 'x-goog-api-key': apiKey } }
      );
      const data = await response.json();
      if (response.ok && data.models) {
        const validModels = data.models
          .filter(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
          .map(m => m.name.replace(/^models\//, ''));

        const preferred = [
          'gemini-2.5-flash',
          'gemini-2.0-flash',
          'gemini-1.5-flash',
          'gemini-1.5-pro',
          'gemini-2.5-pro',
          'gemini-2.0-flash-lite'
        ];

        const candidateList = [];
        for (const p of preferred) {
          if (validModels.includes(p)) candidateList.push(p);
        }
        for (const v of validModels) {
          if (!candidateList.includes(v) && !v.includes('embedding') && !v.includes('image') && !v.includes('audio') && !v.includes('tts') && !v.includes('live')) {
            candidateList.push(v);
          }
        }
        if (candidateList.length > 0) return candidateList;
      }
    } catch (e) {
      console.warn("Could not fetch Gemini model list:", e);
    }
    return ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  }

  // Helper to filter out internal scratchpad reasoning, metadata, and draft markers
  function cleanGeminiOutput(rawText) {
    if (!rawText) return '';
    let text = rawText.trim();

    // Strip XML style thinking tags <thought>...</thought>
    text = text.replace(/<thought>[\s\S]*?<\/thought>/gi, '').trim();

    // If response contains internal scratchpad markers (* Role:, * Task:, * Draft 1:, * Refining...:)
    if (text.includes('* Role:') || text.includes('* Task:') || text.includes('* Draft') || text.includes('* Constraint:') || text.includes('Refining for')) {
      // Look for the refined final output after "Refining for...:" or "Draft 1:" or "Final Summary:"
      const refiningIndex = text.lastIndexOf('Refining for');
      if (refiningIndex !== -1) {
        const afterRefining = text.substring(refiningIndex);
        const colonIdx = afterRefining.indexOf(':*');
        if (colonIdx !== -1) {
          text = afterRefining.substring(colonIdx + 2).trim();
        } else {
          const normalColon = afterRefining.indexOf(':');
          if (normalColon !== -1) text = afterRefining.substring(normalColon + 1).trim();
        }
      } else {
        const lines = text.split('\n');
        const cleanLines = lines.filter(line => {
          const l = line.trim();
          return !l.startsWith('* Role:') &&
                 !l.startsWith('* Task:') &&
                 !l.startsWith('* Input Data:') &&
                 !l.startsWith('* Constraint:') &&
                 !l.startsWith('* Draft') &&
                 !l.startsWith('* *Refining') &&
                 !l.startsWith('* *Status:*') &&
                 !l.startsWith('* *Risk') &&
                 !l.startsWith('* *Action Items') &&
                 !l.startsWith('* *Governance');
        });
        text = cleanLines.join('\n').trim();
      }
    }

    // Clean leading metadata block if present
    text = text.replace(/^(\* (Role|Task|Input Data|Constraint|Draft \d+|Status|Risk\/Roadblock|Action Items|Governance):[^\n]*\n?)+/gi, '').trim();

    return text || rawText.trim();
  }

  async function callGeminiWithFallback(prompt, apiKey, systemInstruction = null) {
    const candidateModels = await getAvailableGeminiModels(apiKey);
    let lastErrorMessage = '';

    for (const model of candidateModels) {
      try {
        const requestBody = {
          contents: [{ parts: [{ text: prompt }] }]
        };

        if (systemInstruction) {
          requestBody.systemInstruction = {
            parts: [{ text: systemInstruction }]
          };
        }

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey
            },
            body: JSON.stringify(requestBody)
          }
        );

        const data = await res.json();
        if (res.ok && data.candidates?.[0]?.content?.parts) {
          const parts = data.candidates[0].content.parts.filter(p => !p.thought);
          const partsToUse = parts.length > 0 ? parts : data.candidates[0].content.parts;
          let text = partsToUse.map(p => p.text || '').join('').trim();
          text = cleanGeminiOutput(text);
          if (text) return text;
        }

        if (data.error) {
          lastErrorMessage = data.error.message || `Error ${res.status}`;
          console.warn(`Gemini Model ${model} responded with error: ${lastErrorMessage}. Attempting next model fallback...`);
        }
      } catch (err) {
        lastErrorMessage = err.message;
        console.warn(`Gemini Model ${model} network error: ${err.message}. Attempting next model fallback...`);
      }
    }
    throw new Error(lastErrorMessage || "High demand on Google servers. Please try again shortly.");
  }

  async function handleSummarizeProject() {
    if (!activeWorkId) return;
    const projectLogs = logs.filter(l => !l.is_deleted).map(l => l.content);
    if (projectLogs.length === 0) return alert("No logs available to summarize.");

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setAiSummary("Gemini API key is missing. Check your .env.local file and restart the Vite server.");
      return;
    }

    setIsAiLoading(true);
    setAiSummary('Analyzing project updates with Google Gemini...');

    const prompt = `Project Update Logs:\n${projectLogs.map(l => `- ${l}`).join('\n')}\n\nProvide a direct 2-3 sentence executive summary paragraph summarizing progress, open roadblocks, and next actions.`;
    const systemInstruction = `You are RAJIV CRM's Senior Engineering Project Lead. Output ONLY the final 2-3 sentence summary paragraph directly. Never include internal thoughts, role definitions, task breakdowns, draft markers, or meta-commentary.`;

    try {
      const summaryText = await callGeminiWithFallback(prompt, apiKey, systemInstruction);
      setAiSummary(summaryText);
    } catch (err) {
      console.error("Gemini Error:", err);
      setAiSummary(`Gemini Error: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  }

  function handleClearAiChat() {
    setAiChatMessages([
      {
        id: Date.now().toString(),
        sender: 'ai',
        text: 'Chat history cleared. How can I help you today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }

  async function handleSendAiChatMessage(userMessageText) {
    if (!userMessageText || !userMessageText.trim()) return;

    const trimmedMsg = userMessageText.trim();
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmedMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiChatMessages(prev => [...prev, userMsg]);
    setIsAiChatSending(true);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Error: Gemini API key is missing. Please check your .env.local file.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAiChatMessages(prev => [...prev, errorMsg]);
      setIsAiChatSending(false);
      return;
    }

    // Fetch complete database context for multi-project / all-project reporting
    let allWorksSummary = '';
    try {
      const [{ data: allWorksData }, { data: allIssuesData }, { data: allLogsData }] = await Promise.all([
        supabase.from('works').select('id, title, po_number, wo_number, stages, boq_url, created_at, companies(name), units(name)'),
        supabase.from('issues').select('id, title, status, work_id'),
        supabase.from('logs').select('id, content, stage_name, work_id, created_at, is_deleted').eq('is_deleted', false).order('created_at', { ascending: false }).limit(50)
      ]);

      if (allWorksData && allWorksData.length > 0) {
        allWorksSummary = allWorksData.map((w, idx) => {
          const compName = w.companies?.name || 'N/A';
          const uName = w.units?.name || 'N/A';
          const pLogs = (allLogsData || []).filter(l => l.work_id === w.id).map(l => `[${l.stage_name || 'Update'}]: ${l.content}`);
          const pIssues = (allIssuesData || []).filter(i => i.work_id === w.id && i.status === 'open').map(i => i.title);
          
          return `Project #${idx + 1}: "${w.title}" | Client: ${compName} | Unit: ${uName}
   PO #: ${w.po_number || 'Missing'} | WO #: ${w.wo_number || 'Missing'} | BOQ: ${w.boq_url ? 'Attached' : 'Missing'}
   Stages: ${w.stages ? w.stages.join(' -> ') : 'None'}
   Open Snags (${pIssues.length}): ${pIssues.join(', ') || 'None'}
   Recent Logs (${pLogs.length}): ${pLogs.slice(0, 5).join(' | ') || 'No logs yet'}`;
        }).join('\n\n');
      }
    } catch (e) {
      console.warn("Failed to fetch full portfolio context:", e);
    }

    const currentCompany = companies.find(c => c.id === activeCompanyId);
    const currentUnit = units.find(u => u.id === activeUnitId);
    const currentWork = works.find(w => w.id === activeWorkId);
    const activeStage = currentWork?.stages?.[activeStageIndex];
    const pendingTasks = reminders.filter(r => !r.is_completed && !r.is_deleted).map(r => r.content);
    const missingAlerts = missingData.map(m => `${m.title} (Missing: ${[!m.po_number ? 'PO' : '', !m.wo_number ? 'WO' : '', !m.boq_url ? 'BOQ' : ''].filter(Boolean).join(', ')})`);

    const contextSummary = `
CURRENTLY SELECTED PROJECT FOCUS:
Client: ${currentCompany ? currentCompany.name : 'None selected'}
Unit: ${currentUnit ? currentUnit.name : 'None selected'}
Project: ${currentWork ? `${currentWork.title} (PO: ${currentWork.po_number || 'N/A'}, WO: ${currentWork.wo_number || 'N/A'})` : 'None selected'}
Stage: ${activeStage || 'N/A'}

ALL PROJECTS PORTFOLIO (DATABASE SNAPSHOT):
${allWorksSummary || 'No projects found in database.'}

CRM SYSTEM ALERTS & TASKS:
Action Required / Missing Data Projects (${missingAlerts.length}): ${missingAlerts.join('; ') || 'None'}
Pending Tasks (${pendingTasks.length}): ${pendingTasks.slice(0, 10).join(' | ') || 'None'}
Registered Clients: ${companies.map(c => c.name).join(', ') || 'None'}
`;

    const systemInstruction = `You are RAJIV CRM's Executive Assistant.

STRICT DIRECTIVES FOR YOUR RESPONSE:
1. Output ONLY your direct answer to the user's request. NEVER output internal thoughts, chain-of-thought reasoning, prompt breakdowns, role definitions, or meta text (such as "User Input:", "Context Provided:", "Goal:", "Looking through...").
2. SPECIFIC PROJECT INQUIRIES (e.g. "what is the status of PB14"): Look up that specific project in the context and output ONLY a clean 2-4 sentence status update for THAT project (Client, Unit, PO/WO status, stage, open snags, recent activity). DO NOT list or mention unrelated projects.
3. EMAIL DRAFTING INQUIRIES (e.g. "create a mail to Vaibhav regarding last activity"): Output ONLY the complete, ready-to-send email (Subject, Recipient, Salutation, Body, Sign-off). Do not include chat filler before or after the email draft.
4. PORTFOLIO / ALL PROJECTS REPORTS: Provide a clear, clean executive summary of all projects without step-by-step reasoning steps.`;

    const prompt = `CRM DATABASE CONTEXT:
${contextSummary}

USER REQUEST: ${trimmedMsg}`;

    try {
      const replyText = await callGeminiWithFallback(prompt, apiKey, systemInstruction);

      const aiReply = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAiChatMessages(prev => [...prev, aiReply]);
    } catch (err) {
      console.error('Gemini Chat Error:', err);
      const errorReply = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `AI Error: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAiChatMessages(prev => [...prev, errorReply]);
    } finally {
      setIsAiChatSending(false);
    }
  }


  function startEditingLog(log) { 
    if (userRole !== 'admin' && (log.edit_count || 0) >= 3) return alert("Edit limit reached."); 
    setEditingLogId(log.id); 
    setEditLogContent(log.content);
  }

  async function saveLogEdit(log) {
    if (editLogContent.trim() === log.content) { 
      setEditingLogId(null); 
      return; 
    }
    const newHistoryEntry = { content: log.content, changed_at: new Date().toISOString() }; 
    const updatedHistory = [...(log.previous_versions || []), newHistoryEntry];
    
    const { data } = await supabase.from('logs').update({ content: editLogContent, edit_count: (log.edit_count || 0) + 1, previous_versions: updatedHistory }).eq('id', log.id).select();
    if (data) { 
      setLogs((logs || []).map(l => l.id === log.id ? data[0] : l)); 
      setEditingLogId(null);
    }
  }
  
  async function handleDeleteLog(id) { 
    const confirmed = await showConfirm("Move this log to the Recycle Bin?");
    if (!confirmed) return; 
    const { data } = await supabase.from('logs').update({ is_deleted: true }).eq('id', id).select(); 
    if (data) setLogs((logs || []).map(l => l.id === id ? data[0] : l));
  }

  async function handleRestoreLog(id) { 
    const { data } = await supabase.from('logs').update({ is_deleted: false }).eq('id', id).select(); 
    if (data) { 
      setLogs((logs || []).map(l => l.id === id ? data[0] : l)); 
      if ((logs || []).filter(l=>l.is_deleted).length <= 1) setIsBinModalOpen(false);
    } 
  }

  async function handlePermanentDeleteLog(id) { 
    if (userRole !== 'admin') return alert("Only Admins can permanently delete logs."); 
    const confirmed = await showConfirm("Proceed with permanent deletion?");
    if (!confirmed) return; 
    const { error } = await supabase.from('logs').delete().eq('id', id); 
    if (!error) { 
      setLogs((logs || []).filter(l => l.id !== id)); 
      if ((logs || []).filter(l=>l.is_deleted).length <= 1) setIsBinModalOpen(false);
    } 
  }

  // --- Hierarchy Handlers ---
  async function handleAddCompany() { 
    const rawName = await showPrompt("Add New Client", "Enter Client name...");
    if (!rawName || !rawName.trim()) return;
    const name = rawName.trim();
    try {
      const { data, error } = await supabase.from('companies').insert([{ name }]).select();
      if (error) {
        console.error("Error adding company:", error);
        showToast(`Failed to add client: ${error.message}`);
        alert(`Error adding client: ${error.message}`);
        return;
      }
      if (data && data.length > 0) { 
        setCompanies(prev => [...prev, data[0]]); 
        setActiveCompanyId(data[0].id);
        showToast(`Client "${data[0].name}" added successfully!`);
      } 
    } catch (err) {
      console.error("Unexpected error adding company:", err);
      showToast(`Error: ${err.message || err}`);
    }
  }

  async function handleAddUnit(targetCompanyIdParam = null) { 
    const targetCompanyId = targetCompanyIdParam || activeCompanyId;
    if (!targetCompanyId) {
      alert("Please select or create a client company first.");
      return;
    }
    const rawName = await showPrompt("Add New Unit", "Enter Unit name...");
    if (!rawName || !rawName.trim()) return;
    const name = rawName.trim();
    try {
      const { data, error } = await supabase.from('units').insert([{ company_id: targetCompanyId, name }]).select();
      if (error) {
        console.error("Error adding unit:", error);
        showToast(`Failed to add unit: ${error.message}`);
        alert(`Error adding unit: ${error.message}`);
        return;
      }
      if (data && data.length > 0) { 
        if (targetCompanyId === activeCompanyId) {
          setUnits(prev => [...prev, data[0]]); 
        }
        setActiveCompanyId(targetCompanyId);
        setActiveUnitId(data[0].id);
        showToast(`Unit "${data[0].name}" added successfully!`);
      } 
    } catch (err) {
      console.error("Unexpected error adding unit:", err);
      showToast(`Error: ${err.message || err}`);
    }
  }

  async function handleRenameCompany(id, oldName) { 
    const rawName = await showPrompt("Rename Client", "Enter new name...", oldName);
    if (!rawName || !rawName.trim() || rawName.trim() === oldName) return;
    const newName = rawName.trim();
    try {
      const { error } = await supabase.from('companies').update({ name: newName }).eq('id', id);
      if (error) {
        console.error("Error renaming company:", error);
        showToast(`Failed to rename client: ${error.message}`);
        alert(`Error renaming client: ${error.message}`);
        return;
      }
      setCompanies(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c));
      showToast("Client renamed successfully!");
    } catch (err) {
      console.error("Unexpected error renaming company:", err);
      showToast(`Error: ${err.message || err}`);
    }
  }

  async function handleDeleteCompany(id) { 
    const confirmed = await showConfirm("WARNING: Are you sure you want to delete this company and all its associated data?");
    if (!confirmed) return; 
    try {
      const { error } = await supabase.from('companies').delete().eq('id', id); 
      if (error) {
        console.error("Error deleting company:", error);
        showToast(`Failed to delete client: ${error.message}`);
        alert(`Error deleting client: ${error.message}`);
        return;
      }
      setCompanies(prev => prev.filter(c => c.id !== id)); 
      if (activeCompanyId === id) { 
        setActiveCompanyId(null); 
        setActiveUnitId(null); 
        setActiveWorkId(null);
      } 
      showToast("Client deleted successfully");
    } catch (err) {
      console.error("Unexpected error deleting company:", err);
      showToast(`Error: ${err.message || err}`);
    }
  }

  async function handleRenameUnit(id, oldName) { 
    const rawName = await showPrompt("Rename Unit", "Enter new name...", oldName);
    if (!rawName || !rawName.trim() || rawName.trim() === oldName) return;
    const newName = rawName.trim();
    try {
      const { error } = await supabase.from('units').update({ name: newName }).eq('id', id);
      if (error) {
        console.error("Error renaming unit:", error);
        showToast(`Failed to rename unit: ${error.message}`);
        alert(`Error renaming unit: ${error.message}`);
        return;
      }
      setUnits(prev => prev.map(u => u.id === id ? { ...u, name: newName } : u));
      showToast("Unit renamed successfully!");
    } catch (err) {
      console.error("Unexpected error renaming unit:", err);
      showToast(`Error: ${err.message || err}`);
    }
  }

  async function handleDeleteUnit(id) { 
    const confirmed = await showConfirm("WARNING: Are you sure you want to delete this unit and all its associated data?");
    if (!confirmed) return; 
    try {
      const { error } = await supabase.from('units').delete().eq('id', id); 
      if (error) {
        console.error("Error deleting unit:", error);
        showToast(`Failed to delete unit: ${error.message}`);
        alert(`Error deleting unit: ${error.message}`);
        return;
      }
      setUnits(prev => prev.filter(u => u.id !== id)); 
      if (activeUnitId === id) { 
        setActiveUnitId(null); 
        setActiveWorkId(null);
      } 
      showToast("Unit deleted successfully");
    } catch (err) {
      console.error("Unexpected error deleting unit:", err);
      showToast(`Error: ${err.message || err}`);
    }
  }

  function openNewWorkModal() {
    if (!activeUnitId) {
      showToast('Select a Client Unit before creating a project.');
      return;
    }
    setEditingWorkId(null);
    setWorkForm({ title: '', po_number: '', wo_number: '', boq_url: '', po_file_url: '', wo_file_url: '' }); 
    setBoqFile(null); 
    setPoFile(null);
    setWoFile(null);
    setIsWorkModalOpen(true);
  }

  function openEditWorkModal(work) { 
    setEditingWorkId(work.id);
    setWorkForm({ 
      title: work.title, 
      po_number: work.po_number || '', 
      wo_number: work.wo_number || '', 
      boq_url: work.boq_url || '',
      po_file_url: work.po_file_url || '',
      wo_file_url: work.wo_file_url || ''
    }); 
    setBoqFile(null); 
    setPoFile(null);
    setWoFile(null);
    setIsWorkModalOpen(true);
  }
  
  async function submitWork(e) {
    e.preventDefault(); 
    if (!activeUnitId) {
      showToast('Select a Client Unit before creating a project.');
      return;
    }

    // --- 1. STRICT DATA VALIDATION ---
    const trimmedTitle = workForm.title?.trim() || '';
    const trimmedPO = workForm.po_number?.trim() || '';
    const trimmedWO = workForm.wo_number?.trim() || '';

    if (!trimmedTitle) {
      showToast('Validation Error: System / Title cannot be empty.');
      return;
    }

    // Check for duplicate PO Number
    if (trimmedPO) {
      const isDuplicatePO = works.some(w => w.po_number === trimmedPO && w.id !== editingWorkId);
      if (isDuplicatePO) {
        showToast(`Duplicate Found: The PO Number "${trimmedPO}" is already assigned to another project.`);
        return;
      }
    }

    // Check for duplicate WO Number
    if (trimmedWO) {
      const isDuplicateWO = works.some(w => w.wo_number === trimmedWO && w.id !== editingWorkId);
      if (isDuplicateWO) {
        showToast(`Duplicate Found: The WO Number "${trimmedWO}" is already assigned to another project.`);
        return;
      }
    }
    // --- END VALIDATION ---

    setIsWorkUploading(true); 
    let finalBoqUrl = workForm.boq_url || null;
    
    // Live works table schema has title, po_number, wo_number, boq_url.
    // It DOES NOT have po_file_url or wo_file_url.
    // PO, WO, and BOQ document files are stored in file_attachments via R2 business-file-storage.
    const payload = { 
      title: trimmedTitle, 
      po_number: trimmedPO, 
      wo_number: trimmedWO, 
      boq_url: finalBoqUrl
    };
    
    let targetWorkId = editingWorkId;

    if (editingWorkId) { 
      let { data, error } = await supabase.from('works').update(payload).eq('id', editingWorkId).select(); 
      if (error) {
        console.error('[Supabase Mutation Error - works update]:', error);
        let errorMsg = error.message;
        if (error.message?.includes('row-level security') || error.code === '42501') {
          errorMsg = "Permission denied to update project.";
        }
        showToast(`Failed to save project: ${errorMsg}`);
        setIsWorkUploading(false);
        return;
      }
      if (data && data.length > 0) {
        targetWorkId = data[0].id;
        setWorks(works.map(w => w.id === editingWorkId ? data[0] : w));
      }
    } else {
      let { data, error } = await supabase.from('works').insert([{
        unit_id: activeUnitId,
        company_id: activeCompanyId,
        tenant_company_id: activeOperatingCompanyId || null,
        tenant_id: tenantId || null,
        ...payload
      }]).select();
      if (error) {
        console.error('[Supabase Mutation Error - works insert]:', error);
        let errorMsg = error.message;
        if (error.message?.includes('row-level security') || error.code === '42501') {
          errorMsg = "Permission denied to create project.";
        }
        showToast(`Failed to create project: ${errorMsg}`);
        setIsWorkUploading(false);
        return;
      }
      if (data && data.length > 0) { 
        targetWorkId = data[0].id;
        setWorks([...works, data[0]]); 
        setActiveWorkId(data[0].id); 
      } 
    }

    // Upload newly selected files directly to Cloudflare R2
    const targetTenantCoId = activeOperatingCompanyId || activeWork?.tenant_company_id || null;

    if (poFile && targetWorkId) {
      try {
        const existingAtts = editingWorkId ? await listBusinessAttachments({
          entityType: 'work',
          entityId: targetWorkId,
          fieldKey: 'po',
          includeArchived: false
        }) : [];
        const oldAtt = Array.isArray(existingAtts) && existingAtts.length > 0 ? existingAtts[0] : null;

        if (oldAtt?.id) {
          await replaceBusinessAttachment({
            tenantCompanyId: targetTenantCoId,
            entityType: 'work',
            entityId: targetWorkId,
            fieldKey: 'po',
            file: poFile,
            oldAttachmentId: oldAtt.id
          });
        } else {
          await uploadBusinessAttachment({
            tenantCompanyId: targetTenantCoId,
            entityType: 'work',
            entityId: targetWorkId,
            fieldKey: 'po',
            file: poFile
          });
        }
      } catch (err) {
        console.error('[CrmContext] Error uploading PO to R2:', err);
        showToast(`Warning: Project saved but PO upload failed: ${err.message}`);
      }
    }

    if (woFile && targetWorkId) {
      try {
        const existingAtts = editingWorkId ? await listBusinessAttachments({
          entityType: 'work',
          entityId: targetWorkId,
          fieldKey: 'wo',
          includeArchived: false
        }) : [];
        const oldAtt = Array.isArray(existingAtts) && existingAtts.length > 0 ? existingAtts[0] : null;

        if (oldAtt?.id) {
          await replaceBusinessAttachment({
            tenantCompanyId: targetTenantCoId,
            entityType: 'work',
            entityId: targetWorkId,
            fieldKey: 'wo',
            file: woFile,
            oldAttachmentId: oldAtt.id
          });
        } else {
          await uploadBusinessAttachment({
            tenantCompanyId: targetTenantCoId,
            entityType: 'work',
            entityId: targetWorkId,
            fieldKey: 'wo',
            file: woFile
          });
        }
      } catch (err) {
        console.error('[CrmContext] Error uploading WO to R2:', err);
        showToast(`Warning: Project saved but WO upload failed: ${err.message}`);
      }
    }

    if (boqFile && targetWorkId) {
      try {
        const existingAtts = editingWorkId ? await listBusinessAttachments({
          entityType: 'work',
          entityId: targetWorkId,
          fieldKey: 'boq',
          includeArchived: false
        }) : [];
        const oldAtt = Array.isArray(existingAtts) && existingAtts.length > 0 ? existingAtts[0] : null;

        if (oldAtt?.id) {
          await replaceBusinessAttachment({
            tenantCompanyId: targetTenantCoId,
            entityType: 'work',
            entityId: targetWorkId,
            fieldKey: 'boq',
            file: boqFile,
            oldAttachmentId: oldAtt.id
          });
        } else {
          await uploadBusinessAttachment({
            tenantCompanyId: targetTenantCoId,
            entityType: 'work',
            entityId: targetWorkId,
            fieldKey: 'boq',
            file: boqFile
          });
        }
      } catch (err) {
        console.error('[CrmContext] Error uploading BOQ to R2:', err);
        showToast(`Warning: Project saved but BOQ upload failed: ${err.message}`);
      }
    }

    setPoFile(null);
    setWoFile(null);
    setBoqFile(null);
    setIsWorkModalOpen(false);
    setIsWorkUploading(false);
    fetchMissingData();
    showToast(editingWorkId ? "Project updated successfully." : "Project created successfully.");
  }

  /**
   * Universal Preview for Work Attachments (PO, WO, BOQ)
   * Resolves R2 signed download URL from file_attachments, falling back to legacy URL.
   */
  async function openWorkAttachmentPreview(workId, fieldKey, title = 'Document Preview', fallbackUrl = null) {
    if (!workId) return;
    try {
      const attachments = await listBusinessAttachments({
        entityType: 'work',
        entityId: workId,
        fieldKey
      });
      if (attachments && attachments.length > 0) {
        const downloadRes = await createBusinessAttachmentDownloadUrl({
          attachmentId: attachments[0].id
        });
        if (downloadRes?.download_url) {
          openDocPreview(downloadRes.download_url, `${title} (${attachments[0].file_name})`);
          return;
        }
      }
    } catch (err) {
      console.warn('[CrmContext] Notice resolving R2 preview for work:', err.message);
    }

    if (fallbackUrl) {
      openDocPreview(fallbackUrl, title);
    } else {
      showToast(`No ${fieldKey.toUpperCase()} document attached.`);
    }
  }

  /**
   * Universal Preview for Log Attachments
   * Resolves R2 signed download URL from file_attachments, falling back to legacy attachment_url.
   */
  async function viewLogAttachment(log) {
    if (!log) return;
    if (log.r2_attachment?.id) {
      try {
        const res = await createBusinessAttachmentDownloadUrl({
          attachmentId: log.r2_attachment.id
        });
        if (res?.download_url) {
          openDocPreview(res.download_url, log.r2_attachment.file_name || 'Log Attachment');
          return;
        }
      } catch (e) {
        console.warn('Failed to get download URL for log attachment:', e);
      }
    }

    try {
      const list = await listBusinessAttachments({
        entityType: 'log',
        entityId: log.id,
        fieldKey: 'attachment'
      });
      if (list && list.length > 0) {
        const res = await createBusinessAttachmentDownloadUrl({
          attachmentId: list[0].id
        });
        if (res?.download_url) {
          openDocPreview(res.download_url, list[0].file_name || 'Log Attachment');
          return;
        }
      }
    } catch (_) {}

    if (log.attachment_url) {
      openDocPreview(log.attachment_url, 'Log Attachment');
    } else {
      showToast('No attachment found for this log.');
    }
  }

  async function handleDeleteWork(id) { 
    const confirmed = await showConfirm("Delete this project?");
    if (!confirmed) return; 
    await supabase.from('works').delete().eq('id', id); 
    setWorks(works.filter(w => w.id !== id)); 
    if (activeWorkId === id) setActiveWorkId(null);
    fetchMissingData();
  }

  async function handleSearch(e) { 
    const query = typeof e === 'string' ? e : e?.target?.value || ''; 
    setSearchQuery(query); 
    if (query.trim().length < 2) { 
      setSearchResults([]); 
      return;
    } 
    const q = query.trim();
    try {
      const [compRes, unitRes, workRes, contRes, enqRes] = await Promise.all([
        supabase.from('companies').select('id, name').ilike('name', `%${q}%`).limit(3),
        supabase.from('units').select('id, name, company_id').ilike('name', `%${q}%`).limit(3),
        supabase.from('works').select('id, title, wo_number, po_number, company_id, unit_id').or(`wo_number.ilike.%${q}%,po_number.ilike.%${q}%,title.ilike.%${q}%`).limit(5),
        supabase.from('contacts').select('id, name, email, phone, company_id, unit_id').or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`).limit(3),
        supabase.from('enquiries').select('id, title, status, company_id, contact_id').or(`title.ilike.%${q}%,description.ilike.%${q}%`).limit(3)
      ]);

      const combined = [
        ...(compRes.data || []).map(item => ({ ...item, result_type: 'company', label: item.name, subtext: 'Customer Company' })),
        ...(unitRes.data || []).map(item => ({ ...item, result_type: 'unit', label: item.name, subtext: 'Client Unit' })),
        ...(workRes.data || []).map(item => ({ ...item, result_type: 'project', label: item.title, subtext: item.po_number ? `PO: ${item.po_number}` : (item.wo_number ? `WO: ${item.wo_number}` : 'Project') })),
        ...(contRes.data || []).map(item => ({ ...item, result_type: 'contact', label: item.name, subtext: item.email || item.phone || 'Contact' })),
        ...(enqRes.data || []).map(item => ({ ...item, result_type: 'enquiry', label: item.title, subtext: `Enquiry (${item.status || 'new'})` }))
      ];

      setSearchResults(combined);
    } catch (err) {
      console.error('[Search Error]:', err);
    }
  }

  async function jumpToSearchResult(result) { 
    setSearchQuery(''); 
    setSearchResults([]); 
    if (!result) return;
    if (result.result_type === 'company') {
      setActiveCompanyId(result.id);
    } else if (result.result_type === 'unit') {
      navigateToContext(result.company_id, result.id, null);
    } else if (result.result_type === 'project') {
      navigateToContext(result.company_id, result.unit_id, result.id);
    } else if (result.result_type === 'contact') {
      if (result.company_id) setActiveCompanyId(result.company_id);
      if (result.unit_id) setActiveUnitId(result.unit_id);
      setCenterView('contacts');
    } else if (result.result_type === 'enquiry') {
      if (result.company_id) setActiveCompanyId(result.company_id);
      setCenterView('enquiries');
    } else {
      navigateToContext(result.company_id, result.unit_id, result.id);
    }
  }

  function openMoveLogModal(log) {
    setMoveLogModal({ isOpen: true, log });
  }

  async function handleMoveLogStage(logId, targetStageName) {
    if (!targetStageName) return;
    const { data, error } = await supabase.from('logs').update({ stage_name: targetStageName }).eq('id', logId).select();
    if (error) {
      alert("Error moving log: " + error.message);
      return;
    }
    if (data) {
      setLogs(prev => prev.filter(l => l.id !== logId));
      setMoveLogModal({ isOpen: false, log: null });
    }
  }

  function openEditReminderModal(reminder) {
    setEditReminderModal({ isOpen: true, reminder });
    setEditReminderForm({
      content: reminder.content || '',
      target_date: reminder.target_date ? new Date(reminder.target_date).toISOString().slice(0, 16) : ''
    });
  }

  async function handleSaveReminderEdit(reminderId, newContent, newTargetDate) {
    const currentReminder = (reminders || []).find(r => r.id === reminderId);
    if (!currentReminder) return;

    let history = currentReminder.reschedule_history || [];
    if (typeof history === 'string') {
      try { history = JSON.parse(history); } catch (e) { history = []; }
    }
    if (!Array.isArray(history)) history = [];

    const newEntry = {
      previous_content: currentReminder.content,
      previous_date: currentReminder.target_date,
      rescheduled_at: new Date().toISOString()
    };
    const updatedHistory = [...history, newEntry];

    let payload = {
      content: newContent,
      target_date: newTargetDate || null,
      reschedule_history: updatedHistory
    };

    let { data, error } = await supabase.from('reminders').update(payload).eq('id', reminderId).select(`*, companies!fk_reminders_company_scoped(name), units!fk_reminders_unit_scoped(name), works!fk_reminders_work_scoped(title, po_number, wo_number)`);

    // Schema Cache Fallback: If remote DB lacks reschedule_history column, fallback to content & target_date only!
    if (error && (error.message?.includes('reschedule_history') || error.code === 'PGRST204')) {
      console.warn("reschedule_history column not found in database schema cache. Falling back to content & target_date update.");
      const fallbackRes = await supabase.from('reminders').update({
        content: newContent,
        target_date: newTargetDate || null
      }).eq('id', reminderId).select(`*, companies!fk_reminders_company_scoped(name), units!fk_reminders_unit_scoped(name), works!fk_reminders_work_scoped(title, po_number, wo_number)`);
      
      data = fallbackRes.data;
      error = fallbackRes.error;
    }

    if (error) {
      alert("Error updating task: " + error.message);
      return;
    }

    if (data && data.length > 0) {
      const updatedItem = { ...data[0], reschedule_history: updatedHistory };
      setReminders((reminders || []).map(r => r.id === reminderId ? updatedItem : r));
      setEditReminderModal({ isOpen: false, reminder: null });
    }
  }

  const value = {
    // Authenticated Context & Tenant Foundation (Step 1, 2, 3, 4, 9, 10)
    session,
    currentUser,
    authLoading,
    tenantId,
    tenantMembership,
    tenantRole,
    operatingCompanies,
    activeOperatingCompanyId,
    activeOperatingCompany,
    setActiveOperatingCompanyId,
    fetchOperatingCompanies,
    clientCompanies: companies,
    activeClientCompanyId: activeCompanyId,

    // Project Assignments Foundation (Step 7C)
    projectAssignments,
    isAssignmentsLoading,
    isProjectTeamModalOpen,
    setIsProjectTeamModalOpen,
    fetchProjectAssignments,
    assignUserToProject,
    endProjectAssignment,
    getActiveProjectAssignments,
    tasks,
    isTasksLoading,
    isTaskEditorOpen,
    setIsTaskEditorOpen,
    editingTaskId,
    taskForm,
    setTaskForm,
    taskAssignees,
    isTaskAssigneesLoading,
    taskAssigneeForm,
    setTaskAssigneeForm,
    fetchTasks,
    fetchTaskAssignees,
    openNewTask,
    openEditTask,
    closeTaskEditor,
    saveTask,
    getEligibleTaskAssignees,
    assignUserToTask,
    endTaskAssignment,
    // Stage Definitions / Stage Assignments
    stageDefinitions,
    isStageDefinitionsLoading,
    stageAssignments,
    isStageAssignmentsLoading,
    isStageAssignmentModalOpen,
    stageAssignmentTargetId,
    fetchStageDefinitions,
    fetchStageAssignments,
    openStageAssignmentModal,
    closeStageAssignmentModal,
    assignUserToStage,
    endStageAssignment,
    getStageAssignments,

    tenantMembers,
    isFetchingTenantMembers,
    fetchTenantMembers,

    // Notifications (Phase 3)
    notifications,
    isNotificationsLoading,
    unreadNotificationsCount: (notifications || []).filter(n => !n.is_read).length,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    createNotification,

    isDarkMode, setIsDarkMode, onSignOut, userRole, isSidebarOpen, setIsSidebarOpen, companies, activeCompanyId, setActiveCompanyId, units, activeUnitId, setActiveUnitId, works, activeWorkId, setActiveWorkId,
    fontSize, setFontSize, increaseFontSize, decreaseFontSize, docPreviewModal, openDocPreview, closeDocPreview,
    centerView, setCenterView, rightView, setRightView, isWorkModalOpen, setIsWorkModalOpen, editingWorkId, workForm, setWorkForm, boqFile, setBoqFile, poFile, setPoFile, woFile, setWoFile, isWorkUploading,
    isStageManagerOpen, setIsStageManagerOpen, editedStages, activeStageIndex, setActiveStageIndex, issues, activeIssueId, setActiveIssueId, isIssueModalOpen, setIsIssueModalOpen, issueTitleInput, setIssueTitleInput,
    logs, logInput, setLogInput, editingLogId, setEditingLogId, editLogContent, setEditLogContent, historyLog, setHistoryLog, isBinModalOpen, setIsBinModalOpen, attachment, setAttachment, isUploading,
    reminders, missingData, isReminderModalOpen, setIsReminderModalOpen, reminderForm, setReminderForm, modalUnits, modalWorks, searchQuery, setSearchQuery, searchResults, promptModal, closePrompt, confirmModal, closeConfirm,
    isAdminPanelOpen, setIsAdminPanelOpen, profiles, setProfiles, isFetchingProfiles, fetchProfiles, handleUpdateUserRole, handleApproveUser, handleTerminateUser, handleAdminCreateUser,
    moveLogModal, setMoveLogModal, openMoveLogModal, handleMoveLogStage,
    editReminderModal, setEditReminderModal, editReminderForm, setEditReminderForm, openEditReminderModal, handleSaveReminderEdit,
    refreshAllData, toastMessage, showToast,
    
    // CRM P0 Exports (Contacts, Enquiries, Follow-ups)
    contacts, isContactsLoading, isContactModalOpen, setIsContactModalOpen, editingContact, contactForm, setContactForm, fetchContacts, saveContact, handleDeleteContact, openNewContactModal, openEditContactModal,
    enquiries, isEnquiriesLoading, isEnquiryModalOpen, setIsEnquiryModalOpen, editingEnquiry, enquiryForm, setEnquiryForm, fetchEnquiries, saveEnquiry, handleDeleteEnquiry, openNewEnquiryModal, openEditEnquiryModal,
    followUps, isFollowUpsLoading, isFollowUpModalOpen, setIsFollowUpModalOpen, editingFollowUp, followUpForm, setFollowUpForm, fetchFollowUps, saveFollowUp, toggleFollowUpStatus, handleDeleteFollowUp, openNewFollowUpModal, openEditFollowUpModal,

    // CRM Workspace & Customer Lifecycle Exports
    crmSummary, isCrmWorkspaceLoading, crmWorkspaceError, fetchCrmWorkspace,
    selectedCustomerId, setSelectedCustomerId, openCustomerWorkspace, closeCustomerWorkspace,
    isCustomerModalOpen, setIsCustomerModalOpen, editingCustomer, customerForm, setCustomerForm,
    handleUpsertCustomerProfile, openNewCustomerModal, openEditCustomerModal, closeCustomerModal,

    // My Profile V1 Exports
    myProfile, setMyProfile, myProfileMembership, setMyProfileMembership, isMyProfileLoading, myProfileError, fetchMyProfile, updateMyProfile,

    getUserDisplayName: (userOrId, p, tm, cu) => getUserDisplayName(userOrId, (p && p.length) ? p : profiles, (tm && tm.length) ? tm : tenantMembers, cu || currentUser),
    navigateToContext, openGlobalReminderModal, openReminderForLog, handleModalCompanyChange, handleModalUnitChange, submitReminder, toggleReminder, handleDeleteReminder, handleRestoreReminder, handlePermanentDeleteReminder,
    handleAddIssue, toggleIssueStatus, handleAddLog, startEditingLog, saveLogEdit, handleDeleteLog, handleRestoreLog, handlePermanentDeleteLog, handleAddCompany, handleAddUnit, handleRenameCompany, handleDeleteCompany, handleRenameUnit, handleDeleteUnit,
    openNewWorkModal, openEditWorkModal, submitWork, handleDeleteWork, openWorkAttachmentPreview, viewLogAttachment, openStageManager, updateStageName, moveStage, removeStage, addNewStage, saveStages, handleSearch, jumpToSearchResult, aiSummary, setAiSummary, isAiLoading, handleSummarizeProject,
    isAiChatOpen, setIsAiChatOpen, aiChatMessages, setAiChatMessages, isAiChatSending, handleSendAiChatMessage, handleClearAiChat
  };

  return (
    <CrmContext.Provider value={value}>
      {children}
    </CrmContext.Provider>
  );
}