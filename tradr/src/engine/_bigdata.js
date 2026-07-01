// Auto-extracted verbatim from the prototype (large static datasets).

export const IDEAS=[
    {cat:'Macro',lens:'Event',sym:'XAU/USD',hz:'day',title:'Non-Farm Payrolls',sub:'Fri · 13:30',tag:'High impact',ev:true,evt:'NFP release',evtime:'Fri 13:30',entry:'Pre-position, or react to the spike',resolve:'Fri close',
     thesis:'Consensus +180K jobs. A soft print pressures the dollar and historically lifts gold; a hot number does the opposite.',
     buy:{lbl:'Buy Gold',sub:'on a miss',pc:62},sell:{lbl:'Sell Gold',sub:'on a beat',pc:38},runners:1240,bull:'A soft jobs number weakens the dollar — gold usually catches a fast safe-haven bid.',bear:'A hot print lifts yields and the dollar; gold tends to get sold into the spike.'},
    {cat:'Macro',lens:'Event',sym:'US100',hz:'day',title:'US CPI Inflation',sub:'Wed · 13:30',tag:'High impact',ev:true,evt:'CPI print',evtime:'Wed 13:30',entry:'React to the print, not before',resolve:'Wed close',
     thesis:'Cooler-than-expected inflation tends to fuel a risk-on bid into the Nasdaq; a hot print revives rate-hike fears.',
     buy:{lbl:'Buy Nasdaq',sub:'soft CPI',pc:58},sell:{lbl:'Sell Nasdaq',sub:'hot CPI',pc:42},runners:980,bull:'Cooler inflation eases rate-hike fears and tends to spark a risk-on rally in tech.',bear:'A hot CPI revives hike bets — the Nasdaq is first to sell off on that.'},
    {cat:'Macro',lens:'Event',sym:'EUR/USD',hz:'day',title:'Fed Rate Decision',sub:'Wed · 19:00',tag:'High impact',ev:true,evt:'Fed decision',evtime:'Wed 19:00',entry:'Wait for the statement & presser',resolve:'Wed close',
     thesis:'A hold is priced in — the move is in the tone. A hawkish hold lifts the dollar and pressures EUR/USD.',
     buy:{lbl:'Buy EUR',sub:'dovish hold',pc:45},sell:{lbl:'Sell EUR',sub:'hawkish hold',pc:55},runners:1510,bull:'A dovish tone caps the dollar and lets EUR/USD lift off support.',bear:'A hawkish hold keeps the dollar bid and pressures the euro lower.'},
    {cat:'Crypto',lens:'Technical',sym:'BTC/USD',hz:'day',title:'Bitcoin breakout',sub:'Live setup',tag:'Momentum',ev:false,evt:'Break of 64K',evtime:'on the break',entry:'Enter on the break, stop below range',resolve:'~24h',
     thesis:'BTC is coiling under resistance on falling volume. A clean break tends to carry; a rejection sends it back to range support.',
     buy:{lbl:'Buy breakout',sub:'reclaim 64K',pc:60},sell:{lbl:'Sell rejection',sub:'fail 64K',pc:40},runners:2240,bull:'A clean break of 64K on real volume tends to run as shorts get squeezed.',bear:'Falling volume into resistance often means a fakeout back to range support.'},
    {cat:'Indices',lens:'Technical',sym:'US100',hz:'swing',title:'Nasdaq trend',sub:'Live setup',tag:'Trend',ev:false,evt:'Pullback',evtime:'to 19,600',entry:'Buy the dip into support',resolve:'open-ended',
     thesis:'Uptrend intact while price holds above 19,600. Buy the dips into support; only flip short on a clean break below.',
     buy:{lbl:'Buy the dip',sub:'holds 19,600',pc:67},sell:{lbl:'Sell the break',sub:'loses 19,600',pc:33},runners:1340,bull:'Trend is intact above 19,600 — dips into support have been bought every time.',bear:'A clean break below 19,600 flips the trend and opens a deeper flush.'},
    {cat:'Commodities',lens:'Technical',sym:'XAU/USD',hz:'day',title:'Gold range',sub:'Live setup',tag:'Range',ev:false,evt:'Tag the edge',evtime:'2,380 / 2,440',entry:'Fade at support or resistance',resolve:'open-ended',
     thesis:'Gold is boxed between 2,380 support and 2,440 resistance. Fade the edges until one side gives way.',
     buy:{lbl:'Buy support',sub:'near 2,380',pc:50},sell:{lbl:'Sell resistance',sub:'near 2,440',pc:50},runners:760,bull:'Near 2,380 support the risk-reward favours a bounce back toward the top of the range.',bear:'Near 2,440 resistance the edge is fading the move until a breakout proves otherwise.'},
    {cat:'FX',lens:'Technical',sym:'EUR/USD',hz:'day',title:'EUR/USD pivot',sub:'Live setup',tag:'Mean reversion',ev:false,evt:'Pivot test',evtime:'1.0900',entry:'Trade the reaction at the pivot',resolve:'open-ended',
     thesis:'The euro is testing the 1.0900 pivot. A daily reclaim opens upside; rejection keeps the downtrend in control.',
     buy:{lbl:'Buy reclaim',sub:'above 1.0900',pc:48},sell:{lbl:'Sell rejection',sub:'below 1.0900',pc:52},runners:890,bull:'A daily reclaim of 1.0900 flips the pivot to support and opens upside.',bear:'Rejection at 1.0900 keeps the downtrend firmly in control.'},
    {cat:'Crypto',lens:'Sentiment',sym:'BTC/USD',hz:'swing',title:'BTC ETF flows',sub:'Daily read',tag:'Flow',ev:false,evt:'Flows update',evtime:'daily 21:00',entry:'Buy dips while inflows hold',resolve:'daily',
     thesis:'Strong net inflows have underpinned every recent dip. Watch for flows to turn — that is the signal to fade strength.',
     buy:{lbl:'Buy dips',sub:'inflows hold',pc:64},sell:{lbl:'Sell strength',sub:'flows turn',pc:36},runners:1620,bull:'Persistent net inflows have underpinned every dip — the flow is the floor.',bear:'The moment flows turn negative that support vanishes and strength is for selling.'},
    {cat:'Macro',lens:'Event',sym:'US100',hz:'day',title:'Jobless Claims',sub:'Thu · 13:30',tag:'Medium impact',ev:true,evt:'Claims release',evtime:'Thu 13:30',entry:'React to the print',resolve:'Thu close',
     thesis:'Rising claims hint at a cooling labour market and a softer Fed — supportive for equities. A low print does the reverse.',
     buy:{lbl:'Buy Nasdaq',sub:'claims rise',pc:54},sell:{lbl:'Sell Nasdaq',sub:'claims fall',pc:46},runners:540,bull:'Rising claims point to a cooling labour market and a softer Fed — good for stocks.',bear:'A low print signals a hot economy and a higher-for-longer Fed — a headwind for tech.'},
    {cat:'Commodities',lens:'Sentiment',sym:'XAU/USD',hz:'swing',title:'Crowd is max long gold',sub:'Positioning',tag:'Contrarian',ev:false,evt:'Crowd unwind',evtime:'watch',entry:'Fade the crowd, or wait for the flush',resolve:'open-ended',
     thesis:'Retail positioning shows roughly 78% of accounts long gold. Crowded one-way books tend to wobble when late longs get shaken out.',
     buy:{lbl:'Follow the crowd',sub:'momentum holds',pc:34},sell:{lbl:'Fade the crowd',sub:'squeeze longs',pc:66},runners:840,
     bull:'Strong trends can stay crowded for a long time, and being long with the herd still pays while momentum holds.',bear:'When 78% are leaning one way, the unwind is violent, so fading the crowd front-runs the flush.'},
    {cat:'Crypto',lens:'Sentiment',sym:'BTC/USD',hz:'day',title:'BTC funding flipped negative',sub:'Funding rate',tag:'Flow',ev:false,evt:'Funding reset',evtime:'8h cycle',entry:'Trade the funding reset',resolve:'~8h',
     thesis:'Perp funding just turned negative, so shorts are now paying longs. A crowded short base is classic fuel for a squeeze higher.',
     buy:{lbl:'Buy the squeeze',sub:'shorts pay up',pc:57},sell:{lbl:'Stay short',sub:'trend down',pc:43},runners:1180,
     bull:'Negative funding means shorts are crowded and paying to hold, which is where squeezes higher tend to start.',bear:'Funding can stay negative in a real downtrend, so the flow alone is not a bottom.'},
    {cat:'Commodities',lens:'Quant',sym:'XAU/USD',hz:'swing',title:'Gold seasonality window',sub:'Stat edge',tag:'Seasonal',ev:false,evt:'Seasonal window',evtime:'this month',entry:'Position for the seasonal drift',resolve:'month',
     thesis:'Gold has closed this calendar month higher in a clear majority of the last 15 years. A statistical tailwind, not a chart call.',
     buy:{lbl:'Buy the season',sub:'with the stat',pc:63},sell:{lbl:'Fade the stat',sub:'against it',pc:37},runners:620,
     bull:'The seasonal base rate leans up this month, so you are trading with a positive expectancy edge.',bear:'Seasonality is an average, not a guarantee, and a strong dollar can override the stat in any single year.'},
    {cat:'Indices',lens:'Quant',sym:'US100',hz:'swing',title:'Month-end rebalance drift',sub:'Stat edge',tag:'Seasonal',ev:true,evt:'Month-end',evtime:'last 2 days',entry:'Position into the rebalance window',resolve:'month-end',
     thesis:'Index funds tend to rebalance into month-end, which has historically added a small upward drift to equities in the final sessions.',
     buy:{lbl:'Buy the drift',sub:'rebalance bid',pc:59},sell:{lbl:'Fade strength',sub:'no follow-through',pc:41},runners:540,
     bull:'Passive rebalancing flows lean buy into month-end, a repeatable statistical tailwind.',bear:'In a weak tape the rebalance bid is small and easily swamped by macro selling.'},
    {cat:'Commodities',lens:'Intermarket',sym:'XAU/USD',hz:'swing',title:'Dollar rolling over, gold lifts',sub:'DXY link',tag:'Intermarket',ev:false,evt:'DXY break',evtime:'on the break',entry:'Buy gold as the dollar breaks down',resolve:'open-ended',
     thesis:'The dollar index is failing at resistance. Gold is priced in dollars, so a weaker dollar mechanically lifts gold, all else equal.',
     buy:{lbl:'Buy gold',sub:'dollar weak',pc:64},sell:{lbl:'Sell gold',sub:'dollar bid',pc:36},runners:910,
     bull:'A rolling-over dollar is a direct tailwind for gold, one of the most reliable links in macro.',bear:'If the dollar finds a bid at support instead, the whole setup inverts and gold gets sold.'},
    {cat:'Indices',lens:'Intermarket',sym:'US100',hz:'day',title:'Yields spiking, tech under pressure',sub:'Rates link',tag:'Intermarket',ev:false,evt:'Yield move',evtime:'watch 10Y',entry:'Short tech if yields break higher',resolve:'open-ended',
     thesis:'The 10-year yield is pressing higher. Long-duration tech is the most rate-sensitive corner of the market, so rising yields pressure the Nasdaq first.',
     buy:{lbl:'Buy the dip',sub:'yields ease',pc:42},sell:{lbl:'Short tech',sub:'yields rip',pc:58},runners:780,
     bull:'If yields back off, the pressure lifts and tech tends to bounce hardest, so the dip gets bought.',bear:'Rising long-end yields hit high-multiple tech first, and the Nasdaq leads the move down.'},
    {cat:'Commodities',lens:'Catalyst',sym:'XAU/USD',hz:'day',title:'Risk-off headline bid',sub:'News-driven',tag:'News',ev:false,evt:'Headline risk',evtime:'live',entry:'React to the safe-haven bid',resolve:'~24h',
     thesis:'Geopolitical headlines are driving a safe-haven bid. Gold tends to spike first on risk-off and give some back as the dust settles.',
     buy:{lbl:'Buy the fear',sub:'risk-off bid',pc:55},sell:{lbl:'Fade the spike',sub:'mean reversion',pc:45},runners:700,
     bull:'Risk-off headlines send fast money into gold, and the initial spike has real momentum.',bear:'Headline spikes often fade once the panic cools, so selling the spike catches the give-back.'},
    {cat:'Indices',lens:'Catalyst',sym:'US100',hz:'day',title:'Big-tech earnings week',sub:'Earnings',tag:'Catalyst',ev:true,evt:'Earnings',evtime:'after close',entry:'Trade the post-earnings move',resolve:'next session',
     thesis:'Mega-cap tech reports this week and these names carry the index. A strong print lifts the whole Nasdaq, a miss drags it.',
     buy:{lbl:'Buy a beat',sub:'strong guide',pc:53},sell:{lbl:'Sell a miss',sub:'weak guide',pc:47},runners:1020,
     bull:'Mega-cap beats tend to lift the entire index, and one strong guide can carry the tape.',bear:'These names are priced for perfection, so any wobble in guidance and the index sells off hard.'}
  ];

