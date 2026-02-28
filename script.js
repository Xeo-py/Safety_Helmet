/* === STATE === */
var S={
  lang:'en',theme:'dark',snd:true,flash:true,log:true,modal:true,voice:true,autoDismiss:30,
  trigTemp:true,trigGas:true,trigFall:true,trigSos:true,trigVolt:true,trigInact:true,
  trigExplosive:true,trigFlashFire:true,trigHelmetOff:true,trigTrapped:true,trigUnconscious:true,
  threshT:45,threshG:900,
  isDanger:false,modalOpen:false,modalMuted:false,
  unread:0,events:0,maxTemp:null,history:[],alerts:[],tArr:[],gArr:[],startTime:Date.now(),prev:{}
};
var MAX=40;
function q(s){return document.querySelector(s)}
function qa(s){return document.querySelectorAll(s)}
function pad(n){return n<10?'0'+n:''+n}

/* === TRANSLATIONS === */
var LANG = {
  en: {
    allClear:'ALL CLEAR', allClearSub:'All safety parameters within limits',
    danger:'DANGER!', dangerSub:'Immediate action required — HELMET!',
    connClear:'ALL CLEAR', connDanger:'DANGER',
    fallName:'FALL DETECTION', fallSafe:'STABLE', fallDanger:'FALL DETECTED!',
    sosName:'SOS SIGNAL', sosSafe:'INACTIVE', sosDanger:'SOS ACTIVE!',
    unconsciousName:'CONSCIOUSNESS', unconsciousSafe:'RESPONSIVE', unconsciousDanger:'UNCONSCIOUS!',
    trappedName:'TRAPPED', trappedSafe:'FREE', trappedDanger:'TRAPPED!',
    explosiveName:'EXPLOSIVE GAS', explosiveSafe:'CLEAR', explosiveDanger:'EXPLOSIVE GAS!',
    flashfireName:'FLASH FIRE', flashfireSafe:'CLEAR', flashfireDanger:'FLASH FIRE RISK!',
    voltName:'HIGH VOLTAGE', voltSafe:'SAFE', voltDanger:'HIGH VOLTAGE!',
    helmetoffName:'HELMET STATUS', helmetoffSafe:'WEARING', helmetoffDanger:'HELMET OFF!',
    inactName:'INACTIVITY', inactSafe:'ACTIVE', inactDanger:'INACTIVE!',
    panelAlerts:'SAFETY ALERTS', panelGauges:'LIVE GAUGES',
    panelSystem:'SYSTEM STATUS', panelChart:'LIVE SENSOR FEED',
    badgeLive:'LIVE', badgeAlert:'ALERT', badgeRealtime:'REAL-TIME',
    histTitle:'EVENT LOG', filterAll:'ALL', filterDanger:'DANGER', filterWarn:'WARN', filterSafe:'SAFE',
    searchPlaceholder:'Search events...',
    settingsTitle:'SETTINGS',
    appSection:'APPEARANCE', threshSection:'ALERT THRESHOLDS', notifSection:'NOTIFICATIONS',
    anomalySection:'ANOMALY ALERT TRIGGERS', deviceSection:'DEVICE INFO',
    themeLabel:'Display Theme', themeSub:'Switch light/dark mode',
    langLabel:'Language', langSub:'Interface language',
    darkBtn:'Dark', lightBtn:'Light',
    tempThreshLabel:'Temp Threshold (°C)', gasThreshLabel:'Gas Threshold (ppm)',
    soundLabel:'Alarm Sound', soundSub:'Siren on danger events',
    flashLabel:'Caution Border Flash', flashSub:'Hazard tape on alert',
    modalLabel:'Red Alert Modal', modalSub:'Full-screen popup on danger',
    voiceLabel:'Voice Announcement', voiceSub:'Speak the alert reason aloud',
    autoDismissLabel:'Auto-Dismiss Timer',
    logLabel:'Log All Events', logSub:'Record state changes',
    sysFirebase:'FIREBASE', sysUnit:'UNIT ID', sysGasDanger:'GAS DANGER',
    sysPeakTemp:'PEAK TEMP', sysTotalEvents:'TOTAL EVENTS', sysUptime:'UPTIME',
    exportCSV:'EXPORT CSV', exportBtn:'EXPORT CSV', clearBtn:'CLEAR',
    noAlerts:'NO ALERTS RECORDED', noEvents:'NO EVENTS RECORDED YET',
    trigTempLabel:'High Temperature', trigTempSub:'Alert when temp exceeds threshold',
    trigGasLabel:'Toxic Gas (>900 ppm)', trigGasSub:'Alert when MQ135 exceeds 900 ppm',
    trigFallLabel:'Fall Detection', trigFallSub:'Alert when worker falls',
    trigSosLabel:'SOS Signal', trigSosSub:'Alert on manual SOS press',
    trigVoltLabel:'High Voltage', trigVoltSub:'Alert on high voltage detection',
    trigInactLabel:'Inactivity', trigInactSub:'Alert on worker inactivity',
    trigExplosiveLabel:'Explosive Gas', trigExplosiveSub:'Alert on explosive gas detection',
    trigFlashfireLabel:'Flash Fire', trigFlashfireSub:'Alert on flash fire risk',
    trigHelmetoffLabel:'Helmet Removed', trigHelmetoffSub:'Alert when helmet is taken off',
    trigTrappedLabel:'Worker Trapped', trigTrappedSub:'Alert when worker is trapped',
    trigUnconsciousLabel:'Unconscious Worker', trigUnconsciousSub:'Alert when unconscious state is detected',
    unitIdVal:'HELMET', gasSensorVal:'MQ135', firmwareVal:'v2.4.1', regionVal:'ASIA-SE1',
    uptimeLabel:'Uptime', totalEventsLabel:'Total Events'
  },
  hi: {
    allClear:'सब सुरक्षित', allClearSub:'सभी सुरक्षा मानक सीमा में हैं',
    danger:'खतरा!', dangerSub:'तुरंत कार्रवाई ज़रूरी — हेलमेट!',
    connClear:'सुरक्षित', connDanger:'खतरा',
    fallName:'गिरावट पहचान', fallSafe:'स्थिर', fallDanger:'गिरावट!',
    sosName:'SOS संकेत', sosSafe:'निष्क्रिय', sosDanger:'SOS सक्रिय!',
    unconsciousName:'चेतना', unconsciousSafe:'सचेत', unconsciousDanger:'बेहोश!',
    trappedName:'फँसे हुए', trappedSafe:'मुक्त', trappedDanger:'फँसे हुए!',
    explosiveName:'विस्फोटक गैस', explosiveSafe:'सुरक्षित', explosiveDanger:'विस्फोटक गैस!',
    flashfireName:'फ्लैश आग', flashfireSafe:'सुरक्षित', flashfireDanger:'आग का खतरा!',
    voltName:'उच्च वोल्टेज', voltSafe:'सुरक्षित', voltDanger:'उच्च वोल्टेज!',
    helmetoffName:'हेलमेट स्थिति', helmetoffSafe:'पहने हुए', helmetoffDanger:'हेलमेट उतरा!',
    inactName:'निष्क्रियता', inactSafe:'सक्रिय', inactDanger:'निष्क्रिय!',
    panelAlerts:'सुरक्षा अलर्ट', panelGauges:'लाइव गेज',
    panelSystem:'सिस्टम स्थिति', panelChart:'लाइव सेंसर फ़ीड',
    badgeLive:'लाइव', badgeAlert:'अलर्ट', badgeRealtime:'रियल-टाइम',
    histTitle:'घटना लॉग', filterAll:'सभी', filterDanger:'खतरा', filterWarn:'चेतावनी', filterSafe:'सुरक्षित',
    searchPlaceholder:'खोजें...',
    settingsTitle:'सेटिंग्स',
    appSection:'दिखावट', threshSection:'अलर्ट सीमाएँ', notifSection:'सूचनाएँ',
    anomalySection:'अलर्ट ट्रिगर', deviceSection:'डिवाइस जानकारी',
    themeLabel:'डिस्प्ले थीम', themeSub:'लाइट/डार्क मोड बदलें',
    langLabel:'भाषा', langSub:'इंटरफ़ेस भाषा',
    darkBtn:'डार्क', lightBtn:'लाइट',
    tempThreshLabel:'तापमान सीमा (°C)', gasThreshLabel:'गैस सीमा (ppm)',
    soundLabel:'अलार्म ध्वनि', soundSub:'खतरे पर सायरन बजाएं',
    flashLabel:'सावधानी बॉर्डर', flashSub:'अलर्ट पर हैजार्ड टेप',
    modalLabel:'लाल अलर्ट पॉपअप', modalSub:'खतरे पर फुल-स्क्रीन पॉपअप',
    voiceLabel:'आवाज़ घोषणा', voiceSub:'अलर्ट कारण ज़ोर से बोलें',
    autoDismissLabel:'स्वतः बंद टाइमर',
    logLabel:'घटनाएँ लॉग करें', logSub:'स्थिति परिवर्तन रिकॉर्ड करें',
    sysFirebase:'फायरबेस', sysUnit:'यूनिट आईडी', sysGasDanger:'गैस खतरा',
    sysPeakTemp:'उच्चतम तापमान', sysTotalEvents:'कुल घटनाएँ', sysUptime:'अपटाइम',
    exportCSV:'CSV निर्यात', exportBtn:'CSV निर्यात', clearBtn:'साफ करें',
    noAlerts:'कोई अलर्ट नहीं', noEvents:'अभी तक कोई घटना नहीं',
    trigTempLabel:'उच्च तापमान', trigTempSub:'सीमा पार होने पर अलर्ट',
    trigGasLabel:'जहरीली गैस (>900 ppm)', trigGasSub:'MQ135 900 ppm पार करने पर',
    trigFallLabel:'गिरावट पहचान', trigFallSub:'कर्मचारी के गिरने पर अलर्ट',
    trigSosLabel:'SOS संकेत', trigSosSub:'मैनुअल SOS दबाने पर',
    trigVoltLabel:'उच्च वोल्टेज', trigVoltSub:'उच्च वोल्टेज पहचान पर',
    trigInactLabel:'निष्क्रियता', trigInactSub:'कर्मचारी निष्क्रिय होने पर',
    trigExplosiveLabel:'विस्फोटक गैस', trigExplosiveSub:'विस्फोटक गैस पहचान पर',
    trigFlashfireLabel:'फ्लैश आग', trigFlashfireSub:'फ्लैश आग के खतरे पर',
    trigHelmetoffLabel:'हेलमेट उतारा', trigHelmetoffSub:'हेलमेट उतारने पर अलर्ट',
    trigTrappedLabel:'कर्मचारी फँसा', trigTrappedSub:'फँसने पर अलर्ट',
    trigUnconsciousLabel:'बेहोश कर्मचारी', trigUnconsciousSub:'बेहोशी पहचान पर अलर्ट',
    unitIdVal:'हेलमेट', gasSensorVal:'MQ135', firmwareVal:'v2.4.1', regionVal:'ASIA-SE1',
    uptimeLabel:'अपटाइम', totalEventsLabel:'कुल घटनाएँ'
  }
};

