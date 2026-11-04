// BODY-LAB playful "coolness" index v0.1.
// Pure derived display metric; never stored as SP, health score, or a reward receipt.
// Repeated entries of the same exercise/day do not raise the score.
import {findExercise} from "./training.js";
export function calculateCoolness(records=[],unlocks=[]){
 const days=new Set(),groups=new Set(),dayGroups=new Map();
 for(const record of records){
  if(typeof record.localDay!=="string"||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(record.localDay))continue;
  const exercise=findExercise(record.exerciseId);if(!exercise)continue;
  const group=exercise.group;
  days.add(record.localDay);groups.add(group);
  if(!dayGroups.has(record.localDay))dayGroups.set(record.localDay,new Set());
  dayGroups.get(record.localDay).add(group);
 }
 const balanceDays=[...dayGroups.values()].filter(set=>set.size>=2).length;
 const dailyPoints=days.size*10,groupPoints=groups.size*5,balancePoints=balanceDays*2;
 const researchCount=new Set(unlocks.filter(x=>x&&typeof x.nodeId==="string").map(x=>x.nodeId)).size;
 const researchPoints=researchCount*2;
 const score=dailyPoints+groupPoints+balancePoints+researchPoints;
 const rank=score>=300?"継続の達人":score>=120?"頼れる研究員":score>=40?"研究の常連":score>0?"期待の新人":"研究開始前";
 return {score,rank,dailyPoints,groupPoints,balancePoints,researchPoints,researchCount,activeDays:days.size,groupCount:groups.size,balanceDays};
}
