// Assistant visual selection - display preference only, independent of research data and SP.
export const ASSISTANTS={
hinata:{name:"明日葉ヒナタ",short:"ヒナタ",icon:"☀️",color:"#ffe5a0",accent:"#eab639",image:"./assets/characters/hinata.webp",
lines:{home:"「所長っ！今日も一緒にかっこよくなりましょう！」",active:"「所長っ！今日も研究お疲れさまです！続けているところ、かっこいいですっ！」",day:"「所長っ！新しい研究日ですっ！無理せずいきましょう！」",select:"「所長っ！今日はどこを鍛えましょうか？」",exercise:"「{exercise}ですね！一緒に頑張りましょうっ！」",guide:"「所長っ！まずはフォームを確認しましょう！」",record:"「お疲れさまですっ！結果を教えてくださいね！」",done:"「所長っ！今日もかっこいいですっ！お疲れさまでした！」",again:"「まだ研究するんですか？無理は禁物ですよっ！」",back:"「次はどの種目にしましょうか？」"}},
sena:{name:"御影セナ",short:"セナ",icon:"❄️",color:"#dceafb",accent:"#7ca7e4",image:"./assets/characters/sena.webp",
lines:{home:"「……所長。記録の準備は整っています。焦らず進めましょう」",active:"「記録を確認しました。継続は重要なデータです。……悪くありません」",day:"「日付が変わりました。新しい研究日です。過去の記録は保持しています」",select:"「……所長。今日はどの種目を分析しますか？」",exercise:"「{exercise}ですね。フォームと体調を優先してください」",guide:"「まずは動作を確認します。回数より丁寧さです」",record:"「結果を記録してください。主観的なきつさも重要なデータです」",done:"「保存完了。……お疲れさまです。頑張りは認めます」",again:"「次の種目ですか。疲労が残っているなら休みましょう」",back:"「種目を変更しますか。承知しました」"}},
mirei:{name:"九条ミレイ",short:"ミレイ",icon:"💜",color:"#f3e2ef",accent:"#bf83b9",image:"./assets/characters/mirei.webp",
lines:{home:"「ふふ、所長くん。今日も元気？ 無理せず、自分のペースでね♡」",active:"「今日もお疲れさま。頑張った身体を、ちゃんといたわってあげましょうね♡」",day:"「新しい一日ね。昨日の頑張りはそのままよ。今日は調子を見ながらね♡」",select:"「今日はどんな運動にする？ 疲れていたらお休みでもいいのよ♡」",exercise:"「{exercise}ね。ふふ、頑張りすぎないようにね」",guide:"「姿勢を確かめて、ゆっくり始めましょうね♡」",record:"「お疲れさま。頑張った記録、私にも見せてくれる？」",done:"「よく頑張ったわね♡ あとは食事と休息も忘れずに」",again:"「もう一種目？ ふふ、身体の声も聞いてあげてね」",back:"「別の運動にするのね。ゆっくり選びましょ♡」"}}
};
const STORE_KEY="body-lab-assistant-v1";
function getSelection(){try{const v=localStorage.getItem(STORE_KEY);return ASSISTANTS[v]?v:"hinata"}catch{return "hinata"}}
export function initAssistants({host,portrait,bubble,fallbackName}){
 const container=document.querySelector(host),img=document.querySelector(portrait),speech=document.querySelector(bubble);
 if(!container||!img||!speech)return {say:()=>{},current:()=>ASSISTANTS.hinata};
 const style=document.createElement("style");
 style.textContent=`
.bodylab-assistant-switch{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;padding:8px 0 11px;width:100%;position:relative;z-index:2}
.bodylab-assistant-switch button{border:2px solid #ffffffa8;border-radius:12px;padding:8px 10px;min-height:38px;min-width:0;font-size:13px;font-weight:800;cursor:pointer;color:#354158;background:#ffffffb9;box-shadow:none;flex:1;white-space:nowrap}
.bodylab-assistant-switch button[aria-pressed="true"]{background:#fff;border-color:var(--assistant-accent,#edb63c);box-shadow:0 1px 8px #00000013}
.bodylab-assistant-switch button:focus-visible{outline:3px solid #354c8a;outline-offset:1px}
`;
 document.head.append(style);
 const controls=document.createElement("div");controls.className="bodylab-assistant-switch";controls.setAttribute("role","group");controls.setAttribute("aria-label","表示する研究助手");
 let selected=getSelection(),lastLine="home",lastValues={};
 const buttons={};
 function render(){
  const a=ASSISTANTS[selected];
  container.style.setProperty("--assistant-accent",a.accent);
  container.style.background="linear-gradient(155deg,"+a.color+",#fffbf4 90%)";
  img.hidden=true;img.alt=a.name+"の立ち絵";img.src=a.image;
  img.onload=()=>{img.hidden=false};
  img.onerror=()=>{img.hidden=true};
  if(img.complete&&img.naturalWidth>0)img.hidden=false;
  if(fallbackName){const name=document.querySelector(fallbackName);if(name)name.textContent=a.name}
  const icon=container.querySelector(".sun,.character-standin");if(icon)icon.textContent=a.icon;
  for(const [id,b] of Object.entries(buttons))b.setAttribute("aria-pressed",String(id===selected));
  speak(lastLine,lastValues);
 }
 function speak(line,values={}){
  lastLine=line;lastValues=values;
  const a=ASSISTANTS[selected];const template=a.lines[line]||a.lines.home;
  speech.textContent=template.replace(/\{exercise\}/g,String(values.exercise||"この種目"));
  speech.style.borderColor=a.accent;
 }
 for(const [id,a] of Object.entries(ASSISTANTS)){
  const button=document.createElement("button");button.type="button";button.textContent=a.icon+" "+a.short;
  button.setAttribute("aria-label",a.name+"を表示");buttons[id]=button;
  button.addEventListener("click",()=>{selected=id;try{localStorage.setItem(STORE_KEY,id)}catch{}render()});
  controls.append(button);
 }
 // Keep controls outside portrait stage so their hit targets never overlap the illustration.
 const stage=img.parentElement;
 stage.after(controls);
 render();
 window.addEventListener("storage",event=>{if(event.key===STORE_KEY){selected=getSelection();render()}});
 return {say:speak,current:()=>ASSISTANTS[selected],currentId:()=>selected};
}