/* === LOADER === */
(function(){
  var el=q('#loader'),ml=q('#load-msg');
  var msgs=['INITIALIZING SAFETY SYSTEMS','CONNECTING FIREBASE DATABASE','LOADING SENSOR DRIVERS','CALIBRATING THRESHOLDS','SYSTEM READY - STAY SAFE'];
  var i=0,iv=setInterval(function(){i++;if(i<msgs.length)ml.textContent=msgs[i];},480);
  setTimeout(function(){clearInterval(iv);el.classList.add('fade-out');setTimeout(function(){el.style.display='none';},700);},2600);
})();

/* === RIPPLE === */
document.addEventListener('click',function(e){
  var host=e.target.closest('.ripple-host');if(!host)return;
  var r=document.createElement('span');r.className='ripple';
  var rect=host.getBoundingClientRect(),size=Math.max(rect.width,rect.height);
  r.style.cssText='width:'+size+'px;height:'+size+'px;left:'+(e.clientX-rect.left-size/2)+'px;top:'+(e.clientY-rect.top-size/2)+'px';
  host.appendChild(r);setTimeout(function(){r.remove();},600);
});

/* === NAV SCROLL === */
window.addEventListener('scroll',function(){q('#main-nav').classList.toggle('scrolled',window.scrollY>30);},{passive:true});

/* === CLOCK === */
function tick(){
  var now=new Date();
  q('#clock-chip').textContent=now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true});
  var el=Math.floor((Date.now()-S.startTime)/1000),h=Math.floor(el/3600),m=Math.floor((el%3600)/60),s=el%60;
  var up=pad(h)+':'+pad(m)+':'+pad(s);
  q('#uptime-chip').textContent='UP:'+up;
  q('#sys-uptime').textContent=up;q('#s-uptime').textContent=up;
}
tick();setInterval(tick,1000);

