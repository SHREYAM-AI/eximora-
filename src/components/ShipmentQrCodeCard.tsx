import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Maximize2,
  X,
  ExternalLink,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { TradeOrder } from '../types/order';

interface ShipmentQrCodeCardProps {
  order: TradeOrder;
}

export function buildOrderTrackingUrl(order: TradeOrder): string {
  if (typeof window === 'undefined') {
    return `https://tiffora.trade/?track=${encodeURIComponent(order.orderNumber)}`;
  }
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = 'ai-order-system';
  url.searchParams.set('track', order.orderNumber);
  return url.toString();
}

export function ShipmentQrCodeCard({ order }: ShipmentQrCodeCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const trackingUrl = buildOrderTrackingUrl(order);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(trackingUrl, {
      width: 512,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#090A0F',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (!cancelled) {
          setQrDataUrl(url);
        }
      })
      .catch((err) => {
        console.error('Failed to generate shipment QR code:', err);
      });

    return () => {
      cancelled = true;
    };
  }, [trackingUrl]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for restricted clipboard contexts
      const input = document.createElement('input');
      input.value = trackingUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadLabel = async () => {
    if (!qrDataUrl || isDownloading) return;
    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 720;
      canvas.height = 900;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // White shipping label card background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Outer border
      ctx.strokeStyle = '#090A0F';
      ctx.lineWidth = 6;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

      // Header bar
      ctx.fillStyle = '#090A0F';
      ctx.fillRect(20, 20, canvas.width - 40, 108);

      ctx.fillStyle = '#FCD34D';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('TIFFORA · INTERSTATE DISPATCH PASS', 48, 72);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '18px monospace';
      ctx.fillText(
        `${order.corridor === 'export_agro' ? 'CORRIDOR: STATE AGRO EXPORT' : 'CORRIDOR: ELECTRONICS SUPPLY'} · ${order.incoterm}`,
        48,
        106
      );

      // Order Number & Product
      ctx.fillStyle = '#090A0F';
      ctx.font = 'bold 34px monospace';
      ctx.fillText(order.orderNumber, 48, 184);

      ctx.fillStyle = '#334155';
      ctx.font = '22px sans-serif';
      const productLine =
        order.productName.length > 44 ? order.productName.slice(0, 41) + '...' : order.productName;
      ctx.fillText(`${productLine} (${order.quantity} ${order.unit})`, 48, 222);

      // Route strip
      ctx.fillStyle = '#F1F5F9';
      ctx.fillRect(48, 248, canvas.width - 96, 72);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`ORIGIN: ${order.origin}`, 64, 278);
      ctx.fillText(`DEST:   ${order.destination}`, 64, 306);

      // QR Code centered
      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      await new Promise<void>((resolve, reject) => {
        qrImg.onload = () => resolve();
        qrImg.onerror = () => reject(new Error('QR image load failed'));
      });
      const qrSize = 420;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = 344;
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // Manifest / Stage footer
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      const manifestText = order.fulfillmentDoc?.trackingNumber
        ? `E-WAY / LR NO: ${order.fulfillmentDoc.trackingNumber}`
        : `STAGE: ${order.stage.toUpperCase()} (${order.progressPercent}%)`;
      ctx.fillText(manifestText, canvas.width / 2, 804);

      ctx.fillStyle = '#475569';
      ctx.font = '15px sans-serif';
      ctx.fillText('Scan QR code to verify live E-Way bill & interstate transit milestones', canvas.width / 2, 838);

      const link = document.createElement('a');
      link.download = `Tiffora-QR-${order.orderNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="p-4 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 shadow-xs">
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-700 dark:text-amber-300">
              <QrCode className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-900 dark:text-white font-semibold block">
                Interstate QR Tracking Pass
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                Scan on mobile, highway checkpoint, or warehouse dock for live status
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
            title="Expand high-contrast scanner view"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Expand</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-4">
          {/* High-contrast white QR quiet-zone container for reliable scanning in both light & dark themes */}
          <div
            onClick={() => setIsExpanded(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsExpanded(true);
              }
            }}
            title="Click to enlarge QR code for scanning"
            className="shrink-0 p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:ring-2 hover:ring-amber-400/60 transition-all flex flex-col items-center justify-center"
          >
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`Tracking QR code for ${order.orderNumber}`}
                className="w-28 h-28 sm:w-32 sm:h-32 object-contain select-none"
              />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center bg-slate-100 rounded-lg text-slate-400 text-[10px] font-mono">
                Generating...
              </div>
            )}
            <span className="mt-1 text-[9px] font-mono font-bold tracking-widest text-slate-800 uppercase">
              {order.orderNumber}
            </span>
          </div>

          {/* Metadata & Partner Actions */}
          <div className="flex-1 min-w-0 flex flex-col justify-between gap-3 w-full">
            <div className="space-y-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-medium">
                  <Smartphone className="w-3 h-3" />
                  Mobile Ready
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-[10px] font-mono">
                  <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-300" />
                  {order.fulfillmentDoc?.trackingNumber || `Progress ${order.progressPercent}%`}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                  Encoded Tracking URL
                </span>
                <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate select-all">
                  {trackingUrl}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyUrl}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono font-medium bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-400">Link Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Tracking URL</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadLabel}
                disabled={!qrDataUrl || isDownloading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono font-semibold bg-amber-400/15 hover:bg-amber-400/25 text-amber-800 dark:text-amber-300 border border-amber-400/35 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isDownloading ? 'Exporting...' : 'Download QR Label'}</span>
              </button>

              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-mono text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="Open tracking URL in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Test Link</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded High-Contrast Scanner Modal */}
      {isExpanded && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Dispatch QR Code for ${order.orderNumber}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="fixed inset-0" onClick={() => setIsExpanded(false)} aria-hidden="true" />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-2xl p-6 text-center">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close expanded QR view"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
              <QrCode className="w-3 h-3" />
              <span>Tiffora Dispatch Scanner Pass</span>
            </div>

            <h4 className="text-lg font-mono font-bold text-slate-900">{order.orderNumber}</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              {order.productName} · {order.quantity} {order.unit}
            </p>
            <p className="text-[11px] font-mono text-slate-500 mt-1">
              {order.origin} → {order.destination} ({order.incoterm})
            </p>

            <div className="my-5 p-4 bg-white rounded-2xl border-2 border-slate-900 inline-block shadow-sm">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt={`Large QR Code for ${order.orderNumber}`}
                  className="w-60 h-60 object-contain mx-auto"
                />
              )}
            </div>

            <div className="text-[11px] font-mono text-slate-500 break-all bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-4">
              {trackingUrl}
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleCopyUrl}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Link'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadLabel}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-amber-400 hover:bg-amber-300 text-black transition-colors cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Label PNG</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
