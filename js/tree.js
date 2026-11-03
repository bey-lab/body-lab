// BODY-LAB research tree v0.1
// Definitions live in code. Save files store only fixed IDs and spending receipts.
import {openBodyLabDB, getAll, STORES} from "./db.js";

export const TREE_PROFILE_ID = "dev-test"; // The initial 5 SP belongs to the test profile only.
export const NODES = Object.freeze([
  {id:"hinata-hello-v1",hero:"hinata",title:"ひなたの応援メモ",cost:2,requires:[],type:"conversation",summary:"所長を応援するひなたの小さな秘密",dialogue:"「所長っ！私、人が頑張っているところを見るのが好きなんです！ だから今日も、所長の頑張りを一緒に喜びたいなって！」"},
  {id:"hinata-bonus-v1",hero:"hinata",title:"特別なひと言",cost:3,requires:["hinata-hello-v1"],type:"conversation",summary:"ひなたのもう少し照れた応援",dialogue:"「えへへ……所長が続けてるところ、私ちゃんと知ってますよ。今日もかっこいいですっ！」"},
  {id:"analyst-study-v1",hero:"analyst",title:"成長を測るということ",cost:2,requires:[],type:"knowledge",summary:"回数だけでは分からない成長",dialogue:"「同じ回数でも、フォームが安定したり、余裕を持って動けたりするのは進歩です。……少しは研究所らしくなってきましたね」"},
  {id:"mirei-meal-v1",hero:"mirei",title:"食事の小さな研究",cost:2,requires:[],type:"knowledge",summary:"身体づくりと普段の食事",dialogue:"「運動を頑張るのは素敵だけど、食事を抜いてはもったいないわ。主食も、たんぱく質を含むおかずも、野菜も。無理なく楽しんでね、所長♡」"}
]);

const NODE_BY_ID = new Map(NODES.map(node=>[node.id,node]));
export function unlockedKey(profileId,nodeId) {return profileId + ":" + nodeId;}
export function nodeById(id) {return NODE_BY_ID.get(id);}
export async function readTreeState(profileId=TREE_PROFILE_ID) {
  const [ledger, unlocks]=await Promise.all([getAll(STORES.spLedger),getAll(STORES.unlocks)]);
  const filtered=ledger.filter(x=>x.profileId===profileId);
  const balance=filtered.reduce((sum,x)=>sum+x.delta,0);
  const unlocked=new Set(unlocks.filter(x=>x.profileId===profileId).map(x=>x.nodeId));
  return {balance,unlocked};
}

// All checks and both writes happen inside a single readwrite IndexedDB transaction.
// Concurrent taps serialize automatically. Duplicate unlocks never spend SP twice.
export async function purchaseNode(nodeId,profileId=TREE_PROFILE_ID) {
  const node=NODE_BY_ID.get(nodeId);
  if(!node) throw new Error("未定義の研究ノードです");
  const db=await openBodyLabDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction([STORES.spLedger,STORES.unlocks],"readwrite");
    const ledgerStore=tx.objectStore(STORES.spLedger);
    const unlockStore=tx.objectStore(STORES.unlocks);
    const id=unlockedKey(profileId,nodeId);
    let businessError=null;
    let outcome="unlocked";
    const stop=message=>{businessError=new Error(message);tx.abort();};
    const existing=unlockStore.get(id);
    existing.onsuccess=()=>{
      if(existing.result){outcome="already";return;}
      const unlocksRequest=unlockStore.getAll();
      unlocksRequest.onsuccess=()=>{
        const unlocked=new Set(unlocksRequest.result.filter(x=>x.profileId===profileId).map(x=>x.nodeId));
        if(!node.requires.every(req=>unlocked.has(req))) {stop("先に必要な研究を解放してください");return;}
        const entries=ledgerStore.getAll();
        entries.onsuccess=()=>{
          const balance=entries.result.filter(x=>x.profileId===profileId).reduce((n,x)=>n+x.delta,0);
          if(balance<node.cost){stop("SPが足りません");return;}
          const at=new Date().toISOString();
          const debitId="tree-sp:"+id;
          ledgerStore.add({
            id:debitId,profileId,sourceKey:debitId,delta:-node.cost,
            reason:"research-unlock",nodeId,createdAt:at
          });
          unlockStore.add({id,profileId,nodeId,unlockedAt:at,definitionVersion:1});
        };
      };
    };
    tx.oncomplete=()=>resolve(outcome);
    tx.onerror=()=>reject(businessError || tx.error || new Error("保存に失敗しました"));
    tx.onabort=()=>reject(businessError || tx.error || new Error("解放処理が中断されました"));
  });
}
