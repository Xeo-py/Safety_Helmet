/* === STATE === */
var S={
  lang:'en',theme:'dark',snd:true,flash:true,log:true,modal:true,voice:true,autoDismiss:30,
  trigTemp:true,trigGas:true,trigFall:true,trigSos:true,
  threshT:45,threshG:100,isDanger:false,modalOpen:false,modalMuted:false,
  unread:0,events:0,maxTemp:null,history:[],alerts:[],tArr:[],gArr:[],startTime:Date.now(),prev:{}
};
var MAX=40;
function q(s){return document.querySelector(s)}
function qa(s){return document.querySelectorAll(s)}
function pad(n){return n<10?'0'+n:''+n}

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
  qa('[data-en]').forEach(function(el){var v=el.getAttribute('data-'+lang);if(v!==null){if(v.indexOf('<')!==-1)el.innerHTML=v;else el.textContent=v;}});
  var si=q('#log-search');if(si)si.placeholder=si.getAttribute('data-'+lang+'-placeholder')||si.placeholder;
  qa('#s-en,#s-hi,#dr-en,#dr-hi').forEach(function(b){b.classList.remove('active');});
  [q('#s-'+lang),q('#dr-'+lang)].forEach(function(b){if(b)b.classList.add('active');});
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
q('#t-thresh').addEventListener('input',function(){S.threshT=parseInt(this.value);q('#t-v').textContent=this.value+'C';q('#ts-sub').textContent='Trigger at: '+this.value+'C';});
q('#g-thresh').addEventListener('input',function(){S.threshG=parseInt(this.value);q('#g-v').textContent=this.value;q('#gs-sub').textContent='Trigger at: '+this.value+' ppm';});
q('#tog-snd').addEventListener('change',function(){S.snd=this.checked;});
q('#tog-flash').addEventListener('change',function(){S.flash=this.checked;});
q('#tog-modal').addEventListener('change',function(){S.modal=this.checked;});
q('#tog-voice').addEventListener('change',function(){S.voice=this.checked;});
q('#tog-log').addEventListener('change',function(){S.log=this.checked;});
q('#trig-temp').addEventListener('change',function(){S.trigTemp=this.checked;});
q('#trig-gas').addEventListener('change',function(){S.trigGas=this.checked;});
q('#trig-fall').addEventListener('change',function(){S.trigFall=this.checked;});
q('#trig-sos').addEventListener('change',function(){S.trigSos=this.checked;});
q('#autodismiss-range').addEventListener('input',function(){
  S.autoDismiss=parseInt(this.value);
  var lbl=S.autoDismiss===0?'OFF':S.autoDismiss+'s';
  q('#autodismiss-v').textContent=lbl;
  q('#autodismiss-sub').textContent='Dismiss after: '+lbl;
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
  if(!S.alerts.length){body.innerHTML='<div class="as-empty"><i class="fas fa-shield-alt"></i>NO ALERTS RECORDED</div>';return;}
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
  var rows=S.history.filter(function(r){
    return(activeF==='all'||r.type===activeF)&&(!searchQ||r.event.toLowerCase().indexOf(searchQ)!==-1||r.val.toString().toLowerCase().indexOf(searchQ)!==-1);
  });
  if(!rows.length){tbody.innerHTML='<tr><td colspan="4" style="text-align:center;padding:26px;color:var(--text-dim);font-family:var(--mono);font-size:.74rem;letter-spacing:.12em">NO EVENTS</td></tr>';return;}
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

/* Build list of active danger reasons based on current data + trigger settings */
function buildReasons(T,G,fal,sos){
  var items=[];
  if(fal&&S.trigFall)
    items.push({icon:'fa-person-falling',main:'FALL DETECTED',val:'Worker has fallen — immediate response needed on HELMET_01'});
  if(sos&&S.trigSos)
    items.push({icon:'fa-sos',main:'SOS ACTIVATED',val:'Manual emergency signal triggered from HELMET_01'});
  if(T>S.threshT&&S.trigTemp)
    items.push({icon:'fa-temperature-high',main:'HIGH TEMPERATURE',val:T+'C recorded — Safe limit is '+S.threshT+'C on HELMET_01'});
  if(G>S.threshG&&S.trigGas)
    items.push({icon:'fa-smog',main:'TOXIC GAS DETECTED',val:G+' ppm detected — Safe limit is '+S.threshG+' ppm on HELMET_01'});
  return items;
}

/* Show the full-screen red alert modal */
function showAlertModal(reasons){
  if(!S.modal||!reasons.length)return;
  var modal=q('#alert-modal');
  var ts=new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true});
  q('#alm-time').textContent='Triggered at '+ts+' | Unit: HELMET_01';
  q('#alm-reasons').innerHTML=reasons.map(function(r){
    return '<div class="alm-reason-item">'
      +'<i class="fas '+r.icon+'"></i>'
      +'<div class="alm-reason-txt">'
      +'<div class="alm-reason-main">'+r.main+'</div>'
      +'<div class="alm-reason-val">'+r.val+'</div>'
      +'</div></div>';
  }).join('');
  q('#alm-auto').textContent='';

  // Reset mute button state
  var muteBtn=q('#alm-mute');
  muteBtn.innerHTML='<i class="fas fa-volume-mute"></i> MUTE';
  muteBtn.style.opacity='1';

  modal.style.display='flex';
  S.modalOpen=true;
  S.modalMuted=false;

  // Voice announcement via Web Speech API
  if(S.voice&&'speechSynthesis' in window){
    window.speechSynthesis.cancel();
    var announcement='Danger alert on Helmet 01. ';
    reasons.forEach(function(r){announcement+=r.main+'. '+r.val+'. ';});
    var utt=new SpeechSynthesisUtterance(announcement);
    utt.rate=0.9;utt.pitch=1.1;utt.volume=1;
    window.speechSynthesis.speak(utt);
  }

  // Auto-dismiss countdown
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
/* ========================================================= */

/* === HEALTH SCORE === */
function updateHealth(T,G,fal,sos){
  var score=100;
  if(fal)score-=40;if(sos)score-=40;
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
    if(idx>=0&&idx<S.tArr.length){tip.style.display='block';tip.style.left=Math.min(x+10,cvs2.width-120)+'px';tip.style.top='4px';tip.innerHTML='TEMP: '+S.tArr[idx]+'C &nbsp;|&nbsp; GAS: '+S.gArr[idx]+'ppm';}
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
  plotLine2(S.tArr,'#FFD600',w,h,0,100);plotLine2(S.gArr,'#FF6B00',w,h,0,400);
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

/* === MAIN UI UPDATE === */
function updateUI(data){
  var T=parseFloat(data.Temperature)||0,G=parseFloat(data.Gas_Level)||0;
  var fal=data.Fall_Alert==1,sos=data.SOS_Alert==1;

  // Danger is only active for enabled trigger types
  var isDanger=(fal&&S.trigFall)||(sos&&S.trigSos)||(G>S.threshG&&S.trigGas)||(T>S.threshT&&S.trigTemp);

  S.tArr.push(T);S.gArr.push(G);
  if(S.tArr.length>MAX)S.tArr.shift();if(S.gArr.length>MAX)S.gArr.shift();
  drawChart();
  if(S.maxTemp===null||T>S.maxTemp){S.maxTemp=T;q('#sys-peak').textContent=T+'C';}

  var te=q('#sb-temp'),ge=q('#sb-gas');
  te.textContent=T+'C';ge.textContent=G;
  te.className='sb-rv '+(T>S.threshT?'danger-v':T>S.threshT*0.8?'warn-v':'safe-v');
  ge.className='sb-rv '+(G>S.threshG?'danger-v':G>S.threshG*0.7?'warn-v':'safe-v');

  updateGauge('gauge-temp-arc','gauge-temp-val',T,100,'var(--green)','var(--orange)','var(--red)',S.threshT*0.8,S.threshT);
  updateGauge('gauge-gas-arc','gauge-gas-val',G,400,'var(--green)','var(--orange)','var(--red)',S.threshG*0.7,S.threshG);

  var mt=q('#m-temp'),mg=q('#m-gas');
  mt.textContent=T;mt.className='metric-val '+(T>S.threshT?'rv':T>S.threshT*0.8?'ov':'gv');
  mg.textContent=G;mg.className='metric-val '+(G>S.threshG?'rv':G>S.threshG*0.7?'ov':'gv');

  // Fall alert card
  var fc=q('#fall-card'),fi=q('#fall-icon'),fv=q('#fall-val');
  if(fal){
    fc.classList.add('danger');fi.innerHTML='<i class="fas fa-person-falling"></i>';fi.className='ac-icon';
    fv.textContent='FALL DETECTED!';fv.style.color='var(--red)';
    if(S.prev.fal!==fal){addAlert('danger','FALL DETECTED — HELMET_01');addLog('danger','Fall Detected','ALERT');}
  } else {
    fc.classList.remove('danger');fi.innerHTML='<i class="fas fa-user-check"></i>';fi.className='ac-icon safe-i';
    fv.textContent='STABLE';fv.style.color='var(--green)';
    if(S.prev.fal!==fal&&S.prev.fal!==undefined){addLog('safe','Fall Cleared','OK');}
  }

  // SOS alert card
  var sc=q('#sos-card'),si2=q('#sos-icon'),sv=q('#sos-val');
  if(sos){
    sc.classList.add('danger');si2.innerHTML='<i class="fas fa-sos"></i>';si2.className='ac-icon';
    sv.textContent='SOS ACTIVE!';sv.style.color='var(--red)';
    if(S.prev.sos!==sos){addAlert('danger','SOS SIGNAL — HELMET_01');addLog('danger','SOS Activated','ALERT');}
  } else {
    sc.classList.remove('danger');si2.innerHTML='<i class="fas fa-hand-paper"></i>';si2.className='ac-icon safe-i';
    sv.textContent='INACTIVE';sv.style.color='var(--green)';
    if(S.prev.sos!==sos&&S.prev.sos!==undefined){addLog('safe','SOS Cleared','OK');}
  }

  // Temp log events
  if(T>S.threshT&&(S.prev.T===undefined||S.prev.T<=S.threshT)){
    addAlert('danger','High Temp: '+T+'C — HELMET_01');addLog('danger','Temp Threshold Exceeded',T+'C');
  } else if(T>S.threshT*0.8&&!(S.prev.T>S.threshT*0.8)){
    addAlert('warn','Temp Warning: '+T+'C — HELMET_01');addLog('warn','Temp Warning',T+'C');
  }

  // Gas log events
  if(G>S.threshG&&(S.prev.G===undefined||S.prev.G<=S.threshG)){
    addAlert('danger','Toxic Gas: '+G+' ppm — HELMET_01');addLog('danger','Gas Threshold Exceeded',G+'ppm');
  } else if(G>S.threshG*0.7&&!(S.prev.G>S.threshG*0.7)){
    addAlert('warn','Gas Warning: '+G+' ppm — HELMET_01');addLog('warn','Gas Warning',G+'ppm');
  }

  // Status banner + alarm + modal
  var banner=q('#status-banner'),word=q('#sb-word'),sub=q('#sb-sub'),
      hex=q('#sb-hex'),hexi=q('#sb-hex-i'),pill=q('#conn-pill'),
      ptxt=q('#conn-txt'),ab=q('#alert-badge');

  if(isDanger){
    banner.style.borderColor='var(--red)';banner.style.boxShadow='0 4px 0 var(--red),inset 0 0 60px rgba(227,0,11,0.05)';
    word.textContent='DANGER!';word.className='sb-word danger';
    sub.textContent='Immediate action required — HELMET_01!';
    hex.className='sb-hex danger-hex';hexi.className='fas fa-radiation';
    pill.className='status-pill danger';ptxt.textContent='DANGER';
    ab.className='panel-badge red';ab.textContent='ALERT';
    q('#emrg-wrap').classList.toggle('active',!!S.flash);

    // New danger onset: trigger alarm + modal
    if(!S.isDanger){
      if(S.snd){var al=q('#alarm');if(al){al.currentTime=0;al.play().catch(function(){});}}
      var reasons=buildReasons(T,G,fal,sos);
      if(!S.modalOpen)showAlertModal(reasons);
      S.isDanger=true;
    }
  } else {
    banner.style.borderColor='var(--yellow)';banner.style.boxShadow='0 4px 0 var(--yellow),inset 0 0 60px rgba(255,214,0,0.03)';
    word.textContent='ALL CLEAR';word.className='sb-word';
    sub.textContent='All safety parameters within limits';
    hex.className='sb-hex';hexi.className='fas fa-shield-alt';
    pill.className='status-pill';ptxt.textContent='ALL CLEAR';
    ab.className='panel-badge';ab.textContent='LIVE';
    q('#emrg-wrap').classList.remove('active');
    if(S.isDanger){
      var al2=q('#alarm');if(al2)al2.pause();
      if(window.speechSynthesis)window.speechSynthesis.cancel();
      S.isDanger=false;S.modalMuted=false;
      if(S.modalOpen)dismissModal();
    }
  }

  updateHealth(T,G,fal,sos);
  S.prev={T:T,G:G,fal:fal,sos:sos};
}

/* === FIREBASE === */
window.addEventListener('load',function(){
  initChart();
  var fbConfig={
    apiKey:"YOUR_API_KEY",
    authDomain:"YOUR_PROJECT.firebaseapp.com",
    databaseURL:"https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId:"YOUR_PROJECT",
    storageBucket:"YOUR_PROJECT.appspot.com",
    messagingSenderId:"YOUR_SENDER_ID",
    appId:"YOUR_APP_ID"
  };
  try{
    firebase.initializeApp(fbConfig);
    var db=firebase.database();
    db.ref('/').on('value',function(snap){
      var d=snap.val();if(d)updateUI(d);
    },function(err){console.error('Firebase error:',err);toast('DB ERROR','r');});
  } catch(e){console.error('Firebase init failed:',e);toast('FIREBASE CONFIG MISSING','o');}
});
