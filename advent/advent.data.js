/* advent.data.js — Emi-memo Advent
   Każdy wpis: [title, teaser, html, items?]
   items: tablica obiektów typu "mcq" | "cloze" | "short" | "match"
*/
window.ADVENT_TASKS = {
  base: [
    // ===== 1 =====
    [
      "Dzień 1 – Transformacje (z podanym słowem)",
      "Wpisz parafrazę. Sprawdzanie jest tolerancyjne (słowa kluczowe/struktura).",
      `<p><strong>Instrukcja:</strong> Przepisz zdanie, używając wyrazu w nawiasie. 
  Ocena automatyczna sprawdza kluczowe fragmenty – zaakceptuje kilka wariantów poprawnych.</p>
  <ol>
    <li>I last saw my cousin in July. <em>(SEEN)</em></li>
    <li>“Don’t touch that wire,” the man said to me. <em>(WARNED)</em></li>
    <li>The exam is too difficult for most students. <em>(ENOUGH)</em></li>
    <li>Someone has delivered the parcel. <em>(PASSIVE)</em></li>
    <li>If we start now, we’ll catch the bus. <em>(UNLESS)</em></li>
  </ol>`,
      [
        { type:"short", prompt:"1) … (SEEN)",    answer:[/haven['’]t\s+seen.*since\s+july/i, /have\s+not\s+seen.*since\s+july/i] },
        { type:"short", prompt:"2) … (WARNED)",  answer:[/warned\s+me\s+not\s+to\s+touch\s+that\s+wire/i] },
        { type:"short", prompt:"3) … (ENOUGH)",  answer:[/(is|isn['’]t)\s+(not\s+)?easy\s+enough\s+for\s+most\s+students/i, /not\s+enough\s+.*for\s+most\s+students/i] },
        { type:"short", prompt:"4) … (PASSIVE)", answer:[/the\s+parcel\s+has\s+been\s+delivered/i] },
        { type:"short", prompt:"5) … (UNLESS)",  answer:[/we\s+won['’]?t\s+catch\s+the\s+bus\s+unless\s+we\s+start\s+now/i] }
      ]
    ],

    // ===== 2 =====  (ZMIANA: tekst z lukami + osobne pola)
    [
      "Dzień 2 – Open cloze (8 luk)",
      "Wstaw po jednym wyrazie w każdą lukę. Najpierw przeczytaj tekst, potem wpisz odpowiedzi w polach (1)–(8).",
      `<p><strong>Tekst (8 luk):</strong><br>
      Many teenagers want to (1) ___ part in volunteer projects because they believe it (2) ___ them gain experience.
      They (3) ___ also meet people from different cultures and (4) ___ new skills. What (5) ___ more, volunteering
      often helps you decide (6) ___ career to choose. If you don’t (7) ___ time during the year, you can try a summer
      project (8) ___ your holidays.</p>`,
      [
        { type:"short", prompt:"(1)", answer:[/^\s*take\s*$/i] },
        { type:"short", prompt:"(2)", answer:[/^\s*helps\s*$/i] },
        { type:"short", prompt:"(3)", answer:[/^\s*can\s*$/i] },
        { type:"short", prompt:"(4)", answer:[/^\s*learn\s*$/i] },
        { type:"short", prompt:"(5)", answer:[/^\s*is\s*$/i] },
        { type:"short", prompt:"(6)", answer:[/^\s*which\s*$/i] },
        { type:"short", prompt:"(7)", answer:[/^\s*have\s*$/i] },
        { type:"short", prompt:"(8)", answer:[/^\s*during\s*$/i] }
      ]
    ],

    // ===== 3 =====  (ZMIANA: tekst z lukami + osobne pola)
    [
      "Dzień 3 – Słowotwórstwo",
      "Uzupełnij poprawną formą od wyrazu w nawiasie (1 wyraz). Najpierw przeczytaj tekst, potem wpisz (1)–(6).",
      `<p><strong>Tekst (6 luk):</strong><br>
      It was a difficult (1) ___ (decide), so we asked for more time. This manual is very (2) ___ (use) for beginners,
      and the new seats offer much greater (3) ___ (comfort). The charity was (4) ___ (create) in 1999 by local volunteers.
      Hard work is the key to (5) ___ (success), and parents are (6) ___ (responsible) for their children’s safety online.</p>`,
      [
        { type:"short", prompt:"(1)", answer:[/^\s*decision\s*$/i] },
        { type:"short", prompt:"(2)", answer:[/^\s*useful\s*$/i] },
        { type:"short", prompt:"(3)", answer:[/^\s*comfort\s*$/i] },
        { type:"short", prompt:"(4)", answer:[/^\s*created\s*$/i] },
        { type:"short", prompt:"(5)", answer:[/^\s*success\s*$/i] },
        { type:"short", prompt:"(6)", answer:[/^\s*responsible\s*$/i] }
      ]
    ],

    // ===== 4 =====
    [
      "Dzień 4 – Phrasal verbs (połącz w pary)",
      "Połącz phrasale z ich znaczeniami (listy rozwijane).",
      `<p>Dobierz poprawne znaczenie do każdego phrasala.</p>`,
      [
        {
          type: "match",
          left:  ["put off","look after","run into","turn up","give up","make up"],
          right: ["appear","invent","postpone","quit","meet by chance","take care of"],
          answer: [2,5,4,0,3,1]
        }
      ]
    ],

    // ===== 5 =====
    [
      "Dzień 5 – Korekta błędów (zaznacz błąd/poprawne)",
      "Wybierz: „error” jeśli zdanie zawiera błąd, „correct” jeśli jest poprawne.",
      `<p>Każde zdanie oceń jako <strong>error</strong> lub <strong>correct</strong>.</p>`,
      [
        { type:"mcq", prompt:"She suggested to go by train.",         options:["correct","error"], answer:1 },
        { type:"mcq", prompt:"I’m looking forward to see you.",       options:["correct","error"], answer:1 },
        { type:"mcq", prompt:"He didn’t used to eat breakfast.",      options:["correct","error"], answer:1 },
        { type:"mcq", prompt:"The film was so bored that we left.",   options:["correct","error"], answer:1 },
        { type:"mcq", prompt:"I prefer tea than coffee.",             options:["correct","error"], answer:1 },
        { type:"mcq", prompt:"There is too much people here.",        options:["correct","error"], answer:1 }
      ]
    ],

    // ===== 6 =====
    [
      "Dzień 6 – Czytanie (T/F/NG)",
      "Przeczytaj tekst. Przy każdym zdaniu wybierz: Prawda, Fałsz lub Brak informacji w tekście.",
      `<p><strong>Tekst (~120 słów):</strong><br>
      Local councils often look for volunteers to help organize community events. Tasks range from designing posters to welcoming guests. Although volunteers don’t get paid, many say the experience is rewarding and improves their communication skills. Some events take place at weekends, while others are held on weekday evenings. Training is always provided, and volunteers can choose the tasks that suit them best. According to last year’s report, over 60% of volunteers decided to continue after their first event. The council also offers certificates to recognize long-term involvement.</p>`,
      [
        { type:"mcq", prompt:"All events are organized at weekends.", options:["T","F","NG"], answer:1 },
        { type:"mcq", prompt:"Volunteers can select tasks.",           options:["T","F","NG"], answer:0 },
        { type:"mcq", prompt:"Training is available.",                 options:["T","F","NG"], answer:0 },
        { type:"mcq", prompt:"Most volunteers quit after the first event.", options:["T","F","NG"], answer:1 },
        { type:"mcq", prompt:"Certificates may be given.",             options:["T","F","NG"], answer:0 }
      ]
    ],

    // ===== 7 =====
    [
      "Dzień 7 – Funkcje językowe (dopasuj)",
      "Dopasuj wypowiedź do funkcji (MCQ).",
      `<p><strong>Funkcje:</strong> complaint / advice / apology / request</p>`,
      [
        { type:"mcq", prompt:"Could you possibly turn the music down?", options:["complaint","advice","apology","request"], answer:3 },
        { type:"mcq", prompt:"I’m really sorry for being late.",       options:["complaint","advice","apology","request"], answer:2 },
        { type:"mcq", prompt:"If I were you, I’d email the teacher.",  options:["complaint","advice","apology","request"], answer:1 },
        { type:"mcq", prompt:"I’m not happy with this service.",       options:["complaint","advice","apology","request"], answer:0 }
      ]
    ],

    // ===== 8 =====
    [
      "Dzień 8 – Zdania względne (formularz)",
      "Połącz pary zdań, używając who/which/that/where (3–8 wyrazów).",
      `<p>Wpisz jedno zdanie łączące parę. Akceptowane są naturalne warianty.</p>`,
      [
        {
          type:"short",
          prompt:"1) The woman is my neighbour. She teaches biology.",
          answer:[
            /the\s+woman\s+who\s+teaches\s+biology\s+is\s+my\s+neighbou?r/i,
            /my\s+neighbou?r\s+who\s+teaches\s+biology/i
          ]
        },
        {
          type:"short",
          prompt:"2) This is the cafe. We met there last year.",
          answer:[
            /this\s+is\s+the\s+caf[eé]\s+where\s+we\s+met\s+last\s+year/i,
            /we\s+met\s+at\s+this\s+caf[eé]\s+last\s+year/i
          ]
        },
        {
          type:"short",
          prompt:"3) The book is on the desk. You recommended it.",
          answer:[
            /the\s+book\s+(that|which)\s+you\s+recommended\s+is\s+on\s+the\s+desk/i,
            /the\s+book\s+you\s+recommended\s+is\s+on\s+the\s+desk/i
          ]
        }
      ]
    ],

    // ===== 9 =====  (ZMIANA: tekst z lukami + osobne pola)
    [
      "Dzień 9 – Kolokacje make/do/take/have",
      "Uzupełnij odpowiednim czasownikiem. Najpierw przeczytaj tekst, potem wpisz (1)–(6).",
      `<p><strong>Tekst (6 luk):</strong><br>
      To move forward this term, we need to (1) ___ progress and (2) ___ a decision about the project.
      Before you (3) ___ an exam, take a moment to (4) ___ a break. Everyone should (5) ___ responsibility
      for their part, and finally (6) ___ a look at the checklist.</p>`,
      [
        { type:"short", prompt:"(1)", answer:[/^\s*make\s*$/i] },
        { type:"short", prompt:"(2)", answer:[/^\s*make\s*$/i] },
        { type:"short", prompt:"(3)", answer:[/^\s*take\s*$/i] },
        { type:"short", prompt:"(4)", answer:[/^\s*take\s*$/i] },
        { type:"short", prompt:"(5)", answer:[/^\s*take\s*$/i] },
        { type:"short", prompt:"(6)", answer:[/^\s*have\s*$/i] }
      ]
    ],

    // ===== 10 =====
    [
      "Dzień 10 – Parafrazy warunkowe (formularz)",
      "Przepisz zdanie, zachowując sens.",
      `<ol>
        <li>Start now or you’ll miss the train. → <em>Unless …</em></li>
        <li>I didn’t know about the meeting, so I didn’t come. → <em>If … (III)</em></li>
        <li>He doesn’t study; that’s why he gets bad marks. → <em>If … (II)</em></li>
        <li>I advise you to call her. → <em>If I were …</em></li>
        <li>Finish your homework and you can go out. → <em>If … (I)</em></li>
      </ol>`,
      [
        { type:"short", prompt:"1) … (UNLESS)", answer:[/we\s+won['’]?t\s+miss\s+the\s+train\s+unless\s+we\s+start\s+now/i, /we\s+won['’]?t\s+catch\s+the\s+train\s+unless\s+we\s+start\s+now/i] },
        { type:"short", prompt:"2) … (III)",    answer:[/if\s+i\s+had\s+known\s+about\s+the\s+meeting,\s+i\s+would\s+have\s+come/i] },
        { type:"short", prompt:"3) … (II)",     answer:[/if\s+he\s+studied,\s+he\s+would\s+get\s+better\s+marks/i] },
        { type:"short", prompt:"4) …",          answer:[/if\s+i\s+were\s+you,\s+i['’]d\s+call\s+her/i, /if\s+i\s+were\s+you,\s+i\s+would\s+call\s+her/i] },
        { type:"short", prompt:"5) … (I)",      answer:[/if\s+you\s+finish\s+your\s+homework,\s+you\s+can\s+go\s+out/i] }
      ]
    ],

    // ===== 11 =====
    [
      "Dzień 11 – Artykuły i ilościowniki (listy rozwijane)",
      "Dobierz właściwy element do każdej luki.",
      `<p>Bank: a, an, the, some, any, much, many, few, little</p>
       <p>There aren’t ___ chairs, but there is ___ space. I have ___ idea: let’s bring ___ folding chairs. How ___ time do we have? Just ___ minutes and ___ people to help.</p>`,
      [
        {
          type:"match",
          left:[
            "There aren’t ___ chairs,",
            "but there is ___ space.",
            "I have ___ idea:",
            "let’s bring ___ folding chairs.",
            "How ___ time do we have?",
            "Just ___ minutes",
            "and ___ people to help."
          ],
          right:["a","an","the","some","any","much","many","few","little"],
          answer:[6,8,1,3,5,6,3]
        }
      ]
    ],

    // ===== 12 =====  (ZMIANA: tekst z lukami + osobne pola)
    [
      "Dzień 12 – Przyimki (8)",
      "Uzupełnij przyimki. Najpierw przeczytaj tekst, potem wpisz (1)–(8).",
      `<p><strong>Tekst (8 luk):</strong><br>
      Tom is very (1) ___ maths and always arrives (2) ___ the airport early. He can depend (3) ___ his sister,
      who is interested (4) ___ travel. (5) ___ Monday they will live (6) ___ a city for a month. He is afraid (7) ___ spiders,
      but he said “Congrats (8) ___ your success!” to his friend.</p>`,
      [
        { type:"short", prompt:"(1)", answer:[/^\s*at\s*$/i] },
        { type:"short", prompt:"(2)", answer:[/^\s*at\s*$/i] },
        { type:"short", prompt:"(3)", answer:[/^\s*on\s*$/i] },
        { type:"short", prompt:"(4)", answer:[/^\s*in\s*$/i] },
        { type:"short", prompt:"(5)", answer:[/^\s*on\s*$/i] },
        { type:"short", prompt:"(6)", answer:[/^\s*in\s*$/i] },
        { type:"short", prompt:"(7)", answer:[/^\s*of\s*$/i] },
        { type:"short", prompt:"(8)", answer:[/^\s*on\s*$/i] }
      ]
    ],

    // ===== 13 =====
    [
      "Dzień 13 – Szyk wyrazów (formularz)",
      "Ułóż poprawne zdanie z elementów.",
      `<ol>
        <li>rarely / we / go / do / hiking / winter / in</li>
        <li>were / by / we / impressed / the / performance</li>
        <li>enough / warm / the / wasn’t / jacket</li>
      </ol>`,
      [
        { type:"short", prompt:"1) …", answer:[/we\s+rarely\s+go\s+hiking\s+in\s+winter\./i] },
        { type:"short", prompt:"2) …", answer:[/we\s+were\s+impressed\s+by\s+the\s+performance\./i] },
        { type:"short", prompt:"3) …", answer:[/the\s+jacket\s+wasn['’]?t\s+warm\s+enough\./i] }
      ]
    ],

    // ===== 14 =====
    [
      "Dzień 14 – Writing: e-mail (80–100 słów)",
      "E-mail o nowym projekcie szkolnym.",
      `<p>Napisz e-mail (80–100 słów) do kolegi z zagranicy o nowym projekcie szkolnym: cel, twoja rola, co było trudne, plany na finał.</p>`
    ],

    // ===== 15 =====
    [
      "Dzień 15 – Writing: opiniotwórczy akapit (80–100)",
      "Temat: Homework ≤ 30 min dziennie.",
      `<p><strong>Temat:</strong> Homework should be limited to 30 minutes a day. Do you agree? (80–100 słów)</p>`
    ],

    // ===== 16 =====
    [
      "Dzień 16 – Czytanie (dopasowanie tytułów, listy rozwijane)",
      "Tekst o gap year (A–C) – dopasuj tytuły.",
      `<p>Tytuły: 1) Learning through travel 2) Budget problems 3) Skills for future work</p>
       <p>A) praktyczne uczenie się w podróży; B) finanse i ograniczenia; C) kompetencje na przyszłość.</p>`,
      [
        {
          type:"match",
          left:["A)","B)","C)"],
          right:["Learning through travel","Budget problems","Skills for future work"],
          answer:[0,1,2]
        }
      ]
    ],

    // ===== 17 =====
    [
      "Dzień 17 – Reported speech (formularz)",
      "Zmień na mowę zależną.",
      `<ol>
        <li>“I’ll help you tomorrow,” she said.</li>
        <li>“Don’t be late,” the teacher told us.</li>
        <li>“Where did you go?” he asked me.</li>
        <li>“I’m studying,” Tom said.</li>
        <li>“Let’s order pizza,” Anna suggested.</li>
      </ol>`,
      [
        { type:"short", prompt:"1) …", answer:[/she\s+said\s+\(that\)\s+she\s+would\s+help\s+me\s+the\s+next\s+day/i] },
        { type:"short", prompt:"2) …", answer:[/the\s+teacher\s+told\s+us\s+not\s+to\s+be\s+late/i] },
        { type:"short", prompt:"3) …", answer:[/he\s+asked\s+me\s+where\s+i\s+had\s+gone/i] },
        { type:"short", prompt:"4) …", answer:[/tom\s+said\s+\(that\)\s+he\s+was\s+studying/i] },
        { type:"short", prompt:"5) …", answer:[/anna\s+suggested\s+ordering\s+pizza/i] }
      ]
    ],

    // ===== 18 =====
    [
      "Dzień 18 – Strona bierna (formularz)",
      "Zmień zdania na stronę bierną.",
      `<ol>
        <li>They are building a new bridge.</li>
        <li>Someone stole my bike yesterday.</li>
        <li>People speak English worldwide.</li>
        <li>They will announce the results tomorrow.</li>
        <li>They have cancelled the match.</li>
      </ol>`,
      [
        { type:"short", prompt:"1) …", answer:[/a\s+new\s+bridge\s+is\s+being\s+built/i] },
        { type:"short", prompt:"2) …", answer:[/my\s+bike\s+was\s+stolen\s+yesterday/i] },
        { type:"short", prompt:"3) …", answer:[/english\s+is\s+spoken\s+worldwide/i] },
        { type:"short", prompt:"4) …", answer:[/the\s+results\s+will\s+be\s+announced\s+tomorrow/i] },
        { type:"short", prompt:"5) …", answer:[/the\s+match\s+has\s+been\s+cancelled/i] }
      ]
    ],

    // ===== 19 =====
    [
      "Dzień 19 – Relative clauses (formularz)",
      "Połącz zdania, skracając powtórzenia.",
      `<ol>
        <li>I met a singer. The singer won a talent show.</li>
        <li>She visited a town. The town is famous for its castle.</li>
        <li>We stayed in a hostel. It was cheap and clean.</li>
      </ol>`,
      [
        { type:"short", prompt:"1) …", answer:[/i\s+met\s+a\s+singer\s+who\s+won\s+a\s+talent\s+show/i] },
        { type:"short", prompt:"2) …", answer:[/she\s+visited\s+a\s+town\s+which\s+is\s+famous\s+for\s+its\s+castle/i, /that\s+is\s+famous\s+for\s+its\s+castle/i] },
        { type:"short", prompt:"3) …", answer:[/we\s+stayed\s+in\s+a\s+hostel\s+which\s+was\s+cheap\s+and\s+clean/i, /that\s+was\s+cheap\s+and\s+clean/i] }
      ]
    ],

    // ===== 20 =====
    [
      "Dzień 20 – Modalne (wnioskowanie w past, formularz)",
      "Uzupełnij: must/can’t/may/might + have + III.",
      `<ol>
        <li>The lights are off – they ___ (leave) already.</li>
        <li>He looks tired – he ___ (study) all night.</li>
        <li>That story is false – you ___ (mishear) it.</li>
        <li>I’m not sure – she ___ (forget) the meeting.</li>
        <li>The ground is wet – it ___ (rain).</li>
      </ol>`,
      [
        { type:"short", prompt:"1) …", answer:[/must\s+have\s+left/i] },
        { type:"short", prompt:"2) …", answer:[/might\s+have\s+studied/i, /may\s+have\s+studied/i, /must\s+have\s+studied/i] },
        { type:"short", prompt:"3) …", answer:[/can['’]?t\s+have\s+heard\s+it\s+right/i, /can['’]?t\s+have\s+misheard/i] },
        { type:"short", prompt:"4) …", answer:[/might\s+have\s+forgotten/i, /may\s+have\s+forgotten/i] },
        { type:"short", prompt:"5) …", answer:[/must\s+have\s+rained/i] }
      ]
    ],

    // ===== 21 =====  (ZMIANA: tekst z lukami + osobne pola)
    [
      "Dzień 21 – Słowotwórstwo (w zdaniach)",
      "Uzupełnij 6 luk formą od: legal, happy, honesty, danger, employ, predict.",
      `<p><strong>Tekst (6 luk):</strong><br>
      It’s (1) ___ to ride a bike without lights at night. She gave a very (2) ___ answer during the interview,
      and the new policy improved (3) ___ rates in the region. The weather here is so (4) ___ that plans often change.
      The contract isn’t (5) ___ yet, but he seemed genuinely (6) ___ with the results.</p>`,
      [
        { type:"short", prompt:"(1)", answer:[/^\s*dangerous\s*$/i] },
        { type:"short", prompt:"(2)", answer:[/^\s*honest\s*$/i] },
        { type:"short", prompt:"(3)", answer:[/^\s*employment\s*$/i] },
        { type:"short", prompt:"(4)", answer:[/^\s*unpredictable\s*$/i] },
        { type:"short", prompt:"(5)", answer:[/^\s*legal\s*$/i] },
        { type:"short", prompt:"(6)", answer:[/^\s*happy\s*$/i] }
      ]
    ],

    // ===== 22 =====
    [
      "Dzień 22 – Easily confused words (MCQ)",
      "Wybierz właściwe słowo w zdaniu.",
      `<p>W każdym zdaniu wybierz jedną opcję.</p>`,
      [
        { type:"mcq", prompt:"Could you ___ me your pen?", options:["say","tell","lend","borrow"], answer:2 },
        { type:"mcq", prompt:"I can’t stop ___ about the exam.", options:["remembering","reminding"], answer:0 },
        { type:"mcq", prompt:"He’s looking for a new ___.", options:["job","work"], answer:0 },
        { type:"mcq", prompt:"Be ___; that’s too risky.", options:["sensible","sensitive"], answer:0 },
        { type:"mcq", prompt:"We need a more ___ car.", options:["economic","economical"], answer:1 },
        { type:"mcq", prompt:"Please ___ me what to do.", options:["say","tell"], answer:1 }
      ]
    ],

    // ===== 23 =====  (ZMIANA: tekst z lukami + osobne pola)
    [
      "Dzień 23 – Phrasal “get”",
      "Uzupełnij odpowiednią frazą: get over / get along (with) / get away (with) / get by / get into / get rid of.",
      `<p><strong>Tekst (6 luk):</strong><br>
      We can hardly (1) ___ our noisy neighbours. On a small budget, we somehow (2) ___.
      Last year she finally (3) ___ her fear of flying. He once tried to (4) ___ cheating in a test, but failed.
      I still can’t (5) ___ this old sofa, and I first (6) ___ astronomy at school.</p>`,
      [
        { type:"short", prompt:"(1)", answer:[/^\s*get\s+along\s+with\s*$/i] },
        { type:"short", prompt:"(2)", answer:[/^\s*get\s+by\s*$/i] },
        { type:"short", prompt:"(3)", answer:[/^\s*get\s+over\s*$/i] },
        { type:"short", prompt:"(4)", answer:[/^\s*get\s+away\s+with\s*$/i] },
        { type:"short", prompt:"(5)", answer:[/^\s*get\s+rid\s+of\s*$/i] },
        { type:"short", prompt:"(6)", answer:[/^\s*get\s+into\s*$/i] }
      ]
    ],

    // ===== 24 =====
    [
      "Dzień 24 – Mini-revision (10 pytań, mix)",
      "Szybkie sprawdzenie różnych działów.",
      `<p>Wpisz/wybierz odpowiedzi.</p>`,
      [
        { type:"short", prompt:"1) They have closed the road. → (Passive)", answer:[/the\s+road\s+has\s+been\s+closed/i] },
        { type:"short", prompt:"2) (II) If he ___ (study) more, he ___ (pass).", answer:[/if\s+he\s+studied,\s+he\s+would\s+pass/i] },
        { type:"short", prompt:"3) “Don’t smoke,” the sign said. → The sign …", answer:[/the\s+sign\s+said\s+not\s+to\s+smoke/i] },
        { type:"short", prompt:"4) He is perfectly ___ (able) to do it.", answer:[/able/i, /capable/i] },
        { type:"short", prompt:"5) depend ___", answer:[/on/i] },
        { type:"mcq",  prompt:"6) I saw ___ interesting idea.", options:["a","an","the"], answer:1 },
        { type:"short", prompt:"7) He isn’t here — he ___ (leave).", answer:[/must\s+have\s+left/i] },
        { type:"mcq",  prompt:"8) The man ___ lives next door is a pilot.", options:["which","who","whom"], answer:1 },
        { type:"mcq",  prompt:"9) ___ a decision", options:["make","do","take","have"], answer:0 },
        { type:"short", prompt:"10) He no longer smokes. → He ___", answer:[/he\s+used\s+to\s+smoke\./i] }
      ]
    ]
  ],

  // ====== ROZSZERZENIE (adv) — tytuły BEZ prefiksu „Dzień …” ======
  adv: [
    // ---- 1. KWT ----
    [
      "Key Word Transformations",
      "2–5 wyrazów; nie zmieniaj podanego słowa.",
      `<ol>
        <li>The last time I saw Anna was in May. <em>(SEEN)</em></li>
        <li>It wasn’t necessary for you to buy a ticket. <em>(NEEDN’T)</em></li>
        <li>“Remember to lock the door,” she said. <em>(REMINDED)</em></li>
        <li>I started working here three years ago. <em>(FOR)</em></li>
        <li>They will probably cancel the meeting. <em>(LIKELY)</em></li>
      </ol>`,
      [
        { type:"short", prompt:"1) … (SEEN)",   answer:[/haven['’]t\s+seen\s+anna\s+since\s+may/i, /have\s+not\s+seen\s+anna\s+since\s+may/i] },
        { type:"short", prompt:"2) … (NEEDN’T)",answer:[/needn['’]?t\s+have\s+bought\s+a\s+ticket/i, /did\s+not\s+need\s+to\s+buy\s+a\s+ticket/i] },
        { type:"short", prompt:"3) … (REMINDED)",answer:[/reminded\s+(me|us)\s+to\s+lock\s+the\s+door/i] },
        { type:"short", prompt:"4) … (FOR)",    answer:[/have\s+worked\s+here\s+for\s+three\s+years/i, /have\s+been\s+working\s+here\s+for\s+three\s+years/i] },
        { type:"short", prompt:"5) … (LIKELY)", answer:[/it\s+is\s+likely\s+that\s+they\s+will\s+cancel\s+the\s+meeting/i, /they\s+are\s+likely\s+to\s+cancel\s+the\s+meeting/i] }
      ]
    ],

    // ---- 2. Open cloze ----  (ZMIANA: tekst z lukami + osobne pola)
    [
      "Open cloze (8 luk)",
      "Zaawansowane linkery i struktury. Przeczytaj tekst, potem wpisz (1)–(8).",
      `<p><strong>Tekst (8 luk):</strong><br>
      Not only (1) ___ students benefit (2) ___ group projects, but teachers (3) ___ find them easier to assess.
      Working in teams helps learners take (4) ___ responsibility and share ideas. There is, (5) ___, a risk that some may do less work.
      To prevent this, teachers can check progress (6) ___ regular intervals. If deadlines are missed, the group (7) ___ be asked to reflect
      on what went wrong and how to improve (8) ___ future.</p>`,
      [
        { type:"short", prompt:"(1)", answer:[/^\s*do\s*$/i] },
        { type:"short", prompt:"(2)", answer:[/^\s*from\s*$/i] },
        { type:"short", prompt:"(3)", answer:[/^\s*also\s*$/i] },
        { type:"short", prompt:"(4)", answer:[/^\s*on\s*$/i] },
        { type:"short", prompt:"(5)", answer:[/^\s*however\s*$/i] },
        { type:"short", prompt:"(6)", answer:[/^\s*at\s*$/i] },
        { type:"short", prompt:"(7)", answer:[/^\s*may\s*$/i] },
        { type:"short", prompt:"(8)", answer:[/^\s*in\s*$/i] }
      ]
    ],

    // ---- 3. Word formation (8) ----  (ZMIANA: tekst z lukami + osobne pola)
    [
      "Word formation (8)",
      "Uzupełnij jednym słowem utworzonym od podanego w nawiasie. Przeczytaj tekst, potem wpisz (1)–(8).",
      `<p><strong>Tekst (8 luk):</strong><br>
      The speaker was highly (1) ___ (persuade), offering clear (2) ___ (compare) with previous years.
      As a respected (3) ___ (profession), she showed strong (4) ___ (lead). New members are (5) ___ (rely)
      on the training team, but there is a (6) ___ (short) of mentors. The policy is (7) ___ (benefit) to students
      and avoids (8) ___ (waste) of resources.</p>`,
      [
        { type:"short", prompt:"(1)", answer:[/^\s*persuasive\s*$/i] },
        { type:"short", prompt:"(2)", answer:[/^\s*comparison\s*$/i] },
        { type:"short", prompt:"(3)", answer:[/^\s*professional\s*$/i] },
        { type:"short", prompt:"(4)", answer:[/^\s*leadership\s*$/i] },
        { type:"short", prompt:"(5)", answer:[/^\s*reliant\s*$/i] },
        { type:"short", prompt:"(6)", answer:[/^\s*shortage\s*$/i] },
        { type:"short", prompt:"(7)", answer:[/^\s*beneficial\s*$/i] },
        { type:"short", prompt:"(8)", answer:[/^\s*wasteful\s*$/i] }
      ]
    ],

    // ---- 4. Multiple-choice cloze ----
    [
      "Multiple-choice cloze (A–D)",
      "Wybierz A–D dla każdej luki.",
      `<p>Many museums follow a growing ___ (1) towards “pay-what-you-want” days. The policy aims to ___ (2) visitors who might otherwise stay away. Critics claim it could ___ (3) revenues, yet early data seems to ___ (4) that attendance increases while income remains ___ (5). What truly ___ (6), directors argue, is access.</p>`,
      [
        { type:"mcq", prompt:"(1) Many museums follow a growing ___ towards …", options:["A trend","B drift","C leaning","D bend"], answer:0 },
        { type:"mcq", prompt:"(2) The policy aims to ___ visitors …",         options:["A attract","B attach","C attain","D attend"], answer:0 },
        { type:"mcq", prompt:"(3) Critics claim it could ___ revenues …",       options:["A undermine","B understate","C undergo","D undertake"], answer:0 },
        { type:"mcq", prompt:"(4) … data seems to ___ that attendance …",       options:["A suggest","B assume","C pretend","D propose"], answer:0 },
        { type:"mcq", prompt:"(5) … income remains ___",                        options:["A stable","B steady","C static","D still"], answer:1 },
        { type:"mcq", prompt:"(6) What truly ___, directors argue, is access.", options:["A matters","B counts","C weighs","D means"], answer:0 }
      ]
    ],

    // ---- 5. Inwersja ----
    [
      "Inwersja (przepisz)",
      "Zastosuj inwersję w zdaniach.",
      `<ol>
        <li>I had hardly sat down when the phone rang.</li>
        <li>We had no sooner reached the station than the train left.</li>
        <li>I only later realised my mistake.</li>
        <li>If you should need help, call me. (zacznij od <em>Should…</em>)</li>
        <li>You will under no circumstances share this information.</li>
      </ol>`,
      [
        { type:"short", prompt:"1) …", answer:[/hardly\s+had\s+i\s+sat\s+down\s+when\s+the\s+phone\s+rang/i] },
        { type:"short", prompt:"2) …", answer:[/no\s+sooner\s+had\s+we\s+reached\s+the\s+station\s+than\s+the\s+train\s+left/i] },
        { type:"short", prompt:"3) …", answer:[/only\s+later\s+did\s+i\s+realise/i, /only\s+later\s+did\s+i\s+realize/i] },
        { type:"short", prompt:"4) …", answer:[/should\s+you\s+need\s+help,\s+call\s+me/i] },
        { type:"short", prompt:"5) …", answer:[/under\s+no\s+circumstances\s+(will\s+you|are\s+you\s+to)\s+share\s+this\s+information/i] }
      ]
    ],

    // ---- 6. Cleft sentences ----
    [
      "Cleft sentences",
      "What… was / It was … that/who.",
      `<ol>
        <li>I noticed the timing of their announcement.</li>
        <li>We need transparency, not promises.</li>
        <li>Maria helped me most.</li>
        <li>He failed because of poor planning.</li>
      </ol>`,
      [
        { type:"short", prompt:"1) …", answer:[/what\s+i\s+noticed\s+was\s+the\s+timing/i, /it\s+was\s+the\s+timing.*that\s+i\s+noticed/i] },
        { type:"short", prompt:"2) …", answer:[/what\s+we\s+need\s+is\s+transparency/i, /it\s+is\s+transparency\s+that\s+we\s+need/i] },
        { type:"short", prompt:"3) …", answer:[/it\s+was\s+maria\s+who\s+helped\s+me\s+most/i, /the\s+one\s+who\s+helped\s+me\s+most\s+was\s+maria/i] },
        { type:"short", prompt:"4) …", answer:[/it\s+was\s+because\s+of\s+poor\s+planning\s+that\s+he\s+failed/i, /what\s+made\s+him\s+fail\s+was\s+poor\s+planning/i] }
      ]
    ],

    // ---- 7. Tłumaczenia fragmentów ----
    [
      "Tłumaczenie fragmentów (PL→EN)",
      "Wstaw brakujący fragment po angielsku.",
      `<ol>
        <li>I regret <em>(że nie poszedłem)</em> to the meeting.</li>
        <li>She insisted <em>(żebyśmy spotkali się)</em> at noon.</li>
        <li>It’s high time <em>(żebyś posprzątał)</em> your room.</li>
        <li>They had their house <em>(pomalowany)</em> last year.</li>
        <li>He denied <em>(że to była jego wina)</em>.</li>
      </ol>`,
      [
        { type:"short", prompt:"1) …", answer:[/i\s+regret\s+not\s+going\s+to\s+the\s+meeting/i, /i\s+regret\s+not\s+having\s+gone/i] },
        { type:"short", prompt:"2) …", answer:[/she\s+insisted\s+that\s+we\s+meet\s+at\s+noon/i, /she\s+insisted\s+on\s+meeting\s+at\s+noon/i] },
        { type:"short", prompt:"3) …", answer:[/it['’]s\s+high\s+time\s+you\s+cleaned\s+your\s+room/i] },
        { type:"short", prompt:"4) …", answer:[/they\s+(had|got)\s+their\s+house\s+painted\s+last\s+year/i] },
        { type:"short", prompt:"5) …", answer:[/he\s+denied\s+\(that\)\s+it\s+was\s+his\s+fault/i] }
      ]
    ],

    // ---- 8. Kolokacje/idiomy (dropdown) ----
    [
      "Kolokacje/idiomy (dopasuj)",
      "Dopasuj A ↔ B (listy rozwijane).",
      `<p>Wybierz najlepszy odpowiednik znaczeniowy.</p>`,
      [
        {
          type:"match",
          left:["bear in mind","by and large","on the brink of","set the record straight","take sth for granted","with a view to"],
          right:["generally speaking","correct a false account","keep in memory","assume as obvious","intending to","close to starting"],
          answer:[2,0,5,1,3,4]
        }
      ]
    ],

    // ---- 9. Korekta błędów (popraw) ----
    [
      "Korekta błędów (1 błąd)",
      "Popraw jedno błędne miejsce w każdym zdaniu.",
      `<ol>
        <li>He suggested me to start earlier.</li>
        <li>Despite of the rain, we continued.</li>
        <li>Hardly I had arrived when they called.</li>
        <li>Not only he lied but also he stole.</li>
        <li>She’s responsible of the report.</li>
        <li>I look forward to see you.</li>
      </ol>`,
      [
        { type:"short", prompt:"1) …", answer:[/he\s+suggested\s+starting\s+earlier/i, /he\s+suggested\s+that\s+i\s+start\s+earlier/i] },
        { type:"short", prompt:"2) …", answer:[/despite\s+the\s+rain,\s+we\s+continued/i, /in\s+spite\s+of\s+the\s+rain,\s+we\s+continued/i] },
        { type:"short", prompt:"3) …", answer:[/hardly\s+had\s+i\s+arrived\s+when\s+they\s+called/i] },
        { type:"short", prompt:"4) …", answer:[/not\s+only\s+did\s+he\s+lie\s+but\s+he\s+also\s+stole/i] },
        { type:"short", prompt:"5) …", answer:[/responsible\s+for\s+the\s+report/i] },
        { type:"short", prompt:"6) …", answer:[/look\s+forward\s+to\s+seeing\s+you/i] }
      ]
    ],

    // ---- 10. Przyimki zaawansowane (dropdown) ----
    [
      "Przyimki zaawansowane",
      "from/of/to/on/with/at/for/between.",
      `<p>Uzupełnij właściwym przyimkiem.</p>`,
      [
        {
          type:"match",
          left:["immune ___","confident ___","keen ___","at odds ___","conducive ___","liable ___","relevant ___","a compromise ___"],
          right:["from","of","to","on","with","at","for","between"],
          answer:[2,1,3,4,2,6,2,7]
        }
      ]
    ],

    // ---- 11. Wzorce czasownikowe ----  (ZMIANA: tekst z lukami + osobne pola)
    [
      "Wzorce czasownikowe",
      "Uzupełnij poprawną formą. Przeczytaj tekst, potem wpisz (1)–(6).",
      `<p><strong>Tekst (6 luk):</strong><br>
      I’d rather you (1) ___ here. She prevented me (2) ___ the lab, and I remember (3) ___ her at the conference.
      We regret (4) ___ you that your application was unsuccessful. You had better (5) ___ the figures,
      and he made us (6) ___ outside.</p>`,
      [
        { type:"short", prompt:"(1)", answer:[/^\s*didn['’]?t\s+smoke\s*$/i] },
        { type:"short", prompt:"(2)", answer:[/^\s*from\s+entering\s*$/i] },
        { type:"short", prompt:"(3)", answer:[/^\s*meeting\s*$/i] },
        { type:"short", prompt:"(4)", answer:[/^\s*to\s+inform\s*$/i] },
        { type:"short", prompt:"(5)", answer:[/^\s*double-?check\s*$/i] },
        { type:"short", prompt:"(6)", answer:[/^\s*wait\s*$/i] }
      ]
    ],

    // ---- 12. Participle / reduced relative ----
    [
      "Participle / reduced relative",
      "Zredukuj zgodnie ze wzorem.",
      `<p>0) Because he felt unwell, he left early. → <em>Feeling unwell, he left early.</em></p>
       <ol>
        <li>Students who wish to apply must submit a CV.</li>
        <li>As I didn’t know the rules, I asked for help.</li>
        <li>People who live in the area oppose the plan.</li>
        <li>Since it was finished, the report was sent.</li>
        <li>Anyone who interested me should email.</li>
       </ol>`,
      [
        { type:"short", prompt:"1) …", answer:[/students\s+wishing\s+to\s+apply\s+must\s+submit\s+a\s+cv/i] },
        { type:"short", prompt:"2) …", answer:[/(not\s+knowing|since\s+i\s+didn['’]?t\s+know)\s+the\s+rules,\s+i\s+asked\s+for\s+help/i] },
        { type:"short", prompt:"3) …", answer:[/people\s+living\s+in\s+the\s+area\s+oppose\s+the\s+plan/i] },
        { type:"short", prompt:"4) …", answer:[/(when|once)\s+finished,\s+the\s+report\s+was\s+sent/i] },
        { type:"short", prompt:"5) …", answer:[/anyone\s+interested\s+should\s+email/i] }
      ]
    ],

    // ---- 13. Reported speech + passive ----
    [
      "Reported speech (+ passive)",
      "Przepisz, gdzie wskazano użyj strony biernej.",
      `<ol>
        <li>“They are redesigning the website now,” she said.</li>
        <li>“Don’t touch anything,” the technician told us.</li>
        <li>“Where have you been?” he asked me.</li>
        <li>People say he is a brilliant negotiator. <em>(użyj is said to)</em></li>
        <li>It is believed that the policy reduced costs. <em>(forma bezosobowa)</em></li>
      </ol>`,
      [
        { type:"short", prompt:"1) …", answer:[/she\s+said\s+\(that\)\s+they\s+were\s+redesigning\s+the\s+website\s+(then|at\s+that\s+time)/i] },
        { type:"short", prompt:"2) …", answer:[/the\s+technician\s+told\s+us\s+not\s+to\s+touch\s+anything/i] },
        { type:"short", prompt:"3) …", answer:[/he\s+asked\s+me\s+where\s+i\s+had\s+been/i] },
        { type:"short", prompt:"4) …", answer:[/he\s+is\s+said\s+to\s+be\s+a\s+brilliant\s+negotiator/i] },
        { type:"short", prompt:"5) …", answer:[/the\s+policy\s+is\s+believed\s+to\s+have\s+reduced\s+costs/i, /it\s+is\s+believed\s+that\s+the\s+policy\s+reduced\s+costs/i] }
      ]
    ],

    // ---- 14. Mixed conditionals / inwersja ----
    [
      "Mixed conditionals / inwersja",
      "Przepisz zgodnie z poleceniem.",
      `<ol>
        <li>I didn’t study; that’s why I’m underprepared now. → (III→II mix)</li>
        <li>If you should see Tom, tell him to call. (zacznij od <em>Should…</em>)</li>
        <li>If I were you, I would reconsider. (inwersja <em>Were…</em>)</li>
        <li>I’m not tall, so I didn’t become a pilot. (II→III mix)</li>
        <li>Only if you agree will we proceed. (przepisz na zwykłe zdanie warunkowe)</li>
      </ol>`,
      [
        { type:"short", prompt:"1) …", answer:[/if\s+i\s+had\s+studied,\s+i\s+would\s+be\s+better\s+prepared\s+now/i] },
        { type:"short", prompt:"2) …", answer:[/should\s+you\s+see\s+tom,\s+tell\s+him\s+to\s+call/i] },
        { type:"short", prompt:"3) …", answer:[/were\s+i\s+you,\s+i\s+would\s+reconsider/i] },
        { type:"short", prompt:"4) …", answer:[/if\s+i\s+were\s+taller,\s+i\s+would\s+have\s+become\s+a\s+pilot/i] },
        { type:"short", prompt:"5) …", answer:[/if\s+you\s+agree,\s+we\s+will\s+proceed/i] }
      ]
    ],

    // ---- 15. Passive / causatives ----
    [
      "Passive / causatives",
      "Strona bierna, czasowniki raportujące, causatives.",
      `<ol>
        <li>They say the company will expand. <em>(is expected to)</em></li>
        <li>Someone had cleaned the room before we arrived. <em>(passive past perfect)</em></li>
        <li>I’ll have the documents translated. <em>(zachowaj sens)</em></li>
        <li>They made us repeat the experiment. <em>(passive)</em></li>
        <li>People believe the painting is priceless. <em>(reporting passive)</em></li>
      </ol>`,
      [
        { type:"short", prompt:"1) …", answer:[/the\s+company\s+is\s+expected\s+to\s+expand/i] },
        { type:"short", prompt:"2) …", answer:[/the\s+room\s+had\s+been\s+cleaned\s+before\s+we\s+arrived/i] },
        { type:"short", prompt:"3) …", answer:[/i\s+(will|’ll)\s+(have|get)\s+the\s+documents\s+translated/i] },
        { type:"short", prompt:"4) …", answer:[/we\s+were\s+made\s+to\s+repeat\s+the\s+experiment/i] },
        { type:"short", prompt:"5) …", answer:[/the\s+painting\s+is\s+believed\s+to\s+be\s+priceless/i] }
      ]
    ],

    // ---- 16. Linkers ----  (ZMIANA: tekst z lukami + osobne pola)
    [
      "Linkers (6 luk)",
      "Uzupełnij tekst spójnikami. Przeczytaj, potem wpisz (1)–(6).",
      `<p><strong>Tekst (6 luk):</strong><br>
      (1) ___ the project was well planned, delays occurred. (2) ___ the bad weather, we continued.
      The team was tired; (3) ___, they finished on time. The budget increased; (4) ___, we had to cut extra features.
      Adam prefers remote work, (5) ___ Marta enjoys the office. The results were not perfect; (6) ___, the client was satisfied.</p>`,
      [
        { type:"short", prompt:"(1)", answer:[/^\s*although\s*$/i] },
        { type:"short", prompt:"(2)", answer:[/^\s*despite\s*$/i] },
        { type:"short", prompt:"(3)", answer:[/^\s*however\s*$/i] },
        { type:"short", prompt:"(4)", answer:[/^\s*therefore\s*$/i] },
        { type:"short", prompt:"(5)", answer:[/^\s*whereas\s*$/i] },
        { type:"short", prompt:"(6)", answer:[/^\s*nevertheless\s*$/i] }
      ]
    ],

    // ---- 17. Wish / If only / It’s time / I’d rather ----
    [
      "Wish / If only / It’s (high) time / I’d rather",
      "Przepisz zdania, używając wskazanych struktur.",
      `<ol>
        <li>I don’t know the answer now. → <em>(wish)</em></li>
        <li>You never call me. → <em>(if only)</em></li>
        <li>It’s late; you should go to bed. → <em>(It’s high time)</em></li>
        <li>I prefer you didn’t smoke here. → <em>(I’d rather)</em></li>
        <li>We didn’t take an umbrella and now we’re wet. → <em>(wish + past perfect)</em></li>
      </ol>`,
      [
        { type:"short", prompt:"1) …", answer:[/i\s+wish\s+i\s+knew\s+the\s+answer/i] },
        { type:"short", prompt:"2) …", answer:[/if\s+only\s+you\s+called\s+me/i] },
        { type:"short", prompt:"3) …", answer:[/it['’]s\s+high\s+time\s+you\s+went\s+to\s+bed/i] },
        { type:"short", prompt:"4) …", answer:[/i['’]d\s+rather\s+you\s+didn['’]?t\s+smoke\s+here/i] },
        { type:"short", prompt:"5) …", answer:[/i\s+wish\s+we\s+had\s+taken\s+an\s+umbrella/i] }
      ]
    ],

    // ---- 18. Phrasal verbs (zaaw.) ----  (ZMIANA: tekst z lukami + osobne pola)
    [
      "Phrasal verbs (zaawans.)",
      "Uzupełnij brakujące frazy. Przeczytaj tekst, potem wpisz (1)–(6).",
      `<p><strong>Tekst (6 luk):</strong><br>
      Their plan (1) ___ when funding was cut. Before launch, we must (2) ___ the remaining issues.
      Eventually, the team (3) ___ a workable prototype, which should (4) ___ real change.
      How did we (5) ___ spending so much? Investigators tried to (6) ___ the cause.</p>
      <p><em>Bank:</em> iron out / fall through / zero in on / wind up / come up with / bring about</p>`,
      [
        { type:"short", prompt:"(1)", answer:[/^\s*fell\s+through\s*$/i] },
        { type:"short", prompt:"(2)", answer:[/^\s*iron\s+out\s*$/i] },
        { type:"short", prompt:"(3)", answer:[/^\s*came\s+up\s+with\s*$/i] },
        { type:"short", prompt:"(4)", answer:[/^\s*bring\s+about\s*$/i] },
        { type:"short", prompt:"(5)", answer:[/^\s*wind\s+up\s*$/i] },
        { type:"short", prompt:"(6)", answer:[/^\s*zero\s+in\s+on\s*$/i] }
      ]
    ],

    // ---- 19. Rejestr formalny ----
    [
      "Rejestr formalny",
      "Podmień podkreślone na formalne.",
      `<ol>
        <li>We <u>got</u> your email.</li>
        <li><u>A lot of</u> students complained.</li>
        <li>Please <u>help us</u> with the survey.</li>
        <li>We will <u>deal with</u> your request soon.</li>
        <li>The results <u>show</u> a clear trend.</li>
        <li><u>Kids</u> shouldn’t use this device.</li>
      </ol>`,
      [
        { type:"short", prompt:"1) …", answer:[/we\s+received\s+your\s+email/i] },
        { type:"short", prompt:"2) …", answer:[/(many|a\s+large\s+number\s+of)\s+students\s+complained/i] },
        { type:"short", prompt:"3) …", answer:[/please\s+assist\s+us\s+with\s+the\s+survey/i] },
        { type:"short", prompt:"4) …", answer:[/we\s+will\s+address\s+your\s+request\s+soon/i] },
        { type:"short", prompt:"5) …", answer:[/the\s+results\s+indicate\s+a\s+clear\s+trend/i, /demonstrate\s+a\s+clear\s+trend/i] },
        { type:"short", prompt:"6) …", answer:[/children\s+shouldn['’]?t\s+use\s+this\s+device/i] }
      ]
    ],

    // ---- 20. Reading: match headings ----
    [
      "Reading: match headings (A–C)",
      "Dobierz tytuły 1–3 do A–C.",
      `<p><strong>Tekst:</strong></p>
       <p><strong>A)</strong> Free-entry days attract new audiences but require careful queue management and scheduling.</p>
       <p><strong>B)</strong> Volunteers guide visitors, answer questions and promote cultural engagement in their communities.</p>
       <p><strong>C)</strong> A balanced model mixing ticket sales, donations and public grants keeps programmes sustainable.</p>
       <p><strong>Tytuły:</strong> 1) Funding the arts smartly 2) Why access matters more than price 3) Volunteers as cultural ambassadors</p>`,
      [
        {
          type:"match",
          left:["A)","B)","C)"],
          right:["Funding the arts smartly","Why access matters more than price","Volunteers as cultural ambassadors"],
          answer:[1,2,0]
        }
      ]
    ],

    // ---- 21. Writing: proposal ----
    [
      "Writing: formal proposal (120–150)",
      "Forma wypowiedzi maturalnej (poziom rozszerzony).",
      `<p>Napisz formalną propozycję (120–150 słów) dotyczącą uruchomienia szkolnego podcastu: <em>cel, format, korzyści, harmonogram</em>. Zadbaj o styl formalny, akapity i spójne linkery.</p>`
    ],

    // ---- 22. Writing: review ----
    [
      "Writing: review (120–150)",
      "Forma wypowiedzi maturalnej (poziom rozszerzony).",
      `<p>Napisz recenzję (120–150 słów) książki lub filmu wartego polecenia maturzystom. Uwzględnij tezę, dwa argumenty z przykładami oraz końcową ocenę. Zachowaj styl odpowiedni dla recenzji.</p>`
    ],

    // ---- 23. Fixed phrases (short) ----
    [
      "Fixed phrases (2–5 wyrazów)",
      "Ukończ drugie zdanie; zawrzyj podane słowo.",
      `<ol>
        <li>Provided that you study, you’ll pass. <em>(LONG)</em></li>
        <li>Immediately after he arrived, he called me. <em>(MOMENT)</em></li>
        <li>Such opportunities rarely occur. <em>(FEW)</em></li>
        <li>You can borrow the car only if you fill it up. <em>(CONDITION)</em></li>
        <li>He started speaking and she interrupted. <em>(SOONER)</em></li>
      </ol>`,
      [
        { type:"short", prompt:"1) … (LONG)",     answer:[/as\s+long\s+as\s+you\s+study,\s*you['’]ll\s+pass/i] },
        { type:"short", prompt:"2) … (MOMENT)",   answer:[/the\s+moment\s+he\s+arrived,\s*he\s+called\s+me/i] },
        { type:"short", prompt:"3) … (FEW)",      answer:[/such\s+opportunities\s+are\s+few\s+and\s+far\s+between/i] },
        { type:"short", prompt:"4) … (CONDITION)",answer:[/you\s+can\s+borrow\s+the\s+car\s+on\s+(the\s+)?condition\s+that\s+you\s+fill\s+it\s+up/i] },
        { type:"short", prompt:"5) … (SOONER)",   answer:[/no\s+sooner\s+had\s+he\s+started\s+speaking\s+than\s+she\s+interrupted/i] }
      ]
    ],

    // ---- 24. Mini revision (9+pisanie) ----
    [
      "Mini revision (9 + zadanie pisemne)",
      "Zestaw krótkich punktów kontrolnych + polecenie pisemne.",
      `<p>1–9: wpisz/wybierz odpowiedź. 10: krótka forma pisemna.</p>
       <p><strong>10) Zadanie pisemne:</strong> Napisz 80–100 słów: <em>Opisz sytuację, gdy musiałeś/musiałaś zmienić plan w ostatniej chwili</em> (powód, reakcja, rezultat, wnioski). Styl półformalny.</p>`,
      [
        { type:"short", prompt:"1) They will complete the bridge by June. → (Passive, future perfect)", answer:[/the\s+bridge\s+will\s+have\s+been\s+completed\s+by\s+june/i] },
        { type:"short", prompt:"2) We understood the problem only after we ran more tests. → Only after …", answer:[/only\s+after\s+we\s+had\s+run\s+more\s+tests\s+did\s+we\s+understand\s+the\s+problem/i] },
        { type:"short", prompt:"3) I don’t have more time. → I wish …", answer:[/i\s+wish\s+i\s+had\s+more\s+time/i] },
        { type:"cloze", prompt:"4) They let us ___ early. (enter)", answer:["enter"] },
        { type:"mcq",  prompt:"5) The solution is simple; ___, it’s hard to implement.", options:["however","therefore","moreover"], answer:0 },
        { type:"cloze", prompt:"6) ___ odds ___", answer:["at","with"] },
        { type:"short", prompt:"7) People believe the plan is effective. → The plan …", answer:[/the\s+plan\s+is\s+believed\s+to\s+be\s+effective/i] },
        { type:"mcq",  prompt:"8) ___ a deadline", options:["meet","make","keep","reach"], answer:0 },
        { type:"mcq",  prompt:"9) Please ___ in touch if you have questions.", options:["contact","get","obtain","receive"], answer:0 }
      ]
    ]
  ]
};