/* === LANGUAGE === */
function setLang(lang){
  S.lang=lang;
  var T=LANG[lang]||LANG['en'];

  /* Nav tabs */
  qa('.n-tab').forEach(function(b){
    var pg=b.getAttribute('data-page');
    if(pg==='dashboard')b.textContent=T.panelAlerts==='SAFETY ALERTS'?'Dashboard':'डैशबोर्ड';
    if(pg==='history')b.textContent=lang==='hi'?'इतिहास':'History';
    if(pg==='settings')b.textContent=lang==='hi'?'सेटिंग्स':'Settings';
  });
  qa('.drawer-btn[data-page]').forEach(function(b){
    var pg=b.getAttribute('data-page');
    var ic=b.querySelector('i')?b.querySelector('i').outerHTML:'';
    if(pg==='dashboard')b.innerHTML=ic+(lang==='hi'?'डैशबोर्ड':'Dashboard');
    if(pg==='history')b.innerHTML=ic+(lang==='hi'?'इतिहास':'History');
    if(pg==='settings')b.innerHTML=ic+(lang==='hi'?'सेटिंग्स':'Settings');
  });

  /* Status banner - only update text if not in danger so we don't override live state */
  if(!S.isDanger){
    var wEl=q('#sb-word'),sEl=q('#sb-sub');
    if(wEl)wEl.textContent=T.allClear;
    if(sEl)sEl.textContent=T.allClearSub;
  }
  var ptxt=q('#conn-txt');
  if(ptxt)ptxt.textContent=S.isDanger?T.connDanger:T.connClear;

  /* Alert card names & safe values */
  var cards=[
    {card:'fall-card',nameK:'fallName',safeK:'fallSafe',dangerK:'fallDanger',valId:'fall-val'},
    {card:'sos-card',nameK:'sosName',safeK:'sosSafe',dangerK:'sosDanger',valId:'sos-val'},
    {card:'unconscious-card',nameK:'unconsciousName',safeK:'unconsciousSafe',dangerK:'unconsciousDanger',valId:'unconscious-val'},
    {card:'trapped-card',nameK:'trappedName',safeK:'trappedSafe',dangerK:'trappedDanger',valId:'trapped-val'},
    {card:'explosive-card',nameK:'explosiveName',safeK:'explosiveSafe',dangerK:'explosiveDanger',valId:'explosive-val'},
    {card:'flashfire-card',nameK:'flashfireName',safeK:'flashfireSafe',dangerK:'flashfireDanger',valId:'flashfire-val'},
    {card:'volt-card',nameK:'voltName',safeK:'voltSafe',dangerK:'voltDanger',valId:'volt-val'},
    {card:'helmetoff-card',nameK:'helmetoffName',safeK:'helmetoffSafe',dangerK:'helmetoffDanger',valId:'helmetoff-val'},
    {card:'inact-card',nameK:'inactName',safeK:'inactSafe',dangerK:'inactDanger',valId:'inact-val'}
  ];
  cards.forEach(function(c){
    var card=q('#'+c.card);if(!card)return;
    var nm=card.querySelector('.ac-name');
    if(nm)nm.textContent=T[c.nameK];
    var vl=q('#'+c.valId);
    if(vl){
      var isDangerCard=card.classList.contains('danger');
      vl.textContent=isDangerCard?T[c.dangerK]:T[c.safeK];
    }
  });

  /* Panel titles */
  var ptEl=q('#page-dashboard .panel:nth-child(1) .panel-title');
  qa('.panel-title').forEach(function(pt){
    var t=pt.textContent.trim().toUpperCase();
    if(t==='SAFETY ALERTS'||t==='सुरक्षा अलर्ट')pt.textContent=T.panelAlerts;
    else if(t==='LIVE GAUGES'||t==='लाइव गेज')pt.textContent=T.panelGauges;
    else if(t==='SYSTEM STATUS'||t==='सिस्टम स्थिति')pt.textContent=T.panelSystem;
    else if(t==='LIVE SENSOR FEED'||t==='लाइव सेंसर फ़ीड')pt.textContent=T.panelChart;
  });

  /* Panel badges */
  var ab=q('#alert-badge');
  if(ab)ab.textContent=S.isDanger?T.badgeAlert:T.badgeLive;

  /* History page */
  var ht=q('#page-history .pg-title');if(ht)ht.textContent=T.histTitle;
  qa('.f-btn').forEach(function(b){
    var f=b.getAttribute('data-f');
    if(f==='all')b.textContent=T.filterAll;
    else if(f==='danger')b.textContent=T.filterDanger;
    else if(f==='warn')b.textContent=T.filterWarn;
    else if(f==='safe')b.textContent=T.filterSafe;
  });
  var si=q('#log-search');if(si)si.placeholder=T.searchPlaceholder;
  var eb=q('#export-csv-btn');
  if(eb){var ei=eb.querySelector('i');eb.innerHTML=(ei?ei.outerHTML:'')+T.exportBtn;}

  /* Settings page title */
  var spt=q('#page-settings .pg-title');if(spt)spt.textContent=T.settingsTitle;

  /* Settings box headers */
  qa('.set-box-hd').forEach(function(hd){
    var t=hd.textContent.trim();
    if(['APPEARANCE','दिखावट'].includes(t))hd.textContent=T.appSection;
    else if(['ALERT THRESHOLDS','अलर्ट सीमाएँ'].includes(t))hd.textContent=T.threshSection;
    else if(['NOTIFICATIONS','सूचनाएँ'].includes(t))hd.textContent=T.notifSection;
    else if(['ANOMALY ALERT TRIGGERS','अलर्ट ट्रिगर'].includes(t))hd.textContent=T.anomalySection;
    else if(['DEVICE INFO','डिवाइस जानकारी'].includes(t))hd.textContent=T.deviceSection;
  });

  /* Settings rows - theme */
  var setRows=qa('.set-row');
  setRows.forEach(function(row){
    var lbl=row.querySelector('.set-label');
    var sub=row.querySelector('.set-sub');
    if(!lbl)return;
    var lt=lbl.textContent.trim();
    /* appearance */
    if(['Display Theme','डिस्प्ले थीम'].includes(lt)){lbl.textContent=T.themeLabel;if(sub)sub.textContent=T.themeSub;}
    else if(['Language','भाषा'].includes(lt)){lbl.textContent=T.langLabel;if(sub)sub.textContent=T.langSub;}
    /* thresholds */
    else if(lt.indexOf('Temp Threshold')!==-1||lt.indexOf('तापमान सीमा')!==-1){lbl.textContent=T.tempThreshLabel;}
    else if(lt.indexOf('Gas Threshold')!==-1||lt.indexOf('गैस सीमा')!==-1){lbl.textContent=T.gasThreshLabel;}
    /* notifications */
    else if(['Alarm Sound','अलार्म ध्वनि'].includes(lt)){lbl.textContent=T.soundLabel;if(sub)sub.textContent=T.soundSub;}
    else if(['Caution Border Flash','सावधानी बॉर्डर'].includes(lt)){lbl.textContent=T.flashLabel;if(sub)sub.textContent=T.flashSub;}
    else if(['Red Alert Modal','लाल अलर्ट पॉपअप'].includes(lt)){lbl.textContent=T.modalLabel;if(sub)sub.textContent=T.modalSub;}
    else if(['Voice Announcement','आवाज़ घोषणा'].includes(lt)){lbl.textContent=T.voiceLabel;if(sub)sub.textContent=T.voiceSub;}
    else if(['Auto-Dismiss Timer','स्वतः बंद टाइमर'].includes(lt)){lbl.textContent=T.autoDismissLabel;}
    else if(['Log All Events','घटनाएँ लॉग करें'].includes(lt)){lbl.textContent=T.logLabel;if(sub)sub.textContent=T.logSub;}
    /* anomaly triggers */
    else if(['High Temperature','उच्च तापमान'].includes(lt)){lbl.innerHTML='<i class="fas fa-temperature-high" style="color:var(--orange);margin-right:6px"></i>'+T.trigTempLabel;if(sub)sub.textContent=T.trigTempSub;}
    else if(lt.indexOf('Toxic Gas')!==-1||lt.indexOf('जहरीली गैस')!==-1){lbl.innerHTML='<i class="fas fa-smog" style="color:var(--orange);margin-right:6px"></i>'+T.trigGasLabel;if(sub)sub.textContent=T.trigGasSub;}
    else if(['Fall Detection','गिरावट पहचान'].includes(lt)){lbl.innerHTML='<i class="fas fa-person-falling" style="color:var(--red);margin-right:6px"></i>'+T.trigFallLabel;if(sub)sub.textContent=T.trigFallSub;}
    else if(['SOS Signal','SOS संकेत'].includes(lt)){lbl.innerHTML='<i class="fas fa-sos" style="color:var(--red);margin-right:6px"></i>'+T.trigSosLabel;if(sub)sub.textContent=T.trigSosSub;}
    else if(['High Voltage','उच्च वोल्टेज'].includes(lt)){lbl.innerHTML='<i class="fas fa-bolt" style="color:var(--red);margin-right:6px"></i>'+T.trigVoltLabel;if(sub)sub.textContent=T.trigVoltSub;}
    else if(['Inactivity','निष्क्रियता'].includes(lt)){lbl.innerHTML='<i class="fas fa-person" style="color:var(--orange);margin-right:6px"></i>'+T.trigInactLabel;if(sub)sub.textContent=T.trigInactSub;}
    else if(['Explosive Gas','विस्फोटक गैस'].includes(lt)){lbl.innerHTML='<i class="fas fa-explosion" style="color:var(--red);margin-right:6px"></i>'+T.trigExplosiveLabel;if(sub)sub.textContent=T.trigExplosiveSub;}
    else if(['Flash Fire','फ्लैश आग'].includes(lt)){lbl.innerHTML='<i class="fas fa-fire-flame-curved" style="color:var(--red);margin-right:6px"></i>'+T.trigFlashfireLabel;if(sub)sub.textContent=T.trigFlashfireSub;}
    else if(['Helmet Removed','हेलमेट उतारा'].includes(lt)){lbl.innerHTML='<i class="fas fa-hard-hat" style="color:var(--orange);margin-right:6px"></i>'+T.trigHelmetoffLabel;if(sub)sub.textContent=T.trigHelmetoffSub;}
    else if(['Worker Trapped','कर्मचारी फँसा'].includes(lt)){lbl.innerHTML='<i class="fas fa-person-rays" style="color:var(--red);margin-right:6px"></i>'+T.trigTrappedLabel;if(sub)sub.textContent=T.trigTrappedSub;}
    else if(['Unconscious Worker','बेहोश कर्मचारी'].includes(lt)){lbl.innerHTML='<i class="fas fa-head-side-mask" style="color:var(--red);margin-right:6px"></i>'+T.trigUnconsciousLabel;if(sub)sub.textContent=T.trigUnconsciousSub;}
    /* device info */
    else if(['Uptime','अपटाइम'].includes(lt)){lbl.textContent=T.uptimeLabel;}
    else if(['Total Events','कुल घटनाएँ'].includes(lt)){lbl.textContent=T.totalEventsLabel;}
  });

  /* Choice buttons in settings */
  var sdb=q('#s-dark');var slb=q('#s-light');
  if(sdb){var sdi=sdb.querySelector('i');sdb.innerHTML=(sdi?sdi.outerHTML:'')+T.darkBtn;}
  if(slb){var sli=slb.querySelector('i');slb.innerHTML=(sli?sli.outerHTML:'')+T.lightBtn;}

  /* System rows */
  qa('.sys-row-name').forEach(function(rn){
    var t=rn.textContent.trim();
    if(['FIREBASE','फायरबेस'].includes(t))rn.textContent=T.sysFirebase;
    else if(['UNIT ID','यूनिट आईडी'].includes(t))rn.textContent=T.sysUnit;
    else if(['GAS DANGER','गैस खतरा'].includes(t))rn.textContent=T.sysGasDanger;
    else if(['PEAK TEMP','उच्चतम तापमान'].includes(t))rn.textContent=T.sysPeakTemp;
    else if(['TOTAL EVENTS','कुल घटनाएँ'].includes(t))rn.textContent=T.sysTotalEvents;
    else if(['UPTIME','अपटाइम'].includes(t))rn.textContent=T.sysUptime;
  });

  /* Alert sidebar */
  var asExport=q('#export-alerts');
  if(asExport){var aei=asExport.querySelector('i');asExport.innerHTML=(aei?aei.outerHTML:'')+' CSV';}
  var asClear=q('#clear-alerts');if(asClear)asClear.textContent=T.clearBtn;

  /* No data states */
  var asEmpty=q('.as-empty');
  if(asEmpty)asEmpty.innerHTML='<i class="fas fa-shield-alt"></i>'+T.noAlerts;

  /* Active lang button highlight */
  qa('#s-en,#s-hi,#dr-en,#dr-hi,#dd-en,#dd-hi').forEach(function(b){b.classList.remove('active');});
  [q('#s-'+lang),q('#dr-'+lang),q('#dd-'+lang)].forEach(function(b){if(b)b.classList.add('active');});
}

