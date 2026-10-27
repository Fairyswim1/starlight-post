import {test} from 'node:test';
import assert from 'node:assert/strict';
import {route,move,solve,createState,location,stars,inspectMove} from '../engine.mjs';
import {levels} from '../levels.mjs';
test('axes are not quadrants; ordered pairs and signs are distinguished',()=>{
  assert.equal(location([0,0]),'원점');assert.equal(location([0,3]),'y축 위');assert.equal(location([-3,0]),'x축 위');
  [[2,3],[-2,3],[-2,-3],[2,-3]].forEach((p,i)=>assert.equal(location(p),`제${i+1}사분면`));
  assert.notDeepEqual(route([0,0],[2,4]),route([0,0],[4,2]));
});
test('routing has correct signs, length and endpoints for every pair in the grid',()=>{
  for(let a=-5;a<=5;a++)for(let b=-5;b<=5;b++)for(let x=-5;x<=5;x++)for(let y=-5;y<=5;y++)for(const order of ['xy','yx']){
    const path=route([a,b],[x,y],order);assert.equal(path.length,Math.abs(x-a)+Math.abs(y-b));
    if(path.length)assert.deepEqual(path.at(-1),[x,y]);
    let previous=[a,b];for(const p of path){assert.equal(Math.abs(p[0]-previous[0])+Math.abs(p[1]-previous[1]),1);previous=p;}
  }
});
test('all 12 stages have solvable non-overlapping geometry; solver solution actually wins',()=>{
  assert.equal(levels.length,12);
  for(const level of levels){
    const objects=[...level.letters,...level.storms];
    assert.equal(new Set(objects.map(String)).size,objects.length);
    assert.ok(!level.storms.some(p=>String(p)===String(level.start)||String(p)===String(level.goal)));
    const solution=solve(level);assert.ok(solution);assert.ok(solution.distance>0);
    const withFuel={...level,fuel:solution.distance+level.extra};let s=createState(withFuel);
    for(const p of solution.path){const result=move(withFuel,s,p);assert.ok(result.ok);s=result.state;}
    assert.ok(s.won,level.title);assert.equal(s.fuel,level.extra);assert.equal(stars(withFuel,s),3);
    assert.equal(s.collected,(1<<level.letters.length)-1);
  }
});
test('storm collision is atomic; changing axis order avoids first storm',()=>{
  const l=levels[8],s=createState(l),blocked=move(l,s,[3,2],'xy');
  assert.equal(blocked.ok,false);assert.deepEqual(blocked.state.position,s.position);assert.equal(blocked.state.fuel,s.fuel);
  assert.equal(blocked.state.mistakes,1);assert.equal(move(l,s,[3,2],'yx').ok,true);
});
test('fuel, invalid coordinates, repeated letters and goal conditions',()=>{
  const l=levels[0];let s=createState(l);
  assert.equal(move(l,s,l.goal,'yx').state.won,false);
  assert.equal(inspectMove(l,{...s,fuel:1},[3,2]).ok,false);
  for(const p of [[6,0],[NaN,1],[1.5,1],[],null])assert.equal(inspectMove(l,s,p).ok,false);
  s=move(l,s,[3,2]).state;assert.equal(s.collected,1);
  s=move(l,s,[2,2]).state;s=move(l,s,[3,2]).state;assert.equal(s.collected,1);
  s=move(l,s,l.goal).state;assert.equal(s.won,true);assert.equal(stars(l,s),2);
  assert.equal(move(l,s,[0,0]).ok,false);
});
test('unreachable board returns null and zero fuel can still finish exactly',()=>{
  const l={...levels[0],storms:[[1,0],[-1,0],[0,1],[0,-1]]};assert.equal(solve(l),null);
  const a={...levels[0],fuel:7};let s=createState(a);s=move(a,s,[3,2]).state;s=move(a,s,a.goal).state;
  assert.ok(s.won);assert.equal(s.fuel,0);
});
