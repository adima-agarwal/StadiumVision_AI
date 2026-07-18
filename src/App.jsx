import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Globe, MapPin, AlertTriangle, CheckCircle2, Users, Activity,
  Shield, Zap, Camera, Send, ChevronDown, Wifi, Battery,
  Signal, Clock, TrendingUp, TrendingDown, Minus,
  FileText, Eye, Radio, Cpu, Lock, Layers, Navigation,
  MessageSquare, Trash2, RefreshCw, BarChart3, ThumbsUp,
  AlertOctagon, Info, Crosshair, Radar, Terminal, Star,
  ChevronRight, CircleDot, Mic, Paperclip, X, Plus,
  Flame, Wind, Droplets, Thermometer, Car, Bus, Zap as ZapIcon,
  Volume2, Bell, Settings, Search, Filter, Download
} from 'lucide-react'

// ─────────────────────────────────────────────
// CONSTANTS & MOCK DATA
// ─────────────────────────────────────────────
const INITIAL_INCIDENTS = [
  {
    id: 1,
    category: 'Crowd Control',
    severity: 'High',
    location: 'Gate G Turnstiles',
    details: 'Severe crowd backup causing language barrier bottlenecks at ticket scanning queues.',
    timestamp: '22:41:03',
    status: 'Active',
    reportedBy: 'Security Team Alpha',
    zone: 'north',
    pinX: 28,
    pinY: 22,
  },
  {
    id: 2,
    category: 'Facilities',
    severity: 'Medium',
    location: 'Concession Zone 4',
    details: 'Liquid spill creating an active slip hazard on concrete walkways.',
    timestamp: '22:47:19',
    status: 'In Progress',
    reportedBy: 'Facilities Bot v2',
    zone: 'east',
    pinX: 72,
    pinY: 48,
  },
  {
    id: 3,
    category: 'Sustainability',
    severity: 'Low',
    location: 'Section 224 East',
    details: 'Recycling bins completely full; requires rapid clearing team routing.',
    timestamp: '22:51:44',
    status: 'Pending',
    reportedBy: 'Smart Bin Sensor #224E',
    zone: 'east',
    pinX: 65,
    pinY: 68,
  },
  {
    id: 4,
    category: 'Medical',
    severity: 'High',
    location: 'South Stand Row M',
    details: 'Localized fan distress due to heat exhaustion; medical team dispatched.',
    timestamp: '22:54:11',
    status: 'Active',
    reportedBy: 'MedWatch AI Sensor',
    zone: 'south',
    pinX: 42,
    pinY: 75,
  },
]

const LANGUAGES = [
  { code: 'en', label: '🇺🇸 English', name: 'English' },
  { code: 'es', label: '🇪🇸 Español', name: 'Spanish' },
  { code: 'pt', label: '🇧🇷 Português', name: 'Portuguese' },
  { code: 'fr', label: '🇫🇷 Français', name: 'French' },
  { code: 'ja', label: '🇯🇵 日本語', name: 'Japanese' },
  { code: 'ar', label: '🇸🇦 العربية', name: 'Arabic' },
]

const CATEGORY_ICONS = {
  'Crowd Control': Users,
  'Facilities': Layers,
  'Sustainability': Globe,
  'Medical': Activity,
  'Fan Report': MessageSquare,
}

const SEVERITY_CONFIG = {
  High: { color: '#FF3D00', bg: 'rgba(255,61,0,0.1)', border: 'rgba(255,61,0,0.3)', pin: '#FF3D00', label: 'badge-high' },
  Medium: { color: '#FFD600', bg: 'rgba(255,214,0,0.1)', border: 'rgba(255,214,0,0.3)', pin: '#FFD600', label: 'badge-medium' },
  Low: { color: '#00E676', bg: 'rgba(0,230,118,0.1)', border: 'rgba(0,230,118,0.3)', pin: '#00E676', label: 'badge-low' },
}

const AI_RESPONSES = {
  en: (text, sev) => ({
    translation: text,
    severity: sev || 'Medium',
    response: `Thank you for reporting this. Our response team has been alerted and is en route to address the situation immediately. Your safety and comfort are our top priority. Please stay calm — a StadiumVision AI coordinator will reach your location within 3–5 minutes.`,
  }),
  es: (text, sev) => ({
    translation: `[Traducción al inglés]: ${text}`,
    severity: sev || 'Medium',
    response: `Gracias por informar esto. Nuestro equipo de respuesta ha sido alertado y está en camino para atender la situación de inmediato. Su seguridad y comodidad son nuestra máxima prioridad. Por favor, mantenga la calma — un coordinador de StadiumVision AI llegará a su ubicación en 3–5 minutos.`,
  }),
  pt: (text, sev) => ({
    translation: `[Tradução para inglês]: ${text}`,
    severity: sev || 'Medium',
    response: `Obrigado por relatar isso. Nossa equipe de resposta foi alertada e está a caminho para resolver a situação imediatamente. Sua segurança e conforto são nossa maior prioridade. Por favor, mantenha a calma — um coordenador StadiumVision AI chegará ao seu local em 3–5 minutos.`,
  }),
  fr: (text, sev) => ({
    translation: `[Traduction en anglais]: ${text}`,
    severity: sev || 'Medium',
    response: `Merci d'avoir signalé cela. Notre équipe d'intervention a été alertée et est en route pour résoudre la situation immédiatement. Votre sécurité et votre confort sont notre priorité absolue. Restez calme — un coordinateur StadiumVision AI sera à votre emplacement dans 3–5 minutes.`,
  }),
  ja: (text, sev) => ({
    translation: `[英語訳]: ${text}`,
    severity: sev || 'Medium',
    response: `ご報告ありがとうございます。対応チームに連絡が届き、直ちに現場へ向かっています。あなたの安全と快適さが私たちの最優先事項です。どうぞ落ち着いてください — 3〜5分以内にStadiumVision AIコーディネーターがお客様のもとに到着します。`,
  }),
  ar: (text, sev) => ({
    translation: `[الترجمة إلى الإنجليزية]: ${text}`,
    severity: sev || 'Medium',
    response: `شكراً لك على الإبلاغ. تم تنبيه فريق الاستجابة لدينا وهو في طريقه للتعامل مع الوضع فوراً. سلامتكم وراحتكم هي أولويتنا القصوى. يرجى البقاء هادئاً — سيصل منسق StadiumVision AI إلى موقعكم في غضون 3–5 دقائق.`,
  }),
}

