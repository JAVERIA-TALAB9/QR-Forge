import { useState, useRef, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  Link2,
  Type,
  Palette,
  Settings2,
  RefreshCw,
  Image as ImageIcon,
  FileCode,
  Sparkles,
  Check,
  AlertCircle,
} from 'lucide-react';

type ErrorLevel = 'L' | 'M' | 'Q' | 'H';

const PRESETS = [
  { name: 'Classic', fg: '#0f172a', bg: '#ffffff' },
  { name: 'Ocean', fg: '#0e7490', bg: '#ecfeff' },
  { name: 'Forest', fg: '#166534', bg: '#f0fdf4' },
  { name: 'Sunset', fg: '#b91c1c', bg: '#fef2f2' },
  { name: 'Mono', fg: '#1f2937', bg: '#f9fafb' },
  { name: 'Midnight', fg: '#fbbf24', bg: '#0f172a' },
];

const SAMPLES = [
  'https://www.example.com',
  'mailto:hello@example.com',
  'tel:+15551234567',
  'WIFI:T:WPA;S:MyNetwork;P:password123;;',
  'https://maps.google.com/?q=Central+Park',
];

export default function App() {
  const [text, setText] = useState('https://www.example.com');
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState(320);
  const [margin, setMargin] = useState(2);
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>('M');
  const [activePreset, setActivePreset] = useState<string | null>('Classic');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [svgString, setSvgString] = useState('');
  const [dataUrl, setDataUrl] = useState('');

  const generate = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError(null);
      setSvgString('');
      setDataUrl('');
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const opts = {
        width: size,
        margin,
        errorCorrectionLevel: errorLevel,
        color: { dark: fgColor, light: bgColor },
      };

      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, trimmed, opts);
      }
      const url = await QRCode.toDataURL(trimmed, opts);
      setDataUrl(url);
      const svg = await QRCode.toString(trimmed, {
        ...opts,
        type: 'svg',
      });
      setSvgString(svg);
    } catch (e) {
      setError('That text is too long for a QR code at this error-correction level. Try lowering it or shortening your text.');
    } finally {
      setGenerating(false);
    }
  }, [text, size, margin, errorLevel, fgColor, bgColor]);

  useEffect(() => {
    const t = setTimeout(generate, 120);
    return () => clearTimeout(t);
  }, [generate]);

  const applyPreset = (name: string, fg: string, bg: string) => {
    setActivePreset(name);
    setFgColor(fg);
    setBgColor(bg);
  };

  const downloadPng = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'qrcode.png';
    a.click();
  };

  const downloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qrcode.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const charCount = text.length;
  const maxChars = 1200;
  const overLimit = charCount > maxChars;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-teal-200/30 blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 h-80 w-80 rounded-full bg-sky-200/30 blur-3xl" />
      </div>

      <div className="relative">
        {/* Header */}
        <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-lg shadow-slate-900/20">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">QR Forge</h1>
                <p className="text-xs text-slate-500">Generate & download QR codes</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:flex">
              <Sparkles className="h-3.5 w-3.5" />
              Free & instant
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          {/* Hero */}
          <div className="mb-10 text-center">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
              Turn any link or text into a{' '}
              <span className="bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                downloadable QR code
              </span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-600">
              Paste a URL, message, or contact info. Customize the colors and size, then download as PNG or SVG.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            {/* Left: Input & customization */}
            <div className="lg:col-span-3 space-y-5">
              {/* Input card */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Link2 className="h-4 w-4 text-cyan-600" />
                  Enter text or URL
                </label>
                <div className="relative">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="https://your-link.com"
                    rows={3}
                    className={`w-full resize-none rounded-xl border bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 placeholder:text-slate-400 transition focus:bg-white focus:outline-none focus:ring-2 ${
                      overLimit
                        ? 'border-red-300 focus:ring-red-400'
                        : 'border-slate-200 focus:ring-cyan-400'
                    }`}
                  />
                  <button
                    onClick={copyText}
                    title="Copy text"
                    className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Type className="h-4 w-4" />}
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-xs ${overLimit ? 'text-red-500' : 'text-slate-400'}`}>
                    {charCount} / {maxChars} characters
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setText(s)}
                        className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-200"
                      >
                        {s.startsWith('http') ? 'URL' : s.startsWith('mailto') ? 'Email' : s.startsWith('tel') ? 'Phone' : s.startsWith('WIFI') ? 'Wi-Fi' : 'Map'}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Color presets */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Palette className="h-4 w-4 text-cyan-600" />
                  Color presets
                </h3>
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
                  {PRESETS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => applyPreset(p.name, p.fg, p.bg)}
                      className={`group flex flex-col items-center gap-2 rounded-xl border p-2.5 transition ${
                        activePreset === p.name
                          ? 'border-cyan-400 ring-2 ring-cyan-100'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200"
                        style={{ backgroundColor: p.bg }}
                      >
                        <span className="h-4 w-4 rounded-sm" style={{ backgroundColor: p.fg }} />
                      </span>
                      <span className="text-[11px] font-medium text-slate-600">{p.name}</span>
                    </button>
                  ))}
                </div>

                {/* Custom colors */}
                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">Foreground</label>
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
                      <input
                        type="color"
                        value={fgColor}
                        onChange={(e) => {
                          setFgColor(e.target.value);
                          setActivePreset(null);
                        }}
                        className="h-8 w-8 cursor-pointer rounded-md border-0 bg-transparent p-0"
                      />
                      <input
                        type="text"
                        value={fgColor}
                        onChange={(e) => {
                          setFgColor(e.target.value);
                          setActivePreset(null);
                        }}
                        className="w-full bg-transparent text-sm uppercase text-slate-700 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">Background</label>
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => {
                          setBgColor(e.target.value);
                          setActivePreset(null);
                        }}
                        className="h-8 w-8 cursor-pointer rounded-md border-0 bg-transparent p-0"
                      />
                      <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => {
                          setBgColor(e.target.value);
                          setActivePreset(null);
                        }}
                        className="w-full bg-transparent text-sm uppercase text-slate-700 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Advanced settings */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Settings2 className="h-4 w-4 text-cyan-600" />
                  Advanced
                </h3>
                <div className="space-y-5">
                  {/* Size */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-500">Size</label>
                      <span className="text-xs font-semibold text-slate-700">{size}px</span>
                    </div>
                    <input
                      type="range"
                      min={128}
                      max={1024}
                      step={32}
                      value={size}
                      onChange={(e) => setSize(Number(e.target.value))}
                      className="w-full accent-cyan-600"
                    />
                  </div>

                  {/* Margin */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-500">Quiet zone (margin)</label>
                      <span className="text-xs font-semibold text-slate-700">{margin}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={8}
                      step={1}
                      value={margin}
                      onChange={(e) => setMargin(Number(e.target.value))}
                      className="w-full accent-cyan-600"
                    />
                  </div>

                  {/* Error correction */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">Error correction</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['L', 'M', 'Q', 'H'] as ErrorLevel[]).map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setErrorLevel(lvl)}
                          className={`rounded-lg border py-2 text-sm font-semibold transition ${
                            errorLevel === lvl
                              ? 'border-cyan-400 bg-cyan-50 text-cyan-700'
                              : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-400">
                      Higher levels survive more damage but make denser codes.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Right: Preview & download */}
            <div className="lg:col-span-2">
              <section className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <QrCode className="h-4 w-4 text-cyan-600" />
                  Preview
                </h3>

                <div className="flex flex-col items-center">
                  <div className="relative flex aspect-square w-full max-w-[300px] items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                    {text.trim() && !error ? (
                      <canvas
                        ref={canvasRef}
                        className="h-full w-full object-contain p-2"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-3 p-8 text-center">
                        {error ? (
                          <>
                            <AlertCircle className="h-10 w-10 text-red-400" />
                            <p className="text-xs text-red-500">{error}</p>
                          </>
                        ) : (
                          <>
                            <QrCode className="h-12 w-12 text-slate-300" />
                            <p className="text-xs text-slate-400">Your QR code will appear here</p>
                          </>
                        )}
                      </div>
                    )}
                    {generating && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                        <RefreshCw className="h-6 w-6 animate-spin text-cyan-600" />
                      </div>
                    )}
                  </div>

                  {/* Download buttons */}
                  <div className="mt-5 w-full space-y-2.5">
                    <button
                      onClick={downloadPng}
                      disabled={!dataUrl || !!error}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Download className="h-4 w-4" />
                      Download PNG
                    </button>
                    <button
                      onClick={downloadSvg}
                      disabled={!svgString || !!error}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <FileCode className="h-4 w-4" />
                      Download SVG
                    </button>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
                    <ImageIcon className="h-3 w-3" />
                    PNG for images, SVG for print & scaling
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>

        <footer className="border-t border-slate-200/70 bg-white/50">
          <div className="mx-auto max-w-6xl px-5 py-6 text-center text-xs text-slate-400 sm:px-8">
            QR Forge — Generate QR codes instantly. No sign-up required.
          </div>
        </footer>
      </div>
    </div>
  );
}
