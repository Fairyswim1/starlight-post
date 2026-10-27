export const key=([x,y])=>`${x},${y}`;
export const equal=(a,b)=>a[0]===b[0]&&a[1]===b[1];
export function location([x,y]){if(!x&&!y)return '원점';if(!y)return 'x축 위';if(!x)return 'y축 위';return `제${x>0?(y>0?1:4):(y>0?2:3)}사분면`;}
export function route(from,to,order='xy'){const p=[...from],out=[];for(const axis of order==='yx'?[1,0]:[0,1])while(p[axis]!==to[axis]){p[axis]+=Math.sign(to[axis]-p[axis]);out.push([...p]);}return out;}
export const waveAt=(l,t)=>l.wave[t%l.wave.length];
export const allRescued=l=>(1<<l.rescues.length)-1;
export function createState(l){return {position:[...l.start],fuel:l.fuel,tick:0,delivered:0,cargo:-1,keys:0,refueled:0,distance:0,moves:0,mistakes:0,hints:0,won:false,lost:false,reason:''};}
// Every grid step is one turn. A route and its preview use the very same transition.
export function step(l,s,p){
  if(s.won||s.lost)return {ok:false,reason:'임무가 끝났어요. 다시 도전해보세요.'};
  if(p.some(n=>!Number.isInteger(n)||Math.abs(n)>l.bound))return {ok:false,reason:'지도 바깥으로 나갈 수 없어요.'};
  const distance=Math.abs(p[0]-s.position[0])+Math.abs(p[1]-s.position[1]);
  if(distance>1)return {ok:false,reason:'한 턴에 한 칸씩 이동해요.'};
  const tick=s.tick+1,at=q=>equal(p,q),where=`(${p.join(', ')})`;
  if(l.storms.some(at))return {ok:false,reason:`${where}은 영구 폭풍이에요. 경유지를 바꿔보세요.`};
  if(l.gates.some(g=>at(g.at)&&!(s.keys&(1<<g.switch))))return {ok:false,reason:`${where}의 관문이 잠겼어요. 먼저 청록 문 여는 장치를 방문하세요.`};
  if(l.pulses.some(at)&&waveAt(l,tick)>l.safeHeight)return {ok:false,reason:`${tick}턴의 폭풍 세기는 ${waveAt(l,tick)}예요. ${where}은 폭풍 세기 ${l.safeHeight} 이하일 때만 통과할 수 있어요. 대기하거나 우회하세요.`};
  if(distance>s.fuel)return {ok:false,reason:'연료가 부족해요.'};
  const n={...s,position:[...p],fuel:s.fuel-distance,tick,distance:s.distance+distance};
  l.switches.forEach((q,i)=>{if(at(q))n.keys|=1<<i;});
  l.stations.forEach((q,i)=>{if(at(q)&&!(n.refueled&(1<<i))){n.fuel=l.capacity;n.refueled|=1<<i;}});
  const events=[];
  if(n.cargo>=0&&at(l.rescues[n.cargo].drop)){events.push(`${l.rescues[n.cargo].name} 구조 완료`);n.delivered|=1<<n.cargo;n.cargo=-1;}
  if(n.cargo<0){const i=l.rescues.findIndex((r,i)=>!(n.delivered&(1<<i))&&at(r.pickup));if(i>=0){n.cargo=i;events.push(`${l.rescues[i].name} 탑승`);}}
  const late=l.rescues.find((r,i)=>r.deadline&&tick>=r.deadline&&!(n.delivered&(1<<i)));
  n.won=n.delivered===allRescued(l)&&at(l.goal)&&!late;
  if(!n.won&&(late||tick>=l.limit||n.fuel===0)){n.lost=true;n.reason=late?`${late.name}의 구조 시한 ${late.deadline}턴을 넘겼어요.`:tick>=l.limit?'폭풍 전선이 도착했어요. 제한 턴 안에 기지로 돌아와야 해요.':'연료가 소진됐어요. 연료 충전소를 포함한 경로를 다시 계획하세요.';}
  return {ok:true,state:n,events};
}
export function inspectMove(l,s,target,order='xy'){
  if(!Array.isArray(target)||target.length!==2||target.some(n=>!Number.isInteger(n)||Math.abs(n)>l.bound))return {ok:false,reason:`좌표는 −${l.bound}부터 ${l.bound}까지의 정수로 입력하세요.`};
  let path=route(s.position,target,order);if(!path.length)return {ok:false,reason:'다른 좌표로 이동하거나 1턴 대기를 선택하세요.'};
  let next=s,travel=[],events=[];
  for(const p of path){const result=step(l,next,p);if(!result.ok)return {...result,path,cost:path.length};next=result.state;travel.push(p);events.push(...result.events);if(next.won||next.lost)break;}
  return {ok:true,path:travel,cost:travel.length,state:{...next,moves:s.moves+1},events};
}
export function move(l,s,target,order='xy'){const r=inspectMove(l,s,target,order);return r.ok?r:{...r,state:{...s,mistakes:s.mistakes+1}};}
export function wait(l,s){const r=step(l,s,s.position);return r.ok?{...r,path:[[...s.position]],cost:0,state:{...r.state,moves:s.moves+1}}:{...r,state:{...s,mistakes:s.mistakes+1}};}
// Breadth-first planning includes cargo, activated gates, consumed fuel stations and weather phase.
// At equal positions and objectives, earlier arrival in the same phase with more fuel dominates.
export function solve(l,initial=createState(l)){
  if(initial.lost)return null;if(initial.won)return {distance:0,path:[],turns:0};
  const code=s=>[key(s.position),s.delivered,s.cargo,s.keys,s.refueled,s.tick%l.wave.length].join('|');
  const nodes=[{s:initial,parent:-1}],seen=new Map([[code(initial),[{tick:initial.tick,fuel:initial.fuel}]]]);let head=0;
  while(head<nodes.length){const idx=head++,s=nodes[idx].s;
    for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1],[0,0]]){
      if(dx===0&&dy===0&&!l.pulses.length)continue;
      const r=step(l,s,[s.position[0]+dx,s.position[1]+dy]);if(!r.ok||r.state.lost)continue;const n=r.state;
      if(n.won){const path=[n.position];let at=idx;while(nodes[at].parent>=0){path.push(nodes[at].s.position);at=nodes[at].parent;}path.reverse();return {path,turns:n.tick-initial.tick,distance:n.distance-initial.distance,explored:nodes.length};}
      const k=code(n),front=seen.get(k)||[];if(front.some(v=>v.tick<=n.tick&&v.fuel>=n.fuel))continue;
      seen.set(k,[...front.filter(v=>!(n.tick<=v.tick&&n.fuel>=v.fuel)),{tick:n.tick,fuel:n.fuel}]);nodes.push({s:n,parent:idx});
    }
  }return null;
}
export function stars(l,s){if(!s.won)return 0;return !s.hints&&!s.mistakes&&s.tick<=l.par?3:!s.hints&&s.tick<=l.par+4?2:1;}