// ─────────────────────────────────────────────
// UTILITY COMPONENTS
// ─────────────────────────────────────────────
function PulsingDot({ color = '#00E676' }) {
  return (
    <span className="relative flex items-center justify-center" style={{ width: 16, height: 16 }}>
      <span
        className="absolute inline-flex rounded-full opacity-75 animate-ping"
        style={{ backgroundColor: color, width: 12, height: 12, animationDuration: '1.5s' }}
      />
      <span
        className="relative inline-flex rounded-full"
        style={{ backgroundColor: color, width: 8, height: 8 }}
      />
    </span>
  )
}

function SeverityBadge({ severity }) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.Low
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border"
      style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: cfg.border }}
    >
      {severity}
    </span>
  )
}

// ─────────────────────────────────────────────
// KPI CARD
// ─────────────────────────────────────────────
function KPICard({ icon: Icon, label, value, trend, trendDir, accentColor, topBorder, sublabel }) {
  const borderTopStyle = topBorder
    ? { borderTop: `4px solid ${topBorder}` }
    : { borderTop: '4px solid transparent' }

  return (
    <div
      className="bg-[#161F30] border border-[#24334C] rounded-xl p-5 relative overflow-hidden transition-all duration-300 hover:border-[#2e4060] hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)] group"
      style={borderTopStyle}
    >
      {/* Corner glow */}
      <div
        className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-0 group-hover:opacity-10 transition-opacity duration-500"
        style={{ backgroundColor: accentColor || '#00E676' }}
      />
      {/* Decorative corner dot */}
      <div
        className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-5"
        style={{ backgroundColor: accentColor || '#00E676' }}
      />

      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${accentColor || '#00E676'}18`, border: `1px solid ${accentColor || '#00E676'}30` }}
        >
          <Icon size={18} style={{ color: accentColor || '#00E676' }} />
        </div>
        {trend != null && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trendDir === 'up' ? 'text-[#FF3D00]' : trendDir === 'down' ? 'text-[#00E676]' : 'text-slate-400'
          }`}>
            {trendDir === 'up' ? <TrendingUp size={12} /> : trendDir === 'down' ? <TrendingDown size={12} /> : <Minus size={12} />}
            <span>{trend}</span>
          </div>
        )}
      </div>

      <div>
        <div
          className="text-4xl font-black tracking-tight leading-none mb-1.5 tabular-nums"
          style={{ color: accentColor || '#f1f5f9' }}
        >
          {value}
        </div>
        <div className="text-sm font-semibold text-slate-300">{label}</div>
        {sublabel && <div className="text-[11px] text-slate-500 mt-1">{sublabel}</div>}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// STADIUM MAP
