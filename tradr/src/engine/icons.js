// Auto-extracted verbatim: SVG icon + tint string builders. Used via dangerouslySetInnerHTML for inline SVG.

export function pheroTint(i){return ['linear-gradient(150deg,#8b6cf0 0%,#b9a6ff 100%)','linear-gradient(150deg,#3b74f0 0%,#86b0ff 100%)','linear-gradient(150deg,#14b88a 0%,#6fe0b8 100%)','linear-gradient(150deg,#f0a020 0%,#ffd27a 100%)','linear-gradient(150deg,#ec5a92 0%,#ffa3c6 100%)','linear-gradient(150deg,#6470e0 0%,#a6acf5 100%)'][i%6];}
export function pheroMark(){return '<svg class="phwm" viewBox="0 0 24 24"><path d="M6 4h12v4.5a6 6 0 0 1-12 0z" fill="none" stroke="#fff" stroke-width="1.4"/><path d="M12 14.5V19M8.5 21h7M4.5 5H2.6v1.6A3.4 3.4 0 0 0 6 10M19.5 5h1.9v1.6A3.4 3.4 0 0 1 18 10" fill="none" stroke="#fff" stroke-width="1.3"/></svg>';}

export function symGlyph(s){return {'XAU/USD':'Au','BTC/USD':'\u20BF','EUR/USD':'\u20AC','US100':'NQ'}[s]||s.slice(0,2);}
export function symTint(s){return {'XAU/USD':'linear-gradient(145deg,#e6bf66,#c8912f)','BTC/USD':'linear-gradient(145deg,#ffb347,#f7931a)','EUR/USD':'linear-gradient(145deg,#5b8bff,#2f6bff)','US100':'linear-gradient(145deg,#9a7cff,#7c5cff)'}[s]||'linear-gradient(145deg,#8a8f98,#5f636d)';}
export function symIcon(s){var m={
    'XAU/USD':'<ellipse cx="12" cy="8.4" rx="6" ry="2.4" fill="#fff"/><path d="M6 8.4v3.1c0 1.32 2.69 2.4 6 2.4s6-1.08 6-2.4V8.4" fill="none" stroke="#fff" stroke-width="1.5"/><path d="M6 11.6v3.1c0 1.32 2.69 2.4 6 2.4s6-1.08 6-2.4v-3.1" fill="none" stroke="#fff" stroke-width="1.5"/>',
    'BTC/USD':'<text x="12" y="17" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="15" font-weight="700" fill="#fff">\u20BF</text>',
    'EUR/USD':'<text x="12" y="17" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="15" font-weight="700" fill="#fff">\u20AC</text>',
    'US100':'<rect x="6" y="11" width="2.6" height="7" rx="1" fill="#fff"/><rect x="10.7" y="8" width="2.6" height="10" rx="1" fill="#fff"/><rect x="15.4" y="6" width="2.6" height="12" rx="1" fill="#fff"/>'};
    return '<svg viewBox="0 0 24 24">'+(m[s]||'')+'</svg>';}
export function cadTint(k){return {daily:'linear-gradient(145deg,#ffc24b,#f59e0b)',weekly:'linear-gradient(145deg,#5b8bff,#2f6bff)',monthly:'linear-gradient(145deg,#9a7cff,#7c5cff)',quarterly:'linear-gradient(145deg,#34d399,#10b981)',yearly:'linear-gradient(145deg,#ff7eb3,#ff2e88)'}[k]||'linear-gradient(145deg,#8a8f98,#5f636d)';}
export function cadIcon(k){var m={
    daily:'<path d="M13 3L6 13h4.5l-.8 7.5L18 10h-4.5L13 3z" fill="#fff"/>',
    weekly:'<rect x="4.5" y="5.5" width="15" height="14" rx="2.2" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M4.5 9.5h15M9 3.5v4M15 3.5v4" stroke="#fff" stroke-width="1.6"/>',
    monthly:'<circle cx="12" cy="12" r="8" fill="none" stroke="#fff" stroke-width="1.5"/><ellipse cx="12" cy="12" rx="3.4" ry="8" fill="none" stroke="#fff" stroke-width="1.3"/><path d="M4.3 12h15.4" stroke="#fff" stroke-width="1.3"/>',
    quarterly:'<path d="M6.5 4.5h11v3.5a5.5 5.5 0 0 1-11 0z" fill="none" stroke="#fff" stroke-width="1.5"/><path d="M12 13.5v4M9 19.5h6" stroke="#fff" stroke-width="1.6"/>',
    yearly:'<path d="M12 4l2.2 4.6 5 .7-3.6 3.6.85 5L12 15.6 7.55 17.9l.85-5L4.8 9.3l5-.7L12 4z" fill="#fff"/>'};
    return '<svg viewBox="0 0 24 24">'+(m[k]||'')+'</svg>';}
