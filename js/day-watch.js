// BODY-LAB day change observer (Japan Standard Time).
// Presentation only: never edits records, SP ledger or unlocks.
import {localDay} from "./training.js";
export function watchResearchDay(onDayChanged){
 let lastDay=localDay(),timer=null,disposed=false;
 const check=()=>{if(disposed)return;const next=localDay();if(next!==lastDay){const previous=lastDay;lastDay=next;Promise.resolve().then(()=>onDayChanged(next,previous)).catch(error=>console.error("BODY-LAB day refresh failed",error));}schedule();};
 const schedule=()=>{
  if(timer!==null)clearTimeout(timer);
  if(disposed)return;
  // Offset is UTC+09 year-round in Tokyo. Determine next local midnight.
  const now=Date.now();
  const JST=9*60*60*1000;
  const tomorrowJstMidnight=Math.floor((now+JST)/86400000+1)*86400000-JST;
  const delay=Math.min(60000,Math.max(1000,tomorrowJstMidnight-now+200));
  timer=setTimeout(check,delay);
 };
 const onFocus=()=>check();
 const onVisibility=()=>{if(!document.hidden)check();};
 const onPageshow=()=>check();
 window.addEventListener("focus",onFocus);
 window.addEventListener("pageshow",onPageshow);
 document.addEventListener("visibilitychange",onVisibility);
 schedule();
 return ()=>{disposed=true;if(timer!==null)clearTimeout(timer);window.removeEventListener("focus",onFocus);window.removeEventListener("pageshow",onPageshow);document.removeEventListener("visibilitychange",onVisibility);};
}
