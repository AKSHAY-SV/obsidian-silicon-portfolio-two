import React from 'react';
import { Download } from 'lucide-react';

interface DownloadButtonProps {
  downloadPath: string;
  assetName: string;
  onDownloadStarted?: () => void;
}

export default function DownloadButton({ downloadPath, assetName, onDownloadStarted }: DownloadButtonProps) {
  const hasPath = !!downloadPath;

  const handleDownload = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!hasPath) {
      e.preventDefault();
      return;
    }

    if (onDownloadStarted) {
      onDownloadStarted();
    }

    // Build absolute URL supporting base url for GitHub Pages
    const baseUrl = (import.meta as any).env?.BASE_URL || '/';
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const cleanPath = downloadPath.startsWith('/') ? downloadPath.slice(1) : downloadPath;
    const downloadUrl = encodeURI(`${cleanBaseUrl}${cleanPath}`);

    // Create a native anchor element to trigger browser's native download behavior
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', assetName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      disabled={!hasPath}
      onClick={handleDownload}
      className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
        !hasPath
          ? 'bg-neutral-800/60 text-neutral-500 border border-[rgba(255,255,255,0.05)] cursor-not-allowed'
          : 'bg-[#a78bfa] text-[#0a0a0a] hover:bg-[#bca5ff] hover:shadow-lg hover:shadow-[#a78bfa]/10'
      }`}
      title={!hasPath ? 'Download path not configured' : `Download ${assetName}`}
    >
      Download Asset <Download className="h-3.5 w-3.5" />
    </button>
  );
}
