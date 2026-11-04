// BODY-LAB research tree v0.1
// Definitions live in code. Save files store only fixed IDs and spending receipts.
import {openBodyLabDB, getAll, STORES} from "./db.js";

export const TREE_PROFILE_ID = "dev-test"; // The initial 5 SP belongs to the test profile only.
export const STARTER_NODES = Object.freeze([
  {id:"hinata-hello-v1",hero:"hinata",title:"ひなたの応援メモ",cost:2,requires:[],type:"conversation",summary:"所長を応援するひなたの小さな秘密",dialogue:"「所長っ！私、人が頑張っているところを見るのが好きなんです！ だから今日も、所長の頑張りを一緒に喜びたいなって！」"},
  {id:"hinata-bonus-v1",hero:"hinata",title:"特別なひと言",cost:3,requires:["hinata-hello-v1"],type:"conversation",summary:"ひなたのもう少し照れた応援",dialogue:"「えへへ……所長が続けてるところ、私ちゃんと知ってますよ。今日もかっこいいですっ！」"},
  {id:"analyst-study-v1",hero:"analyst",title:"成長を測るということ",cost:2,requires:[],type:"knowledge",summary:"回数だけでは分からない成長",dialogue:"「同じ回数でも、フォームが安定したり、余裕を持って動けたりするのは進歩です。……少しは研究所らしくなってきましたね」"},
  {id:"mirei-meal-v1",hero:"mirei",title:"食事の小さな研究",cost:2,requires:[],type:"knowledge",summary:"身体づくりと普段の食事",dialogue:"「運動を頑張るのは素敵だけど、食事を抜いてはもったいないわ。主食も、たんぱく質を含むおかずも、野菜も。無理なく楽しんでね、所長♡」"}
]);

