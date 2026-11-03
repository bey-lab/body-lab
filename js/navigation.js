// Shared BODY-LAB navigation. Does not read or change workout data.
const LINKS=[
{path:"./",label:"ホーム",icon:"⌂",key:"home"},
{path:"./training.html",label:"トレーニング",icon:"💪",key:"training"},
{path:"./tree.html",label:"研究ツリー",icon:"🌳",key:"tree"},
{path:"./backup-test.html",label:"バックアップ",icon:"🔐",key:"backup"}
];
export function installNavigation(){
 if(document.querySelector(".bodylab-global-nav"))return;
 const css=document.createElement("style");
 css.textContent=`
.bodylab-global-nav{box-sizing:border-box;position:sticky;top:0;z-index:100;display:flex;align-items:center;gap:12px;padding:10px clamp(12px,3vw,34px);background:#fffef8f5;border-bottom:1px solid #e8dfcc;box-shadow:0 4px 16px #4639180b;font-family:system-ui,-apple-system,"Hiragino Kaku Gothic ProN",sans-serif;color:#293247;width:100vw;max-width:none;margin-left:calc(50% - 50vw)}
.bodylab-global-nav *, .bodylab-global-nav *::before{box-sizing:border-box}
.bodylab-nav-brand{font-size:18px;font-weight:950;text-decoration:none;color:#343c50;white-space:nowrap}
.bodylab-nav-links{display:flex;align-items:center;gap:7px;overflow-x:auto;scrollbar-width:thin;min-width:0;flex:1;padding:2px}
.bodylab-nav-link{display:flex;align-items:center;gap:5px;flex-shrink:0;padding:11px 14px;border-radius:13px;background:#f0f2f6;color:#343d52;text-decoration:none;font-size:15px;font-weight:800;line-height:1.2;white-space:nowrap;min-height:44px}
.bodylab-nav-link.active{background:#ffd05c;color:#382804;box-shadow:inset 0 0 0 1px #e9b741}
.bodylab-nav-link:hover{background:#ffe7a0}
@media(max-width:730px){.bodylab-global-nav{flex-wrap:wrap;gap:4px;padding:8px 10px}.bodylab-nav-brand{font-size:14px}.bodylab-nav-links{order:2;flex-basis:100%}.bodylab-nav-link{font-size:13px;padding:9px 11px;min-height:40px}}
`;
 document.head.append(css);
 const nav=document.createElement("nav");nav.className="bodylab-global-nav";nav.setAttribute("aria-label","BODY-LAB ページ移動");
 const title=document.createElement("a");title.href="./";title.className="bodylab-nav-brand";title.textContent="⬡ BODY-LAB";nav.append(title);
 const holder=document.createElement("div");holder.className="bodylab-nav-links";
 const page=location.pathname.split("/").pop()||"index.html";
 const active=page==="index.html"?"home":page==="training.html"?"training":page==="tree.html"?"tree":page==="backup-test.html"?"backup":null;
 for(const link of LINKS){const a=document.createElement("a");a.className="bodylab-nav-link"+(active===link.key?" active":"");a.href=link.path;a.textContent=link.icon+" "+link.label;if(active===link.key)a.setAttribute("aria-current","page");holder.append(a)}
 nav.append(holder);document.body.prepend(nav);
}
installNavigation();
