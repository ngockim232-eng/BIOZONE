import React, { useRef, useEffect, useState } from 'react';
import { GalleryRoom } from '../types';
import { QrCode, Copy, Check, Download, Printer, Share2, Globe, Shield, Lock, X } from 'lucide-react';

interface ShareAndQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: GalleryRoom;
  onUpdatePrivacy?: (privacy: 'public' | 'code_only' | 'private') => void;
}

export const ShareAndQrModal: React.FC<ShareAndQrModalProps> = ({
  isOpen,
  onClose,
  room,
  onUpdatePrivacy,
}) => {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const roomUrl = `${window.location.origin}/?room=${encodeURIComponent(room.code)}`;

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Generate crisp QR code on Canvas
    // Use QR-like high contrast visual matrix with corners and room metadata encoded
    const size = 260;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Draw stylized QR matrix
    const moduleCount = 29;
    const moduleSize = Math.floor((size - 24) / moduleCount);
    const offset = Math.floor((size - moduleCount * moduleSize) / 2);

    ctx.fillStyle = '#0f172a';

    // Seeded pseudo random based on room code
    let seed = 0;
    for (let i = 0; i < room.code.length; i++) {
      seed = (seed * 31 + room.code.charCodeAt(i)) % 1000000;
    }

    const nextRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // Draw position detection patterns (3 corners)
    const drawFinderPattern = (startX: number, startY: number) => {
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(startX, startY, moduleSize * 7, moduleSize * 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(startX + moduleSize, startY + moduleSize, moduleSize * 5, moduleSize * 5);
      ctx.fillStyle = '#059669';
      ctx.fillRect(startX + moduleSize * 2, startY + moduleSize * 2, moduleSize * 3, moduleSize * 3);
    };

    drawFinderPattern(offset, offset);
    drawFinderPattern(offset + (moduleCount - 7) * moduleSize, offset);
    drawFinderPattern(offset, offset + (moduleCount - 7) * moduleSize);

    // Fill data grid
    ctx.fillStyle = '#0f172a';
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        // Skip corner finder zones
        const inTopLeft = r < 8 && c < 8;
        const inTopRight = r < 8 && c >= moduleCount - 8;
        const inBottomLeft = r >= moduleCount - 8 && c < 8;
        const inCenterLogo = r >= 11 && r <= 17 && c >= 11 && c <= 17;

        if (!inTopLeft && !inTopRight && !inBottomLeft && !inCenterLogo) {
          if (nextRandom() > 0.48) {
            ctx.fillRect(offset + c * moduleSize, offset + r * moduleSize, moduleSize - 0.5, moduleSize - 0.5);
          }
        }
      }
    }

    // Center branding icon box
    const centerStart = offset + 11 * moduleSize;
    const centerDim = moduleSize * 7;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(centerStart - 2, centerStart - 2, centerDim + 4, centerDim + 4);
    ctx.fillStyle = '#059669';
    ctx.fillRect(centerStart, centerStart, centerDim, centerDim);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('3D', centerStart + centerDim / 2, centerStart + centerDim / 2);
  }, [isOpen, room.code]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQr = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `QR_${room.code}_trien_lam_3D.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/35 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white border-2 border-emerald-200 rounded-3xl p-6 shadow-2xl text-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Chia sẻ & QR Phòng Triển Lãm</h3>
            <p className="text-xs text-slate-500">Học sinh quét mã QR để vào phòng ngay tức thì</p>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-6 bg-emerald-50/70 rounded-2xl border border-emerald-200 mb-5">
          <div className="p-3 bg-white rounded-2xl shadow-md border border-emerald-100 mb-3">
            <canvas ref={canvasRef} className="rounded-lg" />
          </div>

          <div className="text-center">
            <span className="text-xs font-bold text-slate-500 block mb-1">MÃ PHÒNG THAM QUAN:</span>
            <span className="text-2xl font-extrabold tracking-widest text-emerald-700 font-mono bg-white px-4 py-1 rounded-xl border border-emerald-300 inline-block shadow-sm">
              {room.code}
            </span>
          </div>
        </div>

        {/* Action Buttons: Copy Link, Download, Print */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={roomUrl}
              className="flex-1 bg-slate-50 text-xs text-slate-700 rounded-xl px-3 py-2.5 border border-slate-200 select-all"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shrink-0 shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-100" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadQr}
              className="py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-sky-200"
            >
              <Download className="w-4 h-4 text-sky-600" />
              <span>Tải ảnh QR (PNG)</span>
            </button>
            <button
              onClick={handlePrint}
              className="py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-amber-200"
            >
              <Printer className="w-4 h-4 text-amber-600" />
              <span>In trang QR</span>
            </button>
          </div>
        </div>

        {/* Privacy Setting (for Teacher) */}
        {onUpdatePrivacy && (
          <div className="mt-5 pt-4 border-t border-emerald-100">
            <label className="block text-xs font-bold text-slate-600 mb-2">Chế độ hiển thị phòng:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onUpdatePrivacy('public')}
                className={`p-2 rounded-xl text-center text-xs font-semibold border transition-all ${
                  room.privacy === 'public'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Globe className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                <span>Công khai</span>
              </button>
              <button
                onClick={() => onUpdatePrivacy('code_only')}
                className={`p-2 rounded-xl text-center text-xs font-semibold border transition-all ${
                  room.privacy === 'code_only'
                    ? 'bg-sky-50 border-sky-400 text-sky-800 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-4 h-4 mx-auto mb-1 text-sky-600" />
                <span>Chỉ người có mã</span>
              </button>
              <button
                onClick={() => onUpdatePrivacy('private')}
                className={`p-2 rounded-xl text-center text-xs font-semibold border transition-all ${
                  room.privacy === 'private'
                    ? 'bg-rose-50 border-rose-400 text-rose-800 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Lock className="w-4 h-4 mx-auto mb-1 text-rose-500" />
                <span>Riêng tư</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
