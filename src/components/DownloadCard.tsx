import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Download, Cpu, Code, FileText, Layers, Activity, Check, CheckCircle2, Shield, FolderDown, ArrowUpRight
} from 'lucide-react';
import { DownloadAsset } from '../types';

interface DownloadCardProps {
  asset: DownloadAsset;
  onDownloadStart?: (id: string) => void;
  downloadAction?: () => Promise<string | undefined>;
  isRestricted?: boolean;
}

export default function DownloadCard({ asset, onDownloadStart, downloadAction, isRestricted = false }: DownloadCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (downloading) return;
    if (onDownloadStart) {
      onDownloadStart(asset.id);
    }

    setDownloadError(null);
    setDownloading(true);
    setProgress(0);
    setCompleted(false);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 5;
      if (currentProgress >= 100) {
        currentProgress = 100;
      }
      setProgress(currentProgress);
    }, 120);

    try {
      let downloadUrl: string | undefined;

      if (downloadAction) {
        downloadUrl = await downloadAction();
      } else if (asset.downloadPath) {
        const baseUrl = (import.meta as any).env?.BASE_URL || window.location.origin || '/';
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
        const cleanPath = asset.downloadPath.startsWith('/') ? asset.downloadPath.slice(1) : asset.downloadPath;
        downloadUrl = encodeURI(`${cleanBaseUrl}${cleanPath}`);
      }

      if (downloadUrl) {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', asset.name);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error('Unable to resolve download URL.');
      }

      setProgress(100);
      setCompleted(true);
    } catch (error: any) {
      setDownloadError(error?.message || 'Download failed.');
    } finally {
      clearInterval(interval);
      setDownloading(false);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'cpu': return <Cpu className="h-4.5 w-4.5" />;
      case 'code': return <Code className="h-4.5 w-4.5" />;
      case 'file-text': return <FileText className="h-4.5 w-4.5" />;
      case 'layers': return <Layers className="h-4.5 w-4.5" />;
      case 'waveform': return <Activity className="h-4.5 w-4.5" />;
      default: return <Download className="h-4.5 w-4.5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Restricted':
        return (
          <span className="font-mono text-[8px] font-bold text-amber-400 bg-amber-400/5 px-1.5 py-0.5 rounded border border-amber-400/10 uppercase tracking-widest flex items-center gap-1">
            <Shield className="h-2 w-2" /> Restricted
          </span>
        );
      case 'Official':
        return (
          <span className="font-mono text-[8px] font-bold text-[#a78bfa] bg-[#a78bfa]/5 px-1.5 py-0.5 rounded border border-[#a78bfa]/10 uppercase tracking-widest">
            Official
          </span>
        );
      default:
        return (
          <span className="font-mono text-[8px] font-bold text-emerald-400 bg-emerald-400/5 px-1.5 py-0.5 rounded border border-emerald-400/10 uppercase tracking-widest">
            Verified
          </span>
        );
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01, borderColor: 'rgba(167, 139, 250, 0.2)' }}
      transition={{ duration: 0.2 }}
      className="group relative rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0c0c0e] p-5 flex flex-col justify-between hover:bg-[#111115]/40 transition-all duration-300 overflow-hidden"
    >
      {/* Background accent glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="space-y-4">
        {/* Card ribbon details */}
        <div className="flex items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              {asset.category}
            </span>
            <span className="text-slate-700 font-mono text-[8px] select-none">•</span>
            <span className="font-mono text-[9px] text-slate-500">
              v{asset.version}
            </span>
          </div>
          {getStatusBadge(asset.status)}
        </div>

        {/* Card Header */}
        <div className="flex gap-4 items-start relative z-10">
          <div className="h-10 w-10 rounded-lg bg-[#141418] border border-[rgba(255,255,255,0.08)] flex items-center justify-center shrink-0 text-[#a78bfa] group-hover:border-[#a78bfa]/20 group-hover:text-white transition-all duration-300">
            {getIcon(asset.icon)}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-sans font-bold text-white text-xs sm:text-sm uppercase tracking-wide truncate group-hover:text-[#a78bfa] transition-colors duration-200">
              {asset.name}
            </h4>
            <p className="mt-0.5 font-mono text-[9px] text-slate-500">
              {asset.fileType}
            </p>
          </div>
        </div>

        {/* Card Description */}
        {asset.description && (
          <p className="font-sans text-[11px] sm:text-xs text-slate-400 leading-relaxed relative z-10 font-medium">
            {asset.description}
          </p>
        )}

        {/* File size & Download Counter info block */}
        <div className="flex items-center justify-between pt-1 font-mono text-[9px] text-slate-500 relative z-10 border-t border-[rgba(255,255,255,0.02)]">
          <div className="flex items-center gap-1.5">
            <span>SIZE:</span>
            <span className="text-slate-300 font-bold">{asset.size}</span>
          </div>
          {asset.downloadCount !== undefined && (
            <div className="flex items-center gap-1.5">
              <span>DOWNLOADS:</span>
              <span className="text-slate-300 font-bold">{asset.downloadCount + (completed ? 1 : 0)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Download Progress Bar / Trigger actions */}
      <div className="mt-5 pt-3.5 border-t border-[rgba(255,255,255,0.04)] relative z-10">
        {downloading ? (
          <div className="space-y-2">
            <div className="flex justify-between font-mono text-[9px] text-slate-400">
              <span className="animate-pulse">FETCHING LOGIC CORE FILES...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1 w-full bg-[#16161c] rounded-full overflow-hidden border border-slate-900">
              <div 
                className="h-full bg-gradient-to-r from-[#a78bfa] to-[#c084fc] transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            {isRestricted ? (
              <span className="font-mono text-[9px] text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="h-3 w-3" /> SESSION SECURED
              </span>
            ) : (
              <span className="font-mono text-[9px] text-slate-500 flex items-center gap-1">
                PUBLIC REPOSITORY
              </span>
            )}
            
            <button
              onClick={handleDownload}
              className={`flex items-center gap-1.5 font-mono text-[10px] uppercase font-extrabold transition-all px-3 py-1.5 rounded-md cursor-pointer ${
                completed 
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                  : 'bg-neutral-900 hover:bg-[#a78bfa]/10 hover:text-[#a78bfa] border border-[rgba(255,255,255,0.05)] hover:border-[#a78bfa]/20 text-slate-300'
              }`}
            >
              {completed ? (
                <>
                  <Check className="h-3.5 w-3.5" /> RE-DOWNLOAD
                </>
              ) : (
                <>
                  <FolderDown className="h-3.5 w-3.5" /> FETCH ASSET
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
