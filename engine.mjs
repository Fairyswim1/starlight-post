export const key = ([x,y]) => `${x},${y}`;
export const equal = (a,b) => a[0] === b[0] && a[1] === b[1];
export function location([x,y]) {
  if (x === 0 && y === 0) return '원점';
  if (y === 0) return 'x축 위';
  if (x === 0) return 'y축 위';
  return `제${x > 0 ? (y > 0 ? 1 : 4) : (y > 0 ? 2 : 3)}사분면`;
}
export function route(from, to, order='xy') {
  const p = [...from], result = [];
  for (const axis of order === 'yx' ? [1,0] : [0,1]) {
    while (p[axis] !== to[axis]) {
      p[axis] += Math.sign(to[axis] - p[axis]); result.push([...p]);
    }
  }
  return result;
}
export function createState(level) {
  return {position:[...level.start], fuel:level.fuel, collected:0, moves:0, distance:0, mistakes:0, hints:0, won:false};
}
export function inspectMove(level, state, target, order='xy') {
  if (state.won) return {ok:false,reason:'이미 배달을 마쳤어요.'};
  if (!Array.isArray(target) || target.length !== 2 || target.some(n=>!Number.isInteger(n) || Math.abs(n)>level.bound)) return {ok:false,reason:`좌표는 −${level.bound}부터 ${level.bound}까지의 정수로 정해주세요.`};
  const path = route(state.position, target, order);
  if (!path.length) return {ok:false,reason:'현재 위치와 다른 목적지를 골라주세요.'};
  const blocked = new Set(level.storms.map(key));
  const collision = path.find(p=>blocked.has(key(p)));
  if (collision) return {ok:false,path,reason:`(${collision.join(', ')})에 폭풍이 있어요. 이동 순서를 바꾸거나 경유지를 정해보세요.`};
  if (path.length > state.fuel) return {ok:false,path,reason:`연료가 ${path.length}칸 필요해요. 남은 연료는 ${state.fuel}칸이에요.`};
  return {ok:true,path,cost:path.length};
}
export function move(level, state, target, order='xy') {
  const check=inspectMove(level,state,target,order);
  if (!check.ok) return {...check,state:{...state,mistakes:state.mistakes+1}};
  let collected=state.collected;
  for (const p of check.path) level.letters.forEach((v,i)=>{if(equal(v,p)) collected |= 1<<i;});
  const next={...state,position:[...target],collected,fuel:state.fuel-check.cost,moves:state.moves+1,distance:state.distance+check.cost};
  next.won=collected === (1<<level.letters.length)-1 && equal(target,level.goal);
  return {...check,state:next};
}
// Independent unit-step breadth-first search: shortest playable route through all letters.
// Returned waypoints work in the same game, one adjacent grid point per command.
export function solve(level, position=level.start, initialMask=0) {
  const obstacles=new Set(level.storms.map(key));
  const all=(1<<level.letters.length)-1;
  const states=[{p:[...position],mask:initialMask,parent:-1}];
  const seen=new Set([`${key(position)}|${initialMask}`]);
  for(let head=0;head<states.length;head++) {
    const cur=states[head];
    if(cur.mask===all && equal(cur.p,level.goal)) {
      const path=[]; let idx=head;
      while(states[idx].parent>=0){path.push(states[idx].p);idx=states[idx].parent;}
      return {distance:path.length,path:path.reverse()};
    }
    for(const d of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const p=[cur.p[0]+d[0],cur.p[1]+d[1]];
      if(p.some(n=>Math.abs(n)>level.bound)||obstacles.has(key(p))) continue;
      let mask=cur.mask;
      level.letters.forEach((v,i)=>{if(equal(v,p))mask|=1<<i;});
      const id=`${key(p)}|${mask}`; if(seen.has(id))continue;
      seen.add(id);states.push({p,mask,parent:head});
    }
  }
  return null;
}
export function stars(level,state) {
  if(!state.won)return 0;
  const optimal=solve(level).distance;
  if(state.distance===optimal && state.mistakes===0 && state.hints===0)return 3;
  if(state.distance<=optimal+4 && state.hints<=1)return 2;
  return 1;
}