export const ALGOS=[
    {id:'momentum',name:'Momentum Breakout',tag:'Trend',ic:'bolt',tint:'linear-gradient(145deg,#34d399,#10b981)',markets:'Gold · Nasdaq',style:'Breakout · day',freq:'3–6 trades/day',ret:42.6,win:54,dd:11.2,sharpe:1.6},
    {id:'meanrev',name:'Mean Reversion Grid',tag:'Range',ic:'grid',tint:'linear-gradient(145deg,#5b8bff,#2f6bff)',markets:'EUR/USD · Gold',style:'Fades extremes',freq:'8–14 trades/day',ret:28.1,win:71,dd:14.8,sharpe:1.3},
    {id:'london',name:'London Open Scalper',tag:'Scalp',ic:'clock',tint:'linear-gradient(145deg,#9a7cff,#7c5cff)',markets:'Indices · FX',style:'Session scalp',freq:'London session',ret:35.4,win:61,dd:9.4,sharpe:1.8},
    {id:'goldtrend',name:'Gold Trend Follower',tag:'Trend',ic:'trend',tint:'linear-gradient(145deg,#ffc24b,#f59e0b)',markets:'Gold',style:'Swing · trend',freq:'1–3 trades/day',ret:51.2,win:48,dd:16.1,sharpe:1.4},
    {id:'newsfade',name:'News Spike Fader',tag:'Event',ic:'news',tint:'linear-gradient(145deg,#f87171,#e5484d)',markets:'All majors',style:'Fades news spikes',freq:'On high-impact',ret:23.8,win:66,dd:8.2,sharpe:1.5},
    {id:'volharvest',name:'Volatility Harvester',tag:'Vol',ic:'wave',tint:'linear-gradient(145deg,#5bc8ff,#2f9bff)',markets:'BTC · Nasdaq',style:'Sells spikes',freq:'Adaptive',ret:31.0,win:58,dd:12.6,sharpe:1.5}
  ];

