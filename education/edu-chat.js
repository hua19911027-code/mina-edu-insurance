(function () {
  'use strict';
  const LINE_URL = 'https://line.me/R/ti/p/@590binwn';

  let messages = [], isLoading = false;
  let chatBox, inputEl, sendBtn, loadingEl, formEl;
  let userGrade = '', userSubjects = [], userConcern = '';
  let round = 0;

  // ── 腳本資料 ──────────────────────────────────────────
  const SCRIPT = {
    round1_opener: {
      '小一小二_英文': '小一小二正是英文打基礎的黃金期，這個階段建立好自然發音和開口習慣，之後的路會輕鬆很多。\n\n• 很多孩子在這個年紀覺得英文很陌生，容易失去興趣\n• 靠學校進度，開口練習機會太少，容易變成「看得懂但不敢說」\n• 徐薇英文從自然發音開始，讓孩子在遊戲和互動中愛上開口，不靠死背',
      '小一小二_數學': '小一小二的數學看起來簡單，但這個階段建立的數感和計算習慣，會影響之後很多年。\n\n• 加減法靠數手指，沒有真正建立數感，到了乘除就容易卡住\n• 在家練習，很難知道孩子是真的懂還是只記住步驟\n• 偉智數學用生活化的方式讓孩子理解數字的邏輯，不只會算，還知道為什麼',
      '小一小二_安親': '小一小二剛開始上學，放學後有沒有人好好陪著，對孩子的習慣養成影響很大。\n\n• 這個年紀自制力還不夠，放學回家容易先玩，作業一拖就到睡前\n• 家長上班沒辦法全程陪，孩子需要有結構的環境來養成習慣\n• 我們的安親讓孩子放學就先把功課完成，老師在旁邊引導，養成主動學習的節奏',
      '小一小二_英文_數學': '小一小二同時加強英文和數學，這個階段打好雙科基礎，之後會省很多力氣。\n\n• 英文需要開口習慣，數學需要數感，兩件事愈早建立愈自然\n• 在家自學這兩科都很難，英文缺練習對象，數學容易教成死記步驟\n• 徐薇英文讓孩子敢開口，偉智數學讓孩子真的懂，兩科都用互動教學取代死背',
      '小一小二_英文_安親': '英文加安親，讓孩子放學有人顧、英文也有人帶，家長可以真正放心。\n\n• 安親解決放學的照顧問題，英文解決語言學習的方向問題\n• 這個年紀英文和生活習慣一起建立，效果最好\n• 我們的安親老師陪孩子完成功課，英文課讓孩子在遊戲中愛上開口說話',
      '小一小二_數學_安親': '數學加安親，讓孩子放學有人管、數學有人教，養成踏實學習的習慣。\n\n• 安親讓孩子放學第一件事就把作業寫完，數學課讓孩子真正理解每一題\n• 這個年紀數學觀念打好，之後學乘除分數會輕鬆很多\n• 我們的老師在安親時會留意孩子哪裡不懂，數學課再針對弱點加強',
      '小一小二_英文_數學_安親': '英文、數學、安親三合一，放學有人顧、英文有人帶、數學有人教，家長不用每天追功課。\n\n• 三件事在同一個地方解決，孩子的學習節奏也更穩定\n• 老師會掌握每個孩子的狀況，安親、英文、數學互相配合',
      '小三小四_英文': '小三小四的英文開始有閱讀理解和單字量要求，這個階段是很多孩子開始掉隊的時候。\n\n• 單字愈來愈多，靠死背很快就記不住\n• 閱讀理解需要語感，但口說基礎不夠，讀起來就像在猜字\n• 徐薇英文在這個階段幫孩子建立語感和單字記憶策略，不再靠死背',
      '小三小四_數學': '小三小四是數學的關鍵轉折點，乘除法和分數是很多孩子開始卡住的地方。\n\n• 從加減跳到乘除，觀念沒跟上就容易用死記代替理解\n• 分數的概念很多孩子第一次接觸覺得很抽象，沒有好老師引導容易放棄\n• 偉智數學用生活情境解釋乘除和分數，讓孩子真的懂，不只會算',
      '小三小四_安親': '小三小四功課開始變多，放學後需要有人好好陪著，不然容易積累壓力。\n\n• 作業量增加，自己在家寫常常寫到很晚還沒寫完\n• 孩子開始有社交需求，在安親可以和同學一起學習，也學習人際相處\n• 我們的安親讓孩子放學先把功課完成，老師在旁邊確認有真的寫懂',
      '小三小四_英文_數學': '小三小四英文和數學同時加強，這個階段兩科都是關鍵期。\n\n• 英文單字量和閱讀理解需要語感，數學乘除分數需要觀念，兩科都需要好方法\n• 徐薇英文建立語感，偉智數學建立邏輯，兩科都讓孩子真的懂',
      '小三小四_英文_安親': '英文加安親，小三小四這個階段兩件事一起解決最省心。\n\n• 安親讓孩子放學功課有人管，英文讓孩子語感持續建立\n• 小三小四英文進度加快，有老師持續練習，效果差很多',
      '小三小四_數學_安親': '數學加安親，這個階段最需要有人在旁邊引導。\n\n• 乘除和分數是很多孩子第一次遇到真正的困難，需要有耐心的老師陪著\n• 安親讓孩子先把作業寫完，數學課再針對不懂的地方加強',
      '小三小四_英文_數學_安親': '英文、數學、安親三合一，小三小四是關鍵期，三科一起顧最穩。\n\n• 英文和數學都進入關鍵轉折，安親幫孩子把每天的功課顧好\n• 老師會掌握每個孩子的整體狀況，讓孩子在穩定的節奏裡成長',
      '小五小六_英文': '小五小六的英文進入句型文法和作文階段，底子夠不夠，差別很明顯。\n\n• 不只是背單字，還要能寫句子、說出來\n• 很多孩子小時候英文還好，到了這個階段開始跟不上，是語感沒建立好\n• 徐薇英文幫孩子從理解到輸出，讓孩子能寫出完整的句子和短文',
      '小五小六_數學': '小五小六的數學是應用題、比例、面積體積，觀念一定要夠紮實才應付得來。\n\n• 需要把多個觀念組合起來解題\n• 如果之前基礎沒打好，這個時候往往會突然覺得數學很難\n• 偉智數學用邏輯引導，讓孩子能拆解複雜題目，找到解題方向',
      '小五小六_安親': '小五小六課業壓力變大，有人在旁邊陪著把功課完成，孩子的壓力會小很多。\n\n• 作業和考試都增加，孩子需要一個專心讀書的環境\n• 我們的安親在考前會幫孩子做複習規劃，讓孩子不用臨時抱佛腳',
      '小五小六_英文_數學': '小五小六英文和數學同時加強，兩科都進入考驗期，一起顧最穩。\n\n• 英文需要寫作和語感，數學需要應用題的解題邏輯\n• 徐薇英文和偉智數學各有專長，讓孩子在兩科都找到自信',
      '小五小六_英文_安親': '英文加安親，小五小六功課多，安親讓孩子每天的作業顧好，英文持續帶著練。\n\n• 英文在這個階段需要持續練習，有老師帶著效果穩定很多',
      '小五小六_數學_安親': '數學加安親，應用題需要老師引導解題思路，安親讓孩子每天功課完成，考前還有複習規劃。',
      '小五小六_英文_數學_安親': '英文、數學、安親三合一，小五小六是準備升學的關鍵期，三科一起顧最完整。\n\n• 有一個穩定的學習環境，孩子不用奔波，學習節奏更穩\n• 老師會掌握孩子整體的學習狀況，讓每一科都有人照顧到'
    },
    round1_question: {
      '英文': { q: '孩子目前在學校的英文狀況，比較符合哪個？', opts: ['單字背了就忘','看得懂但不會說','考試還好但沒有興趣','跟不上進度','自己說說看（可在下方輸入）'] },
      '數學': { q: '孩子目前在學校的數學狀況，比較符合哪個？', opts: ['計算會但應用題不行','觀念沒搞懂就硬背','考試緊張容易算錯','跟不上老師進度','自己說說看（可在下方輸入）'] },
      '安親': { q: '目前最擔心放學後的哪個狀況？', opts: ['沒人陪，孩子自己在家','作業沒人管，拖到很晚','孩子不知道怎麼安排時間','想讓孩子養成讀書習慣','自己說說看（可在下方輸入）'] },
      '英文_數學': { q: '孩子目前兩科的狀況，比較符合哪個？', opts: ['英文跟不上，數學還好','數學跟不上，英文還好','兩科都有點吃力','其實還好但想提前加強','自己說說看（可在下方輸入）'] },
      '英文_安親': { q: '目前最優先想解決的是哪個？', opts: ['放學照顧的問題','英文跟不上的問題','兩個都一樣急','自己說說看（可在下方輸入）'] },
      '數學_安親': { q: '目前最優先想解決的是哪個？', opts: ['放學照顧的問題','數學跟不上的問題','兩個都一樣急','自己說說看（可在下方輸入）'] },
      '英文_數學_安親': { q: '三個需求裡，目前最急迫的是哪個？', opts: ['放學照顧最急','英文最急','數學最急','三個都一樣急','自己說說看（可在下方輸入）'] }
    },
    round2_opener: {
      '單字背了就忘': '單字背了就忘，不是孩子記性差，是記憶方法沒找對。',
      '看得懂但不會說': '看得懂但不會說，孩子的理解力是有的，缺的是開口練習的機會和環境。',
      '考試還好但沒有興趣': '考試還好但沒有興趣，這是很值得注意的訊號——有興趣才能走得長遠。',
      '跟不上進度': '跟不上進度，最重要的是找到孩子卡在哪裡，再針對那個點補起來。',
      '計算會但應用題不行': '計算會但應用題不行，孩子學會了步驟，但沒有真正理解題目在問什麼。',
      '觀念沒搞懂就硬背': '觀念沒搞懂就硬背，這樣學數學很辛苦，因為新的觀念都建在舊的上面。',
      '考試緊張容易算錯': '考試緊張容易算錯，通常代表孩子對自己不夠有把握，需要建立更紮實的信心。',
      '跟不上老師進度': '跟不上老師進度，需要有人幫孩子把落差補起來，不然會愈差愈多。',
      '沒人陪，孩子自己在家': '孩子自己在家，不只是安全，孩子沒有人引導，時間很容易就浪費掉了。',
      '作業沒人管，拖到很晚': '作業拖到很晚，這個習慣如果沒有調整，之後功課愈來愈多會更辛苦。',
      '孩子不知道怎麼安排時間': '不知道怎麼安排時間，這個年紀的孩子需要有人幫他建立結構，不是只靠自律。',
      '想讓孩子養成讀書習慣': '想讓孩子養成讀書習慣，環境和引導比說教有效。',
      '英文跟不上，數學還好': '英文跟不上但數學還好，我們先把重心放在英文，把語感和開口習慣建立起來。',
      '數學跟不上，英文還好': '數學跟不上但英文還好，我們先把重心放在數學，把觀念弄清楚比刷題重要。',
      '兩科都有點吃力': '兩科都有點吃力，只要方法對了，兩科同時進步是完全可以的。',
      '其實還好但想提前加強': '其實還好但想提前加強，在跟不上之前就準備好，孩子會更有自信。',
      '放學照顧的問題': '放學照顧是很多雙薪家庭最頭痛的問題，有一個安心的地方讓孩子放學去，家長才能真正放心上班。',
      '英文跟不上的問題': '英文跟不上，愈早處理愈好，語感需要時間累積，不是臨時抱佛腳能解決的。',
      '數學跟不上的問題': '數學跟不上，要找到卡在哪個觀念，補起來才有用，不是一直刷題。',
      '兩個都一樣急': '兩個都急，就同時解決——放學有人顧，學科有人教，一次到位。',
      '放學照顧最急': '放學照顧最急，先把這個解決，孩子有穩定的地方去，學習自然也會跟著穩。',
      '英文最急': '英文最急，先重點處理，把語感和開口習慣建立起來。',
      '數學最急': '數學最急，先針對弱點加強，把觀念打通。',
      '三個都一樣急': '三個都急，就一次解決——英文、數學、安親全包，孩子在這裡有人顧、有人教、有人陪。'
    },
    round2_body: {
      '英文': {
        '單字背了就忘': '• 單字記不住通常是因為只有「看」，沒有「用」——要能說出來、用在句子裡才會真的記住\n• 徐薇英文用自然發音和情境對話，讓孩子在互動中反覆使用單字，記得自然又牢固\n• 之前有個小四的孩子，背單字背了一學期還是一直忘，來上了幾堂課之後，媽媽說孩子開始會在家裡突然講英文句子，連她都嚇到',
        '看得懂但不會說': '• 從來沒有練習輸出的機會——學校英文課一班幾十個人，根本輪不到開口\n• 徐薇英文的課堂鼓勵每個孩子開口，從簡單的單字到完整的句子，老師會等、會引導，不讓孩子有壓力\n• 之前有個小三的孩子，在學校從來不敢舉手，來上課三個月之後，老師說他開始主動回答問題了',
        '考試還好但沒有興趣': '• 靠記憶力在撐，而不是真的喜歡英文——這樣遲早會遇到瓶頸\n• 徐薇英文把課程設計得像遊戲，讓孩子在不知不覺中學英文，目標是讓孩子覺得英文是有趣的事\n• 之前有個小二的孩子，在家從不碰英文，來了幾次之後，孩子開始主動要求回家練習，因為覺得有趣',
        '跟不上進度': '• 通常是某一個觀念沒搞懂，後面全部都在硬撐——需要找到那個點，補起來才有用\n• 徐薇英文的老師會先了解每個孩子的狀況，找到卡住的地方，再從那裡開始補\n• 之前有個小五的孩子，英文跟不上一學期了，老師發現是自然發音基礎有問題，針對那個點補強之後，進度很快就跟上了',
        'default': '• 徐薇英文從自然發音開始，讓孩子在遊戲和互動中愛上開口說英文\n• 老師會找出孩子卡住的地方，針對性地補強，不是從頭重來\n• 很多孩子試聽後，回家就自己拿著英文繪本在唸'
      },
      '數學': {
        '計算會但應用題不行': '• 應用題不行，是因為孩子沒辦法把題目的文字轉換成數學算式——這是理解的問題，不是計算的問題\n• 偉智數學用生活情境解釋應用題，讓孩子先理解題目在說什麼，再想怎麼算\n• 之前有個小四的孩子，計算題都全對，應用題幾乎全錯，上了幾堂課之後，媽媽說孩子開始會把應用題念出來、畫圖解釋，答對率大幅提升',
        '觀念沒搞懂就硬背': '• 硬背步驟在數學是很危險的，題目只要換個方式問，就完全不會了\n• 偉智數學的老師用引導的方式，讓孩子自己去想「為什麼」，不是只告訴他「怎麼做」\n• 之前有個小三的孩子，乘法背得很熟但完全不懂意思，老師用積木和圖示幫他理解之後，他說「原來乘法就是這樣」，之後再也不用死背了',
        '考試緊張容易算錯': '• 對自己的方法不夠有把握，不確定做的對不對，就更容易慌\n• 偉智數學讓孩子把每個步驟都搞清楚，有了紮實的理解，考試時才能有把握地寫\n• 之前有個小五的孩子，平常練習都會，考試就是出錯，老師發現他有幾個觀念一直似懂非懂，針對補強之後，考試穩定度明顯提升',
        '跟不上老師進度': '• 有些觀念還沒消化，老師就繼續往前，洞愈來愈大\n• 偉智數學的老師會先評估孩子現在的程度，從真正懂的地方開始，把基礎補紮實\n• 之前有個小六的孩子，數學落後半學期，老師從分數的觀念重新開始，三個月後孩子說他終於聽得懂老師上什麼了',
        'default': '• 偉智數學用啟發式教學，讓孩子從理解出發，不靠死記\n• 老師會找到孩子卡住的觀念，針對性地補強\n• 很多孩子本來覺得數學很可怕，上了幾堂課之後開始說「我懂了」'
      },
      '安親': {
        '沒人陪，孩子自己在家': '• 有一個有結構的環境，孩子才能把時間用在對的地方\n• 我們的安親放學就開始，先休息一下，然後老師陪著把功課完成\n• 之前有個媽媽，孩子之前放學自己在家，功課都沒寫，換到安親之後，放學功課寫完才回家，媽媽說親子關係都變好了',
        '作業沒人管，拖到很晚': '• 作業拖到很晚，隔天早起上學，孩子又累又有壓力——需要有人幫忙打破這個循環\n• 我們的安親讓孩子放學第一件事就把功課完成，老師在旁邊確認寫完、寫懂\n• 之前有個爸爸說，孩子以前作業寫到十一點，來安親之後，晚上七點多就回家，作業全寫完，親子多出時間做別的事',
        '孩子不知道怎麼安排時間': '• 這個年紀需要有人幫他建立結構和習慣，不是只靠自律\n• 我們的安親有固定的時間流程，孩子到了就知道接下來要做什麼，慢慢養成有節奏的習慣\n• 之前有個孩子，每天放學不知道先做什麼，來安親三個月之後，媽媽說孩子假日也開始會自己安排時間了',
        '想讓孩子養成讀書習慣': '• 讀書習慣要從小養成，環境和引導比說教有效\n• 我們的安親有安靜讀書的時間，老師引導孩子完成功課，也鼓勵預習和複習的習慣\n• 之前有個孩子，之前完全沒有讀書習慣，來安親一學期後，媽媽說孩子開始主動把書包整理好',
        'default': '• 我們的安親每天放學，老師陪孩子把作業寫完、考前幫忙複習\n• 連生活上的小事——剪髮、學洗碗、人際關係的小摩擦——老師都會陪著處理\n• 很多家長說：孩子來安親之後，回家不用再催功課，親子關係都變好了'
      }
    },
    round3_intro: {
      '有補過，但效果不明顯': '補過但效果不明顯，補習有沒有效，跟方法和師生的匹配度關係很大。',
      '有補過，換了幾家': '換了幾家，代表家長在認真找對的地方——不是所有補習班都適合每個孩子。',
      '還沒有，這是第一次考慮': '第一次考慮，代表已經覺得孩子需要一些幫助了。這個時候找對的地方，可以讓孩子少走很多彎路。',
      '一直在家自己練': '在家自己練有限制——孩子需要練習對象、需要有人糾正、需要有結構的環境，這些在家很難給足。',
      'default': '每個孩子的狀況不同，找到適合的方式最重要。'
    },
    round3_body: {
      '英文': '徐薇英文的老師透過遊戲和互動，讓孩子在快樂的氣氛中學英文，從自然發音到開口說話，目標是讓孩子真的敢開口、喜歡說。很多孩子試聽後，回家就自己拿著英文繪本在唸——那是最好的回饋。',
      '數學': '偉智數學的老師用啟發式教學，引導孩子從生活情境中理解數學概念，不只教計算，讓孩子真的理解為什麼。很多孩子本來覺得數學很可怕，上了幾堂課之後開始說「我懂了」——那個瞬間家長都很感動。',
      '安親': '我們的安親不只是有人顧。每天放學，老師陪孩子把作業寫完、考前幫忙複習，連生活上的小事——剪髮、學洗碗、人際關係的小摩擦——老師都會陪著處理。很多家長說：孩子來安親之後，回家不用再催功課，親子關係都變好了。'
    }
  };

  // ── 腳本查詢函式 ──────────────────────────────────────
  function getGradeGroup(grade) {
    if (['小一','小二'].includes(grade)) return '小一小二';
    if (['小三','小四'].includes(grade)) return '小三小四';
    return '小五小六';
  }

  function getSubjectKey(subjects) {
    return [...subjects].sort().join('_');
  }

  function buildRound1(grade, subjects) {
    const gradeGroup = getGradeGroup(grade);
    const subKey = getSubjectKey(subjects);
    const openerKey = gradeGroup + '_' + subKey;
    const text = SCRIPT.round1_opener[openerKey] || SCRIPT.round1_opener[gradeGroup + '_' + subjects[0]] || '這個階段打好基礎，之後的學習會輕鬆很多。';
    const qData = SCRIPT.round1_question[subKey] || SCRIPT.round1_question[subjects[0]];
    return { text, question: qData ? qData.q : null, options: qData ? qData.opts : [] };
  }

  function buildRound2(userChoice, subjects) {
    const opener = SCRIPT.round2_opener[userChoice] || '';
    const bodyParts = [];
    subjects.forEach(function(subj) {
      const bodyMap = SCRIPT.round2_body[subj];
      if (bodyMap) {
        bodyParts.push(bodyMap[userChoice] || bodyMap['default'] || '');
      }
    });
    const text = opener + '\n\n' + bodyParts.join('\n\n');
    return {
      text: text.trim(),
      question: SCRIPT.round2_body ? '孩子有沒有試過補習或其他學習方式？' : null,
      options: ['有補過，但效果不明顯','有補過，換了幾家','還沒有，這是第一次考慮','一直在家自己練','自己說說看（可在下方輸入）']
    };
  }

  function buildRound3(userChoice, subjects) {
    const intro = SCRIPT.round3_intro[userChoice] || SCRIPT.round3_intro['default'];
    const bodyParts = subjects.map(s => SCRIPT.round3_body[s]).filter(Boolean);
    const text = intro + '\n\n' + bodyParts.join('\n\n') + '\n\n試聽課完全免費，不需要承諾任何事情，帶孩子來感受一下就好。來了之後，孩子喜不喜歡，家長一眼就知道。\n\n• [LINE_CTA]';
    return { text: text.trim(), question: null, options: [] };
  }

  // ── UI ────────────────────────────────────────────────
  const INTAKE = {
    grade: { label: '① 孩子幾年級？', options: ['小一','小二','小三','小四','小五','小六'], selected: null },
    subject: { label: '② 想加強哪個科目？（可複選）', options: ['英文','數學','安親'], selected: [], multi: true },
    concern: {
      label: '③ 目前最擔心的是？',
      options: ['跟不上學校進度','成績起伏大','孩子不愛讀書','想提前打好基礎','放學沒人照顧','自己說說看（可在下方輸入）'],
      selected: null, hasOther: true
    }
  };

  function init() {
    const modal = document.getElementById('edu-chat-modal');
    const closeBtn = document.getElementById('edu-chat-close');
    chatBox = document.getElementById('edu-chat-messages');
    inputEl = document.getElementById('edu-chat-input');
    sendBtn = document.getElementById('edu-chat-send');
    loadingEl = document.getElementById('edu-chat-loading');
    if (!modal) return;

    document.querySelectorAll('[data-edu-trigger]').forEach(function(trigger) {
      trigger.addEventListener('click', function(e) {
        e.preventDefault();
        modal.classList.add('open');
        if (messages.length === 0 && !formEl) renderIntakeForm();
        setTimeout(() => inputEl && inputEl.focus(), 300);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    modal.addEventListener('click', function(e) { if (e.target === modal) modal.classList.remove('open'); });
    if (sendBtn) sendBtn.addEventListener('click', sendFreeText);
    if (inputEl) {
      inputEl.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendFreeText(); }
      });
    }
  }

  function renderIntakeForm() {
    formEl = document.createElement('div');
    formEl.className = 'edu-intake-form';
    const welcome = document.createElement('div');
    welcome.className = 'edu-intake-welcome';
    welcome.innerHTML = '你好！先了解一下孩子的狀況<br>才能給你最準確的建議 👋';
    formEl.appendChild(welcome);
    ['grade','subject','concern'].forEach(key => formEl.appendChild(renderGroup(key)));
    const submitBtn = document.createElement('button');
    submitBtn.className = 'edu-intake-submit';
    submitBtn.textContent = '開始諮詢';
    submitBtn.disabled = true;
    submitBtn.addEventListener('click', submitIntake);
    formEl.appendChild(submitBtn);
    chatBox.appendChild(formEl);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function renderGroup(key) {
    const g = INTAKE[key];
    const wrap = document.createElement('div');
    wrap.className = 'edu-intake-group';
    const lbl = document.createElement('div');
    lbl.className = 'edu-intake-label';
    lbl.textContent = g.label;
    wrap.appendChild(lbl);
    const btns = document.createElement('div');
    btns.className = 'edu-intake-btns';
    const otherWrap = document.createElement('div');
    otherWrap.style.display = 'none';
    otherWrap.style.marginTop = '8px';
    const otherInput = document.createElement('input');
    otherInput.className = 'edu-intake-other-input';
    otherInput.placeholder = '請輸入你的狀況…';
    otherInput.addEventListener('input', function() {
      g.selected = otherInput.value.trim() || null;
      checkSubmit();
    });
    otherWrap.appendChild(otherInput);
    g.options.forEach(function(opt) {
      const isOther = opt.startsWith('自己說說看');
      const btn = document.createElement('button');
      btn.className = 'edu-intake-btn' + (isOther ? ' edu-intake-btn-other' : '');
      btn.textContent = opt;
      btn.addEventListener('click', function() {
        if (g.multi) {
          btn.classList.toggle('selected');
          g.selected = Array.from(btns.querySelectorAll('.edu-intake-btn.selected')).map(b => b.textContent);
        } else {
          btns.querySelectorAll('.edu-intake-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          if (isOther && g.hasOther) {
            otherWrap.style.display = 'block';
            g.selected = null;
            setTimeout(() => otherInput.focus(), 50);
          } else {
            otherWrap.style.display = 'none';
            g.selected = opt;
          }
        }
        checkSubmit();
      });
      btns.appendChild(btn);
    });
    wrap.appendChild(btns);
    if (g.hasOther) wrap.appendChild(otherWrap);
    return wrap;
  }

  function checkSubmit() {
    if (!formEl) return;
    const btn = formEl.querySelector('.edu-intake-submit');
    const subjectOk = Array.isArray(INTAKE.subject.selected) ? INTAKE.subject.selected.length > 0 : !!INTAKE.subject.selected;
    if (btn) btn.disabled = !(INTAKE.grade.selected && subjectOk && INTAKE.concern.selected);
  }

  function submitIntake() {
    userGrade = INTAKE.grade.selected;
    userSubjects = Array.isArray(INTAKE.subject.selected) ? INTAKE.subject.selected : [INTAKE.subject.selected];
    userConcern = INTAKE.concern.selected;
    const summary = '年級：' + userGrade + '｜科目：' + userSubjects.join('、') + '｜擔心：' + userConcern;
    formEl.remove(); formEl = null;
    appendMessage('user', summary);
    round = 1;
    const resp = buildRound1(userGrade, userSubjects);
    setTimeout(function() { showScriptResponse(resp); }, 400);
  }

  function showScriptResponse(resp) {
    appendMessage('assistant', resp.text);
    if (resp.question) showOptions(resp.options, resp.question);
  }

  function handleOptionClick(opt) {
    appendMessage('user', opt);
    round++;
    let resp;
    if (round === 2) {
      resp = buildRound2(opt, userSubjects);
    } else {
      resp = buildRound3(opt, userSubjects);
    }
    setTimeout(function() { showScriptResponse(resp); }, 400);
  }

  // 自由文字 → 呼叫 AI
  async function sendFreeText() {
    if (!inputEl || isLoading) return;
    const text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';
    appendMessage('user', text);
    messages.push({ role: 'user', content: text });
    setLoading(true);
    try {
      const context = '用戶背景：年級=' + userGrade + '，科目=' + userSubjects.join('、') + '，擔心=' + userConcern;
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: context + '\n\n用戶問題：' + text }] })
      });
      const data = await res.json();
      const replyText = data.text || '這個問題讓我幫你確認一下，建議直接加 LINE 詢問會更快喔！\n\n• [LINE_CTA]';
      appendMessage('assistant', replyText);
      messages.push({ role: 'assistant', content: replyText });
    } catch (_) {
      appendMessage('assistant', '抱歉，連線發生問題，建議直接加 LINE 詢問 😊\n\n• [LINE_CTA]');
    } finally {
      setLoading(false);
    }
  }

  function showOptions(options, question) {
    const wrap = document.createElement('div');
    wrap.className = 'edu-options';
    if (question) {
      const qLabel = document.createElement('div');
      qLabel.className = 'edu-options-question';
      qLabel.textContent = question;
      wrap.appendChild(qLabel);
    }
    options.forEach(function(opt) {
      const isOther = opt.startsWith('自己說說看');
      const btn = document.createElement('button');
      btn.className = 'edu-option-btn' + (isOther ? ' edu-option-other' : '');
      btn.textContent = opt;
      if (isOther) {
        btn.addEventListener('click', function() {
          if (wrap.querySelector('.edu-option-inline-input')) return;
          btn.classList.add('active');
          const inlineWrap = document.createElement('div');
          inlineWrap.className = 'edu-option-inline-wrap';
          const inlineInput = document.createElement('input');
          inlineInput.className = 'edu-option-inline-input';
          inlineInput.placeholder = '請在這裡輸入…';
          const inlineSend = document.createElement('button');
          inlineSend.className = 'edu-option-inline-send';
          inlineSend.textContent = '送出';
          function submitInline() {
            const val = inlineInput.value.trim();
            if (!val) return;
            wrap.remove();
            handleOptionClick(val);
          }
          inlineSend.addEventListener('click', submitInline);
          inlineInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') { e.preventDefault(); submitInline(); } });
          inlineWrap.appendChild(inlineInput);
          inlineWrap.appendChild(inlineSend);
          wrap.appendChild(inlineWrap);
          chatBox.scrollTop = chatBox.scrollHeight;
          setTimeout(() => inlineInput.focus(), 50);
        });
      } else {
        btn.addEventListener('click', function() { wrap.remove(); handleOptionClick(opt); });
      }
      wrap.appendChild(btn);
    });
    chatBox.appendChild(wrap);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function appendMessage(role, text) {
    if (!chatBox) return;
    const wrap = document.createElement('div');
    wrap.className = 'edu-msg edu-msg--' + role;
    const bubble = document.createElement('div');
    bubble.className = 'edu-bubble';
    if (role === 'assistant') {
      text.split('\n').forEach(function(line) {
        if (!line.trim()) { const s = document.createElement('div'); s.style.height = '8px'; bubble.appendChild(s); return; }
        const clean = line.replace(/^[•♦\-]\s*/, '').trim();
        if (clean === '[LINE_CTA]') {
          const card = document.createElement('div');
          card.className = 'edu-line-card';
          card.innerHTML = '<p class="edu-line-card-lead">想預約免費試聽嗎？</p>' +
            '<a href="' + LINE_URL + '" target="_blank" rel="noopener" class="edu-line-btn">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0"><path d="M12 2C6.48 2 2 6.1 2 11.2c0 3.28 1.67 6.18 4.27 8.04L5.2 22l3.09-1.62C9.38 20.78 10.67 21 12 21c5.52 0 10-4.1 10-9.2C22 6.1 17.52 2 12 2z"/></svg>' +
            '點這裡加 LINE・預約免費試聽</a>' +
            '<span class="edu-line-card-note">不用決定・不用準備・來試一堂就知道</span>';
          bubble.appendChild(card);
        } else if (clean === '[DIVIDER]') {
          const hr = document.createElement('div'); hr.className = 'edu-section-divider'; bubble.appendChild(hr);
        } else {
          const p = document.createElement('p');
          p.textContent = clean;
          if (line.trim().startsWith('•') || line.trim().startsWith('♦') || line.trim().startsWith('-')) p.className = 'edu-bullet';
          bubble.appendChild(p);
        }
      });
    } else {
      bubble.textContent = text;
    }
    wrap.appendChild(bubble);
    chatBox.appendChild(wrap);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function setLoading(state) {
    isLoading = state;
    if (sendBtn) sendBtn.disabled = state;
    if (loadingEl) loadingEl.style.display = state ? 'flex' : 'none';
    if (inputEl) inputEl.disabled = state;
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