/* === THEME === */
function setTheme(t){
  S.theme=t;document.body.classList.toggle('light-mode',t==='light');
  qa('#s-dark,#s-light').forEach(function(b){b.classList.remove('active');});
  var sb=q('#s-'+t);if(sb)sb.classList.add('active');
}

/* === NAVIGATION === */
function goPage(pg){
  qa('.n-tab').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-page')===pg);});
  qa('.drawer-btn[data-page]').forEach(function(b){b.classList.toggle('active-page',b.getAttribute('data-page')===pg);});
  qa('.page').forEach(function(p){p.classList.remove('active');});
  var t=q('#page-'+pg);if(t)t.classList.add('active');
  closeAll();if(pg==='dashboard')setTimeout(drawChart,50);
}
qa('.n-tab').forEach(function(btn){btn.addEventListener('click',function(){goPage(btn.getAttribute('data-page'));});});
qa('.drawer-btn[data-page]').forEach(function(btn){btn.addEventListener('click',function(){goPage(btn.getAttribute('data-page'));closeMobileDrawer();});});

/* === DROPDOWN === */
var dd=q('#dropdown');
function closeAll(){dd.classList.remove('open');}
q('#menu-btn').addEventListener('click',function(e){e.stopPropagation();dd.classList.toggle('open');});
document.addEventListener('click',closeAll);
dd.addEventListener('click',function(e){e.stopPropagation();});
q('#dd-dark').addEventListener('click',function(){setTheme('dark');closeAll();});
q('#dd-light').addEventListener('click',function(){setTheme('light');closeAll();});
q('#dd-en').addEventListener('click',function(){setLang('en');closeAll();});
q('#dd-hi').addEventListener('click',function(){setLang('hi');closeAll();});
q('#dd-export').addEventListener('click',function(){exportCSV();closeAll();});

/* === MOBILE DRAWER === */
var burger=q('#hamburger'),drawer=q('#mobile-drawer'),overlay=q('#drawer-overlay');
function closeMobileDrawer(){burger.classList.remove('open');drawer.classList.remove('open');overlay.classList.remove('open');}
burger.addEventListener('click',function(e){
  e.stopPropagation();var open=!drawer.classList.contains('open');
  burger.classList.toggle('open',open);drawer.classList.toggle('open',open);overlay.classList.toggle('open',open);closeAll();
});
overlay.addEventListener('click',closeMobileDrawer);
q('#dr-dark').addEventListener('click',function(){setTheme('dark');closeMobileDrawer();});
q('#dr-light').addEventListener('click',function(){setTheme('light');closeMobileDrawer();});
q('#dr-en').addEventListener('click',function(){setLang('en');closeMobileDrawer();});
q('#dr-hi').addEventListener('click',function(){setLang('hi');closeMobileDrawer();});

