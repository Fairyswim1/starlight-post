import test from 'node:test';
import assert from 'node:assert/strict';
import {levels} from '../levels.mjs';
import {createState} from '../engine.mjs';
import {fresh,destinations,coordinateTask,forecastTasks,submit,assist,summary,check} from '../observations.mjs';
test('map answers require signed x,y in order; blank is not zero',()=>{
 const t=coordinateTask(levels[1],destinations(levels[1])[0]);
 assert.equal(check(t,[2,-3]),false);assert.equal(check(t,[-3,2]),true);
 assert.equal(check(coordinateTask(levels[6],destinations(levels[6])[0]),[2,NaN]),false);
});
test('retry, refresh and repeated destination labels cannot mint first-success evidence',()=>{
 const j=fresh(),l=levels[0],t=coordinateTask(l,destinations(l)[0]);
 assert.equal(submit(j,t,[1,2]).correct,false);assert.equal(submit(j,t,[2,1]).independent,false);
 const saved=JSON.parse(JSON.stringify(j));assert.equal(submit(saved,t,[2,1]).independent,false);
 const d=destinations(l);assert.equal(coordinateTask(l,d[1]).id,coordinateTask(l,d[2]).id);
 assert.equal(summary(saved).coordinate.independent,0);
});
test('help before response persists; later help does not erase earlier independent work',()=>{
 const j=fresh(),l=levels[0],d=destinations(l);
 assert.equal(submit(j,coordinateTask(l,d[0]),[2,1]).independent,true);
 assist(j,l.id,'route hint');assert.equal(submit(j,coordinateTask(l,d[1]),[4,2]).independent,false);
 assert.equal(summary(JSON.parse(JSON.stringify(j))).coordinate.independent,1);
});
test('weather is judged at crossing time, not current time or final arrival',()=>{
 const l=levels[6],s=createState(l),tasks=forecastTasks(l,s,[2,0],'xy');
 assert.equal(tasks[0].tick,2);assert.deepEqual(tasks[0].expected,[2,'unsafe']);
 assert.equal(check(tasks[0],[0,'safe']),false);assert.equal(check(tasks[0],[2,'safe']),false);
 assert.equal(check(tasks[0],[2,'unsafe']),true);
 assert.deepEqual(forecastTasks(l,{...s,tick:2},[2,0],'xy')[0].expected,[0,'safe']);
 assert.equal(forecastTasks(l,{...s,tick:4},[2,0],'xy')[0].id,tasks[0].id);
});
test('each storm crossing is considered; taking a detour supplies no graph evidence',()=>{
 const l=levels[7],s=createState(l),t=forecastTasks(l,s,[4,0],'xy');assert.equal(t.length,2);
 assert.deepEqual(t.map(x=>x.tick),[2,6]);
 assert.equal(forecastTasks(levels[8],createState(levels[8]),[-4,2],'xy').length,0);
 assert.equal(summary(fresh()).graph.independent,0);
});
