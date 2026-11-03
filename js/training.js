import {openBodyLabDB,getAll,STORES} from "./db.js";
export const OWNER_ID="local-owner-v1";
export const EXERCISES=[
{id:"push-up",name:"腕立て伏せ",category:"自重",group:"upper",kind:"reps",unit:"回",tip:"胸・肩・腕",steps:["手を肩幅より少し広く置く","頭からかかとまで一直線を保つ","ゆっくり下ろし、無理のない範囲で押し上げる"],caution:"腰を反らさず、肩や手首が痛ければ中止する"},
{id:"squat",name:"スクワット",category:"自重",group:"lower",kind:"reps",unit:"回",tip:"脚・お尻",steps:["足を肩幅ほどに開いて立つ","お尻を後ろへ引くように腰を下ろす","膝とつま先の向きを揃え、足裏で押して立つ"],caution:"膝や腰に痛みがあれば無理をしない"},
{id:"plank",name:"プランク",category:"自重",group:"core",kind:"seconds",unit:"秒",tip:"体幹",steps:["肘を肩の下について前腕で支える","頭からかかとまで一直線にする","呼吸を止めずに無理のない時間キープ"],caution:"腰が落ちる・痛む場合はそこで終了する"},
{id:"bike",name:"エアロバイク",category:"有酸素",group:"cardio",kind:"minutes",unit:"分",tip:"有酸素運動",steps:["サドル高さを調整し、楽にペダルが回せる姿勢へ","軽い負荷からこぎ始める","会話できる程度のペースを目安に続ける"],caution:"めまいや胸の痛み、強い息苦しさがあれば中止"},
{id:"curl",name:"ダンベルカール",category:"ダンベル",group:"upper",kind:"reps",unit:"回",tip:"腕・力こぶ",weight:true,steps:["軽く膝を緩めて安定して立つ","肘を大きく動かさず持ち上げる","反動を使わずゆっくり下ろす"],caution:"5kgが重ければ無理せず重量や回数を減らす"},
{id:"row",name:"ワンハンドロー",category:"ダンベル",group:"upper",kind:"reps",unit:"回",tip:"背中",weight:true,steps:["安定した台などに片手をつき背中を保つ","肘を身体の横へ引き、ダンベルを持ち上げる","ゆっくり下ろし、左右それぞれ行う"],caution:"腰をひねらず、支える台が動かないことを確認する"},
{id:"press",name:"ショルダープレス",category:"ダンベル",group:"upper",kind:"reps",unit:"回",tip:"肩",weight:true,steps:["安定した姿勢でダンベルを肩付近に構える","無理のない範囲で頭上へ押す","肘を急に伸ばし切らずゆっくり戻す"],caution:"5kgは重いことがある。肩に違和感があれば行わない"},
{id:"stretch",name:"ストレッチ",category:"回復",group:"recovery",kind:"minutes",unit:"分",tip:"コンディショニング",steps:["呼吸を落ち着け、楽な姿勢をとる","伸ばす場所をゆっくり動かす","心地よい範囲でキープする"],caution:"痛みが出るほど強く伸ばさない"}
];
const lookup=new Map(EXERCISES.map(x=>[x.id,x]));
export function findExercise(id){return lookup.get(id)||null;}
export function localDay(when=new Date()){const parts=new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Tokyo",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(when);const values=Object.fromEntries(parts.filter(p=>p.type!=="literal").map(p=>[p.type,p.value]));return values.year+"-"+values.month+"-"+values.day;}
export async function readTrainingSummary(profileId=OWNER_ID){
 const [records,ledger]=await Promise.all([getAll(STORES.records),getAll(STORES.spLedger)]);
 const owned=records.filter(x=>x.profileId===profileId&&x.sourceMode==="manual-v1").sort((a,b)=>b.performedAt.localeCompare(a.performedAt));
 const today=localDay();
 return {records:owned,todayRecords:owned.filter(x=>x.localDay===today),sp:ledger.filter(x=>x.profileId===profileId).reduce((s,x)=>s+(Number(x.delta)||0),0),activeDays:new Set(owned.map(x=>x.localDay)).size};
}
function positiveInt(value,label,max){const v=Number(value);if(!Number.isSafeInteger(v)||v<1||v>max)throw new Error(label+"の値を確認してください");return v;}
export async function saveTraining(input,profileId=OWNER_ID){
 const ex=findExercise(input.exerciseId);if(!ex)throw new Error("種目が見つかりません");
 const amount=positiveInt(input.amount,ex.kind==="reps"?"回数":"時間",ex.kind==="seconds"?36000:ex.kind==="minutes"?1440:2000);
 const sets=positiveInt(input.sets,"セット数",30),effort=Number(input.effort);
 if(!Number.isSafeInteger(effort)||effort<1||effort>3)throw new Error("きつさを選んでください");
 const kg=ex.weight?Number(input.kg):null;
 if(ex.weight&&(!Number.isFinite(kg)||kg<=0||kg>100))throw new Error("ダンベル重量を確認してください");
 const now=new Date(),performedAt=now.toISOString(),day=localDay(now),id=input.recordId&&/^timer:[a-z0-9-]{8,100}$/.test(input.recordId)?input.recordId:"training:"+crypto.randomUUID(),note=String(input.note||"").slice(0,300);
 const db=await openBodyLabDB();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction([STORES.records,STORES.spLedger],"readwrite");
  const recordStore=tx.objectStore(STORES.records),spStore=tx.objectStore(STORES.spLedger);
  let earned=0;
  let alreadySaved=false;
  const existingRecord=recordStore.get(id);
  existingRecord.onsuccess=()=>{
   if(existingRecord.result){alreadySaved=true;return;}
   const prior=recordStore.getAll();
   prior.onsuccess=()=>{
   const todayRecords=prior.result.filter(r=>r.profileId===profileId&&r.sourceMode==="manual-v1"&&r.localDay===day);
   const keys=[];
   if(todayRecords.length===0)keys.push(["daily-first",5]);
   if(todayRecords.every(r=>r.effort===undefined))keys.push(["daily-reflection",2]);
   const groups=new Set([...todayRecords.map(r=>findExercise(r.exerciseId)?.group),ex.group]);
   if(groups.size>=2)keys.push(["daily-variety",2]);
   const ledgerRequest=spStore.getAll();
   ledgerRequest.onsuccess=()=>{
    const existing=new Set(ledgerRequest.result.filter(l=>l.profileId===profileId).map(l=>l.sourceKey));
    recordStore.add({id,profileId,exerciseId:ex.id,performedAt,localDay:day,sourceMode:"manual-v1",schemaVersion:1,
     ...(ex.kind==="reps"?{reps:amount}:{duration:amount,durationUnit:ex.kind}),sets,effort,...(ex.weight?{weightKg:kg}:{}),note});
    for(const [key,delta] of keys){
     const sourceKey="reward:"+profileId+":"+day+":"+key;
     if(existing.has(sourceKey))continue;
     spStore.add({id:"sp:"+sourceKey,profileId,sourceKey,delta,reason:key,createdAt:performedAt,recordId:id});
     existing.add(sourceKey);earned+=delta;
    }
   };
  };
  };
  tx.oncomplete=()=>resolve({id,earned,alreadySaved,exercise:ex,amount,sets,day});
  tx.onerror=()=>reject(tx.error||new Error("保存できませんでした"));
  tx.onabort=()=>reject(tx.error||new Error("保存が中断されました"));
 });
}