/* === SWIPE === */
var touchX=null,PAGES=['dashboard','history','settings'],curPage=0;
document.addEventListener('touchstart',function(e){touchX=e.changedTouches[0].clientX;},{passive:true});
document.addEventListener('touchend',function(e){
  if(touchX===null)return;var dx=e.changedTouches[0].clientX-touchX;
  if(Math.abs(dx)<60)return;
  if(dx<0&&curPage<PAGES.length-1){curPage++;goPage(PAGES[curPage]);}
  else if(dx>0&&curPage>0){curPage--;goPage(PAGES[curPage]);}
  touchX=null;
},{passive:true});

/* === SETTINGS === */
q('#s-dark').addEventListener('click',function(){setTheme('dark');q('#s-light').classList.remove('active');this.classList.add('active');});
q('#s-light').addEventListener('click',function(){setTheme('light');q('#s-dark').classList.remove('active');this.classList.add('active');});
q('#s-en').addEventListener('click',function(){setLang('en');});
q('#s-hi').addEventListener('click',function(){setLang('hi');});
q('#t-thresh').addEventListener('input',function(){S.threshT=parseInt(this.value);q('#t-v').textContent=this.value+'°C';q('#ts-sub').textContent=(S.lang==='hi'?'ट्रिगर: ':'Trigger at: ')+this.value+'°C';});
q('#g-thresh').addEventListener('input',function(){S.threshG=parseInt(this.value);q('#g-v').textContent=this.value;q('#gs-sub').textContent=(S.lang==='hi'?'ट्रिगर: ':'Trigger at: ')+this.value+' ppm';});
q('#tog-snd').addEventListener('change',function(){S.snd=this.checked;});
q('#tog-flash').addEventListener('change',function(){S.flash=this.checked;});
q('#tog-modal').addEventListener('change',function(){S.modal=this.checked;});
q('#tog-voice').addEventListener('change',function(){S.voice=this.checked;});
q('#tog-log').addEventListener('change',function(){S.log=this.checked;});
q('#trig-temp').addEventListener('change',function(){S.trigTemp=this.checked;});
q('#trig-gas').addEventListener('change',function(){S.trigGas=this.checked;});
q('#trig-fall').addEventListener('change',function(){S.trigFall=this.checked;});
q('#trig-sos').addEventListener('change',function(){S.trigSos=this.checked;});
q('#trig-volt').addEventListener('change',function(){S.trigVolt=this.checked;});
q('#trig-inact').addEventListener('change',function(){S.trigInact=this.checked;});
q('#trig-explosive').addEventListener('change',function(){S.trigExplosive=this.checked;});
q('#trig-flashfire').addEventListener('change',function(){S.trigFlashFire=this.checked;});
q('#trig-helmetoff').addEventListener('change',function(){S.trigHelmetOff=this.checked;});
q('#trig-trapped').addEventListener('change',function(){S.trigTrapped=this.checked;});
q('#trig-unconscious').addEventListener('change',function(){S.trigUnconscious=this.checked;});
q('#autodismiss-range').addEventListener('input',function(){
  S.autoDismiss=parseInt(this.value);
  var lbl=S.autoDismiss===0?'OFF':S.autoDismiss+'s';
  q('#autodismiss-v').textContent=lbl;
  q('#autodismiss-sub').textContent=(S.lang==='hi'?'बंद: ':'Dismiss after: ')+lbl;
});

/* === ALERT SIDEBAR === */
var asPanel=q('#alert-sidebar');
q('#bell-btn').addEventListener('click',function(e){
  e.stopPropagation();asPanel.classList.toggle('open');
  S.unread=0;q('#n-badge').style.display='none';closeAll();closeMobileDrawer();
});
document.addEventListener('click',function(e){if(!asPanel.contains(e.target)&&e.target!==q('#bell-btn'))asPanel.classList.remove('open');});
q('#clear-alerts').addEventListener('click',function(){S.alerts=[];renderAlerts();S.unread=0;q('#n-badge').style.display='none';});
q('#export-alerts').addEventListener('click',function(){exportCSV();});

function addAlert(type,msg){
  var ts=new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true});
  S.alerts.unshift({type:type,msg:msg,time:ts});
  if(S.alerts.length>40)S.alerts.pop();
  S.unread++;var b=q('#n-badge');b.style.display='flex';b.textContent=S.unread>9?'9+':S.unread;
  renderAlerts();
}
function renderAlerts(){
  var body=q('#as-body');
  var T=LANG[S.lang]||LANG['en'];
  if(!S.alerts.length){body.innerHTML='<div class="as-empty"><i class="fas fa-shield-alt"></i>'+T.noAlerts+'</div>';return;}
  var iMap={danger:'fas fa-exclamation-triangle',warn:'fas fa-exclamation-circle',safe:'fas fa-check-circle'};
  body.innerHTML=S.alerts.map(function(a){
    return '<div class="alert-item '+a.type+'"><div class="ai-icon"><i class="'+iMap[a.type]+'"></i></div><div><div class="ai-msg">'+a.msg+'</div><div class="ai-time">'+a.time+'</div></div></div>';
  }).join('');
}

/* === HISTORY LOG === */
var activeF='all',searchQ='';
qa('.f-btn').forEach(function(btn){
  btn.addEventListener('click',function(){qa('.f-btn').forEach(function(b){b.classList.remove('active');});btn.classList.add('active');activeF=btn.getAttribute('data-f');renderLog();});
});
var searchEl=q('#log-search');
if(searchEl)searchEl.addEventListener('input',function(){searchQ=this.value.toLowerCase();renderLog();});

function addLog(type,event,val){
  if(!S.log)return;
  var ts=new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true});
  S.history.unshift({type:type,event:event,val:val,time:ts});
  if(S.history.length>100)S.history.pop();
  S.events++;q('#sys-events').textContent=S.events;q('#s-total').textContent=S.events;
  renderLog();
}
function renderLog(){
  var tbody=q('#log-body');
  var T=LANG[S.lang]||LANG['en'];
  var rows=S.history.filter(function(r){
    return(activeF==='all'||r.type===activeF)&&(!searchQ||r.event.toLowerCase().indexOf(searchQ)!==-1||r.val.toString().toLowerCase().indexOf(searchQ)!==-1);
  });
  if(!rows.length){tbody.innerHTML='<tr><td colspan="4" style="text-align:center;padding:26px;color:var(--text-dim);font-family:var(--mono);font-size:.74rem;letter-spacing:.12em">'+T.noEvents+'</td></tr>';return;}
  tbody.innerHTML=rows.map(function(r){
    return '<tr><td class="t-time">'+r.time+'</td><td class="t-ev">'+r.event+'</td><td style="font-family:var(--mono);font-size:.8rem">'+r.val+'</td><td><span class="t-badge '+r.type+'">'+r.type.toUpperCase()+'</span></td></tr>';
  }).join('');
}

