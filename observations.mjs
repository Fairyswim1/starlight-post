import {route,equal,waveAt} from './engine.mjs';
export const VERSION='2026.10.27.2';
export const STORAGE='starlight-observations-'+VERSION;
export const fresh=()=>({version:VERSION,learner:globalThis.crypto.randomUUID(),attempts:[],help:[]});
export function destinations(l){return [
 ...l.rescues.flatMap((r,i)=>[{id:`person-${i}`,label:`${r.name} 구조자`,point:r.pickup},{id:`shelter-${i}`,label:`${r.name} 대피소`,point:r.drop}]),
 {id:'base',label:'기지',point:l.goal},
 ...l.switches.map((point,i)=>({id:`switch-${i}`,label:`문 여는 장치 ${i+1}`,point})),
 ...l.stations.map((point,i)=>({id:`fuel-${i}`,label:`연료 충전소 ${i+1}`,point}))];}
export function coordinateTask(l,d){return {id:`${l.id}:coordinate:${d.point.join(',')}`,level:l.id,skill:'coordinate',code:'9수02-05',label:d.label,expected:d.point};}
// A repeated weather phase is the same evidence item, even after undo/restart.
export function forecastTasks(l,s,to,order){return route(s.position,to,order).flatMap((p,i)=>l.pulses.some(q=>equal(p,q))?[{
 id:`${l.id}:graph:${(s.tick+i+1)%l.wave.length}`,level:l.id,skill:'graph',code:'9수02-06',tick:s.tick+i+1,
 label:`${s.tick+i+1}차례의 폭풍 세기`,expected:[waveAt(l,s.tick+i+1),waveAt(l,s.tick+i+1)<=l.safeHeight?'safe':'unsafe']
 }]:[]);}
export function check(task,response){return Array.isArray(response)&&response.length===2&&
 (task.skill==='coordinate'?response.every((n,i)=>Number.isInteger(n)&&n===task.expected[i]):Number.isInteger(response[0])&&response[0]===task.expected[0]&&response[1]===task.expected[1]);}
export function assist(journal,level,kind){journal.help.push({level,kind,at:new Date().toISOString()});}
export function submit(journal,task,response){
 const correct=check(task,response),prior=journal.attempts.filter(a=>a.id===task.id),helped=journal.help.some(h=>h.level===task.level);
 const row={...task,response:response.map(x=>Number.isNaN(x)?null:x),correct,independent:correct&&!prior.length&&!helped,helped,attempt:prior.length+1,at:new Date().toISOString()};
 journal.attempts.push(row);return row;
}
export function observed(journal,task){return journal.attempts.some(a=>a.id===task.id&&a.correct);}
export function summary(journal,level){const rows=journal.attempts.filter(a=>level===undefined||a.level===level);return Object.fromEntries(['coordinate','graph'].map(skill=>[skill,{independent:new Set(rows.filter(a=>a.skill===skill&&a.independent).map(a=>a.id)).size,attempts:rows.filter(a=>a.skill===skill).length}]));}
export function report(journal){return {...journal,summary:summary(journal),scope:'플레이 중 좌표 읽기와 그래프 값·통과 판단의 관찰 기록. 성취기준 전체 이수 판정이 아님. 좌표 표시, 그래프 그리기, 편리함 설명은 별도 성취기준 확인에서 검토. 도움과 재시도는 무도움 첫 성공에 포함하지 않음. 자유 경유지 비행·되돌리기 이후 해당 임무의 응답도 도움 있는 연습으로 구분.'};}