// ─────────────────────────────────────────────
function StadiumMap({ incidents }) {
  const [hoveredPin, setHoveredPin] = useState(null)
  const [scanPos, setScanPos] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setScanPos(p => (p + 1) % 100), 80)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative w-full rounded-xl border border-[#24334C] overflow-hidden"
      style={{
        height: 288,
        background: 'linear-gradient(135deg, #080d18 0%, #0B0F19 60%, #0a0f1a 100%)',
        backgroundImage: `
          linear-gradient(rgba(36,51,76,0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(36,51,76,0.3) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }}
    >
      {/* Radial glow center */}
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(0,230,118,0.04) 0%, transparent 70%)' }}
      />

      {/* Animated scan line */}
      <div
        className="absolute left-0 right-0 pointer-events-none z-10"
        style={{
          height: 2,
          top: `${scanPos}%`,
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,230,118,0.3) 30%, rgba(0,230,118,0.6) 50%, rgba(0,230,118,0.3) 70%, transparent 100%)',
          filter: 'blur(1px)',
        }}
      />

      {/* Stadium SVG */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Outer ring */}
        <ellipse cx="50" cy="50" rx="44" ry="37" fill="none" stroke="#24334C" strokeWidth="0.7" />
        <ellipse cx="50" cy="50" rx="38" ry="31" fill="none" stroke="#1e2d42" strokeWidth="0.5" />
        {/* Pitch */}
        <ellipse cx="50" cy="50" rx="29" ry="23" fill="rgba(0,230,118,0.04)" stroke="#00E676" strokeWidth="0.5" strokeDasharray="2,1.5" />
        {/* Center circle */}
        <circle cx="50" cy="50" r="5.5" fill="none" stroke="#00E676" strokeWidth="0.4" strokeOpacity="0.6" />
        <circle cx="50" cy="50" r="0.8" fill="#00E676" fillOpacity="0.5" />
        {/* Center line */}
        <line x1="21" y1="50" x2="79" y2="50" stroke="#00E676" strokeWidth="0.3" strokeOpacity="0.3" />
        {/* Penalty areas */}
        <rect x="36" y="41" width="13" height="18" fill="none" stroke="#00E676" strokeWidth="0.3" strokeOpacity="0.4" />
        <rect x="51" y="41" width="13" height="18" fill="none" stroke="#00E676" strokeWidth="0.3" strokeOpacity="0.4" />
        {/* Goal areas */}
        <rect x="42" y="44" width="5" height="12" fill="none" stroke="#00E676" strokeWidth="0.25" strokeOpacity="0.35" />
        <rect x="53" y="44" width="5" height="12" fill="none" stroke="#00E676" strokeWidth="0.25" strokeOpacity="0.35" />
        {/* Corner arcs */}
        {[[21,27],[79,27],[21,73],[79,73]].map(([cx2, cy2], i) => (
          <circle key={i} cx={cx2} cy={cy2} r="2" fill="none" stroke="#00E676" strokeWidth="0.25" strokeOpacity="0.3" />
        ))}
        {/* Direction labels */}
        <text x="50" y="9.5" textAnchor="middle" fill="#2d4563" fontSize="3" fontFamily="monospace" letterSpacing="2">GATE G — NORTH</text>
        <text x="50" y="94" textAnchor="middle" fill="#2d4563" fontSize="3" fontFamily="monospace" letterSpacing="1.5">SOUTH STAND</text>
        <text x="6.5" y="54" textAnchor="middle" fill="#2d4563" fontSize="2.5" fontFamily="monospace" transform="rotate(-90,6.5,54)">WEST</text>
        <text x="93.5" y="50" textAnchor="middle" fill="#2d4563" fontSize="2.5" fontFamily="monospace" transform="rotate(90,93.5,50)">EAST</text>
        {/* Section indicators */}
        <text x="50" y="17" textAnchor="middle" fill="#1e2d42" fontSize="2" fontFamily="monospace">SEC 101-115</text>
        <text x="50" y="87" textAnchor="middle" fill="#1e2d42" fontSize="2" fontFamily="monospace">SEC 224-238</text>
      </svg>

      {/* Compass */}
      <div className="absolute top-3 left-3 opacity-50">
        <Navigation size={14} className="text-[#00E676]" />
      </div>

      {/* Stadium badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#0B0F19]/80 border border-[#24334C] rounded-lg px-2 py-1 backdrop-blur-sm">
        <PulsingDot color="#00E676" />
        <span className="text-[9px] font-mono text-[#00E676] tracking-widest uppercase">MetLife Stadium</span>
      </div>

      {/* Incident Pins */}
      {incidents.map((inc) => {
        const cfg = SEVERITY_CONFIG[inc.severity] || SEVERITY_CONFIG.Low
        const isHovered = hoveredPin === inc.id
        return (
          <div
            key={inc.id}
            className="absolute cursor-pointer"
            style={{
              left: `${inc.pinX}%`,
              top: `${inc.pinY}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: isHovered ? 30 : 20,
            }}
            onMouseEnter={() => setHoveredPin(inc.id)}
            onMouseLeave={() => setHoveredPin(null)}
          >
            {/* Ripple for High severity */}
            {inc.severity === 'High' && (
              <span
                className="absolute inset-[-4px] rounded-full animate-ping"
                style={{ backgroundColor: cfg.pin, opacity: 0.35 }}
              />
            )}
            {/* Medium pulse */}
            {inc.severity === 'Medium' && (
              <span
                className="absolute inset-[-2px] rounded-full animate-pulse"
                style={{ backgroundColor: cfg.pin, opacity: 0.2 }}
              />
            )}
            {/* Pin dot */}
            <span
              className="relative block rounded-full transition-transform duration-200"
              style={{
                width: isHovered ? 16 : 12,
                height: isHovered ? 16 : 12,
                backgroundColor: cfg.pin,
                boxShadow: `0 0 ${isHovered ? 14 : 8}px ${cfg.pin}AA, 0 0 3px ${cfg.pin}`,
              }}
            />
          </div>
        )
      })}

      {/* Hover tooltip */}
      {hoveredPin && (() => {
        const inc = incidents.find(i => i.id === hoveredPin)
        if (!inc) return null
        const cfg = SEVERITY_CONFIG[inc.severity] || SEVERITY_CONFIG.Low
        return (
          <div
            className="absolute z-40 pointer-events-none min-w-[160px] animate-[fadeIn_0.15s_ease-out]"
            style={{
              left: `${Math.min(inc.pinX + 3, 58)}%`,
              top: `${Math.max(inc.pinY - 15, 4)}%`,
              background: 'rgba(22,31,48,0.95)',
              border: `1px solid ${cfg.pin}50`,
              borderRadius: 10,
              padding: '8px 10px',
              backdropFilter: 'blur(12px)',
              boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 12px ${cfg.pin}20`,
            }}
          >
            <div className="text-[11px] font-bold text-slate-100 mb-0.5">{inc.location}</div>
            <div className="text-[10px] text-slate-400 mb-1">{inc.category}</div>
            <SeverityBadge severity={inc.severity} />
          </div>
        )
      })()}

      {/* Corner bracket decorations */}
      {[
        ['top-2 left-2', { borderTop: '1px solid rgba(0,230,118,0.4)', borderLeft: '1px solid rgba(0,230,118,0.4)' }],
        ['top-2 right-2', { borderTop: '1px solid rgba(0,230,118,0.4)', borderRight: '1px solid rgba(0,230,118,0.4)' }],
        ['bottom-2 left-2', { borderBottom: '1px solid rgba(0,230,118,0.4)', borderLeft: '1px solid rgba(0,230,118,0.4)' }],
        ['bottom-2 right-2', { borderBottom: '1px solid rgba(0,230,118,0.4)', borderRight: '1px solid rgba(0,230,118,0.4)' }],
      ].map(([pos, style], i) => (
        <div key={i} className={`absolute ${pos} w-4 h-4`} style={style} />
      ))}

      {/* Map footer bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-1.5"
        style={{ background: 'rgba(11,15,25,0.75)', borderTop: '1px solid rgba(36,51,76,0.6)', backdropFilter: 'blur(8px)' }}>
        <span className="text-[9px] font-mono text-slate-600">GPS: 40.8135° N, 74.0745° W</span>
        <div className="flex items-center gap-3">
          {[
            { color: '#FF3D00', label: 'High' },
            { color: '#FFD600', label: 'Med' },
            { color: '#00E676', label: 'Low' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[9px] font-mono text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// INCIDENT TABLE
// ─────────────────────────────────────────────
function IncidentTable({ incidents }) {
  const [filter, setFilter] = useState('All')
  const filters = ['All', 'High', 'Medium', 'Low']

  const displayed = filter === 'All' ? incidents : incidents.filter(i => i.severity === filter)

  return (
    <div className="mt-4 bg-[#161F30] border border-[#24334C] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#24334C]">
        <div className="flex items-center gap-2">
          <Radio size={13} className="text-[#00E676] animate-pulse" />
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Live Incident Feed</span>
        </div>
        <div className="flex items-center gap-1.5">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md transition-all duration-200"
              style={{
                color: filter === f ? (f === 'High' ? '#FF3D00' : f === 'Medium' ? '#FFD600' : f === 'Low' ? '#00E676' : '#00E676') : '#64748b',
                backgroundColor: filter === f ? (f === 'High' ? 'rgba(255,61,0,0.12)' : f === 'Medium' ? 'rgba(255,214,0,0.12)' : f === 'Low' ? 'rgba(0,230,118,0.12)' : 'rgba(0,230,118,0.12)') : 'transparent',
                border: filter === f ? `1px solid ${f === 'High' ? 'rgba(255,61,0,0.3)' : f === 'Medium' ? 'rgba(255,214,0,0.3)' : 'rgba(0,230,118,0.3)'}` : '1px solid transparent',
              }}
            >
              {f}
            </button>
          ))}
          <span className="ml-2 text-[10px] text-slate-600 font-mono">{displayed.length} LOGS</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#24334C]">
              {['#ID', 'Category', 'Location', 'Severity', 'Status', 'Reporter', 'Time'].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((inc, idx) => {
              const Icon = CATEGORY_ICONS[inc.category] || AlertTriangle
              const cfg = SEVERITY_CONFIG[inc.severity] || SEVERITY_CONFIG.Low
              return (
                <tr
                  key={inc.id}
                  className="border-b border-[#24334C]/40 hover:bg-[#24334C]/15 transition-colors duration-150"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500">#{String(inc.id).padStart(4, '0')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Icon size={12} style={{ color: cfg.color }} className="flex-shrink-0" />
                      <span className="text-[12px] text-slate-300 font-medium whitespace-nowrap">{inc.category}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 whitespace-nowrap">
                      <MapPin size={10} className="flex-shrink-0" />
                      {inc.location}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <SeverityBadge severity={inc.severity} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {inc.status === 'Active' && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF3D00] animate-pulse flex-shrink-0" />
                      )}
                      <span className={`text-[11px] font-semibold whitespace-nowrap ${
                        inc.status === 'Active' ? 'text-[#FF3D00]' :
                        inc.status === 'In Progress' ? 'text-[#FFD600]' :
                        inc.status === 'Resolved' ? 'text-[#00E676]' : 'text-slate-400'
                      }`}>
                        {inc.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-slate-500 whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis">
                    {inc.reportedBy}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">{inc.timestamp}</td>
                </tr>
              )
            })}
            {displayed.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-600">No incidents match this filter</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// AI COMMANDER PANEL
// ─────────────────────────────────────────────
function AICommanderPanel({ incidents }) {
  const highCount = incidents.filter(i => i.severity === 'High').length
  const medCount = incidents.filter(i => i.severity === 'Medium').length
  const lowCount = incidents.filter(i => i.severity === 'Low').length
  const activeCount = incidents.filter(i => i.status === 'Active').length

  const insights = [
    {
      icon: AlertOctagon,
      color: '#FF3D00',
      label: 'CRITICAL',
      text: `${highCount} HIGH-severity incidents detected — immediate executive response required at Gate G Turnstiles and South Stand Row M. Medical units on standby.`,
    },
    {
      icon: BarChart3,
      color: '#FFD600',
      label: 'WARNING',
      text: `Crowd density models flagging North Gate sector as a bottleneck risk zone. Language-barrier escalation probability at 73% without multilingual agent deployment.`,
    },
    {
      icon: CheckCircle2,
      color: '#00E676',
      label: 'STATUS',
      text: `${lowCount} LOW-priority sustainability task logged. Automated routing sent to Zone 4 clearing crew. Estimated clearance ETA: 12 minutes.`,
    },
  ]

  const directive = `[STADIUMVISION AI — TACTICAL DIRECTIVE v2.6]
  
TIMESTAMP .............. ${new Date().toISOString()}
VENUE .................. MetLife Stadium, East Rutherford, NJ
MATCH .................. Group Stage · Match 41 — USA vs. PRT
ATTENDANCE ............. 82,500 / 82,500 ■ SOLD OUT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRIORITY ACTIONS:

  [1] DEPLOY  → 3× Bilingual Staff :: Gate G Turnstiles
  [2] DISPATCH → Medical Fast-Response :: S.Stand Row M
  [3] ROUTE   → Sustainability Crew :: Section 224 East
  [4] MONITOR → Heat Index :: All Outdoor Zones (36°C)
  [5] ALERT   → Facilities Wet-Floor Response :: Zone 4

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THREAT LEVEL ........... ELEVATED ⚠
ACTIVE INCIDENTS ....... ${incidents.length} TOTAL (${activeCount} ACTIVE)
HIGH SEVERITY .......... ${highCount} CRITICAL
SYSTEM HEALTH .......... ██████████ 99.8% NOMINAL
AI CONFIDENCE .......... 94.2%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[AUTO-GENERATED · STADIUMVISION AI ENGINE]`

  return (
    <div
      className="bg-[#161F30] border border-[#24334C] rounded-xl p-5 h-full flex flex-col gap-5"
      style={{ boxShadow: '0 0 20px rgba(0,230,118,0.15), 0 0 60px rgba(0,230,118,0.04)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#24334C]">
        <div className="w-10 h-10 rounded-xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center"
          style={{ boxShadow: '0 0 12px rgba(0,230,118,0.2)' }}>
          <Cpu size={18} className="text-[#00E676] animate-pulse" />
        </div>
        <div>
          <div className="text-sm font-bold text-slate-100">AI GenAI Commander</div>
          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse inline-block" />
            Briefing Node · Live Analysis
          </div>
        </div>
        <div className="ml-auto flex flex-col items-end gap-1">
          <div className="text-[9px] font-mono text-slate-600 border border-[#24334C] px-2 py-0.5 rounded bg-[#0B0F19]">
            v2.6-LIVE
          </div>
          <div className="text-[9px] font-mono text-[#00E676]">GEMINI CORE</div>
        </div>
      </div>

      {/* Core Insights Checklist */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Eye size={12} className="text-slate-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Core Insight Checklist</span>
        </div>
        <div className="flex flex-col gap-2">
          {insights.map((ins, i) => {
            const Icon = ins.icon
            return (
              <div
                key={i}
                className="flex gap-3 p-3 rounded-xl transition-all duration-200 hover:brightness-110"
                style={{ backgroundColor: `${ins.color}0A`, border: `1px solid ${ins.color}20` }}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: `${ins.color}18` }}>
                    <Icon size={11} style={{ color: ins.color }} />
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: ins.color }}>
                    {ins.label}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{ins.text}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tactical Directive */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-2">
          <Terminal size={12} className="text-[#00E676]" />
          <span className="text-[10px] font-bold text-[#00E676] uppercase tracking-widest">
            Automated Tactical Operational Directive
          </span>
        </div>
        <pre
          className="font-mono text-[10px] text-[#00E676] leading-relaxed overflow-auto flex-1"
          style={{
            background: '#080c14',
            border: '1px solid rgba(0,230,118,0.18)',
            borderRadius: 10,
            padding: '12px 14px',
            maxHeight: 260,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            scrollbarWidth: 'thin',
          }}
        >
          {directive}
        </pre>
      </div>

      {/* Quick action pills */}
      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#24334C]">
        {['Dispatch Medical', 'Alert Gate G', 'Broadcast Alert'].map(action => (
          <button
            key={action}
            className="text-[9px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wide transition-all duration-200 hover:bg-[#00E676]/10 hover:border-[#00E676]/40 hover:text-[#00E676]"
            style={{ color: '#64748b', borderColor: '#24334C', backgroundColor: 'transparent' }}
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// FAN CONCIERGE TERMINAL (VIEW A)
// ─────────────────────────────────────────────
function FanConciergeTerminal({ incidents, onAddIncident }) {
  const [language, setLanguage] = useState('en')
  const [issueText, setIssueText] = useState('')
  const [severity, setSeverity] = useState('Medium')
  const [aiResponse, setAIResponse] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [attachedFile, setAttachedFile] = useState(null)
  const [charCount, setCharCount] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleTextChange = (e) => {
    setIssueText(e.target.value)
    setCharCount(e.target.value.length)
    if (aiResponse) setAIResponse(null)
  }

  const handleSubmit = useCallback(async () => {
    if (!issueText.trim() || isProcessing) return
    setIsProcessing(true)
    setAIResponse(null)

    await new Promise(r => setTimeout(r, 1600))

    const responseFn = AI_RESPONSES[language] || AI_RESPONSES.en
    const response = responseFn(issueText, severity)
    setAIResponse(response)

    const now = new Date()
    const timeStr = now.toTimeString().slice(0, 8)
    onAddIncident({
      id: Date.now(),
      category: 'Fan Report',
      severity,
      location: 'Fan Submission',
      details: issueText,
      timestamp: timeStr,
      status: 'Active',
      reportedBy: `Fan (${LANGUAGES.find(l => l.code === language)?.name || 'Unknown'})`,
      zone: 'general',
      pinX: 30 + Math.random() * 40,
      pinY: 30 + Math.random() * 40,
    })

    setIsProcessing(false)
    setIssueText('')
    setCharCount(0)
    setAttachedFile(null)
  }, [issueText, language, severity, onAddIncident, isProcessing])

  return (
    <div className="flex justify-center py-6 px-4">
      {/* Phone wrapper */}
      <div
        className="w-full max-w-[420px] relative"
        style={{
          background: 'linear-gradient(160deg, #1c1c30 0%, #141424 100%)',
          border: '2px solid #2a3a52',
          borderRadius: 44,
          boxShadow: '0 0 80px rgba(0,0,0,0.7), 0 0 30px rgba(0,230,118,0.06), inset 0 1px 0 rgba(255,255,255,0.07)',
          padding: '14px 12px',
        }}
      >
        {/* Dynamic Island / Notch */}
        <div className="flex items-center justify-between px-2 mb-3">
          <div className="flex items-center gap-1.5 bg-[#0d0d1a] rounded-full px-3 py-1" style={{ fontSize: 9 }}>
            <span className="text-slate-500 font-mono">22:55</span>
          </div>
          <div
            className="h-7 flex items-center justify-center bg-[#0d0d1a] rounded-2xl px-4"
            style={{ minWidth: 100 }}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
              <span className="text-[9px] font-mono text-slate-400">LIVE</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-[#0d0d1a] rounded-full px-2 py-1">
            <Signal size={9} className="text-slate-500" />
            <Wifi size={9} className="text-slate-500" />
            <Battery size={9} className="text-slate-500" />
          </div>
        </div>

        {/* Phone screen */}
        <div
          className="rounded-[32px] overflow-hidden"
          style={{
            background: '#0B0F19',
            minHeight: 680,
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
          }}
        >
          {/* Top micro-header */}
          <div
            className="px-5 pt-5 pb-4"
            style={{
              background: 'linear-gradient(180deg, #0e1726 0%, #0B0F19 100%)',
              borderBottom: '1px solid #1e2d42',
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[9px] text-[#00E676] uppercase tracking-[0.2em] font-bold font-mono mb-0.5">
                  FIFA WORLD CUP
                </div>
                <div className="text-2xl font-black text-slate-100 tracking-tight leading-none">
                  2026<span className="text-[#00E676]">™</span>
                </div>
                <div className="text-[9px] text-slate-500 font-mono mt-1">StadiumVision AI · Fan Portal</div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end mb-1">
                  <PulsingDot color="#00E676" />
                  <span className="text-[#00E676] text-[10px] font-extrabold tracking-widest uppercase">LIVE</span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium leading-tight">MetLife Stadium Hub</div>
                <div className="text-[9px] text-slate-600 font-mono">82,500 FANS</div>
              </div>
            </div>

            {/* Mini KPI strip */}
            <div className="flex gap-2 mt-4">
              {[
                { label: 'Incidents', value: incidents.length, color: '#FF3D00' },
                { label: 'Active', value: incidents.filter(i => i.status === 'Active').length, color: '#FFD600' },
                { label: 'Resolved', value: incidents.filter(i => i.status === 'Resolved').length, color: '#00E676' },
              ].map(k => (
                <div
                  key={k.label}
                  className="flex-1 rounded-xl text-center py-2"
                  style={{ background: `${k.color}10`, border: `1px solid ${k.color}25` }}
                >
                  <div className="text-base font-black" style={{ color: k.color }}>{k.value}</div>
                  <div className="text-[8px] text-slate-500 uppercase tracking-wider mt-0.5">{k.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Form area */}
          <div className="px-4 pt-5 pb-4 space-y-4">
            {/* Language selector */}
            <div>
              <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-[0.15em] mb-1.5">
                🌐 Select Your Language
              </label>
              <div className="relative">
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="w-full bg-[#161F30] border border-[#24334C] text-slate-200 text-xs rounded-xl pl-3 pr-8 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:border-[#00E676]/50 transition-all cursor-pointer"
                  style={{ focusRingColor: 'rgba(0,230,118,0.4)' }}
                >
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Severity selector */}
            <div>
              <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-[0.15em] mb-1.5">
                ⚠️ Issue Severity
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {['Low', 'Medium', 'High'].map(sev => {
                  const cfg = SEVERITY_CONFIG[sev]
                  const isSelected = severity === sev
                  return (
                    <button
                      key={sev}
                      onClick={() => setSeverity(sev)}
                      className="py-2 rounded-xl text-xs font-extrabold transition-all duration-200 uppercase tracking-wide"
                      style={{
                        backgroundColor: isSelected ? `${cfg.color}18` : 'transparent',
                        border: `1px solid ${isSelected ? cfg.color : '#24334C'}`,
                        color: isSelected ? cfg.color : '#64748b',
                        boxShadow: isSelected ? `0 0 10px ${cfg.color}30` : 'none',
                      }}
                    >
                      {sev}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Text area */}
            <div>
              <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-[0.15em] mb-1.5">
                📝 Describe Your Issue
              </label>
              <div className="relative">
                <textarea
                  value={issueText}
                  onChange={handleTextChange}
                  placeholder="Describe what you're experiencing at the stadium. Our Gemini AI will translate and respond in your language..."
                  rows={4}
                  maxLength={500}
                  className="w-full text-xs rounded-xl p-3 resize-none placeholder:text-slate-700 focus:outline-none transition-all duration-300 leading-relaxed"
                  style={{
                    background: '#161F30',
                    border: issueText ? '1px solid rgba(0,230,118,0.4)' : '1px solid #24334C',
                    color: '#cbd5e1',
                    boxShadow: issueText ? '0 0 0 2px rgba(0,230,118,0.15)' : 'none',
                  }}
                />
                <div className="absolute bottom-2 right-2.5 text-[9px] text-slate-700 font-mono">{charCount}/500</div>
              </div>
            </div>

            {/* Attachment dropzone */}
            <div>
              <input type="file" accept="image/*" ref={fileInputRef}
                onChange={e => setAttachedFile(e.target.files?.[0]?.name || null)}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={e => {
                  e.preventDefault()
                  setIsDragOver(false)
                  setAttachedFile(e.dataTransfer.files?.[0]?.name || null)
                }}
                className="w-full flex flex-col items-center gap-2 py-4 rounded-xl transition-all duration-300"
                style={{
                  border: `2px dashed ${isDragOver ? '#00E676' : attachedFile ? 'rgba(0,230,118,0.5)' : '#24334C'}`,
                  background: isDragOver ? 'rgba(0,230,118,0.06)' : attachedFile ? 'rgba(0,230,118,0.04)' : 'transparent',
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                  style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.2)' }}
                >
                  <Camera size={18} className="text-[#00E676]" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-slate-400">
                    {attachedFile ? `📎 ${attachedFile}` : 'Snap & Upload Incident'}
                  </div>
                  <div className="text-[9px] text-slate-600 mt-0.5">Crowd / Safety / Facilities</div>
                </div>
              </button>
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={!issueText.trim() || isProcessing}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-extrabold text-sm transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: issueText.trim() && !isProcessing
                  ? 'linear-gradient(135deg, #00E676 0%, #00c862 100%)'
                  : '#1a2a3a',
                color: issueText.trim() && !isProcessing ? '#0B0F19' : '#475569',
                boxShadow: issueText.trim() && !isProcessing
                  ? '0 0 20px rgba(0,230,118,0.35), 0 4px 15px rgba(0,0,0,0.3)'
                  : 'none',
              }}
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  Gemini AI Processing...
                </>
              ) : (
                <>
                  <Send size={15} />
                  Submit to StadiumVision AI
                </>
              )}
            </button>
          </div>

          {/* AI Response */}
          {(isProcessing || aiResponse) && (
            <div
              className="mx-4 mb-5 rounded-xl p-4 animate-[slideIn_0.35s_ease-out]"
              style={{
                background: 'rgba(22,31,48,0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid #24334C',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,230,118,0.12)', border: '1px solid rgba(0,230,118,0.2)' }}>
                  <Cpu size={11} className="text-[#00E676]" />
                </div>
                <span className="text-[9px] font-extrabold text-[#00E676] uppercase tracking-widest">Gemini AI Response</span>
                {isProcessing && <RefreshCw size={10} className="text-[#00E676] animate-spin ml-auto" />}
              </div>

              {isProcessing ? (
                <div className="space-y-2">
                  {[85, 65, 75].map((w, i) => (
                    <div key={i} className="h-2 rounded animate-pulse" style={{ width: `${w}%`, background: '#24334C' }} />
                  ))}
                </div>
              ) : aiResponse && (
                <div className="space-y-3">
                  {aiResponse.translation !== issueText && (
                    <div className="p-2.5 rounded-lg" style={{ background: '#0B0F19', border: '1px solid #24334C' }}>
                      <div className="text-[8px] text-slate-500 uppercase tracking-wider mb-1.5 font-bold">🔤 Translation</div>
                      <div className="text-[11px] text-slate-300 leading-relaxed">{aiResponse.translation}</div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] text-slate-500 uppercase tracking-wider">Severity Analysis:</span>
                    <SeverityBadge severity={aiResponse.severity} />
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(0,230,118,0.05)', border: '1px solid rgba(0,230,118,0.15)' }}>
                    <div className="text-[8px] text-[#00E676] uppercase tracking-widest mb-2 font-extrabold">✅ AI Response</div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{aiResponse.response}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-600">
                    <CheckCircle2 size={10} className="text-[#00E676]" />
                    Incident logged to Command Center
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom navigation */}
          <div className="px-4 pt-3 pb-4 border-t border-[#1e2d42]">
            <div className="flex items-center justify-around">
              {[
                { icon: Activity, label: 'Status' },
                { icon: MessageSquare, label: 'Report', active: true },
                { icon: MapPin, label: 'Map' },
                { icon: Shield, label: 'Safety' },
              ].map(({ icon: Icon, label, active }) => (
                <div key={label} className="flex flex-col items-center gap-1 cursor-pointer group">
                  <div
                    className="w-9 h-9 rounded-2xl flex items-center justify-center transition-all"
                    style={{ background: active ? 'rgba(0,230,118,0.12)' : 'transparent' }}
                  >
                    <Icon size={15} style={{ color: active ? '#00E676' : '#475569' }} className="group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[8px] font-semibold" style={{ color: active ? '#00E676' : '#475569' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Home indicator */}
          <div className="flex justify-center pb-3">
            <div className="w-24 h-1 bg-[#24334C] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// WEATHER WIDGET
// ─────────────────────────────────────────────
function WeatherWidget() {
  return (
    <div className="bg-[#161F30] border border-[#24334C] rounded-xl p-4 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Thermometer size={16} className="text-[#FF3D00]" />
        <span className="text-xl font-black text-slate-100">36°C</span>
      </div>
      <div className="w-px h-8 bg-[#24334C]" />
      <div className="flex items-center gap-1.5">
        <Droplets size={13} className="text-sky-400" />
        <span className="text-xs text-slate-400">68% RH</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Wind size={13} className="text-slate-400" />
        <span className="text-xs text-slate-400">12 km/h SW</span>
      </div>
      <div className="ml-auto text-[10px] font-mono text-slate-600 uppercase tracking-wider">Field Conditions</div>
    </div>
  )
}

// ─────────────────────────────────────────────
// TRANSPORT WIDGET
// ─────────────────────────────────────────────
function TransportWidget() {
  const routes = [
    { icon: Bus, label: 'NJT Bus 355', status: 'On Time', color: '#00E676', eta: '4 min' },
    { icon: Car, label: 'Lot C Shuttle', status: 'Delayed', color: '#FFD600', eta: '12 min' },
    { icon: Bus, label: 'Express Link', status: 'Full', color: '#FF3D00', eta: '—' },
  ]
  return (
    <div className="bg-[#161F30] border border-[#24334C] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Navigation size={13} className="text-[#00E676]" />
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Transit Status</span>
      </div>
      <div className="space-y-2">
        {routes.map(r => {
          const Icon = r.icon
          return (
            <div key={r.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon size={12} style={{ color: r.color }} />
                <span className="text-[11px] text-slate-400">{r.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-600">{r.eta}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{ color: r.color, background: `${r.color}15`, border: `1px solid ${r.color}30` }}>
                  {r.status}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// VIEW B: MATCHDAY COMMAND CENTER
// ─────────────────────────────────────────────
function MatchdayCommandCenter({ incidents }) {
  const totalLogs = incidents.length
  const activeCrowdBottlenecks = incidents.filter(i => i.category === 'Crowd Control' && i.status === 'Active').length
  const highSeverity = incidents.filter(i => i.severity === 'High').length
  const resolved = incidents.filter(i => i.status === 'Resolved').length

  const kpis = [
    {
      icon: FileText,
      label: 'Total Live Logs',
      value: totalLogs,
      trend: '+2 last 10m',
      trendDir: 'up',
      accentColor: '#00E676',
      topBorder: null,
      sublabel: 'All categories combined',
    },
    {
      icon: Users,
      label: 'Crowd Bottlenecks',
      value: activeCrowdBottlenecks,
      trend: 'Live',
      trendDir: 'up',
      accentColor: '#FFD600',
      topBorder: '#FFD600',
      sublabel: 'Gate G & Entry Points',
    },
    {
      icon: AlertOctagon,
      label: 'High Severity Alerts',
      value: highSeverity,
      trend: 'CRITICAL',
      trendDir: 'up',
      accentColor: '#FF3D00',
      topBorder: '#FF3D00',
      sublabel: 'Requires immediate action',
    },
    {
      icon: CheckCircle2,
      label: 'Resolved Events',
      value: resolved,
      trend: 'All clear',
      trendDir: 'down',
      accentColor: '#00E676',
      topBorder: null,
      sublabel: 'Completed & closed',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Row 1: KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, i) => (
          <KPICard key={i} {...kpi} />
        ))}
      </div>

      {/* Row 1b: Utility bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <WeatherWidget />
        <TransportWidget />
      </div>

      {/* Row 2: Dual Column Workspace (65% / 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Map + Table (65%) */}
        <div className="lg:col-span-2">
          <div className="bg-[#161F30] border border-[#24334C] rounded-xl p-5">
            {/* Panel header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.15)' }}>
                  <Crosshair size={15} className="text-[#00E676]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Live Location & Tracking Feed</h3>
                  <p className="text-[10px] text-slate-500 font-mono">MetLife Stadium · East Rutherford, NJ, USA</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <PulsingDot color="#00E676" />
                  <span className="text-[10px] font-mono text-[#00E676] uppercase tracking-wide font-bold">Real-time</span>
                </div>
                <button className="text-[10px] text-slate-500 border border-[#24334C] px-2 py-1 rounded-lg hover:text-slate-300 hover:border-[#2e4060] transition-all flex items-center gap-1">
                  <Download size={10} />
                  Export
                </button>
              </div>
            </div>

            <StadiumMap incidents={incidents} />
            <IncidentTable incidents={incidents} />
          </div>
        </div>

        {/* Right: AI Commander (35%) */}
        <div className="lg:col-span-1">
          <AICommanderPanel incidents={incidents} />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// LIVE TICKER BAR
// ─────────────────────────────────────────────
function TickerBar({ incidents }) {
  const highAlerts = incidents.filter(i => i.severity === 'High')
  const tickers = [
    '⚽ USA vs. Portugal · LIVE · 67\' · 2–1',
    '🏟️ MetLife Stadium · Attendance: 82,500 / 82,500 SOLD OUT',
    `🚨 ${highAlerts.length} HIGH SEVERITY ALERTS ACTIVE — Response teams deployed`,
    '🌡️ Field Temp: 36°C · Humidity: 68% · UV Index: 9',
    '🚌 Transit: 4 shuttle buses dispatched from NJT Hub',
    '♻️ Sustainability target: 85% waste diversion — on track',
    '🔐 Security perimeter: All checkpoints nominal',
    '🌐 Fan portal: 12,847 active users across 64 countries',
  ]

  const [offset, setOffset] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setOffset(p => (p + 1) % tickers.length), 4500)
    return () => clearInterval(id)
  }, [tickers.length])

  return (
    <div className="border-b border-[#24334C] overflow-hidden" style={{ height: 38, background: 'rgba(22,31,48,0.6)' }}>
      <div className="max-w-[1600px] mx-auto px-6 h-full flex items-center gap-4">
        <div className="flex items-center gap-2 flex-shrink-0 border-r border-[#24334C] pr-4">
          <Radio size={10} className="text-[#00E676] animate-pulse" />
          <span className="text-[9px] font-extrabold text-[#00E676] uppercase tracking-widest">Live Feed</span>
        </div>
        <div className="flex-1 overflow-hidden h-full flex items-center">
          <div key={offset} className="text-[11px] text-slate-400 font-mono whitespace-nowrap"
            style={{ animation: 'slideIn 0.4s ease-out' }}>
            {tickers[offset]}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 border-l border-[#24334C] pl-4">
          {[
            { color: '#FF3D00', count: incidents.filter(i => i.severity === 'High').length, label: 'HIGH' },
            { color: '#FFD600', count: incidents.filter(i => i.severity === 'Medium').length, label: 'MED' },
            { color: '#00E676', count: incidents.filter(i => i.severity === 'Low').length, label: 'LOW' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-[10px] font-bold font-mono" style={{ color: s.color }}>{s.count}</span>
              <span className="text-[9px] text-slate-600">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// APP HEADER
// ─────────────────────────────────────────────
function AppHeader({ activeView, setActiveView, incidents }) {
  const [currentTime, setCurrentTime] = useState(new Date().toTimeString().slice(0, 8))

  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date().toTimeString().slice(0, 8)), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header
      className="sticky top-0 z-50 border-b border-[#24334C]"
      style={{ background: 'rgba(11,15,25,0.96)', backdropFilter: 'blur(24px)' }}
    >
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(0,230,118,0.1)',
                border: '1px solid rgba(0,230,118,0.2)',
                boxShadow: '0 0 16px rgba(0,230,118,0.2)',
              }}
            >
              <Radar size={18} className="text-[#00E676]" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-100 tracking-tight">
                StadiumVision <span className="text-[#00E676]">AI</span>
              </div>
              <div className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">FIFA World Cup 2026™</div>
            </div>

            <div className="flex items-center gap-1.5 ml-1 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(255,61,0,0.1)', border: '1px solid rgba(255,61,0,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF3D00] animate-pulse" />
              <span className="text-[10px] font-bold text-[#FF3D00] uppercase tracking-widest">LIVE</span>
            </div>
          </div>

          {/* Tab Navigator */}
          <nav className="flex items-center gap-1 p-1 rounded-xl flex-shrink-0"
            style={{ background: '#161F30', border: '1px solid #24334C' }}>
            {[
              { id: 'fan', emoji: '🌐', label: 'Fan Concierge Terminal' },
              { id: 'command', emoji: '🏟️', label: 'Matchday Command Center' },
            ].map(tab => {
              const isActive = activeView === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-250"
                  style={{
                    background: isActive ? 'rgba(0,230,118,0.1)' : 'transparent',
                    color: isActive ? '#00E676' : '#64748b',
                    border: isActive ? '1px solid rgba(0,230,118,0.3)' : '1px solid transparent',
                    boxShadow: isActive ? '0 0 12px rgba(0,230,118,0.15)' : 'none',
                  }}
                >
                  <span>{tab.emoji}</span>
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Right meta */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden lg:flex flex-col items-end">
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <Clock size={10} className="text-[#00E676]" />
                <span className="tabular-nums">{currentTime}</span>
                <span className="text-slate-600">UTC+5:30</span>
              </div>
              <div className="text-[9px] text-slate-600 uppercase tracking-wider">Group Stage · Match 41</div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{ background: '#161F30', border: '1px solid #24334C' }}>
              <Lock size={10} className="text-[#00E676]" />
              <span className="text-[10px] font-mono text-slate-400">SECURE</span>
            </div>

            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs"
              style={{ background: 'linear-gradient(135deg, #00E676 0%, #00b051 100%)', color: '#0B0F19' }}
            >
              OP
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

// ─────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────
export default function App() {
  const [activeView, setActiveView] = useState('command')
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS)

  const handleAddIncident = useCallback((incident) => {
    setIncidents(prev => [incident, ...prev])
  }, [])

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      {/* Background grid dots */}
      <div
        className="fixed inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(36,51,76,0.5) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Ambient radial glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,230,118,0.05) 0%, transparent 70%)',
        }}
      />

      <AppHeader activeView={activeView} setActiveView={setActiveView} incidents={incidents} />
      <TickerBar incidents={incidents} />

      <main className="max-w-[1600px] mx-auto px-6 py-8 relative">
        {activeView === 'fan' ? (
          <FanConciergeTerminal incidents={incidents} onAddIncident={handleAddIncident} />
        ) : (
          <MatchdayCommandCenter incidents={incidents} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#24334C] mt-6" style={{ background: 'rgba(22,31,48,0.4)' }}>
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radar size={12} className="text-[#00E676]" />
            <span className="text-[10px] text-slate-600 font-mono">
              StadiumVision AI · Powered by Gemini · FIFA World Cup 2026™ · All rights reserved
            </span>
          </div>
          <div className="flex items-center gap-5 text-[9px] text-slate-700 font-mono">
            <span>System Health: <span className="text-[#00E676] font-bold">99.8%</span></span>
            <span>Latency: <span className="text-[#00E676] font-bold">12ms</span></span>
            <span>Uptime: <span className="text-[#00E676] font-bold">99.99%</span></span>
            <span>Nodes: <span className="text-[#00E676] font-bold">47 active</span></span>
          </div>
        </div>
      </footer>
    </div>
  )
}