/* === EXPORT CSV === */
function exportCSV(){
  if(!S.history.length){toast('NO DATA TO EXPORT','o');return;}
  var csv='Timestamp,Event,Value,Severity\n';
  S.history.forEach(function(r){csv+='"'+r.time+'","'+r.event+'","'+r.val+'","'+r.type+'"\n';});
  var blob=new Blob([csv],{type:'text/csv'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='safenet_log_'+new Date().toISOString().slice(0,10)+'.csv';
  document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
  toast('CSV EXPORTED','g');
}
var exportBtn=q('#export-csv-btn');if(exportBtn)exportBtn.addEventListener('click',exportCSV);

/* === TOAST === */
function toast(msg,cls){
  var z=q('#toast-zone'),t=document.createElement('div');t.className='t-toast '+cls;
  var icons={g:'check-circle',r:'exclamation-triangle',o:'exclamation-circle',y:'info-circle'};
  t.innerHTML='<i class="fas fa-'+icons[cls]+'"></i>'+msg;
  z.appendChild(t);setTimeout(function(){if(t.parentNode)t.parentNode.removeChild(t);},3200);
}

/* =========================================================
    RED ALERT MODAL SYSTEM
   ========================================================= */
var almAutoCt=null;

function buildReasons(T,G,fal,sos,volt,inact,explosive,flashfire,helmetOff,trapped,unconscious){
  var items=[];
  if(unconscious&&S.trigUnconscious)
    items.push({icon:'fa-head-side-mask',main:'WORKER UNCONSCIOUS',val:'Unconscious state detected — immediate response needed at HELMET'});
  if(fal&&S.trigFall)
    items.push({icon:'fa-person-falling',main:'FALL DETECTED',val:'Worker has fallen — immediate response needed on HELMET'});
  if(sos&&S.trigSos)
    items.push({icon:'fa-sos',main:'SOS ACTIVATED',val:'Manual emergency signal triggered from HELMET'});
  if(trapped&&S.trigTrapped)
    items.push({icon:'fa-person-rays',main:'WORKER TRAPPED',val:'Worker may be trapped — evacuate and assist at HELMET'});
  if(explosive&&S.trigExplosive)
    items.push({icon:'fa-explosion',main:'EXPLOSIVE GAS DETECTED',val:'Explosive gas concentration detected near HELMET'});
  if(flashfire&&S.trigFlashFire)
    items.push({icon:'fa-fire-flame-curved',main:'FLASH FIRE RISK',val:'Flash fire conditions detected near HELMET'});
  if(volt&&S.trigVolt)
    items.push({icon:'fa-bolt',main:'HIGH VOLTAGE DETECTED',val:'Dangerous voltage level detected on HELMET'});
  if(helmetOff&&S.trigHelmetOff)
    items.push({icon:'fa-hard-hat',main:'HELMET REMOVED',val:'Worker is not wearing the helmet — safety compromised'});
  if(inact&&S.trigInact)
    items.push({icon:'fa-person',main:'WORKER INACTIVITY',val:'No movement detected — check on worker at HELMET'});
  if(T>S.threshT&&S.trigTemp)
    items.push({icon:'fa-temperature-high',main:'HIGH TEMPERATURE',val:T+'°C recorded — Safe limit is '+S.threshT+'°C on HELMET'});
  if(G>S.threshG&&S.trigGas)
    items.push({icon:'fa-smog',main:'TOXIC GAS CRITICAL',val:G+' ppm detected — Danger limit is '+S.threshG+' ppm on HELMET'});
  return items;
}

function showAlertModal(reasons){
  if(!S.modal||!reasons.length)return;
  var modal=q('#alert-modal');
  var ts=new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true});
  q('#alm-time').textContent='Triggered at '+ts+' | Unit: HELMET';
  q('#alm-reasons').innerHTML=reasons.map(function(r){
    return '<div class="alm-reason-item">'
      +'<i class="fas '+r.icon+'"></i>'
      +'<div class="alm-reason-txt">'
      +'<div class="alm-reason-main">'+r.main+'</div>'
      +'<div class="alm-reason-val">'+r.val+'</div>'
      +'</div></div>';
  }).join('');
  q('#alm-auto').textContent='';
  var muteBtn=q('#alm-mute');
  muteBtn.innerHTML='<i class="fas fa-volume-mute"></i> MUTE';
  muteBtn.style.opacity='1';
  modal.style.display='flex';
  S.modalOpen=true;S.modalMuted=false;
  if(S.voice&&'speechSynthesis' in window){
    window.speechSynthesis.cancel();
    var announcement='Danger alert on Helmet. ';
    reasons.forEach(function(r){announcement+=r.main+'. ';});
    var utt=new SpeechSynthesisUtterance(announcement);
    utt.rate=0.9;utt.pitch=1.1;utt.volume=1;
    window.speechSynthesis.speak(utt);
  }
  clearInterval(almAutoCt);
  if(S.autoDismiss>0){
    var rem=S.autoDismiss;
    q('#alm-auto').textContent='Auto-dismiss in '+rem+'s';
    almAutoCt=setInterval(function(){
      rem--;
      var ae=q('#alm-auto');
      if(ae)ae.textContent=rem>0?'Auto-dismiss in '+rem+'s':'Dismissing...';
      if(rem<=0){clearInterval(almAutoCt);dismissModal();}
    },1000);
  }
}

function dismissModal(){
  clearInterval(almAutoCt);
  var modal=q('#alert-modal');
  if(modal)modal.style.display='none';
  S.modalOpen=false;
  if(window.speechSynthesis)window.speechSynthesis.cancel();
}

function muteAlarm(){
  S.modalMuted=true;
  var al=q('#alarm');if(al)al.pause();
  if(window.speechSynthesis)window.speechSynthesis.cancel();
  var muteBtn=q('#alm-mute');
  if(muteBtn){muteBtn.innerHTML='<i class="fas fa-volume-mute"></i> MUTED';muteBtn.style.opacity='0.5';}
}

q('#alm-dismiss').addEventListener('click',dismissModal);
q('#alm-mute').addEventListener('click',muteAlarm);

/* === HEALTH SCORE === */
function updateHealth(T,G,fal,sos,volt,inact,explosive,flashfire,helmetOff,trapped,unconscious){
  var score=100;
  if(unconscious)score-=50;
  if(fal)score-=40;if(sos)score-=40;
  if(trapped)score-=35;
  if(explosive||flashfire)score-=30;
  if(volt)score-=30;
  if(helmetOff)score-=20;
  if(inact)score-=20;
  if(G>S.threshG)score-=20;else if(G>S.threshG*0.7)score-=10;
  if(T>S.threshT)score-=20;else if(T>S.threshT*0.8)score-=10;
  score=Math.max(0,score);
  q('#hs-num').textContent=score;
  var circ=2*Math.PI*24,offset=circ*(1-score/100),fill=q('#hr-fill');
  fill.style.strokeDasharray=circ;fill.style.strokeDashoffset=offset;
  fill.style.stroke=score>70?'var(--green)':score>40?'var(--orange)':'var(--red)';
  var si=q('#hi-status');
  if(score>70){si.textContent='EXCELLENT';si.style.color='var(--green)';}
  else if(score>40){si.textContent='WARNING';si.style.color='var(--orange)';}
  else{si.textContent='CRITICAL';si.style.color='var(--red)';}
}

/* === GAUGE === */
function updateGauge(arcId,valId,val,maxVal,colorSafe,colorWarn,colorDanger,threshWarn,threshDanger){
  var arc=q('#'+arcId),valEl=q('#'+valId);if(!arc||!valEl)return;
  var pct=Math.min(val/maxVal,1),total=173;
  arc.style.strokeDashoffset=total*(1-pct);
  var col=val>=threshDanger?colorDanger:val>=threshWarn?colorWarn:colorSafe;
  arc.style.stroke=col;valEl.setAttribute('fill',col);
  valEl.textContent=val>999?Math.round(val/10)+'k':val;
}

