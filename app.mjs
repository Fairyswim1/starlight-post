import {levels} from './levels.mjs';
import {createState,inspectMove,move,solve,stars,location,key} from './engine.mjs';
const $=s=>document.querySelector(s), fmt=p=>`(${p.join(', ')})`;
const storageKey='starlight-post-v1';
let saved={stars:{},last:0,sound:false};
try{const v=JSON.parse(localStorage.getItem(storageKey));if(v&&typeof v==='object'){for(const l of levels){const n=v.stars?.[l.id];if(Number.isInteger(n)&&n>=1&&n<=3)saved.stars[l.id]=n;}if(Number.isInteger(v.last)&&v.last>=0&&v.last<levels.length)saved.last=v.last;saved.sound=v.sound===true;}}catch{}
const persist=()=>{try{localStorage.setItem(storageKey,JSON.stringify(saved));}catch{}};
for(const l of levels){l.optimal=solve(l).distance;l.fuel=l.optimal+l.extra;}
let index=saved.last,level=levels[index],state=createState(level),previous=null,order='xy',busy=false,sequence=0,trail=[],audio;
const ns='http://www.w3.org/2000/svg';
function node(tag,attrs={},text=''){const e=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text)e.textContent=text;return e;}
const xy=([x,y])=>[300+x*44,300-y*44];
function line(a,b,attrs={}){return node('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],...attrs});}
function getTarget(){return [$('#x-input').valueAsNumber,$('#y-input').valueAsNumber];}
function say(text){$('#feedback').textContent=text;}
function tone(type){if(!saved.sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.type='sine';o.frequency.setValueAtTime(type==='win'?660:type==='mail'?520:330,audio.currentTime);o.frequency.exponentialRampToValueAtTime(type==='win'?990:440,audio.currentTime+.16);g.gain.setValueAtTime(.05,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.25);o.start();o.stop(audio.currentTime+.25);}catch{}}
function marker(svg,p,type,label){const [x,y]=xy(p),g=node('g',{transform:`translate(${x},${y})`});g.append(node('title',{},`${label} ${fmt(p)}`));
  if(type==='letter'){g.append(node('circle',{r:18,fill:'#efc47720',stroke:'#efc47770'}),node('rect',{x:-11,y:-7,width:22,height:15,rx:3,fill:'#f1c67b',stroke:'#fff0c8','stroke-width':1.2}),node('path',{d:'M -10 -6 L 0 2 L 10 -6',fill:'none',stroke:'#9a7444','stroke-width':1.5}));}
  if(type==='goal'){g.append(node('circle',{r:20,fill:'#8fe0cb15',stroke:'#8fe0cb80','stroke-dasharray':'3 4'}),node('path',{d:'M -12 2 L 0 -11 L 12 2 M -9 -1 V 12 H 9 V -1',stroke:'#9be0d0','stroke-width':2.5,fill:'#163f47'}),node('rect',{x:-3,y:5,width:6,height:7,fill:'#9be0d0'}));}
  if(type==='storm'){g.append(node('circle',{r:15,fill:'#87698855'}),node('path',{d:'M -13 3 C -21 -5 -8 -12 -4 -7 C -1 -20 17 -13 14 -5 C 25 -3 18 8 10 7 H -10 Z',fill:'#9c829f',stroke:'#c3acc4','stroke-width':1}),node('path',{d:'M 3 0 L -2 6 H 3 L -1 13',fill:'none',stroke:'#f3cf91','stroke-width':1.5}));}
  if(label)g.append(node('text',{x:0,y:-26,'text-anchor':'middle',class:'marker-label'},label));svg.append(g);
}
function draw(pos=state.position){const svg=$('#board');svg.replaceChildren();
  svg.append(node('rect',{x:58,y:58,width:484,height:484,rx:16,fill:'#092033b3',stroke:'#9cc1cc20'}));
  const names=[[[2.7,4.8],'제1사분면'],[[-2.7,4.8],'제2사분면'],[[-2.7,-4.8],'제3사분면'],[[2.7,-4.8],'제4사분면']];
  for(const[p,t]of names){const[x,y]=xy(p);svg.append(node('text',{x,y,'text-anchor':'middle',class:'quadrant-label'},t));}
  for(let n=-5;n<=5;n++){
    svg.append(line(xy([n,-5]),xy([n,5]),{stroke:n===0?'#9dc8cb99':'#b8d5dd1a','stroke-width':n===0?1.5:1}),line(xy([-5,n]),xy([5,n]),{stroke:n===0?'#9dc8cb99':'#b8d5dd1a','stroke-width':n===0?1.5:1}));
    if(n!==0){svg.append(node('text',{x:xy([n,0])[0],y:319,'text-anchor':'middle',class:'grid-label'},String(n)),node('text',{x:285,y:xy([0,n])[1]+4,'text-anchor':'end',class:'grid-label'},String(n)));}
  }
  svg.append(node('path',{d:'M 527 297 L 534 300 L 527 303 M 297 73 L 300 66 L 303 73',stroke:'#b1cacf',fill:'none'}),node('text',{x:544,y:306,class:'axis-label'},'x'),node('text',{x:296,y:49,class:'axis-label'},'y'),node('text',{x:286,y:319,class:'grid-label'},'O'));
  if(trail.length>1)svg.append(node('polyline',{points:trail.map(p=>xy(p).join(',')).join(' '),fill:'none',stroke:'#8bdcc758','stroke-width':3,'stroke-linecap':'round','stroke-linejoin':'round'}));
  const target=getTarget();const checked=inspectMove(level,state,target,order);
  if(!busy && target.every(n=>Number.isInteger(n)&&Math.abs(n)<=5) && checked.path?.length){svg.append(node('polyline',{points:[state.position,...checked.path].map(p=>xy(p).join(',')).join(' '),fill:'none',stroke:checked.ok?'#f2c377':'#e38e87','stroke-width':2,'stroke-dasharray':'5 7','stroke-linecap':'round'}));const[x,y]=xy(target);svg.append(node('circle',{cx:x,cy:y,r:10,fill:'none',stroke:checked.ok?'#f2c377':'#e38e87','stroke-width':1.5}));}
  level.storms.forEach(p=>marker(svg,p,'storm',''));
  marker(svg,level.goal,'goal','우편함');
  level.letters.forEach((p,i)=>{if(!(state.collected&(1<<i)))marker(svg,p,'letter',`편지 ${String.fromCharCode(65+i)}`);else{const[x,y]=xy(p);svg.append(node('text',{x,y:y+5,fill:'#8bdcc7','text-anchor':'middle','font-size':17},'✓'));}});
  const[x,y]=xy(pos);svg.append(node('circle',{cx:x,cy:y,r:7,fill:'#b9f1da',stroke:'#ffffff','stroke-width':1.5}),node('image',{href:'assets/postal-airship.png',x:x-25,y:y-51,width:50,height:47,class:'ship-marker'}));
  svg.setAttribute('aria-label',`좌표 지도. 현재 위치 ${fmt(state.position)}. ${level.letters.map((p,i)=>`편지 ${String.fromCharCode(65+i)} ${state.collected&(1<<i)?'수거 완료':fmt(p)}`).join('. ')}. 우편함 ${fmt(level.goal)}. 폭풍 ${level.storms.map(fmt).join(', ')||'없음'}.`);
}
function stageButtons(){const nav=$('#stages');nav.replaceChildren();levels.forEach((l,i)=>{const b=document.createElement('button');b.className=`stage-button${i===index?' active':''}${saved.stars[l.id]?' done':''}`;b.textContent=String(l.id).padStart(2,'0');b.setAttribute('aria-label',`항로 ${l.id}: ${l.title}`);b.setAttribute('aria-current',i===index?'step':'false');const small=document.createElement('small');small.textContent=saved.stars[l.id]?'★'.repeat(saved.stars[l.id]):'·';b.append(small);b.onclick=()=>load(i);b.disabled=busy;nav.append(b);});$('#total-stars').textContent=Object.values(saved.stars).reduce((a,b)=>a+b,0);}
function render(){
  $('#chapter').textContent=level.chapter;$('#level-title').textContent=`${String(level.id).padStart(2,'0')}. ${level.title}`;$('#position').textContent=`현재 ${fmt(state.position)}`;$('#collected').textContent=`${state.collected.toString(2).replaceAll('0','').length} / ${level.letters.length}`;$('#fuel').innerHTML=`${state.fuel} <em>칸</em>`;$('#fuel-bar').style.width=`${state.fuel/level.fuel*100}%`;
  $('#mission-copy').textContent=`편지 ${level.letters.length}통을 모두 수거하고 초록색 우편함에 도착하세요.`;$('#tip').textContent=level.tip;
  $('#order-xy').setAttribute('aria-pressed',order==='xy');$('#order-yx').setAttribute('aria-pressed',order==='yx');
  const target=getTarget();const valid=target.every(n=>Number.isInteger(n)&&Math.abs(n)<=5);$('#target-location').textContent=valid?`${fmt(target)} · ${location(target)}`:'−5부터 5까지의 정수를 입력하세요.';
  const check=inspectMove(level,state,target,order);$('#route-info').textContent=busy?'비행 중이에요…':check.ok?`예상 연료 ${check.cost}칸 · 점선으로 항로를 확인하세요.`:check.reason;$('#route-info').classList.toggle('error',!check.ok && check.path?.length>0);
  for(const e of document.querySelectorAll('.control-card button,.control-card input,#hint'))e.disabled=busy||state.won;
  $('#reset').disabled=busy;$('#undo').disabled=busy||!previous||state.won;$('#launch').disabled=busy||state.won||!valid;
  $('#sound').textContent=saved.sound?'소리 켜짐':'소리 꺼짐';$('#sound').setAttribute('aria-pressed',saved.sound);
  stageButtons();draw();
}
function load(i){sequence++;busy=false;index=i;level=levels[i];state=createState(level);previous=null;order='xy';trail=[[...state.position]];$('#x-input').value=state.position[0];$('#y-input').value=state.position[1];saved.last=i;persist();render();say(level.tip);}
function modal(html){$('#dialog-content').innerHTML=html;$('#dialog').showModal();}
function help(){modal(`<div class="dialog-art"><img src="assets/postal-airship.png" alt="별빛 우편 비행선"></div><div class="dialog-inner"><p class="eyebrow">WELCOME, NIGHT PILOT</p><h2>오늘 밤, 당신이 우편사예요.</h2><p>지도 속 편지를 모아 초록색 우편함으로 배달하세요.<br>비행선 아래의 작은 빛이 정확한 현재 위치예요.</p><ol><li><b>x는 가로, y는 세로.</b> 목적지 좌표를 입력해요.</li><li><b>가로 먼저 또는 세로 먼저.</b> 점선 항로를 살펴봐요.</li><li><b>한 칸에 연료 1.</b> 폭풍을 피하고 편지를 모아요.</li></ol><p>가장 짧은 길을 힌트·잘못된 출발 없이 완주하면 별 3개!<br>시간 제한은 없어요. 천천히 생각해도 괜찮아요.</p><button class="launch" id="dialog-start">배달 시작하기 <span>↗</span></button></div>`);$('#dialog-start').onclick=()=>$('#dialog').close();}
function result(){const count=stars(level,state);saved.stars[level.id]=Math.max(saved.stars[level.id]||0,count);persist();stageButtons();tone('win');modal(`<div class="dialog-inner"><p class="eyebrow">DELIVERY COMPLETE</p><h2>밤하늘에 소식이 도착했어요.</h2><div class="win-stars" aria-label="별 ${count}개">${'★'.repeat(count)}${'☆'.repeat(3-count)}</div><div class="win-summary"><div><small>비행 거리</small><strong>${state.distance}칸</strong></div><div><small>최단 거리</small><strong>${level.optimal}칸</strong></div><div><small>남은 연료</small><strong>${state.fuel}칸</strong></div></div><p>마지막 목적지 ${fmt(level.goal)}는 <b>${location(level.goal)}</b>이에요. 좌표는 항상 <b>(x, y)</b> 순서로 읽어요.</p><p>${count===3?'정확한 좌표와 효율적인 항로, 멋진 비행이었어요.':'최단 거리로, 힌트와 잘못된 출발 없이 배달하면 별 3개를 받을 수 있어요.'}</p><button id="next-stage" class="launch">${index<levels.length-1?'다음 항로로':'전체 항로 완주! 처음으로'} <span>→</span></button><button id="replay" class="dialog-secondary">같은 항로 다시 도전</button></div>`);$('#next-stage').onclick=()=>{$('#dialog').close();load((index+1)%levels.length);};$('#replay').onclick=()=>{$('#dialog').close();load(index);};}
async function launch(){if(busy||state.won)return;const target=getTarget();const resultMove=move(level,state,target,order);if(!resultMove.ok){state=resultMove.state;tone('move');render();say(resultMove.reason);return;}
  previous={state:structuredClone(state),trail:structuredClone(trail)};const oldMask=state.collected;busy=true;const seq=++sequence;render();tone('move');const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  for(const p of resultMove.path){if(seq!==sequence)return;draw(p);await new Promise(r=>setTimeout(r,reduced?0:Math.min(100,900/resultMove.path.length)));}
  if(seq!==sequence)return;state=resultMove.state;trail.push(...resultMove.path);busy=false;render();
  if(state.collected!==oldMask)tone('mail');
  say(`${fmt(target)} · ${location(target)}에 도착했어요. ${state.collected!==oldMask?'편지를 수거했어요! ':''}${state.won?'배달 완료!':state.fuel===0?'연료를 모두 썼어요. 되돌리기 또는 처음부터 다시 도전해보세요.':'다음 목적지를 정해주세요.'}`);
  if(state.won)result();
}
for(const button of document.querySelectorAll('[data-axis]'))button.onclick=()=>{const input=$(`#${button.dataset.axis}-input`);input.value=Math.max(-5,Math.min(5,(Number.isFinite(input.valueAsNumber)?input.valueAsNumber:0)+Number(button.dataset.step)));render();};
for(const input of [$('#x-input'),$('#y-input')]){input.addEventListener('input',()=>render());input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();launch();}});}
$('#order-xy').onclick=()=>{order='xy';render();};$('#order-yx').onclick=()=>{order='yx';render();};$('#launch').onclick=launch;$('#reset').onclick=()=>load(index);
$('#undo').onclick=()=>{if(!previous||busy)return;const h=state.hints,m=state.mistakes;state=previous.state;state.hints=Math.max(h,state.hints);state.mistakes=Math.max(m,state.mistakes)+1;trail=previous.trail;previous=null;$('#x-input').value=state.position[0];$('#y-input').value=state.position[1];render();say('직전 비행을 되돌렸어요. 다른 항로를 계획해보세요. 별 3개는 되돌리기 없이 도전해보세요.');};
$('#hint').onclick=()=>{const plan=solve(level,state.position,state.collected);state.hints++;if(!plan?.path.length){say('항로를 다시 시작해보세요.');return;}if(plan.distance>state.fuel){say(`완주하려면 최소 ${plan.distance}칸이 더 필요해요. 되돌리기 또는 처음부터 다시 도전해보세요.`);return;}let end=plan.path[0],dir=[end[0]-state.position[0],end[1]-state.position[1]];for(let i=1;i<plan.path.length;i++){const p=plan.path[i],prev=plan.path[i-1];if(p[0]-prev[0]!==dir[0]||p[1]-prev[1]!==dir[1])break;end=p;}say(`항해사의 힌트: 다음 경유지를 ${fmt(end)}로 정해보세요. 이곳은 ${location(end)}이에요. 힌트를 사용하면 이번 항로는 최대 별 2개예요.`);};
$('#sound').onclick=()=>{saved.sound=!saved.sound;persist();render();tone('move');};$('#help').onclick=help;
$('#learning').onclick=()=>{modal(`<div class="dialog-inner"><p class="eyebrow">FLIGHT NOTE</p><h2>좌표가 길이 되는 순간</h2><p><b>순서쌍:</b> (2, 4)와 (4, 2)는 서로 다른 위치예요.<br><b>좌표축:</b> 가로가 x축, 세로가 y축이에요.<br><b>부호:</b> 오른쪽·위쪽은 양수, 왼쪽·아래쪽은 음수예요.<br><b>원점:</b> 두 축이 만나는 곳은 (0, 0)이에요.<br><b>사분면:</b> 좌표축 위의 점은 사분면에 속하지 않아요.</p><p>학습 근거: 미래엔 중학교 수학 1, 「순서쌍과 좌표」 111~113쪽. 게임의 배달 임무와 지도는 새로 만들었습니다. 이 게임은 정수 좌표를 연습하며, 분수·소수 좌표는 다루지 않습니다.</p><button id="close-learning" class="launch">다시 비행하기 <span>↗</span></button></div>`);$('#close-learning').onclick=()=>$('#dialog').close();};
load(index);if(!Object.keys(saved.stars).length)help();
