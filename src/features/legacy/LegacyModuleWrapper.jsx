import { useNavigate } from 'react-router-dom';
import BusinessOSWorkspace from '../../components/BusinessOSWorkspace';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function LegacyModuleWrapper({ initialPage = 'dashboard', bannerInfo }) {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>
      {bannerInfo && (
        <div style={{
          background: 'var(--bos-accent-muted)',
          borderBottom: '1px solid var(--bos-accent)',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          fontSize: 12,
          color: 'var(--bos-text-primary)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={14} style={{ color: 'var(--bos-accent)' }} />
            <span style={{ fontWeight: 500 }}>{bannerInfo.message}</span>
          </div>
          <button
            className="bos-btn bos-btn-primary bos-btn-sm"
            onClick={() => navigate(bannerInfo.targetPath)}
            style={{ padding: '3px 10px', fontSize: 12 }}
          >
            <span>{bannerInfo.buttonText}</span>
            <ArrowRight size={12} />
          </button>
        </div>
      )}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <BusinessOSWorkspace initialPage={initialPage} />
      </div>
    </div>
  );
}