/* === CHART === */
var ctx2,cvs2;
function initChart(){
  cvs2=q('#sparkline');if(!cvs2)return;
  ctx2=cvs2.getContext('2d');resizeChart();
  window.addEventListener('resize',resizeChart,{passive:true});
  var tip=q('#chart-tip'),wrap=q('#chart-wrap');if(!wrap)return;
  wrap.addEventListener('mousemove',function(e){
    var rect=wrap.getBoundingClientRect(),x=e.clientX-rect.left;
    var idx=Math.round((x/cvs2.width)*(S.tArr.length-1));
    if(idx>=0&&idx<S.tArr.length){tip.style.display='block';tip.style.left=Math.min(x+10,cvs2.width-120)+'px';tip.style.top='4px';tip.innerHTML='TEMP: '+S.tArr[idx]+'°C &nbsp;|&nbsp; GAS: '+S.gArr[idx]+'ppm';}
  },{passive:true});
  wrap.addEventListener('mouseleave',function(){tip.style.display='none';},{passive:true});
}
function resizeChart(){var wrap=q('#chart-wrap');if(!wrap||!cvs2)return;cvs2.width=wrap.clientWidth;cvs2.height=wrap.clientHeight;drawChart();}
function drawChart(){
  if(!ctx2||!cvs2)return;
  var w=cvs2.width,h=cvs2.height;
  ctx2.clearRect(0,0,w,h);
  ctx2.strokeStyle='rgba(255,214,0,0.05)';ctx2.lineWidth=1;
  for(var g=1;g<5;g++){ctx2.beginPath();ctx2.moveTo(0,h/5*g);ctx2.lineTo(w,h/5*g);ctx2.stroke();}
  plotLine2(S.tArr,'#FFD600',w,h,0,100);plotLine2(S.gArr,'#FF6B00',w,h,0,1200);
  if(S.tArr.length>1){
    var ty=h-8-((S.threshT/100)*(h-16));
    ctx2.setLineDash([6,4]);ctx2.strokeStyle='rgba(255,214,0,0.25)';ctx2.lineWidth=1;
    ctx2.beginPath();ctx2.moveTo(0,ty);ctx2.lineTo(w,ty);ctx2.stroke();ctx2.setLineDash([]);
  }
}
function plotLine2(arr,color,w,h,minV,maxV){
  if(arr.length<2)return;var p=8;
  ctx2.beginPath();
  arr.forEach(function(v,i){
    var x=p+(i/(MAX-1))*(w-p*2),norm=Math.min(Math.max((v-minV)/(maxV-minV),0),1),y=h-p-norm*(h-p*2);
    if(i===0)ctx2.moveTo(x,y);else ctx2.lineTo(x,y);
  });
  ctx2.strokeStyle=color;ctx2.lineWidth=2;ctx2.lineJoin='round';
  ctx2.shadowColor=color;ctx2.shadowBlur=7;ctx2.stroke();ctx2.shadowBlur=0;
  var last=arr.length-1;
  ctx2.lineTo(p+(last/(MAX-1))*(w-p*2),h);ctx2.lineTo(p,h);ctx2.closePath();
  var r2=parseInt(color.slice(1,3),16),g2=parseInt(color.slice(3,5),16),b2=parseInt(color.slice(5,7),16);
  var gr=ctx2.createLinearGradient(0,0,0,h);
  gr.addColorStop(0,'rgba('+r2+','+g2+','+b2+',0.2)');gr.addColorStop(1,'rgba('+r2+','+g2+','+b2+',0)');
  ctx2.fillStyle=gr;ctx2.fill();
}

/* helper: update a boolean alert card */
function updateCard(cardId,iconId,valId,active,dangerIcon,safeIcon,dangerTxt,safeTxt,alertMsg,logMsg,alertType){
  var card=q('#'+cardId),icon=q('#'+iconId),val=q('#'+valId);
  if(!card)return;
  if(active){
    card.classList.add('danger');
    icon.innerHTML='<i class="fas '+dangerIcon+'"></i>';icon.className='ac-icon';
    val.textContent=dangerTxt;val.style.color='var(--red)';
    if(S.prev[cardId]!==active){addAlert(alertType,alertMsg);addLog(alertType,logMsg,'ALERT');}
  } else {
    card.classList.remove('danger');
    icon.innerHTML='<i class="fas '+safeIcon+'"></i>';icon.className='ac-icon safe-i';
    val.textContent=safeTxt;val.style.color=alertType==='warn'?'var(--orange)':'var(--green)';
    if(S.prev[cardId]!==active&&S.prev[cardId]!==undefined){addLog('safe',logMsg+' Cleared','OK');}
  }
}

