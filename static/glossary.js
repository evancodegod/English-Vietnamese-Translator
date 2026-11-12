/* Grammar search: type-ahead over a Vietnamese grammar glossary plus the terms in the current AI Deep Dive.
   Everything is rendered with textContent / DOM nodes, never innerHTML. */
(function (root) {
  "use strict";

  // [term, category, definition, example, aliases[]]
  const G = [
    ["Thanh điệu", "Tone", "Vietnamese is tonal: the pitch pattern of a syllable changes the word. Northern Vietnamese has six tones, written with diacritics on the vowel.", "ma, má, mà, mả, mã, mạ are six different words.", ["tone", "tones", "tonal", "tone marks", "dấu thanh", "pitch"]],
    ["Thanh ngang", "Tone", "Level tone (no mark). Mid, flat and steady.", "ma (ghost)", ["level tone", "flat tone", "ngang", "no tone mark"]],
    ["Thanh huyền", "Tone", "Falling tone, written with a grave accent (`). Low and falling.", "mà (but); bà (grandmother)", ["huyền", "falling tone", "grave accent", "huyen"]],
    ["Thanh sắc", "Tone", "Rising tone, written with an acute accent (´). High and rising.", "má (mother, cheek); cá (fish)", ["sắc", "rising tone", "acute accent", "sac"]],
    ["Thanh hỏi", "Tone", "Dipping-rising tone, written with a hook above (̉). Dips, then rises.", "mả (tomb); hỏi (to ask)", ["hỏi", "hook tone", "dipping tone", "question tone", "hoi"]],
    ["Thanh ngã", "Tone", "Creaky rising tone, written with a tilde (~). Glottalised in the north; merges with hỏi in much of the south.", "mã (horse, code); ngã (to fall)", ["ngã", "tilde tone", "broken tone", "nga"]],
    ["Thanh nặng", "Tone", "Heavy low tone, written with a dot below (.). Short, low and glottal.", "mạ (rice seedling); nặng (heavy)", ["nặng", "dot below", "heavy tone", "nang"]],
    ["Dấu phụ", "Spelling", "Letter modifiers that change the vowel itself, separate from tone marks: â, ê, ô (circumflex), ă (breve), ơ, ư (horn), and đ (crossed d).", "ăn (eat) vs an; đi (go) vs di", ["diacritics", "vowel marks", "accent marks", "circumflex", "breve", "horn", "dau phu"]],
    ["Chữ Quốc ngữ", "Spelling", "The Latin-based Vietnamese alphabet. Each syllable is written as a separate word.", "Xin chào. (Hello.)", ["alphabet", "romanization", "quoc ngu", "writing system", "spelling"]],
    ["Âm tiết", "Spelling", "Syllable. Each Vietnamese syllable is written separately and carries one tone. Many words are made of two syllables.", "sinh viên (student) = 2 syllables", ["syllable", "syllables", "syllabic", "am tiet"]],
    ["Từ ghép", "Word formation", "Compound word built from two or more syllables that each have meaning.", "nhà (house) + cửa (door) = nhà cửa (home)", ["compound word", "compound", "compounds", "tu ghep"]],
    ["Từ láy", "Word formation", "Reduplicated word: a syllable repeated with a change of sound. Often adds softness, intensity or sound imagery.", "đo đỏ (reddish), lung linh (shimmering)", ["reduplication", "reduplicated", "reduplicative", "tu lay"]],
    ["Từ Hán Việt", "Word formation", "Sino-Vietnamese vocabulary. Formal and literary words borrowed from Chinese, often used in writing and technical speech.", "quốc gia (nation), học sinh (pupil)", ["sino-vietnamese", "chinese loanword", "han viet", "loanword"]],
    ["Danh từ", "Word class", "Noun. Does not change for number or case. Plural is shown by context or by a word such as những or các.", "sách (book), người (person)", ["noun", "nouns", "danh tu"]],
    ["Động từ", "Word class", "Verb. It never conjugates for person, number or tense: the same form is used for I, you, they, past and future.", "đi (go): tôi đi, anh ấy đi", ["verb", "verbs", "conjugation", "does not conjugate", "dong tu"]],
    ["Tính từ", "Word class", "Adjective. Normally comes after the noun it describes, and can act like a verb on its own (no word for 'to be' needed).", "cái nhà đẹp (the beautiful house); Nhà đẹp. (The house is beautiful.)", ["adjective", "adjectives", "stative verb", "tinh tu"]],
    ["Phó từ", "Word class", "Adverb or auxiliary marker. Includes very (rất), also (cũng), already (đã), still (vẫn), only (chỉ).", "Cô ấy rất vui. (She is very happy.)", ["adverb", "adverbs", "pho tu", "degree word", "intensifier"]],
    ["Đại từ", "Word class", "Pronoun. Vietnamese pronouns carry age, status and relationship, and often come from kinship words.", "tôi (I), bạn (you), anh ấy (he)", ["pronoun", "pronouns", "personal pronoun", "dai tu"]],
    ["Giới từ", "Word class", "Preposition. Links a noun to the rest of the sentence: ở (at), trong (in), với (with), cho (for), từ (from), đến (to).", "Tôi sống ở Hà Nội. (I live in Hanoi.)", ["preposition", "prepositions", "gioi tu"]],
    ["Liên từ", "Word class", "Conjunction. Joins words and clauses: và (and), nhưng (but), vì (because), nếu (if), hoặc (or).", "Tôi đói nhưng không ăn. (I am hungry but I am not eating.)", ["conjunction", "conjunctions", "lien tu", "connective"]],
    ["Loại từ", "Classifier", "Classifier: a small word placed between a number or demonstrative and a noun, depending on the kind of thing. Required in many counting and pointing phrases.", "ba con mèo (three cats), một cái bàn (a table)", ["classifier", "classifiers", "measure word", "counter", "loai tu", "cái", "con", "chiếc"]],
    ["Cái", "Classifier", "General classifier for inanimate objects and things. Also introduces a specific item.", "cái bàn (the table), cái này (this one)", ["cai", "general classifier", "inanimate classifier"]],
    ["Con", "Classifier", "Classifier for animals and some living or moving things, and for children (as 'child of').", "con chó (dog), con mèo (cat), con sông (river)", ["con", "animal classifier", "animate classifier"]],
    ["Chiếc", "Classifier", "Classifier for single items, especially vehicles and one of a pair.", "chiếc xe (a vehicle), chiếc giày (one shoe)", ["chiec", "single item classifier", "vehicle classifier"]],
    ["Quyển / Cuốn", "Classifier", "Classifier for books, notebooks and bound items. Quyển is more southern, cuốn more northern.", "một quyển sách (a book)", ["quyen", "cuon", "book classifier"]],
    ["Người", "Classifier", "Classifier for people, as well as the noun 'person'.", "ba người bạn (three friends)", ["nguoi", "person classifier", "people classifier"]],
    ["Số từ", "Word class", "Numeral. Placed before the classifier and the noun. Some numbers change tone or form in combination.", "hai con chó (two dogs), mười lăm (fifteen)", ["numeral", "numbers", "number words", "so tu", "cardinal"]],
    ["Những / Các", "Plural marker", "Plural words placed before the noun. Những is 'some / a number of', các is 'all of the group'. A noun can also be plural with no marker.", "những người bạn (some friends), các bạn (all of you)", ["nhung", "cac", "plural", "plural marker", "plurals"]],
    ["Xưng hô", "Address", "The system of address: who you call 'I' and 'you' depends on age, gender, family relationship and politeness. Kinship words are used as pronouns.", "Anh khoẻ không? (Are you well, older brother / sir?)", ["xung ho", "address terms", "forms of address", "kinship pronouns", "honorifics", "anh chị em", "pronoun choice"]],
    ["Anh / Chị / Em", "Address", "Kinship terms used as 'you' or 'I': anh = older brother / man a little older, chị = older sister / woman a little older, em = younger sibling / someone younger.", "Chị đi đâu đấy? (Where are you going, older sister?)", ["anh", "chi", "em", "older brother", "older sister", "younger sibling", "kinship term"]],
    ["Ông / Bà / Cô / Chú", "Address", "Kinship terms for older people: ông = grandfather / older man, bà = grandmother / older woman, cô = aunt (father's side) / young woman, chú = uncle (father's younger brother).", "Cháu chào ông ạ. (I greet you, grandfather.)", ["ong", "ba", "co", "chu", "grandfather", "grandmother", "aunt", "uncle"]],
    ["Tôi / Bạn", "Pronoun", "Neutral 'I' and 'you': tôi is polite and neutral, bạn means 'you' among equals or strangers of similar age. The standard in textbooks and translations.", "Tôi là sinh viên. Bạn tên là gì? (I am a student. What is your name?)", ["toi", "ban", "neutral pronouns", "neutral register", "i and you"]],
    ["Mình / Tớ / Cậu", "Pronoun", "Casual, friendly pronouns among peers: mình / tớ = I, cậu = you. Mình can also mean 'we' or 'I'.", "Cậu đi chưa? Tớ đang chờ. (Have you gone yet? I'm waiting.)", ["minh", "to", "cau", "casual pronouns", "casual register", "informal pronouns", "friends"]],
    ["Quý vị", "Pronoun", "Respectful 'you (plural)' used in formal addressing of an audience or customers.", "Kính chào quý vị. (Greetings, ladies and gentlemen.)", ["quy vi", "formal you", "formal address", "ladies and gentlemen", "formal pronouns"]],
    ["Người thứ ba", "Pronoun", "Third person: he / she / they is built from kinship word + ấy / đó (ấy = that). Ấy and đó make it specific.", "anh ấy (he), cô ấy (she), họ (they)", ["third person", "he", "she", "they", "nguoi thu ba", "ấy", "ho"]],
    ["Đại từ chỉ định", "Demonstrative", "Demonstratives: này (this), đó / ấy (that), kia (that over there), đây (here), đấy (there). They follow the noun.", "cuốn sách này (this book), người kia (that person over there)", ["demonstrative", "demonstratives", "this", "that", "này", "kia", "dai tu chi dinh"]],
    ["Thì", "Tense", "Vietnamese has no verb tenses: time is shown by context, time words (hôm qua, ngày mai) or by marker words placed before the verb.", "Tôi ăn. can mean I eat, I ate or I will eat depending on context.", ["tense", "tenses", "tense marker", "time marker", "thi", "no tense"]],
    ["Đã", "Tense", "Past or completed marker: the action happened or is finished. It is often dropped when the time is already clear.", "Tôi đã ăn rồi. (I have already eaten.)", ["da", "past marker", "past tense", "completed", "perfective", "already"]],
    ["Đang", "Tense", "Progressive marker: an action in progress now (or at a moment in the past or future).", "Tôi đang học. (I am studying.)", ["dang", "progressive", "continuous", "in progress", "present continuous", "ongoing"]],
    ["Sẽ", "Tense", "Future marker: an action not yet happened, or a prediction or plan.", "Ngày mai tôi sẽ đi. (Tomorrow I will go.)", ["se", "future", "future marker", "future tense", "will"]],
    ["Vừa / Mới", "Tense", "'Just now' markers: the action happened very recently. Both go before the verb.", "Tôi vừa về. Cô ấy mới đến. (I just got back. She just arrived.)", ["vua", "moi", "just", "recent past", "just now", "recently"]],
    ["Sắp", "Tense", "'About to': the action is going to happen very soon.", "Tàu sắp đến. (The train is about to arrive.)", ["sap", "about to", "soon", "near future", "imminent"]],
    ["Rồi", "Particle", "'Already / now': shows a completed action or a new state. Usually at the end of a clause, often with đã.", "Tôi ăn rồi. (I have eaten.) Hết rồi. (It's gone.)", ["roi", "already", "perfective particle", "completion", "finished"]],
    ["Chưa", "Tense", "'Not yet' (and the 'yet?' question). Answers the 'rồi chưa?' question.", "Bạn ăn chưa? Tôi chưa ăn. (Have you eaten? I haven't yet.)", ["chua", "not yet", "yet", "haven't"]],
    ["Từng", "Tense", "'Ever / once': marks past experience.", "Tôi từng đến Huế. (I have been to Huế before.)", ["tung", "ever", "once", "experience", "have ever"]],
    ["Phủ định", "Negation", "Negation: không (not, general), chưa (not yet), đừng (don't, command), chẳng / chả (emphatic not). The word goes before the verb or adjective.", "Tôi không biết. (I don't know.)", ["negation", "negative", "not", "không", "khong", "phu dinh", "negate", "đừng"]],
    ["Câu hỏi có không", "Question", "Yes/no question: end with không? (or có … không?). Có can be placed before the verb for emphasis.", "Bạn có khoẻ không? (Are you well?)", ["yes no question", "yes-no question", "có không", "co khong", "question", "questions", "câu hỏi"]],
    ["Từ để hỏi", "Question", "Question words: ai (who), gì (what), đâu (where), khi nào (when), sao / tại sao (why), thế nào (how), bao nhiêu (how many/much). They stay where the answer would be.", "Bạn ăn gì? (What are you eating?)", ["question word", "question words", "wh question", "interrogative", "ai", "gì", "đâu", "tu de hoi"]],
    ["Trạng từ chỉ thời gian", "Adverbial", "Time expressions usually go at the start of the sentence or right after the subject.", "Hôm qua tôi ở nhà. (Yesterday I stayed home.)", ["time adverb", "time word", "time expression", "adverb of time", "hôm qua", "ngày mai", "temporal"]],
    ["Trật tự từ", "Word order", "Word order: basic order is Subject – Verb – Object (SVO), like English. Since there are no endings, order carries the meaning.", "Mèo bắt chuột. (The cat catches the mouse.)", ["word order", "svo", "sentence order", "subject verb object", "order", "tu tu"]],
    ["Chủ ngữ", "Sentence part", "Subject: who or what does the action. Often dropped when clear from context.", "Mưa rồi. (It's raining.)", ["subject", "chu ngu", "subject dropping", "zero subject", "pro-drop"]],
    ["Vị ngữ", "Sentence part", "Predicate: what is said about the subject. It can be a verb, an adjective or 'là' + noun.", "Cô ấy đẹp. Cô ấy là giáo viên.", ["predicate", "vi ngu"]],
    ["Tân ngữ", "Sentence part", "Object: the thing the verb acts on. It comes right after the verb, with no case marking.", "Tôi đọc sách. (I read a book.)", ["object", "direct object", "tan ngu", "objects"]],
    ["Trạng ngữ", "Sentence part", "Adverbial: a word or phrase for time, place, reason or manner, often at the start of the sentence.", "Ở nhà, tôi thường nấu ăn. (At home, I often cook.)", ["adverbial", "trang ngu", "adverbial phrase", "modifier"]],
    ["Câu chủ đề", "Word order", "Topic-comment structure: a topic is placed first, followed by a comment about it. Very common in Vietnamese.", "Món này, tôi thích lắm. (This dish, I like a lot.)", ["topic comment", "topic-comment", "topic", "topicalization", "cau chu de", "fronting"]],
    ["Từ bổ nghĩa", "Word order", "Modifiers come AFTER the noun they describe (the reverse of English): adjectives, demonstratives and relative clauses.", "áo đỏ này (this red shirt), quyển sách tôi mua (the book I bought)", ["modifier", "modifiers", "noun phrase", "after the noun", "noun modification", "adjective order", "attributive"]],
    ["Cấu trúc cụm danh từ", "Word order", "Noun phrase order: number – classifier – noun – adjective – demonstrative.", "hai con mèo đen này (these two black cats)", ["noun phrase order", "np order", "phrase structure", "noun phrase"]],
    ["Là", "Copula", "'To be' for identifying something: A là B. It is NOT used before adjectives, and not for location.", "Tôi là bác sĩ. (I am a doctor.) Tôi vui. (I am happy.)", ["la", "to be", "copula", "be verb", "linking verb", "is", "am"]],
    ["Ở", "Preposition", "At / in / to be at: marks location, and also works as a verb 'to live / be at'.", "Tôi ở Sài Gòn. (I am in / live in Saigon.)", ["o", "at", "location", "be located", "in", "stay"]],
    ["Có", "Verb", "To have / there is / to exist. Also used before verbs for emphasis or to confirm a fact.", "Tôi có hai anh trai. Có người ở đó. (I have two brothers. There's someone there.)", ["co", "have", "there is", "there are", "exist", "existential"]],
    ["Bị / Được", "Passive", "Passive-type markers. Bị = something adverse happens to the subject, được = something beneficial or neutral.", "Tôi bị mưa ướt. (I got wet from rain.) Tôi được khen. (I was praised.)", ["bi", "duoc", "passive", "passive voice", "adversity passive", "get passive", "suffer"]],
    ["Được", "Verb", "Can / may (after the verb) or to obtain / get. Also marks ability or permission.", "Tôi đi được. (I can go.) Anh được nghỉ. (You may rest.)", ["duoc", "can", "may", "permission", "able", "ability", "get"]],
    ["Có thể", "Modal", "Can / could / possibly: ability or possibility, placed before the verb.", "Tôi có thể giúp bạn. (I can help you.)", ["co the", "can", "could", "possible", "possibility", "modal"]],
    ["Phải", "Modal", "Must / have to: obligation or necessity. Also means 'right / correct'.", "Tôi phải đi. (I have to go.)", ["phai", "must", "have to", "obligation", "necessity", "need to"]],
    ["Nên", "Modal", "Should: advice or recommendation.", "Bạn nên nghỉ ngơi. (You should rest.)", ["nen", "should", "ought to", "advice", "recommendation"]],
    ["Muốn", "Modal", "To want. Followed by a verb or noun.", "Tôi muốn ăn cơm. (I want to eat rice.)", ["muon", "want", "wish", "desire", "would like"]],
    ["Câu mệnh lệnh", "Mood", "Imperative: commands and requests use the bare verb, often with hãy (please do), đi (go on), or đừng (don't).", "Hãy ngồi xuống. Đừng đi! (Please sit down. Don't go!)", ["imperative", "command", "commands", "request", "hãy", "cau menh lenh", "order"]],
    ["Từ cảm thán", "Particle", "Sentence-final and interjection particles that add feeling or attitude: nhé, nha, nhỉ, ạ, à, ơi, đấy, chứ, thôi.", "Đi nhé! (Let's go, okay!) Dạ, vâng ạ. (Yes, sir.)", ["particle", "particles", "final particle", "sentence-final particle", "discourse particle", "nhé", "nha", "nhỉ", "à", "đấy", "chứ", "tu cam than"]],
    ["Ạ", "Particle", "Politeness particle placed at the end of a sentence, to show respect to an older or higher-status listener.", "Cháu chào bác ạ. (Greetings, uncle/aunt.)", ["polite particle", "politeness", "respect", "honorific particle"]],
    ["Dạ / Vâng", "Particle", "Polite 'yes' or 'I'm listening'. Vâng is northern, dạ is southern and also common elsewhere. Used to show deference.", "Dạ, con biết rồi. (Yes, I know.)", ["da", "vang", "yes", "polite yes", "answering politely", "respectful yes"]],
    ["Nhé / Nha", "Particle", "Friendly softening particle, like 'okay?' or 'alright'. Nha is southern and more casual than nhé.", "Mai gặp nhé! (See you tomorrow, okay!)", ["nhe", "nha", "softener", "casual particle", "friendly", "informal"]],
    ["Nhỉ", "Particle", "Tag-like particle seeking agreement: 'isn't it?', 'right?'.", "Hôm nay nóng nhỉ? (It's hot today, isn't it?)", ["nhi", "right", "isn't it", "tag question", "seeking agreement"]],
    ["Kính ngữ", "Register", "Polite and respectful language. Add polite pronouns (ông / bà / quý vị), polite particles (ạ, dạ) and the word xin ('please / may I').", "Xin lỗi, tôi hỏi một chút ạ. (Excuse me, may I ask something?)", ["honorific", "honorifics", "polite", "politeness", "formal register", "formal", "kinh ngu", "respectful"]],
    ["Văn nói / Văn viết", "Register", "Spoken versus written register. Casual speech drops words and uses particles; writing is more complete and uses more Sino-Vietnamese vocabulary.", "Spoken: Đi đâu đấy? Written: Anh đi đâu vậy?", ["spoken", "written", "colloquial", "informal", "formal writing", "van noi", "van viet", "register", "casual register"]],
    ["Phương ngữ", "Dialect", "Dialects: northern (Hà Nội), central (Huế) and southern (Sài Gòn) differ in tones, some consonants and vocabulary.", "Northern: vâng, bố. Southern: dạ, ba.", ["dialect", "dialects", "northern", "southern", "central", "regional", "accent", "phuong ngu", "regional difference"]],
    ["So sánh hơn", "Comparison", "Comparative: adjective + hơn (more than). Use 'hơn' after the adjective and optionally 'so với' before the thing compared.", "Anh ấy cao hơn tôi. (He is taller than me.)", ["comparative", "comparison", "hơn", "more than", "so sanh hon", "taller"]],
    ["So sánh nhất", "Comparison", "Superlative: adjective + nhất (the most).", "Đây là cái đẹp nhất. (This is the most beautiful one.)", ["superlative", "nhất", "most", "so sanh nhat", "the most", "best"]],
    ["Rất / Quá / Lắm", "Degree", "Intensifiers: rất = very (before the adjective), quá = too / so (after), lắm = very much (after).", "rất đẹp, đẹp quá, đẹp lắm", ["rat", "qua", "lam", "very", "too", "so", "intensifier", "degree", "emphasis"]],
    ["Cũng", "Adverb", "Also / too / either: placed before the verb.", "Tôi cũng thích. (I like it too.)", ["cung", "also", "too", "either", "as well"]],
    ["Vẫn / Còn", "Adverb", "Still / yet: shows that a state continues. Vẫn emphasises continuation; còn also means 'remain / still have'.", "Anh vẫn nhớ. Còn tiền không? (He still remembers. Any money left?)", ["van", "con", "still", "remain", "continue", "yet"]],
    ["Cả / Tất cả", "Quantifier", "All / the whole: cả = whole or both, tất cả = all of them / everything.", "Tất cả mọi người (everyone), cả ngày (all day)", ["ca", "tat ca", "all", "whole", "every", "everyone", "mọi"]],
    ["Câu điều kiện", "Clause", "Conditional: nếu … thì … (if … then …). Thì often marks the result and can be dropped.", "Nếu trời mưa, tôi ở nhà. (If it rains, I stay home.)", ["conditional", "if clause", "nếu", "neu", "if then", "cau dieu kien", "hypothetical"]],
    ["Câu nhân quả", "Clause", "Cause and effect: vì … nên … / do … nên … (because … so …). Both parts are usually used.", "Vì mệt nên tôi ngủ. (Because I'm tired, I sleep.)", ["because", "reason", "cause", "effect", "vì", "vi nen", "nhân quả", "causal", "due to"]],
    ["Câu tương phản", "Clause", "Contrast: tuy … nhưng … / mặc dù … nhưng … (although … but …). Both parts are usually used.", "Tuy mệt nhưng tôi vẫn đi. (Though tired, I still went.)", ["although", "though", "contrast", "tuy", "mặc dù", "but", "concession", "nhưng"]],
    ["Mệnh đề quan hệ", "Clause", "Relative clause: no relative pronoun is needed. The clause simply follows the noun, optionally with mà.", "Người tôi gặp hôm qua rất tốt. (The person I met yesterday is very kind.)", ["relative clause", "relative pronoun", "mà", "that", "which", "who", "menh de quan he"]],
    ["Mà", "Conjunction", "Versatile particle/conjunction: 'but', 'that/which' (relative), or an emphatic tag.", "Tôi muốn mà không có tiền. (I want to, but have no money.)", ["ma", "but", "which", "that", "relative marker", "emphatic"]],
    ["Cho", "Verb", "To give, to let, or 'for / to (someone)'. Marks the recipient or beneficiary after the verb.", "Tôi cho bạn quyển sách. (I give you a book.) Mua cho mẹ. (Buy for mum.)", ["give", "for", "let", "to", "benefactive", "recipient", "indirect object", "dative"]],
    ["Động từ chuyển động", "Verb", "Motion verbs: đi (go), đến (arrive), về (return), ra (go out), vào (go in), lên (go up), xuống (go down). They combine to show direction.", "đi ra (go out), chạy vào (run in)", ["motion verb", "directional verb", "go", "come", "direction", "directional"]],
    ["Động từ ghép", "Verb", "Serial verbs and verb compounds: two or more verbs in a row form one action. There is no joining word.", "đi mua đồ (go buy things), ngồi ăn (sit and eat)", ["serial verb", "serial verbs", "verb compound", "verb chain", "verb phrase"]],
    ["Thành ngữ", "Idiom", "Idiom or fixed expression, often four syllables. Meaning cannot be guessed word for word.", "ăn cháo đá bát (to be ungrateful: eat porridge, kick the bowl)", ["idiom", "idioms", "fixed expression", "proverb", "saying", "thanh ngu", "phrase", "idiomatic"]],
    ["Tục ngữ", "Idiom", "Proverb: a short traditional saying with advice or observed truth.", "Có công mài sắt, có ngày nên kim. (Persistence turns iron into a needle.)", ["proverb", "proverbs", "saying", "tuc ngu", "folk saying", "adage"]],
  ];

  const ENTRIES = G.map(([term, category, definition, example, aliases]) => ({
    term, category, definition, example, aliases: aliases || [], source: "glossary",
  }));

  // lowercase, strip tone marks and diacritics, đ -> d
  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/đ/g, "d")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .trim();
  }

  function words(s) { return norm(s).split(/[^a-z0-9]+/).filter(Boolean); }

  // Tone marks matter in Vietnamese (ma / má / mả are different words), so "is this term in the text?" checks
  // keep the diacritics and only lowercase. Plain norm() is used for type-ahead search only.
  function fold(s) { return String(s || "").toLowerCase().normalize("NFC"); }
  function isLetter(c) { return !!c && /[\p{L}\p{N}]/u.test(c); }

  function hasWord(hay, needle, endBoundary) {
    if (!needle) return false;
    let i = -1;
    while ((i = hay.indexOf(needle, i + 1)) >= 0) {
      if (isLetter(hay[i - 1])) continue;
      if (endBoundary && isLetter(hay[i + needle.length])) continue;
      return true;
    }
    return false;
  }

  // Does this entry appear in the given text? The Vietnamese term(s) must match exactly, whole word.
  // English aliases (4+ letters) match from the start of a word so "classifier" also finds "classifiers".
  function matches(e, raw) {
    const hay = fold(raw);
    if (!hay) return false;
    if (e.term.split(" / ").some((t) => hasWord(hay, fold(t), true))) return true;
    return e.aliases.some((a) => {
      const n = fold(a);
      return n.length >= 4 && hasWord(hay, n, false);
    });
  }

  // Flatten every string in a Breakdown object into one searchable blob (raw text, diacritics kept).
  function blob(d) {
    if (!d) return "";
    const parts = [d.summary, d.tense, d.mood, d.sentence_structure];
    (d.components || []).forEach((c) => parts.push(c.text, c.role, c.case_or_form, c.explanation));
    (d.verbs || []).forEach((v) => parts.push(v.form, v.infinitive, v.conjugation));
    (d.idioms_and_nuance || []).forEach((n) => parts.push(n));
    return parts.filter(Boolean).join(" \n ");
  }

  // Build the index for the current analysis: glossary terms flagged as "used here", plus the sentence's own words.
  function buildIndex(d) {
    const text = blob(d);
    const list = ENTRIES.map((e) => {
      const used = !!text && matches(e, text);
      return Object.assign({}, e, { used });
    });
    const own = [];
    if (d) {
      (d.components || []).forEach((c) => {
        if (!c.text) return;
        own.push({
          term: c.text, category: "In your sentence", source: "sentence",
          definition: [c.role, c.case_or_form].filter(Boolean).join(" · ") + (c.explanation ? ". " + c.explanation : ""),
          example: "", aliases: [c.role, c.case_or_form].filter(Boolean), used: true,
        });
      });
      (d.verbs || []).forEach((v) => {
        if (!v.form) return;
        own.push({
          term: v.form, category: "In your sentence", source: "sentence",
          definition: `${v.infinitive ? "Meaning: " + v.infinitive + ". " : ""}${v.conjugation || ""}`.trim(),
          example: "", aliases: [v.infinitive].filter(Boolean), used: true,
        });
      });
    }
    return own.concat(list);
  }

  // Score one entry for a query. Higher is better, 0 means no match.
  function score(e, q) {
    const nq = norm(q);
    if (!nq) return 0;
    const t = norm(e.term);
    let s = 0;
    if (t === nq) s = 100;
    else if (t.startsWith(nq)) s = 85;
    else if (words(e.term).some((w) => w.startsWith(nq))) s = 65;
    else {
      for (const a of e.aliases) {
        const na = norm(a);
        if (!na) continue;
        if (na === nq) s = Math.max(s, 80);
        else if (na.startsWith(nq)) s = Math.max(s, 72);
        else if (words(a).some((w) => w.startsWith(nq))) s = Math.max(s, 52);
      }
      if (!s && nq.length >= 2 && t.includes(nq)) s = 30;
      if (!s && nq.length >= 3 && norm(e.definition).includes(nq)) s = 10;
    }
    if (!s) return 0;
    if (e.used) s += 12;
    if (e.source === "sentence") s += 4;
    return s;
  }

  function search(index, q, limit = 7) {
    const seen = new Set();
    return index
      .map((e) => ({ e, s: score(e, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s || a.e.term.length - b.e.term.length)
      .filter((x) => {
        const k = norm(x.e.term) + "|" + x.e.source;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .slice(0, limit)
      .map((x) => x.e);
  }

  // Terms to show before the user types anything.
  const STARTERS = ["Thanh điệu", "Loại từ", "Xưng hô", "Đã", "Bị / Được", "Ạ"];

  root.GrammarSearch = { norm, matches, buildIndex, search, score, ENTRIES, STARTERS };
  if (typeof module !== "undefined" && module.exports) module.exports = root.GrammarSearch;
})(typeof window !== "undefined" ? window : globalThis);