export function prodTint(k){return {journal:'linear-gradient(145deg,#9a7cff,#7c5cff)',perf:'linear-gradient(145deg,#34d399,#10b981)',tournament:'linear-gradient(145deg,#ffc24b,#f59e0b)',reports:'linear-gradient(145deg,#5b8bff,#2f6bff)'}[k]||'linear-gradient(145deg,#8a8f98,#5f636d)';}
export function prodIcon(k){var m={
    journal:'<rect x="5" y="3" width="13.5" height="18" rx="2" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M9 3v18" stroke="#fff" stroke-width="1.5"/><path d="M12 8.5h4M12 12h4" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>',
    perf:'<path d="M4 16.5l4.5-4.5 3 2.5L20 6" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 6h5v5" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    tournament:'<path d="M7 4h10v4a5 5 0 0 1-10 0z" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M12 13v4M9 19h6" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><path d="M5 5H3.2v1.4A3 3 0 0 0 6 9.4M19 5h1.8v1.4A3 3 0 0 1 18 9.4" fill="none" stroke="#fff" stroke-width="1.4"/>',
    reports:'<rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>'};
    return '<svg viewBox="0 0 24 24">'+(m[k]||'')+'</svg>';}
export function statIcon(k){var m={
    accounts:'<rect x="4" y="6" width="16" height="12" rx="2" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M4 10h16" stroke="#fff" stroke-width="1.6"/>',
    equity:'<rect x="4" y="7" width="16" height="11" rx="2" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M4 11h16M16 14h1.5" stroke="#fff" stroke-width="1.6"/>',
    pnl:'<path d="M4 16l4-4 3 2.5L20 7" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 7h5v5" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    rank:'<path d="M7 4h10v4a5 5 0 0 1-10 0z" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M12 13v4M9 19h6M5 5H3v2a3 3 0 0 0 3 3M19 5h2v2a3 3 0 0 1-3 3" fill="none" stroke="#fff" stroke-width="1.5"/>'};
    return '<svg viewBox="0 0 24 24">'+(m[k]||'')+'</svg>';}
export function medalIcon(r){var c={1:['#f6de8e','#caa04a','#6b4e12'],2:['#eef0f3','#abafb6','#494c51'],3:['#e6b07b','#a06e3d','#5a3a18']}[r]||['#ccc','#999','#333'];
    return '<svg viewBox="0 0 24 24"><path d="M8.5 2L6.6 8.4l3.4.5L11.2 2z" fill="'+c[1]+'"/><path d="M15.5 2l1.9 6.4-3.4.5L12.8 2z" fill="'+c[1]+'" opacity=".72"/>'+
      '<circle cx="12" cy="15.2" r="6.6" fill="'+c[0]+'" stroke="'+c[1]+'" stroke-width="1.3"/><circle cx="12" cy="15.2" r="4.4" fill="none" stroke="'+c[1]+'" stroke-width=".8" opacity=".55"/>'+
      '<text x="12" y="15.2" text-anchor="middle" dominant-baseline="central" font-family="JetBrains Mono,monospace" font-size="7" font-weight="700" fill="'+c[2]+'">'+r+'</text></svg>';}
export function pstatIcon(k){var m={
    ret:'<path d="M4 16.5l4.5-4.5 3 2.5L20 6" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 6h5v5" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    win:'<circle cx="12" cy="12" r="7.5" fill="none" stroke="#fff" stroke-width="1.5"/><circle cx="12" cy="12" r="3.6" fill="none" stroke="#fff" stroke-width="1.5"/><circle cx="12" cy="12" r="1" fill="#fff"/>',
    dd:'<path d="M4 7.5l4.5 4.5 3-2.5L20 18" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 18h5v-5" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    sharpe:'<path d="M4 17a8 8 0 0 1 16 0" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M12 17l4.5-4" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="17" r="1.4" fill="#fff"/>'};
    return '<svg viewBox="0 0 24 24">'+(m[k]||'')+'</svg>';}

export function algoIcon(k){var m={
    bolt:'<path d="M13 3L6 13h4.5l-.8 7.5L18 10h-4.5L13 3z" fill="#fff"/>',
    grid:'<rect x="4" y="4" width="7" height="7" rx="1.4" fill="#fff"/><rect x="13" y="4" width="7" height="7" rx="1.4" fill="#fff"/><rect x="4" y="13" width="7" height="7" rx="1.4" fill="#fff"/><rect x="13" y="13" width="7" height="7" rx="1.4" fill="#fff"/>',
    clock:'<circle cx="12" cy="12" r="8" fill="none" stroke="#fff" stroke-width="1.7"/><path d="M12 7.5V12l3 2" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    trend:'<path d="M4 16.5l4.5-4.5 3 2.5L20 6" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 6h5v5" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    news:'<rect x="4.5" y="4" width="15" height="16" rx="2" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M8 8.5h8M8 12h8M8 15.5h5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>',
    wave:'<path d="M3 13c2.5 0 2.5-5 5-5s2.5 5 5 5 2.5-5 5-5 2.5 5 3 5" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>'};
    return '<svg viewBox="0 0 24 24">'+(m[k]||'')+'</svg>';}
