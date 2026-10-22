/* =====================================================================
   Battle du panier — leçons en petites pages.
   Chaque mini-jeu est précédé d'une leçon courte, découpée en pages,
   avec des exemples concrets, des illustrations et de petits quiz
   (sans points). Les règles et les scores des jeux ne changent pas.
   ===================================================================== */

/* ---------- Moteur de leçons ---------- */
state.lessonSeen = state.lessonSeen || {};
function lessonPager(o) {
  const pages = [];
  o.chapters.forEach((c, ci) => c.pages.forEach((p, pi) => pages.push({ ...p, chapter: ci, chapterName: c.name, inChapter: pi + 1, chapterSize: c.pages.length })));
  let at = Math.min(state['pos_' + o.id] || 0, pages.length - 1);
  const draw = () => {
    state['pos_' + o.id] = at;
    const p = pages[at], last = at === pages.length - 1;
    const chips = o.chapters.length > 1 ? `<nav class="lp-chapters" aria-label="Chapitres">${o.chapters.map((c, ci) => `<button type="button" class="lp-chip ${ci === p.chapter ? 'on' : ''} ${ci < p.chapter ? 'done' : ''}" data-ch="${ci}">${c.name}</button>`).join('')}</nav>` : '';
    const body = `<div class="lp" data-lesson="${o.id}">
      ${chips}
      <div class="lp-progress"><span>${p.chapterName}${p.chapterSize > 1 ? ` · page ${p.inChapter}/${p.chapterSize}` : ''}</span><i><b style="width:${(at + 1) / pages.length * 100}%"></b></i><small>${at + 1} / ${pages.length}</small></div>
      <article class="lp-card ${p.tone || ''}">${renderLessonPage(p)}</article>
      <div class="lp-nav">
        <button type="button" class="lp-prev" ${at === 0 ? 'disabled' : ''}>← Précédent</button>
        <button type="button" class="lp-next ${last ? 'lp-go' : ''}">${last ? (o.doneLabel || 'Commencer le jeu →') : 'Suivant →'}</button>
      </div>
      ${o.skip && !last ? `<button type="button" class="lp-skip">${o.skip}</button>` : ''}
    </div>`;
    shell(o.tag, o.title, body, '', () => {}, o.sub || '', false);
    if (typeof o.progress === 'number') refreshProgress(o.progress);
    document.querySelector('.actions')?.classList.add('hidden');
    const root = document.querySelector('.lp');
    root.querySelector('.lp-prev').onclick = () => { if (at > 0) { at--; draw(); scrollLesson(); } };
    root.querySelector('.lp-next').onclick = () => { if (last) { state.lessonSeen[o.id] = true; state['pos_' + o.id] = 0; o.done(); } else { at++; draw(); scrollLesson(); } };
    root.querySelector('.lp-skip')?.addEventListener('click', () => { state.lessonSeen[o.id] = true; state['pos_' + o.id] = 0; o.done(); });
    root.querySelectorAll('.lp-chip').forEach(b => b.onclick = () => { at = pages.findIndex(x => x.chapter === +b.dataset.ch); draw(); });
    root.querySelectorAll('.lp-quiz').forEach(q => q.querySelectorAll('button').forEach(b => b.onclick = () => {
      if (q.dataset.done) return; q.dataset.done = '1';
      const ok = b.dataset.ok === '1';
      q.querySelectorAll('button').forEach(x => { x.disabled = true; if (x.dataset.ok === '1') x.classList.add('right'); });
      if (!ok) b.classList.add('wrong');
      q.querySelector('.lp-quiz-fb').innerHTML = `<b>${ok ? '✅ Exact !' : '❌ Pas tout à fait.'}</b> ${q.dataset.why}`;
    }));
    root.querySelectorAll('.lp-flip').forEach(c => c.onclick = () => c.classList.toggle('open'));
  };
  draw();
}
function scrollLesson() { document.querySelector('.gamecard')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
const lpFood = f => `<span class="lp-food"><b>${f[0]}</b><small>${f[1]}</small></span>`;
function renderLessonPage(p) {
  let h = '';
  if (p.badge) h += `<span class="lp-badge ${p.badgeCls || ''}">${p.badge}</span>`;
  if (p.h) h += `<h3>${p.h}</h3>`;
  (p.p || []).forEach(t => h += `<p>${t}</p>`);
  if (p.foods) h += `<div class="lp-foods">${p.foods.map(lpFood).join('')}</div>`;
  if (p.groups) h += `<div class="lp-groups">${p.groups.map(g => `<div class="lp-group"><h4>${g[0]}</h4><div class="lp-foods small">${g[1].map(lpFood).join('')}</div></div>`).join('')}</div>`;
  if (p.steps) h += `<ol class="lp-steps">${p.steps.map(s => `<li>${s}</li>`).join('')}</ol>`;
  if (p.cards) h += `<div class="lp-cards">${p.cards.map(c => `<button type="button" class="lp-flip"><span class="lp-food"><b>${c[0]}</b></span><strong>${c[1]}</strong><em>${c[2]}</em><span class="lp-more">${c[3]}</span><small class="lp-hint">Touche pour un exemple</small></button>`).join('')}</div>`;
  if (p.compare) h += `<div class="lp-compare">${p.compare.map(row => `<div class="lp-row">${row.map((c, i) => `${i ? '<i class="lp-arrow">→</i>' : ''}<div class="lp-step n${c[2]}"><span class="lp-food"><b>${c[0]}</b></span><strong>${c[1]}</strong><em>${c[2] === 'S' ? 'SIGA' : 'NOVA ' + c[2]}</em>${c[3] ? `<small>${c[3]}</small>` : ''}</div>`).join('')}</div>`).join('')}</div>`;
  if (p.scale) h += `<div class="lp-scale">${p.scale.map(s => `<div class="lp-scale-item s${s[0]}"><b>${s[0]}</b><span>${s[1]}</span>${s[2] ? `<small>${s[2]}</small>` : ''}</div>`).join('')}</div>`;
  if (p.after) (p.after).forEach(t => h += `<p>${t}</p>`);
  if (p.tip) h += `<div class="lp-tip"><b>💡 Dans la vie de tous les jours</b><p>${p.tip}</p></div>`;
  if (p.warn) h += `<div class="lp-warn"><b>⚠️ Erreur fréquente</b><p>${p.warn}</p></div>`;
  if (p.quiz) h += `<div class="lp-quiz" data-why="${p.quiz.why.replace(/"/g, '&quot;')}"><b class="lp-quiz-q">🧩 Petit test : ${p.quiz.q}</b><div class="lp-quiz-opts">${p.quiz.opts.map((o, i) => `<button type="button" data-ok="${i === p.quiz.a ? 1 : 0}">${o}</button>`).join('')}</div><p class="lp-quiz-fb"></p></div>`;
  return h;
}

/* =====================================================================
   1. COURS NOVA (avant la Mission Tri NOVA)
   ===================================================================== */
const NOVA_COURSE = [
  { name: 'NOVA, c’est quoi ?', pages: [
    { h: 'NOVA, c’est quoi ?', p: ['NOVA est une façon de <b>ranger les aliments selon la manière dont ils ont été fabriqués</b>. Elle a été créée par des chercheurs de l’université de São Paulo, au Brésil, et elle est utilisée dans de nombreux pays.', 'Elle compte <b>4 groupes</b>, du plus simple au plus fabriqué :'],
      scale: [['1', 'Aliments bruts ou peu transformés', 'pomme, œuf, lentilles'], ['2', 'Ingrédients pour cuisiner', 'huile, beurre, sel, sucre'], ['3', 'Aliments transformés', 'pain de boulangerie, fromage, conserves'], ['4', 'Produits ultra-transformés', 'soda, bonbons, nuggets']] },
    { h: 'Pourquoi regarder la transformation ?', p: ['Un même aliment de départ peut devenir des produits très différents. Une pomme peut rester une pomme, devenir une compote maison, ou un dessert industriel avec arômes et épaississants.', 'Plus un produit passe par des étapes industrielles et contient des ingrédients que l’on n’utilise pas dans une cuisine, plus il s’éloigne de l’aliment de départ.', 'Des études scientifiques observent qu’une consommation <b>très fréquente</b> de produits ultra-transformés est associée à davantage de problèmes de santé. C’est pour cela qu’il est utile de savoir les reconnaître.'],
      compare: [[['🍎', 'Pomme', '1'], ['🍏', 'Compote 100 % pommes', '1'], ['🍎', 'Compote avec sucre', '3'], ['🍮', 'Dessert aux arômes', '4']]] },
    { h: 'Ce que NOVA ne mesure pas', p: ['NOVA parle de <b>fabrication</b>. Elle ne compte <b>pas</b> les calories, les protéines, les vitamines ou le sucre d’un aliment.', 'Par exemple, des noix et de l’huile d’olive sont très riches en énergie, mais restent dans les groupes simples. À l’inverse, un soda « zéro sucre » apporte peu de calories, mais il est ultra-transformé.', 'NOVA est donc <b>un repère parmi d’autres</b>. Pour bien choisir, on regarde aussi la quantité, la fréquence et l’ensemble du repas.'],
      quiz: { q: 'NOVA indique combien de calories contient un aliment.', opts: ['Vrai', 'Faux'], a: 1, why: 'NOVA classe les aliments selon leur fabrication, pas selon leurs calories ou leurs nutriments.' } }
  ] },
  { name: 'NOVA 1', pages: [
    { badge: 'NOVA 1 · VERT', badgeCls: 'n1', h: 'Un aliment brut ou peu transformé, c’est quoi ?', p: ['Ce sont des aliments que l’on retrouve <b>proches de leur état naturel</b>. Par exemple, une pomme, un œuf, du poisson frais ou des lentilles.', 'Ils peuvent aussi avoir été lavés, coupés, congelés ou cuits <b>sans ajout d’autres ingrédients</b>. Même s’ils ont subi ces transformations simples, ils restent généralement dans cette première catégorie.'],
      foods: [['🍎', 'Pomme'], ['🥚', 'Œuf'], ['🐟', 'Poisson frais'], ['🫘', 'Lentilles']] },
    { badge: 'NOVA 1 · VERT', badgeCls: 'n1', h: 'Quelles familles d’aliments ?', p: ['Presque toutes les familles d’aliments ont des représentants en NOVA 1 :'],
      groups: [['Fruits', [['🍎', 'Pomme'], ['🍌', 'Banane'], ['🍊', 'Orange']]], ['Légumes', [['🥕', 'Carotte'], ['🥦', 'Brocoli'], ['🍅', 'Tomate']]], ['Féculents', [['🍚', 'Riz'], ['🥔', 'Pommes de terre'], ['🍝', 'Pâtes nature']]], ['Aliments protéinés', [['🥚', 'Œufs'], ['🐟', 'Poisson'], ['🥩', 'Viande fraîche']]], ['Légumineuses', [['🫘', 'Lentilles'], ['🫘', 'Haricots secs']]], ['Produits laitiers nature', [['🥛', 'Lait'], ['🥣', 'Yaourt nature']]]] },
    { badge: 'NOVA 1 · VERT', badgeCls: 'n1', h: 'Les transformations simples autorisées', p: ['Un aliment reste en NOVA 1 quand on lui fait seulement des gestes simples, <b>sans rien ajouter</b> :'],
      steps: ['<b>Laver, éplucher, couper</b> : une salade lavée en sachet.', '<b>Congeler</b> : des haricots verts surgelés nature.', '<b>Sécher ou moudre</b> : des flocons d’avoine, de la farine, des lentilles sèches.', '<b>Pasteuriser</b> (chauffer pour conserver) : le lait.', '<b>Cuire à l’eau ou à la vapeur</b> : un riz nature.'],
      tip: 'Les légumes surgelés nature sont aussi intéressants que les frais, souvent moins chers et déjà prêts à cuire.' },
    { badge: 'NOVA 1 · VERT', badgeCls: 'n1', h: 'Exemples concrets et erreurs fréquentes', p: ['Le mot « surgelé » ou « en sachet » ne change pas le groupe : c’est <b>ce qu’on ajoute</b> qui compte.'],
      compare: [[['🥬', 'Haricots verts surgelés nature', '1'], ['🥫', 'Haricots verts en conserve au sel', '3']], [['🍊', 'Orange', '1'], ['🧃', 'Boisson aux fruits aromatisée', '4']]],
      warn: 'Penser qu’un aliment « industriel » est forcément ultra-transformé. Un sachet de lentilles sèches ou un lait pasteurisé restent en NOVA 1.',
      quiz: { q: 'Des épinards surgelés nature, sans sauce : quel groupe ?', opts: ['NOVA 1', 'NOVA 4'], a: 0, why: 'La congélation est une transformation simple : sans ajout, ils restent en NOVA 1.' } }
  ] },
  { name: 'NOVA 2', pages: [
    { badge: 'NOVA 2 · JAUNE', badgeCls: 'n2', h: 'Les ingrédients pour cuisiner', p: ['Ce sont des produits tirés d’un aliment ou de la nature, qu’on ne mange <b>presque jamais seuls</b> : on les utilise pour cuisiner, assaisonner ou sucrer.', 'On les obtient en pressant (l’huile vient des olives ou du colza), en séparant (le beurre vient de la crème), en raffinant (le sucre vient de la betterave) ou en récoltant (le sel, le miel).'],
      foods: [['🫒', 'Huile d’olive'], ['🧈', 'Beurre'], ['🥄', 'Sucre'], ['🧂', 'Sel'], ['🍯', 'Miel']] },
    { badge: 'NOVA 2 · JAUNE', badgeCls: 'n2', h: 'Comment les utiliser au quotidien ?', p: ['Ils servent à préparer des plats maison avec des aliments du groupe 1 : des légumes poêlés avec un filet d’huile, une omelette avec une noisette de beurre.', 'Ce qui compte surtout, c’est la <b>quantité</b> : une cuillère d’huile pour cuisiner des légumes n’apporte pas la même chose qu’un plat qui baigne dans l’huile.'],
      tip: 'Pour les huiles, varier est une bonne idée : l’huile de colza et l’huile de noix apportent des oméga-3, l’huile d’olive est pratique pour la cuisson douce.',
      warn: 'Croire que NOVA 2 est « meilleur » ou « moins bon » que NOVA 3. Ce sont des ingrédients, pas des repas : on ne les compare pas de la même façon.',
      quiz: { q: 'Le miel est classé…', opts: ['NOVA 2, ingrédient pour sucrer', 'NOVA 4, produit ultra-transformé'], a: 0, why: 'Le miel est récolté puis extrait : c’est un ingrédient culinaire, comme le sucre.' } }
  ] },
  { name: 'NOVA 3', pages: [
    { badge: 'NOVA 3 · ORANGE', badgeCls: 'n3', h: 'Un aliment transformé, c’est quoi ?', p: ['C’est un aliment du groupe 1 auquel on a ajouté un ingrédient du groupe 2 (<b>sel, sucre, huile ou vinaigre</b>) pour le conserver plus longtemps ou lui donner plus de goût.', 'La recette reste <b>courte</b> : en général 2 ou 3 ingrédients que tu pourrais avoir dans ta cuisine.'],
      compare: [[['🥕', 'Légumes', '1'], ['🧂', '+ sel', '2'], ['🥫', 'Légumes en conserve', '3']]] },
    { badge: 'NOVA 3 · ORANGE', badgeCls: 'n3', h: 'Des exemples de NOVA 3', p: ['Beaucoup de produits du quotidien sont dans ce groupe :'],
      foods: [['🍞', 'Pain de boulangerie (farine, eau, sel, levure)'], ['🧀', 'Fromage'], ['🥫', 'Légumes en conserve'], ['🐟', 'Sardines à l’huile'], ['🥫', 'Pois chiches en conserve'], ['🍎', 'Compote avec sucre']] },
    { badge: 'NOVA 3 · ORANGE', badgeCls: 'n3', h: 'Au quotidien', p: ['Les conserves simples sont <b>pratiques, pas chères et se gardent longtemps</b>. Elles ont toute leur place dans des repas équilibrés.', 'On regarde simplement la quantité de sel ou de sucre ajoutée, et on adapte le reste du repas.'],
      tip: 'Rincer les légumes ou les légumineuses en conserve sous l’eau enlève une partie du sel ajouté.',
      quiz: { q: 'Un pain fait seulement avec farine, eau, sel et levure est…', opts: ['NOVA 3', 'NOVA 4'], a: 0, why: 'Recette courte avec des ingrédients de cuisine : c’est un aliment transformé, NOVA 3.' } }
  ] },
  { name: 'NOVA 4', pages: [
    { badge: 'NOVA 4 · ROUGE', badgeCls: 'n4', h: 'Un produit ultra-transformé, c’est quoi ?', p: ['Ce sont des produits <b>fabriqués industriellement</b>, souvent avec une longue liste d’ingrédients.', 'On y trouve des substances qu’on n’utilise presque jamais à la maison : sirop de glucose, protéines hydrolysées, huiles hydrogénées… et des <b>additifs</b> qui changent la couleur, le goût ou la texture (arômes, colorants, émulsifiants, édulcorants).'] },
    { badge: 'NOVA 4 · ROUGE', badgeCls: 'n4', h: 'Des exemples de NOVA 4', p: ['On les trouve dans presque tous les rayons :'],
      foods: [['🥤', 'Sodas'], ['🍬', 'Bonbons'], ['🍪', 'Biscuits industriels'], ['🍯', 'Céréales aromatisées'], ['🍗', 'Nuggets'], ['🍜', 'Nouilles instantanées'], ['🍲', 'Plats préparés avec additifs'], ['🍮', 'Desserts aux arômes']] },
    { badge: 'NOVA 4 · ROUGE', badgeCls: 'n4', h: 'Comment les reconnaître au magasin ?', p: ['Retourne le paquet et lis la <b>liste des ingrédients</b> :'],
      steps: ['Elle est <b>longue</b> (souvent plus de 5 ingrédients).', 'Elle contient des mots que tu n’as <b>pas dans ta cuisine</b> : sirop de glucose, maltodextrine, protéines de lait hydrolysées…', 'Elle contient des <b>additifs « cosmétiques »</b> : arôme, colorant, émulsifiant (E471…), édulcorant, épaississant.'],
      tip: 'Si tu hésites entre deux produits du même rayon, celui dont la liste d’ingrédients est la plus courte et la plus compréhensible est généralement le moins transformé.' },
    { badge: 'NOVA 4 · ROUGE', badgeCls: 'n4', h: 'Sans culpabiliser', p: ['Ces produits sont pratiques, souvent bons, et peuvent faire partie de la vie. Il ne s’agit pas de les interdire.', 'L’idée est de <b>ne pas en faire la base de tous les repas</b>, et de savoir les repérer pour choisir en connaissance de cause : par exemple un dessert ultra-transformé de temps en temps, et le plus souvent un fruit ou un yaourt nature.'],
      warn: 'Penser qu’un seul additif suffit pour classer en NOVA 4. C’est l’ensemble de la recette et le type d’ingrédients qui comptent.',
      quiz: { q: 'Des biscuits avec « sirop de glucose, arôme, émulsifiant » sont…', opts: ['NOVA 3', 'NOVA 4'], a: 1, why: 'Ingrédients industriels et additifs cosmétiques : ce sont des marqueurs d’ultra-transformation.' } }
  ] },
  { name: 'Comparer', pages: [
    { h: 'Même aliment de départ, groupes différents', p: ['Ce qui fait changer de groupe, c’est <b>ce qu’on ajoute</b> et <b>comment c’est fabriqué</b> :'],
      compare: [[['🥛', 'Lait nature', '1'], ['🥣', 'Yaourt nature', '1'], ['🧀', 'Fromage', '3'], ['🍓', 'Yaourt aromatisé avec arômes', '4']], [['🌾', 'Flocons d’avoine', '1'], ['🍯', 'Céréales aromatisées', '4']]] },
    { h: 'D’autres comparaisons utiles', p: ['Dans chaque rayon, il existe souvent une version simple et une version plus fabriquée :'],
      compare: [[['🍗', 'Poulet frais', '1'], ['🍗', 'Nuggets', '4']], [['🍞', 'Pain de boulangerie', '3'], ['🍞', 'Pain de mie avec additifs', '4']], [['💧', 'Eau', '1'], ['🥤', 'Soda', '4']]],
      tip: 'Remplacer une seule habitude, par exemple le soda du midi par de l’eau pétillante, est déjà un vrai changement.' }
  ] },
  { name: 'Au quotidien', pages: [
    { h: 'Mes 3 réflexes pendant les courses', steps: ['<b>Lire la liste d’ingrédients</b> : courte et compréhensible = produit plus simple.', '<b>Comparer deux produits du même rayon</b> : par exemple deux compotes ou deux pains.', '<b>Construire la base des repas</b> avec des aliments NOVA 1 et 3, cuisinés avec un peu de NOVA 2, et garder les NOVA 4 pour certaines occasions.'],
      tip: 'Une liste de courses préparée à la maison aide à choisir plus calmement, sans se laisser guider seulement par les promotions.' },
    { h: 'À toi de jouer !', p: ['Dans la Mission Tri NOVA, un aliment arrive sur le tapis : touche le bac qui correspond à son groupe. Après chaque aliment, le Professeur Fraise t’explique la bonne réponse.'],
      scale: [['1', 'Brut ou peu transformé'], ['2', 'Ingrédient pour cuisiner'], ['3', 'Transformé (recette courte)'], ['4', 'Ultra-transformé (ingrédients industriels, additifs)']],
      quiz: { q: 'Des pois chiches en conserve avec eau et sel sont…', opts: ['NOVA 1', 'NOVA 3', 'NOVA 4'], a: 1, why: 'Un aliment du groupe 1 + du sel pour le conserver : c’est un aliment transformé, NOVA 3.' } }
  ] }
];

/* =====================================================================
   2. LEÇON SIGA
   ===================================================================== */
const SIGA_COURSE = [{ name: 'Le score SIGA', pages: [
  { h: 'Le SIGA, c’est quoi ?', p: ['Le SIGA est un <b>score de 1 à 7</b> donné à un produit. Comme NOVA, il regarde comment l’aliment a été fabriqué.', 'Mais il ajoute deux informations : la présence de <b>marqueurs d’ultra-transformation</b> (additifs, ingrédients industriels) et l’<b>équilibre du produit</b> en gras, en sucre et en sel.', 'Plus le chiffre est petit, plus le produit est simple et équilibré.'] },
  { h: 'Les groupes 1 à 4', scale: [['1', 'Non transformé', 'lait demi-écrémé, pomme'], ['2', 'Peu transformé', 'compote sans sucres ajoutés'], ['3', 'Transformé équilibré', 'Babybel'], ['4', 'Transformé « gourmand »', 'boisson lactée aromatisée']],
    p: ['« Gourmand » veut dire que le produit est <b>plus riche en gras, en sucre ou en sel</b>.'] },
  { h: 'Les groupes 5 à 7', scale: [['5', 'Ultra-transformé équilibré', 'dessert industriel aux fruits'], ['6', 'Ultra-transformé gourmand', 'nuggets, gâteau enrobé'], ['7', 'Ultra-transformé à limiter', 'nouilles instantanées, bonbons']],
    p: ['Un produit en groupe 6 ou 7 n’est pas interdit : le chiffre aide à savoir lesquels garder pour <b>de temps en temps</b>.'] },
  { h: 'NOVA ou SIGA : quelle différence ?', p: ['<b>NOVA</b> répond à la question : « Comment ce produit a-t-il été fabriqué ? »', '<b>SIGA</b> répond à : « Comment a-t-il été fabriqué, et est-il plutôt équilibré ? »', 'Les deux ne jugent qu’<b>un produit</b>, jamais un repas entier ni une personne.'],
    tip: 'Des applications de scan alimentaire affichent ce type de score en magasin : c’est pratique pour comparer deux produits du même rayon.' },
  { h: 'À toi de jouer !', p: ['Pour chaque produit, déplace le curseur sur le score SIGA que tu imagines. Plus tu es proche, plus tu gagnes de points : chaque cran d’écart enlève 10 points.', 'Après ta réponse, le Professeur Fraise t’explique le vrai score.'],
    quiz: { q: 'Un produit « gourmand » dans le SIGA est…', opts: ['Plus riche en gras, sucre ou sel', 'Interdit'], a: 0, why: 'Le mot « gourmand » décrit l’équilibre du produit. Aucun produit n’est interdit.' } }
] }];

/* =====================================================================
   3. MISSION NUTRIMENTS
   ===================================================================== */
const NUTRI_COURSE = [
  { name: 'Les macronutriments', pages: [
    { h: 'Les 3 grands nutriments', p: ['Les <b>macronutriments</b> sont les nutriments dont le corps a besoin en grande quantité. Ils apportent l’énergie et les matériaux pour fonctionner.', 'Il y en a trois : les <b>protéines</b>, les <b>glucides</b> et les <b>lipides</b>. Aucun n’est « mauvais » : chacun a un rôle.'],
      cards: [['💪', 'Protéines', 'Construire et entretenir', 'Œufs, poisson, lentilles'], ['⚡', 'Glucides', 'Donner de l’énergie', 'Pain, riz, fruits'], ['🫒', 'Lipides', 'Énergie et cellules', 'Huiles, noix, poissons gras']] },
    { h: 'Les protéines', p: ['Elles servent à <b>construire et entretenir</b> les muscles, la peau, les cheveux et les défenses du corps.', 'On en trouve dans des aliments d’origine animale et végétale :'],
      foods: [['🥚', 'Œufs'], ['🐟', 'Poisson'], ['🍗', 'Poulet'], ['🥣', 'Yaourt nature'], ['🫘', 'Lentilles'], ['🫘', 'Pois chiches']],
      tip: 'Mettre une source de protéines à chaque repas aide à se sentir rassasié plus longtemps.' },
    { h: 'Les glucides', p: ['Ils donnent de l’<b>énergie</b>, surtout au cerveau et aux muscles.', 'On les trouve dans les <b>féculents</b> (pain, riz, pâtes, pommes de terre), les légumineuses et les fruits, mais aussi dans les produits sucrés.', 'Les versions <b>complètes</b> (pain complet, riz complet) apportent en plus des <b>fibres</b>, qui aident la digestion et la satiété.'],
      foods: [['🍞', 'Pain'], ['🍚', 'Riz'], ['🥔', 'Pommes de terre'], ['🍌', 'Banane'], ['🌾', 'Flocons d’avoine']],
      tip: 'Remplacer de temps en temps le riz blanc par du riz complet, ou ajouter des légumineuses, augmente les fibres sans changer tes habitudes.' },
    { h: 'Les lipides (les graisses)', p: ['Ils donnent de l’énergie, servent à <b>fabriquer les cellules</b> et à transporter certaines vitamines (A, D, E, K).', 'On les trouve dans les huiles, le beurre, les noix, l’avocat, les poissons gras et les produits laitiers.'],
      foods: [['🫒', 'Huile d’olive'], ['🥑', 'Avocat'], ['🐟', 'Poisson gras'], ['🧈', 'Beurre']],
      tip: 'Varier les matières grasses : huile de colza ou de noix pour les salades, huile d’olive pour cuire, et le beurre en petite quantité.' }
  ] },
  { name: 'Les micronutriments', pages: [
    { h: 'Les vitamines', p: ['Le corps en a besoin en <b>toute petite quantité</b>, mais elles sont indispensables.'],
      cards: [['🍊', 'Vitamine C', 'Défenses du corps', 'Agrumes, kiwi, poivron'], ['🥕', 'Vitamine A', 'Vision', 'Carotte, patate douce'], ['🐟', 'Vitamine D', 'Os et muscles', 'Poissons gras, soleil']],
      tip: 'Plus l’assiette est colorée (légumes et fruits variés), plus elle apporte de vitamines différentes.' },
    { h: 'Les minéraux', p: ['Ce sont aussi des micronutriments. Trois exemples importants :'],
      cards: [['🦴', 'Calcium', 'Solidité des os et des dents', 'Lait, yaourt, fromage, certaines eaux minérales'], ['🩸', 'Fer', 'Transport de l’oxygène dans le sang', 'Viande, poisson, lentilles'], ['💪', 'Magnésium', 'Muscles et nerfs', 'Céréales complètes, légumineuses, amandes']] }
  ] },
  { name: 'Au quotidien', pages: [
    { h: 'Un aliment apporte plusieurs choses', p: ['On ne mange pas « des protéines » ou « des glucides » : on mange des aliments, qui en contiennent souvent plusieurs.'],
      cards: [['🥚', 'Un œuf', 'Protéines, lipides, vitamines', 'Parfait au petit-déjeuner ou en omelette'], ['🫘', 'Des lentilles', 'Glucides, fibres, protéines, fer', 'En salade ou en plat chaud'], ['🥣', 'Un yaourt nature', 'Protéines et calcium', 'Avec un fruit coupé']] },
    { h: 'Les calories ne disent pas tout', p: ['Deux produits avec les mêmes calories peuvent être très différents : l’un rassasie et apporte des fibres et des vitamines, l’autre surtout du sucre.', 'C’est pour cela qu’on regarde <b>ce que l’aliment apporte</b>, et pas seulement son nombre de calories.'],
      tip: 'Sur l’emballage, le tableau « pour 100 g » permet de comparer deux produits du même rayon. La liste d’ingrédients est rangée du plus présent au moins présent.' },
    { h: 'À toi de jouer !', p: ['<b>1. Le labo du corps</b> : relie chaque nutriment à la partie du corps qu’il aide. La zone s’illumine.', '<b>2. Les courses</b> : le chariot avance dans le magasin. À chaque arrêt, choisis le produit le plus adapté à la mission. Les autres ne sont pas interdits : ils correspondent moins bien à l’objectif.'],
      quiz: { q: 'Quel nutriment aide surtout à construire et entretenir les muscles ?', opts: ['Les protéines', 'Les glucides'], a: 0, why: 'Les protéines servent à construire et entretenir les tissus, dont les muscles.' } }
  ] }
];
const SHOP_COURSE = [{ name: 'Au rayon', pages: [
  { h: 'Comment choisir au rayon ?', steps: ['<b>Lis la mission</b> : par exemple « de l’énergie avec des fibres ».', '<b>Regarde ce que chaque produit apporte</b> : les petites étiquettes (glucides, fibres, calcium…) t’aident.', '<b>Choisis le plus adapté à la mission</b>. Les autres ne sont pas interdits : ils répondent moins bien à cet objectif précis.'] },
  { h: 'Une astuce pour la vraie vie', p: ['Au magasin, tu peux comparer deux produits du même rayon avec le <b>tableau nutritionnel pour 100 g</b> : fibres, sucres, sel…', 'La <b>liste d’ingrédients</b> commence par l’ingrédient le plus présent. Si le sucre arrive en premier, le produit en contient beaucoup.'],
    quiz: { q: 'Dans une liste d’ingrédients, le premier ingrédient est…', opts: ['Le plus présent', 'Le moins présent'], a: 0, why: 'Les ingrédients sont toujours rangés du plus présent au moins présent.' } }
] }];

/* =====================================================================
   4. COMPOSE TON ASSIETTE
   ===================================================================== */
const PLATE_COURSE = [{ name: 'Une assiette variée', pages: [
  { h: 'Une assiette variée, c’est quoi ?', p: ['C’est une assiette qui réunit <b>plusieurs familles d’aliments</b>. Chacune apporte quelque chose de différent :'],
    groups: [['Légumes et fruits', [['🥦', 'Brocoli'], ['🍅', 'Tomate'], ['🍎', 'Pomme']]], ['Féculents', [['🍚', 'Riz'], ['🍞', 'Pain'], ['🥔', 'Pommes de terre']]], ['Aliments protéinés', [['🍗', 'Poulet'], ['🐟', 'Poisson'], ['🫘', 'Lentilles']]], ['Boisson', [['💧', 'Eau']]]] },
  { h: 'Une méthode simple', p: ['Pour composer un repas rapidement, imagine ton assiette en morceaux :'],
    steps: ['<b>La moitié</b> de légumes (crus ou cuits).', '<b>Un quart</b> de féculents (riz, pâtes, pain, pommes de terre).', '<b>Un quart</b> d’aliments protéinés (œuf, poisson, viande, légumineuses).', 'Un verre d’<b>eau</b>, et éventuellement un fruit ou un yaourt en dessert.'],
    tip: 'Pas besoin de peser : ce repère visuel marche à la maison comme à la cantine.' },
  { h: 'Et les autres aliments ?', p: ['Les <b>matières grasses</b> (huile, beurre) servent à cuisiner, en petite quantité.', 'Les <b>plats composés</b> (burger, pizza) et les <b>produits sucrés</b> peuvent faire partie de la vie, plutôt de temps en temps. Ils ne remplacent pas les légumes.', 'Les <b>boissons sucrées</b> apportent beaucoup de sucre sans rassasier : l’eau reste la boisson de base.'] },
  { h: 'Comment le jeu compte les points', p: ['Choisis <b>5 aliments</b> parmi 10 et glisse-les sur l’assiette. Tu marques 20 points pour chaque repère réuni :'],
    steps: ['un légume ou un fruit,', 'une source de protéines,', 'un féculent,', 'au moins 4 familles différentes,', 'de l’eau.'],
    after: ['Dans ce défi, le duo burger + frites ne rapporte pas de points : ce n’est pas une interdiction, c’est la règle du jeu pour s’entraîner à varier.'] }
] }];

/* =====================================================================
   5. FAMILLES + FOOD RUN
   ===================================================================== */
const FAMILY_COURSE = [
  { name: 'Les familles', pages: [
    { h: 'Les 7 familles d’aliments (1/2)', p: ['Ranger les aliments par familles aide à <b>varier ses repas</b> : chaque famille a un rôle.'],
      groups: [['Fruits et légumes · vitamines, fibres', [['🍎', 'Pomme'], ['🥕', 'Carotte'], ['🥦', 'Brocoli']]], ['Féculents · énergie', [['🍝', 'Pâtes'], ['🍚', 'Riz'], ['🍞', 'Pain']]], ['Viandes, poissons, œufs · protéines', [['🍗', 'Poulet'], ['🐟', 'Thon'], ['🥚', 'Œuf']]]] },
    { h: 'Les 7 familles d’aliments (2/2)', groups: [['Produits laitiers · calcium, protéines', [['🥛', 'Lait'], ['🥣', 'Yaourt nature'], ['🧀', 'Fromage']]], ['Matières grasses · pour cuisiner', [['🫒', 'Huile'], ['🧈', 'Beurre']]], ['Boissons · l’eau d’abord', [['💧', 'Eau'], ['🍵', 'Thé sans sucre']]], ['Produits sucrés · pour le plaisir', [['🍬', 'Bonbons'], ['🍪', 'Biscuits']]]],
      tip: 'La famille, NOVA et SIGA répondent à des questions différentes : les pâtes sont des féculents (famille), et des pâtes nature sont peu transformées (NOVA).' }
  ] },
  { name: 'Food Run', pages: [
    { h: 'Halo vert : à favoriser', p: ['Les fruits et légumes de la course apportent de l’eau, des <b>fibres</b> et des <b>vitamines</b>. On peut en manger souvent, à chaque repas.'],
      foods: [['🍎', 'Pomme'], ['🍌', 'Banane'], ['🥦', 'Brocoli'], ['🥕', 'Carotte'], ['🍓', 'Fraise'], ['🍊', 'Orange'], ['🍅', 'Tomate']] },
    { h: 'Halo rouge : à limiter selon la fréquence', p: ['Ces produits sont souvent riches en <b>sucre, en gras ou en sel</b> et apportent peu de fibres. Ils ne sont pas interdits : on les garde plutôt pour <b>certaines occasions</b>.'],
      foods: [['🥤', 'Soda'], ['🍩', 'Donut'], ['🥔', 'Chips'], ['🍬', 'Bonbons'], ['🍪', 'Biscuits industriels']],
      tip: 'Une astuce : garder les produits sucrés hors de vue (dans un placard plutôt que sur la table) réduit les grignotages automatiques.' },
    { h: 'Comment jouer', steps: ['<b>Glisse à gauche ou à droite</b> pour changer de voie.', '<b>Glisse vers le haut</b> pour sauter au-dessus des barrières.', '<b>Glisse vers le bas</b> pour passer sous les panneaux.', 'Tu as <b>3 cœurs</b> : un aliment à limiter ou un obstacle en fait perdre un.'] }
  ] }
];

/* =====================================================================
   6. QUI SUIS-JE ?
   ===================================================================== */
const WHO_COURSE = [{ name: 'Mener l’enquête', pages: [
  { h: 'Comment trouver un aliment mystère ?', steps: ['<b>La famille</b> : est-ce un fruit, un produit laitier, un poisson… ?', '<b>La préparation</b> : est-il frais, en conserve, nature, aromatisé ?', '<b>Ce qu’il apporte</b> : protéines, calcium, fibres… ?'],
    p: ['Les trois propositions se ressemblent souvent : c’est le détail de l’indice qui fait la différence.'] },
  { h: 'Pourquoi c’est utile ?', p: ['Au magasin, des produits proches peuvent être très différents : un <b>yaourt nature</b> et un <b>yaourt à boire à la fraise</b> sont tous les deux des produits laitiers, mais le second contient du sucre ajouté et des arômes.'],
    compare: [[['🥣', 'Yaourt nature', '1'], ['🥤', 'Yaourt à boire à la fraise', '4']]],
    tip: 'Lire le nom complet du produit (« nature », « aromatisé », « au naturel », « à l’huile ») donne déjà beaucoup d’indices.' }
] }];

/* ---------- Branchement des leçons sur le parcours ---------- */
(() => {
  const baseHome = renderHome;
  renderHome = function () { state.lessonSeen = {}; baseHome(); };

  /* NOVA et SIGA */
  const baseLesson = renderLesson;
  renderLesson = function (which) {
    if (which === 'nova') lessonPager({ id: 'nova', tag: 'Avant le défi · cours NOVA', title: 'Comprendre la classification NOVA', sub: 'Des petites pages pour comprendre, avec des exemples. Tu peux naviguer entre les chapitres.', chapters: NOVA_COURSE, progress: 0, doneLabel: 'J’ai compris, au tri ! →', done: () => { state.idx = 0; renderNova(0); } });
    else if (which === 'siga') lessonPager({ id: 'siga', tag: 'Avant le défi · SIGA', title: 'Comprendre le score SIGA', chapters: SIGA_COURSE, progress: 1, doneLabel: 'Compris, on joue ! →', done: () => { state.idx = 1; renderSiga(0); } });
    else baseLesson(which);
  };

  /* Nutriments : leçon complète puis labo, et petite leçon avant les courses */
  renderNutrientLesson = function () {
    lessonPager({ id: 'nutri', tag: 'Mission Nutriments · leçon', title: 'Ce que les aliments apportent au corps', chapters: NUTRI_COURSE, progress: 4, doneLabel: 'Commencer le labo du corps →', done: () => startNutrientBody() });
  };
  const baseShop = startNutrientShop;
  startNutrientShop = function () {
    if (state.lessonSeen.shop) { baseShop(); return; }
    lessonPager({ id: 'shop', tag: 'Mission Nutriments · courses', title: 'Avant de faire les courses', chapters: SHOP_COURSE, progress: 4, doneLabel: 'Prendre le chariot →', done: () => baseShop() });
  };

  /* Assiette */
  const basePlate = renderPlate;
  renderPlate = function (r) {
    if (r === 0 && !state.lessonSeen.plate) { lessonPager({ id: 'plate', tag: 'Avant le défi · assiette', title: 'Composer une assiette variée', chapters: PLATE_COURSE, progress: 5, doneLabel: 'Composer mon assiette →', done: () => renderPlate(0) }); return; }
    basePlate(r);
  };

  /* Familles + Food Run */
  renderFamiliesLesson = function () {
    lessonPager({ id: 'families', tag: 'Leçon · familles et Food Run', title: 'Les familles d’aliments', chapters: FAMILY_COURSE, progress: 7, doneLabel: 'Je cours ! →', done: () => { state.familiesLessonComplete = true; renderRunner(); } });
  };

  /* Qui suis-je ? */
  const baseWho = renderWho;
  renderWho = function (i) {
    if (i === 0 && !state.lessonSeen.who) { lessonPager({ id: 'who', tag: 'Avant le défi · Qui suis-je ?', title: 'Mener l’enquête', chapters: WHO_COURSE, progress: 8, doneLabel: 'Trouver l’aliment mystère →', done: () => renderWho(0) }); return; }
    baseWho(i);
  };

  /* Food Run : bilan détaillé des aliments rencontrés */
  const RUN_FOODS = [
    ['🍎', 'Pomme', 'good', 'Fruit entier : fibres et vitamines. Facile à emporter pour une collation.'], ['🍌', 'Banane', 'good', 'Apporte de l’énergie et du potassium. Pratique avant une activité physique.'],
    ['🍓', 'Fraise', 'good', 'Riche en vitamine C. En saison, elle se mange nature ou avec un yaourt.'], ['🍊', 'Orange', 'good', 'Vitamine C et fibres : le fruit entier rassasie plus que le jus.'],
    ['🥕', 'Carotte', 'good', 'Vitamine A (vision) et fibres. Crue en bâtonnets ou cuite.'], ['🥦', 'Brocoli', 'good', 'Fibres, vitamine C. Surgelé nature, il est prêt en quelques minutes.'],
    ['🍇', 'Raisin', 'good', 'Un fruit à partager, avec fibres et vitamines.'], ['🍅', 'Tomate', 'good', 'Légume-fruit riche en eau. En salade ou en sauce maison.'],
    ['🥤', 'Soda', 'bad', 'Beaucoup de sucre sans rassasier. L’eau, nature ou pétillante, est la boisson de base.'], ['🥔', 'Chips', 'bad', 'Riches en gras et en sel. Plutôt pour un apéritif de temps en temps.'],
    ['🍩', 'Donut', 'bad', 'Sucre et gras, peu de fibres : un plaisir occasionnel.'], ['🍬', 'Bonbons', 'bad', 'Presque uniquement du sucre : à garder pour certaines occasions.'],
    ['🧃', 'Boisson aux fruits', 'bad', 'Souvent peu de fruit et beaucoup de sucre ajouté. Un fruit entier apporte plus de fibres.'], ['🍪', 'Biscuits industriels', 'bad', 'Souvent ultra-transformés, riches en sucre et en gras. Un fruit ou un yaourt nature peuvent les remplacer au goûter.']
  ];
  const baseRunDone = finishFoodRun3D;
  finishFoodRun3D = function (result) {
    baseRunDone(result);
    if (state.phase !== 'foodrunDone') return;
    const block = document.createElement('div'); block.className = 'run-learn';
    block.innerHTML = `<h3>Ce que tu as croisé pendant la course</h3><div class="run-learn-grid">${RUN_FOODS.map(f => `<div class="run-learn-item ${f[2]}"><span class="lp-food"><b>${f[0]}</b></span><div><strong>${f[1]} · ${f[2] === 'good' ? 'à favoriser' : 'à limiter selon la fréquence'}</strong><small>${f[3]}</small></div></div>`).join('')}</div><div class="lp-tip"><b>💡 Dans la vie de tous les jours</b><p>Ce qui compte, ce sont les choix répétés. Ajouter un fruit ou un légume à un repas, c’est déjà gagner des points dans la vraie vie.</p></div>`;
    document.querySelector('.roof3d-result')?.after(block);
  };
})();

/* ---------- Conseils « au quotidien » après les réponses ---------- */
const DAILY_TIPS = {
  nova: { 1: 'Ces aliments sont une bonne base pour cuisiner : légumes, fruits, œufs, riz, lentilles…', 2: 'Les ingrédients de cuisine s’utilisent en petite quantité pour préparer des plats maison.', 3: 'Les aliments transformés simples (conserves, pain, fromage) sont pratiques : regarde le sel ou le sucre ajouté.', 4: 'Les ultra-transformés peuvent garder une place de temps en temps : lis la liste d’ingrédients pour les repérer.' },
  siga: n => n <= 2 ? 'Les produits simples de ce type peuvent servir de base à tes repas.' : n <= 4 ? 'Pour les produits transformés, compare les étiquettes de deux produits du même rayon.' : 'Ce type de produit peut garder une place, plutôt de temps en temps, dans une alimentation variée.',
  body: { muscles: 'Une source de protéines à chaque repas : œuf, poisson, viande, yaourt, lentilles ou pois chiches.', bones: 'Le calcium se trouve dans le lait, les yaourts, les fromages et certaines eaux minérales riches en calcium.', energy: 'Les féculents complets et les légumineuses donnent une énergie qui dure plus longtemps.', blood: 'Le fer se trouve dans la viande, le poisson et les légumineuses ; un fruit riche en vitamine C aide à absorber le fer végétal.', shield: 'Les fruits et légumes colorés apportent la vitamine C : agrumes, kiwi, poivron.', eyes: 'La vitamine A se trouve notamment dans la carotte, la patate douce et les légumes verts.' },
  plate: 'Une astuce simple : la moitié de l’assiette en légumes, un quart en féculents, un quart en aliments protéinés, et de l’eau à boire.',
  who: 'Au magasin, lis le nom complet du produit (« nature », « aromatisé », « au naturel ») et sa liste d’ingrédients : c’est là que se cachent les différences.'
};