export const EXPANDED_NODES = Object.freeze([
  {
    "id": "hinata-breath-v2",
    "hero": "hinata",
    "title": "呼吸で動きを整えよう",
    "cost": 3,
    "requires": [
      "hinata-hello-v1"
    ],
    "type": "event",
    "chapter": "基礎",
    "summary": "呼吸と力の入れ方",
    "dialogue": "ヒナタ「所長っ、腕立てのとき息止めてませんか？」\n所長「……止めてたかも」\nヒナタ「えへへ。力を入れるときに息を吐くのが目安ですよっ！」",
    "lesson": "動作中は呼吸を止めないことが基本。苦しくないペースで、押す・立つなど力を発揮するときに息を吐いてみよう。"
  },
  {
    "id": "hinata-squat-v2",
    "hero": "hinata",
    "title": "スクワットの設計図",
    "cost": 3,
    "requires": [
      "hinata-hello-v1"
    ],
    "type": "event",
    "chapter": "基礎",
    "summary": "足裏と膝の向き",
    "dialogue": "ヒナタ「所長、足裏は床にちゃんとついてます？」\n所長「つま先に乗ってるかも」\nヒナタ「足裏全体で踏んで、膝はつま先と同じ向き。ゆっくりいきましょう！」",
    "lesson": "スクワットでは足裏の接地、膝とつま先の向き、無理のない深さを意識。痛みが出るなら中止する。"
  },
  {
    "id": "hinata-load-v2",
    "hero": "hinata",
    "title": "回数だけが正解じゃない",
    "cost": 4,
    "requires": [
      "hinata-breath-v2",
      "hinata-squat-v2"
    ],
    "type": "event",
    "chapter": "応用",
    "summary": "質を保つ練習",
    "dialogue": "ヒナタ「今日は10回じゃなくて、丁寧な5回でもいいんですよ！」\n所長「それでいいのか？」\nヒナタ「もちろんっ！きれいに動けたって大事な成果です！」",
    "lesson": "回数を追うほどフォームが崩れるなら減らす。動作の範囲、速さ、余裕度を揃えて比べると成長が見えやすい。"
  },
  {
    "id": "hinata-menu-v2",
    "hero": "hinata",
    "title": "上半身と下半身の作戦",
    "cost": 5,
    "requires": [
      "hinata-load-v2"
    ],
    "type": "event",
    "chapter": "応用",
    "summary": "種目の組み合わせ",
    "dialogue": "ヒナタ「腕ばっかり鍛えてません？」\n所長「アタック教だからな」\nヒナタ「筋トレでも守備が大事っ！脚や体幹も仲間にしましょう！」",
    "lesson": "特定部位に偏らず上半身・下半身・体幹・有酸素運動を組み合わせる。最初は少数の種目を無理なく回す。"
  },
  {
    "id": "hinata-begin-v2",
    "hero": "hinata",
    "title": "15分だけでも研究",
    "cost": 5,
    "requires": [
      "hinata-bonus-v1"
    ],
    "type": "event",
    "chapter": "習慣",
    "summary": "始めるハードルを下げる",
    "dialogue": "ヒナタ「所長っ、今日はやる気ゼロですか？」\n所長「ゼロです」\nヒナタ「じゃあ準備だけ！始めてみてダメなら休みましょう！」",
    "lesson": "予定を小さくするのは継続の工夫。運動を始める前に水分・道具を用意するだけでも行動のきっかけになる。休息が必要な日は休む。"
  },
  {
    "id": "hinata-timer-v2",
    "hero": "hinata",
    "title": "タイマーと仲良く",
    "cost": 6,
    "requires": [
      "hinata-begin-v2"
    ],
    "type": "event",
    "chapter": "習慣",
    "summary": "時間を味方にする",
    "dialogue": "ヒナタ「映画を観ながらバイク！所長らしいですねっ！」\n所長「気付いたら漕いでる」\nヒナタ「楽しく続く工夫、大発見です！」",
    "lesson": "タイマーは経過時間の記録用。実際に動いていない時間は含めない。疲れ・痛み・めまいを感じたら停止して休もう。"
  },
  {
    "id": "hinata-week-v2",
    "hero": "hinata",
    "title": "一週間の小さな計画",
    "cost": 8,
    "requires": [
      "hinata-menu-v2",
      "hinata-timer-v2"
    ],
    "type": "event",
    "chapter": "発展",
    "summary": "曜日に縛られない予定",
    "dialogue": "ヒナタ「所長っ、来週はどんな作戦にします？」\n所長「休む日も入れるか」\nヒナタ「大正解！休む日も含めて作戦なんですっ！」",
    "lesson": "週の予定は仕事や体調に合わせて柔軟に。運動・休息を両方計画し、できなかった分の『取り返し』は無理にしない。"
  },
  {
    "id": "hinata-master-v2",
    "hero": "hinata",
    "title": "続ける所長がかっこいい",
    "cost": 10,
    "requires": [
      "hinata-week-v2"
    ],
    "type": "event",
    "chapter": "発展",
    "summary": "頑張り方を自分で選ぶ",
    "dialogue": "ヒナタ「所長っ、最初の一歩を覚えてますか？」\n所長「腕立てでヘロヘロだった」\nヒナタ「今も昔も、挑戦した所長がかっこいいですっ！」",
    "lesson": "成果は回数だけでなく、体調の把握、フォーム、適切な休息まで含めて振り返ろう。"
  },
  {
    "id": "sena-muscle-v2",
    "hero": "analyst",
    "title": "筋肉はどう動く？",
    "cost": 3,
    "requires": [
      "analyst-study-v1"
    ],
    "type": "event",
    "chapter": "基礎",
    "summary": "収縮と関節の協力",
    "dialogue": "セナ「筋肉は骨を直接押しているわけではありません」\n所長「引っ張るのか？」\nセナ「正解。腱を介して骨を引くことで運動が起きます」",
    "lesson": "筋肉は主に収縮して力を生み、腱を介して骨を動かす。関節を安定させる筋肉も重要。"
  },
  {
    "id": "sena-energy-v2",
    "hero": "analyst",
    "title": "筋肉のエネルギー源",
    "cost": 3,
    "requires": [
      "analyst-study-v1"
    ],
    "type": "event",
    "chapter": "基礎",
    "summary": "ATPの仕組み",
    "dialogue": "セナ「所長、筋肉が直接使うエネルギーは？」\n所長「……気合い」\nセナ「不正解。ATPです。気合いだけで動けません」",
    "lesson": "筋収縮の直接的なエネルギー源はATP。身体は栄養と代謝を使ってATPを補いながら活動する。"
  },
  {
    "id": "sena-record-v2",
    "hero": "analyst",
    "title": "比較できる記録とは",
    "cost": 4,
    "requires": [
      "sena-muscle-v2"
    ],
    "type": "event",
    "chapter": "基礎",
    "summary": "条件を揃えて比べる",
    "dialogue": "セナ「前回は10回、今回は6回」\n所長「弱くなった？」\nセナ「即断は禁物。睡眠、フォーム、負荷が違えば単純比較できません」",
    "lesson": "同じ種目・重さ・フォーム・セット構成など、条件をなるべく揃えると比較しやすい。1回の上下だけで判断しない。"
  },
  {
    "id": "sena-effort-v2",
    "hero": "analyst",
    "title": "きつさは数字になる",
    "cost": 4,
    "requires": [
      "sena-energy-v2"
    ],
    "type": "event",
    "chapter": "基礎",
    "summary": "主観的運動強度",
    "dialogue": "セナ「『ヘロヘロ』も情報です」\n所長「雑なメモじゃないのか」\nセナ「いいえ。本人の負荷感を記録する価値があります」",
    "lesson": "回数だけでなく『らく・ふつう・きつい』の体感を記録すると、同じ回数でも余裕が出てきた変化に気づける。"
  },
  {
    "id": "sena-progress-v2",
    "hero": "analyst",
    "title": "伸び方は一直線じゃない",
    "cost": 5,
    "requires": [
      "sena-record-v2",
      "sena-effort-v2"
    ],
    "type": "event",
    "chapter": "応用",
    "summary": "変動と長期傾向",
    "dialogue": "セナ「毎日記録が右肩上がりとは限りません」\n所長「かっこいい度は上げたいが」\nセナ「焦らず、複数日の傾向を見てください」",
    "lesson": "体調や疲労で記録は上下する。単発の自己ベストより、数週間単位で運動量や体感の傾向を見る。"
  },
  {
    "id": "sena-overload-v2",
    "hero": "analyst",
    "title": "少しずつ負荷を変える",
    "cost": 6,
    "requires": [
      "sena-progress-v2"
    ],
    "type": "event",
    "chapter": "応用",
    "summary": "漸進性の考え方",
    "dialogue": "セナ「進歩させるなら、無茶ではなく小さな調整です」\n所長「1回増やすとか？」\nセナ「そういう選択肢です。フォームを犠牲にしないで」",
    "lesson": "体力がついたら回数、セット、重さ、難度などを少しずつ調整する考え方がある。痛みや強い疲労時は増やさない。"
  },
  {
    "id": "sena-bias-v2",
    "hero": "analyst",
    "title": "数字の落とし穴",
    "cost": 6,
    "requires": [
      "sena-progress-v2"
    ],
    "type": "event",
    "chapter": "応用",
    "summary": "記録の偏りを読む",
    "dialogue": "セナ「数値は便利です。でもすべてを表しません」\n所長「かっこいい度は？」\nセナ「……娯楽指標ですね」",
    "lesson": "記録していない日常活動や、フォームの質は単純な回数の数値には表れない。数値を判断材料のひとつとして使おう。"
  },
  {
    "id": "sena-compare-v2",
    "hero": "analyst",
    "title": "自分専用カルテ",
    "cost": 8,
    "requires": [
      "sena-overload-v2",
      "sena-bias-v2"
    ],
    "type": "event",
    "chapter": "発展",
    "summary": "自分との比較",
    "dialogue": "セナ「比較相手は他人ではなく、過去の所長でもいい」\n所長「セナ、褒めてる？」\nセナ「……分析結果です」",
    "lesson": "自分の以前の記録と同じ条件で比べ、回数・余裕度・継続を複合的に観察する。"
  },
  {
    "id": "sena-master-v2",
    "hero": "analyst",
    "title": "所長という研究対象",
    "cost": 10,
    "requires": [
      "sena-compare-v2"
    ],
    "type": "event",
    "chapter": "発展",
    "summary": "データと実感を合わせる",
    "dialogue": "セナ「ここまで来ると、所長の変化が見えてきます」\n所長「かっこいい？」\nセナ「……はい。継続して検証する姿勢は、評価に値します」",
    "lesson": "成長を考えるときは数値、フォーム、疲労感、生活状況を合わせて振り返ろう。"
  },
  {
    "id": "mirei-protein-v2",
    "hero": "mirei",
    "title": "たんぱく質のお話",
    "cost": 3,
    "requires": [
      "mirei-meal-v1"
    ],
    "type": "event",
    "chapter": "基礎",
    "summary": "筋肉の材料",
    "dialogue": "ミレイ「所長くん、筋肉にも材料が必要なのよ♡」\n所長「肉か！」\nミレイ「お肉も魚も卵も豆も。いろいろ食べてね」",
    "lesson": "たんぱく質は身体の組織をつくる栄養素。特定の食品だけに偏らず、普段の食事で多様な食品を摂ることが基本。"
  },
  {
    "id": "mirei-carb-v2",
    "hero": "mirei",
    "title": "ご飯は敵じゃない",
    "cost": 3,
    "requires": [
      "mirei-meal-v1"
    ],
    "type": "event",
    "chapter": "基礎",
    "summary": "活動のエネルギー",
    "dialogue": "ミレイ「所長くん、ご飯を抜いて頑張ろうとしてない？」\n所長「かっこよくなりたい」\nミレイ「ふふ、活動の燃料まで減らさなくていいのよ♡」",
    "lesson": "炭水化物は身体の主要なエネルギー源のひとつ。食事を極端に減らすより、バランスのとれた食習慣を意識しよう。"
  },
  {
    "id": "mirei-water-v2",
    "hero": "mirei",
    "title": "水分も研究対象",
    "cost": 4,
    "requires": [
      "mirei-meal-v1"
    ],
    "type": "event",
    "chapter": "基礎",
    "summary": "運動と水分",
    "dialogue": "ミレイ「おかえりなさい。お水、飲んだ？」\n所長「忘れてた」\nミレイ「ふふ、まずはそこからね♡」",
    "lesson": "汗をかく運動では水分補給も大切。喉の渇きや環境に気を配り、体調に異変を感じたら運動を中止しよう。"
  },
  {
    "id": "mirei-sleep-v2",
    "hero": "mirei",
    "title": "眠っている間の仕事",
    "cost": 4,
    "requires": [
      "mirei-protein-v2"
    ],
    "type": "event",
    "chapter": "基礎",
    "summary": "睡眠と回復",
    "dialogue": "ミレイ「寝る時間を削って研究？ だめよ♡」\n所長「あと1ノード……」\nミレイ「続きは明日。研究所は逃げないわ」",
    "lesson": "睡眠は心身の回復と日中の活動に関係する。仕事や生活に合わせて、十分な睡眠機会を確保することが大切。"
  },
  {
    "id": "mirei-rest-v2",
    "hero": "mirei",
    "title": "休むのも研究",
    "cost": 5,
    "requires": [
      "mirei-sleep-v2"
    ],
    "type": "event",
    "chapter": "応用",
    "summary": "休息日を設計する",
    "dialogue": "ミレイ「今日は休息にしましょうか」\n所長「でもSPが……」\nミレイ「ふふ、身体を壊したら本末転倒でしょう？」",
    "lesson": "負荷の高い運動を続けすぎないこと。痛みや強い疲労がある日は無理に運動を足さず、休息や軽い活動を検討しよう。"
  },
  {
    "id": "mirei-recovery-v2",
    "hero": "mirei",
    "title": "疲れのサイン",
    "cost": 5,
    "requires": [
      "mirei-carb-v2",
      "mirei-rest-v2"
    ],
    "type": "event",
    "chapter": "応用",
    "summary": "体調の観察",
    "dialogue": "ミレイ「いつもの運動が妙につらい？」\n所長「今日は重たい」\nミレイ「それなら軽くするか、お休みにしましょうね♡」",
    "lesson": "普段より強い疲労、痛み、体調不良は負荷の見直しのサイン。回復を優先し、症状が続く場合は専門家に相談する。"
  },
  {
    "id": "mirei-food-v2",
    "hero": "mirei",
    "title": "続く献立を考えよう",
    "cost": 6,
    "requires": [
      "mirei-water-v2",
      "mirei-carb-v2"
    ],
    "type": "event",
    "chapter": "応用",
    "summary": "無理のない食事",
    "dialogue": "ミレイ「毎日完璧な献立じゃなくてもいいの」\n所長「お好み焼きでも？」\nミレイ「具材を工夫する楽しさもあるでしょう？♡」",
    "lesson": "主食・主菜・副菜を目安に、食べられる食品や生活リズムに合わせて無理なく組み合わせよう。"
  },
  {
    "id": "mirei-rhythm-v2",
    "hero": "mirei",
    "title": "生活リズムの実験",
    "cost": 8,
    "requires": [
      "mirei-recovery-v2",
      "mirei-food-v2"
    ],
    "type": "event",
    "chapter": "発展",
    "summary": "勤務と体調のバランス",
    "dialogue": "ミレイ「生活の時間は日によって変わるものね」\n所長「夜勤もあるからな」\nミレイ「だからこそ、続けやすい方法を探しましょう♡」",
    "lesson": "勤務や生活に合わせて、睡眠・食事・運動の取りやすい時間を探す。一定の時刻にこだわりすぎず、体調を優先しよう。"
  },
  {
    "id": "mirei-master-v2",
    "hero": "mirei",
    "title": "頑張り屋さんの休み方",
    "cost": 10,
    "requires": [
      "mirei-rhythm-v2"
    ],
    "type": "event",
    "chapter": "発展",
    "summary": "長く続けるために",
    "dialogue": "ミレイ「所長くん、立派になったわね♡」\n所長「筋肉が？」\nミレイ「ふふ、自分をいたわれるようになったところよ」",
    "lesson": "継続の秘訣は運動を増やすことだけではない。食事・睡眠・休息を含め、楽しめる生活の形を育てよう。"
  }
]);

export const NODES = Object.freeze([...STARTER_NODES,...EXPANDED_NODES]);

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

// Read-only unlock history for progress graphs and playful coolness points.
export async function readTreeUnlocks(profileId=TREE_PROFILE_ID){
  const unlocks=await getAll(STORES.unlocks);
  return unlocks.filter(x=>x.profileId===profileId&&NODE_BY_ID.has(x.nodeId));
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