/* === MAIN UI UPDATE === */
function updateUI(data){
  var T          = parseFloat(data.Temperature)        || 0;
  var G          = parseFloat(data.GasLevel_MQ135)     || 0;
  var HI         = parseFloat(data.HeatIndex)          || 0;
  var HUM        = parseFloat(data.Humidity)           || 0;
  var fal        = data.Fall_Alert         == 1;
  var sos        = data.SOS_Alert          == 1;
  var volt       = data.HighVoltage_Alert  == 1;
  var inact      = data.Inactivity_Alert   == 1;
  var explosive  = data.ExplosiveGas_Alert == 1;
  var flashfire  = data.FlashFire_Alert    == 1;
  var helmetOff  = data.Helmet_Off         == 1;
  var trapped    = data.Trapped_Alert      == 1;
  var unconscious= data.Unconscious_Alert  == 1;

  var LT=LANG[S.lang]||LANG['en'];

  var isDanger=(fal&&S.trigFall)||(sos&&S.trigSos)||(volt&&S.trigVolt)||
                (inact&&S.trigInact)||(explosive&&S.trigExplosive)||
                (flashfire&&S.trigFlashFire)||(helmetOff&&S.trigHelmetOff)||
                (trapped&&S.trigTrapped)||(unconscious&&S.trigUnconscious)||
                (G>S.threshG&&S.trigGas)||(T>S.threshT&&S.trigTemp);

  S.tArr.push(T);S.gArr.push(G);
  if(S.tArr.length>MAX)S.tArr.shift();if(S.gArr.length>MAX)S.gArr.shift();
  drawChart();
  if(S.maxTemp===null||T>S.maxTemp){S.maxTemp=T;q('#sys-peak').textContent=T+'°C';}

  var te=q('#sb-temp'),ge=q('#sb-gas');
  te.textContent=T+'°C';ge.textContent=G;
  te.className='sb-rv '+(T>S.threshT?'danger-v':T>S.threshT*0.8?'warn-v':'safe-v');
  ge.className='sb-rv '+(G>S.threshG?'danger-v':G>S.threshG*0.7?'warn-v':'safe-v');

  updateGauge('gauge-temp-arc','gauge-temp-val',T,100,'var(--green)','var(--orange)','var(--red)',S.threshT*0.8,S.threshT);
  updateGauge('gauge-gas-arc','gauge-gas-val',G,1200,'var(--green)','var(--orange)','var(--red)',S.threshG*0.7,S.threshG);

  var mt=q('#m-temp'),mg=q('#m-gas'),mh=q('#m-heat'),mhu=q('#m-hum');
  mt.textContent=T;mt.className='metric-val '+(T>S.threshT?'rv':T>S.threshT*0.8?'ov':'gv');
  mg.textContent=G;mg.className='metric-val '+(G>S.threshG?'rv':G>S.threshG*0.7?'ov':'gv');
  if(mh)mh.textContent=HI.toFixed(1);
  if(mhu)mhu.textContent=HUM;

  updateCard('fall-card','fall-icon','fall-val',fal,
    'fa-person-falling','fa-user-check',LT.fallDanger,LT.fallSafe,
    'FALL DETECTED — HELMET','Fall Detected','danger');
  updateCard('sos-card','sos-icon','sos-val',sos,
    'fa-sos','fa-hand-paper',LT.sosDanger,LT.sosSafe,
    'SOS SIGNAL — HELMET','SOS Activated','danger');
  updateCard('volt-card','volt-icon','volt-val',volt,
    'fa-bolt','fa-bolt',LT.voltDanger,LT.voltSafe,
    'HIGH VOLTAGE — HELMET','High Voltage','danger');
  updateCard('inact-card','inact-icon','inact-val',inact,
    'fa-person','fa-person',LT.inactDanger,LT.inactSafe,
    'INACTIVITY — HELMET','Inactivity','warn');
  updateCard('explosive-card','explosive-icon','explosive-val',explosive,
    'fa-explosion','fa-wind',LT.explosiveDanger,LT.explosiveSafe,
    'EXPLOSIVE GAS — HELMET','Explosive Gas','danger');
  updateCard('flashfire-card','flashfire-icon','flashfire-val',flashfire,
    'fa-fire-flame-curved','fa-fire-flame-curved',LT.flashfireDanger,LT.flashfireSafe,
    'FLASH FIRE RISK — HELMET','Flash Fire','danger');
  updateCard('helmetoff-card','helmetoff-icon','helmetoff-val',helmetOff,
    'fa-hard-hat','fa-hard-hat',LT.helmetoffDanger,LT.helmetoffSafe,
    'HELMET REMOVED — HELMET','Helmet Off','danger');
  updateCard('trapped-card','trapped-icon','trapped-val',trapped,
    'fa-person-rays','fa-person-rays',LT.trappedDanger,LT.trappedSafe,
    'WORKER TRAPPED — HELMET','Trapped Alert','danger');
  updateCard('unconscious-card','unconscious-icon','unconscious-val',unconscious,
    'fa-head-side-mask','fa-head-side-mask',LT.unconsciousDanger,LT.unconsciousSafe,
    'WORKER UNCONSCIOUS — HELMET','Unconscious Alert','danger');

  if(G>S.threshG&&(S.prev.G===undefined||S.prev.G<=S.threshG)){
    addAlert('danger','Toxic Gas CRITICAL: '+G+' ppm — HELMET');addLog('danger','Gas Critical (>'+S.threshG+'ppm)',G+'ppm');
  } else if(G>S.threshG*0.7&&!(S.prev.G>S.threshG*0.7)){
    addAlert('warn','Gas Warning: '+G+' ppm — HELMET');addLog('warn','Gas Warning',G+'ppm');
  }
  if(T>S.threshT&&(S.prev.T===undefined||S.prev.T<=S.threshT)){
    addAlert('danger','High Temp: '+T+'°C — HELMET');addLog('danger','Temp Threshold Exceeded',T+'°C');
  } else if(T>S.threshT*0.8&&!(S.prev.T>S.threshT*0.8)){
    addAlert('warn','Temp Warning: '+T+'°C — HELMET');addLog('warn','Temp Warning',T+'°C');
  }

  var banner=q('#status-banner'),word=q('#sb-word'),sub=q('#sb-sub'),
      hex=q('#sb-hex'),hexi=q('#sb-hex-i'),pill=q('#conn-pill'),
      ptxt=q('#conn-txt'),ab=q('#alert-badge');

  if(isDanger){
    banner.style.borderColor='var(--red)';banner.style.boxShadow='0 4px 0 var(--red),inset 0 0 60px rgba(227,0,11,0.05)';
    word.textContent=LT.danger;word.className='sb-word danger';
    sub.textContent=LT.dangerSub;
    hex.className='sb-hex danger-hex';hexi.className='fas fa-radiation';
    pill.className='status-pill danger';ptxt.textContent=LT.connDanger;
    ab.className='panel-badge red';ab.textContent=LT.badgeAlert;
    q('#emrg-wrap').classList.toggle('active',!!S.flash);
    if(!S.isDanger){
      if(S.snd){var al=q('#alarm');if(al){al.currentTime=0;al.play().catch(function(){});}}
      var reasons=buildReasons(T,G,fal,sos,volt,inact,explosive,flashfire,helmetOff,trapped,unconscious);
      if(!S.modalOpen)showAlertModal(reasons);
      S.isDanger=true;
    }
  } else {
    banner.style.borderColor='var(--yellow)';banner.style.boxShadow='0 4px 0 var(--yellow),inset 0 0 60px rgba(255,214,0,0.03)';
    word.textContent=LT.allClear;word.className='sb-word';
    sub.textContent=LT.allClearSub;
    hex.className='sb-hex';hexi.className='fas fa-shield-alt';
    pill.className='status-pill';ptxt.textContent=LT.connClear;
    ab.className='panel-badge';ab.textContent=LT.badgeLive;
    q('#emrg-wrap').classList.remove('active');
    if(S.isDanger){
      var al2=q('#alarm');if(al2)al2.pause();
      if(window.speechSynthesis)window.speechSynthesis.cancel();
      S.isDanger=false;S.modalMuted=false;
      if(S.modalOpen)dismissModal();
    }
  }

  updateHealth(T,G,fal,sos,volt,inact,explosive,flashfire,helmetOff,trapped,unconscious);
  S.prev={
    T:T,G:G,
    'fall-card':fal,'sos-card':sos,'volt-card':volt,'inact-card':inact,
    'explosive-card':explosive,'flashfire-card':flashfire,'helmetoff-card':helmetOff,
    'trapped-card':trapped,'unconscious-card':unconscious
  };
}

/* === FIREBASE === */
window.addEventListener('load',function(){
  initChart();
  var fbConfig={
    apiKey:"AIzaSyBSNf-7VhfWvo2AyExJbl8_Yk55kNDKZGc",
    authDomain:"smart-helmet-hackathon.firebaseapp.com",
    databaseURL:"https://smart-helmet-hackathon-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId:"smart-helmet-hackathon",
    storageBucket:"smart-helmet-hackathon.firebasestorage.app",
    messagingSenderId:"292986973487",
    appId:"1:292986973487:web:441a114cdc9deaa02285da"
  };
  try{
    firebase.initializeApp(fbConfig);
    var db=firebase.database();
    db.ref('/Helmet').on('value',function(snap){
      var d=snap.val();if(d)updateUI(d);
    },function(err){console.error('Firebase error:',err);toast('DB ERROR','r');});
  } catch(e){console.error('Firebase init failed:',e);toast('FIREBASE CONFIG MISSING','o');}
});