export const CAT_ORDER=['geopolitical','macro','centralbank','technical','quant','onchain','positioning'];
export const CATNAME={geopolitical:'Geopolitical',macro:'Macro',centralbank:'Central bank',technical:'Technical',quant:'Quant',onchain:'On-chain',positioning:'Positioning'};
export const CATSRC={geopolitical:['Reuters','Bloomberg','AP','AFP'],macro:['Bloomberg','Reuters','BLS','Trading Economics'],centralbank:['Fed wire','ECB wire','Reuters','Bloomberg'],technical:['Tradr TA','Chart Desk','TA Engine'],quant:['Quant Desk','Signal Lab','Tradr Quant'],onchain:['Glassnode','CryptoQuant','Tradr On-chain'],positioning:['CFTC COT','Tradr Sentiment','Exchange data','ETF flows']};
export const HZLBL={scalp:{l:'Scalp',s:'minutes'},intraday:{l:'Intraday',s:'hours'},swing:{l:'Swing',s:'days'}};
  function assetSession(a){return a==='BTC/USD'?'24/7 crypto':a==='US100'?'New York session':'London / New York';}

export const CATTPL={
    geopolitical:[
      {ev:'Iran\u2013Israel tensions escalate; Gulf shipping on alert',asset:'XAU/USD',lean:'bull',hz:'swing',why:'Conflict in the Middle East drives safe-haven flows, and gold is the classic hedge when geopolitical risk spikes.',hist:'Gold rose in 7 of the last 8 comparable escalations, +2.3% average over 5 sessions.'},
      {ev:'Strait of Hormuz traffic disrupted by naval incident',asset:'XAU/USD',lean:'bull',hz:'swing',why:'Threats to global oil transit raise inflation and risk-off positioning, both supportive for gold.',hist:'Energy-supply shocks have lifted gold within a week about 70% of the time.'},
      {ev:'US\u2013China trade rhetoric hardens on fresh tariffs',asset:'US100',lean:'bear',hz:'swing',why:'Tech-heavy indices carry the most tariff and supply-chain exposure, so they tend to sell off first on trade friction.',hist:'The Nasdaq fell after 6 of the last 9 major tariff headlines, -1.4% average.'},
      {ev:'European energy supply fears return as flows are cut',asset:'EUR/USD',lean:'bear',hz:'swing',why:'Europe is energy-import dependent, so supply shocks weaken growth and the euro.',hist:'EUR/USD weakened through most prior European energy squeezes.'},
      {ev:'Ceasefire talks progress in an active conflict zone',asset:'XAU/USD',lean:'bear',hz:'intraday',why:'Credible de-escalation unwinds the safe-haven premium built into gold.',hist:'Gold gave back gains after 5 of 7 credible ceasefire headlines.'}
    ],
    macro:[
      {ev:'US CPI prints hotter than expected',asset:'XAU/USD',lean:'bear',hz:'intraday',why:'Hot inflation lifts rate-hike odds and real yields, which pressures non-yielding gold.',hist:'Gold fell after 8 of the last 12 upside CPI surprises.'},
      {ev:'US CPI comes in cooler than forecast',asset:'US100',lean:'bull',hz:'intraday',why:'Softer inflation revives rate-cut hopes, a tailwind for high-duration tech.',hist:'The Nasdaq rallied after 7 of 10 downside CPI prints.'},
      {ev:'US jobs report smashes forecasts',asset:'EUR/USD',lean:'bear',hz:'intraday',why:'A strong labour market supports the dollar and higher-for-longer rates, weighing on EUR/USD.',hist:'EUR/USD fell on the day in roughly two thirds of strong payroll surprises.'},
      {ev:'US growth data disappoints sharply',asset:'XAU/USD',lean:'bull',hz:'swing',why:'Weak growth raises easing expectations and safe-haven demand, both gold-positive.',hist:'Gold advanced after most major US growth misses.'},
      {ev:'Eurozone PMIs slide into contraction',asset:'EUR/USD',lean:'bear',hz:'swing',why:'Deteriorating activity points to a weaker euro versus the dollar.',hist:'EUR/USD softened in the days after most sub-50 PMI prints.'}
    ],
    centralbank:[
      {ev:'Fed signals a dovish pause on rates',asset:'US100',lean:'bull',hz:'swing',why:'Lower expected rates reduce the discount on future tech earnings, lifting growth stocks.',hist:'The Nasdaq rose after most dovish Fed pivots.'},
      {ev:'Fed strikes a hawkish tone, more hikes hinted',asset:'XAU/USD',lean:'bear',hz:'swing',why:'Higher real yields raise the opportunity cost of holding gold.',hist:'Gold fell after a majority of hawkish Fed surprises.'},
      {ev:'ECB hikes more than markets expected',asset:'EUR/USD',lean:'bull',hz:'intraday',why:'A more aggressive ECB widens rate differentials in the euro favour.',hist:'EUR/USD firmed after most hawkish ECB surprises.'},
      {ev:'ECB delivers a dovish surprise',asset:'EUR/USD',lean:'bear',hz:'intraday',why:'A softer ECB narrows rate support for the euro.',hist:'EUR/USD slipped after most dovish ECB meetings.'}
    ],
    technical:[
      {ev:'BTC reclaims its 50-day moving average',asset:'BTC/USD',lean:'bull',hz:'intraday',why:'Reclaiming the 50DMA has historically marked momentum continuation rather than a fakeout.',hist:'BTC closed higher five sessions later in 64% of past reclaims.'},
      {ev:'Gold breaks out of a bullish flag on the 4H',asset:'XAU/USD',lean:'bull',hz:'intraday',why:'Flag breakouts often resolve in the direction of the prior trend.',hist:'Measured-move targets were reached in 6 of 10 recent flag breaks.'},
      {ev:'BTC confirms a golden cross, 50 over 200',asset:'BTC/USD',lean:'bull',hz:'swing',why:'The longer-term moving-average cross is a classic trend-confirmation signal.',hist:'Golden crosses preceded higher prices 30 days on in most cycles.'},
      {ev:'US100 sweeps the session high then reverses hard',asset:'US100',lean:'bear',hz:'scalp',why:'A liquidity sweep above the high that fails often traps breakout buyers for a quick fade.',hist:'Failed sweeps reversed intraday in a majority of recent samples.'},
      {ev:'Gold reclaims VWAP just after the New York open',asset:'XAU/USD',lean:'bull',hz:'scalp',why:'Reclaiming VWAP on the open often hands intraday control to buyers.',hist:'VWAP reclaims at the open held higher into the close more often than not.'},
      {ev:'EUR/USD rejects the London session high',asset:'EUR/USD',lean:'bear',hz:'scalp',why:'A clean rejection of the session high is a common short-term reversal trigger.',hist:'Session-high rejections faded intraday in most recent cases.'},
      {ev:'BTC bids a round-number level with momentum building',asset:'BTC/USD',lean:'bull',hz:'scalp',why:'Defended round numbers with rising momentum often spark quick continuation.',hist:'Round-number defends extended higher short-term in many samples.'},
      {ev:'Gold reclaims its 100-week EMA for the first time in 5 years',asset:'XAU/USD',lean:'bull',hz:'swing',why:'Reclaiming a long-term average after years beneath it tends to mark a regime change to a higher trend rather than a one-day blip.',hist:'Multi-year EMA reclaims preceded extended up-trends in most historical cases.'},
      {ev:'BTC closes a weekly candle back above its 200-week moving average',asset:'BTC/USD',lean:'bull',hz:'swing',why:'The 200-week line has acted as a cycle floor; weekly closes back above it have marked the start of past bull phases.',hist:'Reclaims of the 200WMA aligned with new up-trends in prior cycles.'},
      {ev:'US100 prints a fresh all-time high on broad participation',asset:'US100',lean:'bull',hz:'swing',why:'New highs backed by wide breadth tend to see momentum continue rather than reverse on the first push.',hist:'Breadth-confirmed highs extended further in a majority of cases.'}
    ],
    quant:[
      {ev:'Cross-asset momentum model flips long gold',asset:'XAU/USD',lean:'bull',hz:'swing',why:'Momentum plus a falling real-yield z-score aligns the model bullish.',hist:'Signal hit-rate 61% across 200 backtested triggers.'},
      {ev:'Mean-reversion model flags US100 as overbought',asset:'US100',lean:'bear',hz:'intraday',why:'Stretched short-term z-scores have tended to revert.',hist:'The fade worked in 58% of comparable overbought flags.'},
      {ev:'Carry and real-yield model favours the dollar',asset:'EUR/USD',lean:'bear',hz:'swing',why:'Rate-differential carry leans against the euro here.',hist:'The model was directionally correct in 60% of recent EUR signals.'},
      {ev:'Volatility regime shifts to risk-off',asset:'XAU/USD',lean:'bull',hz:'intraday',why:'Rising cross-asset volatility historically rotates flows into gold.',hist:'Gold outperformed through most prior risk-off regime shifts.'}
    ],
    onchain:[
      {ev:'Exchange BTC balances hit a multi-year low',asset:'BTC/USD',lean:'bull',hz:'swing',why:'Coins leaving exchanges signals accumulation and reduced near-term sell pressure.',hist:'Falling exchange balances aligned with higher prices in most past stretches.'},
      {ev:'Stablecoin supply expands sharply',asset:'BTC/USD',lean:'bull',hz:'swing',why:'Growing stablecoin dry powder often precedes inflows into crypto.',hist:'Supply expansions led demand upticks in several prior cycles.'},
      {ev:'Large BTC outflows as whales accumulate',asset:'BTC/USD',lean:'bull',hz:'swing',why:'Sustained whale accumulation reduces float and can tighten supply.',hist:'Accumulation phases preceded markups in most past cycles.'},
      {ev:'Perp funding flips negative on heavy shorts',asset:'BTC/USD',lean:'bull',hz:'intraday',why:'Crowded shorts raise the odds of a short squeeze higher.',hist:'Negative funding extremes preceded bounces more often than not.'}
    ],
    positioning:[
      {ev:'CFTC data shows funds heavily net-short gold',asset:'XAU/USD',lean:'bull',hz:'swing',why:'Crowded short positioning raises the odds of a short-covering squeeze higher.',hist:'Extreme net-short readings preceded gold rallies in most prior cycles.'},
      {ev:'Retail traders sit 78% long EUR/USD',asset:'EUR/USD',lean:'bear',hz:'intraday',why:'Lopsided retail positioning is often a contrarian signal against the crowd.',hist:'Heavy retail long skews preceded pullbacks more often than not.'},
      {ev:'BTC perp funding turns sharply positive',asset:'BTC/USD',lean:'bear',hz:'intraday',why:'Over-leveraged longs paying high funding raise the risk of a long flush.',hist:'Funding extremes preceded sharp shakeouts in several past cases.'},
      {ev:'Gold ETFs post their largest weekly inflow in months',asset:'XAU/USD',lean:'bull',hz:'swing',why:'Sustained institutional inflows tend to support price over the following weeks.',hist:'Strong ETF inflow weeks aligned with firmer gold in most samples.'},
      {ev:'US100 put/call ratio spikes as hedging jumps',asset:'US100',lean:'bull',hz:'swing',why:'Elevated fear and hedging often mark contrarian buying opportunities.',hist:'Put/call spikes preceded index bounces in a majority of cases.'}
    ]
  };

export const CAT_TTL={scalp:5*60000,intraday:4*3600000,swing:3*86400000};
