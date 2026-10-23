/* =====================================================================
   Battle du panier — cours NOVA et SIGA.
   Une seule page visible à la fois, organisée par catégorie
   (« NOVA 1 — Page 2 sur 4 »), avec animations pédagogiques,
   questions de compréhension et corrections immédiates.
   Les mini-jeux ne sont pas modifiés : à la fin du cours, le bouton
   « Compris, on joue ! » lance le jeu existant.
   ===================================================================== */

/* ---------- Visuels réutilisables ---------- */
const F = (e, n) => [e, n];
const V = {
  foods: items => ({ type: 'foods', items }),
  transform: (from, to, badge, via) => ({ type: 'transform', from, to, badge, via }),
  ingredients: (product, items, note) => ({ type: 'ingredients', product, items, note }),
  compare: (items, note) => ({ type: 'compare', items, note }),
  scale: (items, kind) => ({ type: 'scale', items, kind }),
  prof: msg => ({ type: 'prof', msg })
};

/* =====================================================================
   COURS NOVA
   ===================================================================== */
const NOVA_SECTIONS = [
  { key: 'intro', num: '', small: 'Introduction', label: 'Comprendre la classification NOVA', c: 'intro', next: 'Commencer le cours : découvrir NOVA 1 →', pages: [
    { title: 'Comprendre la classification NOVA',
      text: ['Tous les aliments ne subissent pas les mêmes transformations avant d’arriver dans notre assiette.', 'Certains sont consommés presque directement dans leur état naturel, tandis que d’autres sont modifiés, préparés ou fabriqués à partir de nombreux ingrédients.', 'La classification NOVA permet de distinguer <b>quatre groupes d’aliments</b> selon la nature et le degré de leur transformation.'],
      visual: V.scale([['1', 'Non ou peu transformé'], ['2', 'Ingrédient culinaire'], ['3', 'Transformé'], ['4', 'Ultra-transformé']], 'nova'),
      box: ['attention', 'Attention : elle ne classe pas directement les aliments selon leurs calories ou leur qualité nutritionnelle.'] }
  ] },
  { key: 'n1', num: '1', small: 'NOVA 1', label: 'Peu ou pas transformé', c: 'n1', pages: [
    { title: 'Qu’est-ce qu’un aliment NOVA 1 ?', visual: V.foods([F('🍎', 'Pomme'), F('🥕', 'Carotte'), F('🥚', 'Œuf'), F('🐟', 'Poisson frais')]),
      text: ['Les aliments NOVA 1 sont des aliments <b>bruts ou très peu transformés</b>.', 'Ils proviennent directement de la nature et conservent l’essentiel de leur composition d’origine.'],
      box: ['exemple', 'Ce sont par exemple les fruits, les légumes, les œufs, les céréales nature, le poisson frais ou le lait nature. Ils constituent une base importante d’une alimentation variée.'] },
    { title: 'Peut-on transformer un aliment sans le dénaturer ?', visual: V.transform(F('🥦', 'Brocoli frais'), F('❄️', 'Brocolis surgelés nature'), 'Même groupe : NOVA 1'),
      text: ['<b>Oui !</b> Un aliment peut subir certaines transformations simples tout en restant NOVA 1.', 'Par exemple, il peut être lavé, découpé, congelé, séché, pasteurisé ou cuit simplement. Ces procédés servent souvent à améliorer sa conservation ou à faciliter sa préparation.'],
      box: ['exemple', 'Un brocoli surgelé nature appartient donc au même groupe NOVA qu’un brocoli frais.'] },
    { title: 'Comment les reconnaître ?', visual: V.transform(F('🍎', 'Pomme entière'), F('🍏', 'Compote 100 % pomme'), 'Peuvent rester NOVA 1'),
      text: ['Le premier réflexe consiste à regarder la <b>liste des ingrédients</b>.', 'Les aliments NOVA 1 ne contiennent généralement aucun sel, sucre ou matière grasse ajouté.', 'Une pomme entière et une compote composée uniquement de pommes peuvent appartenir au même groupe.'],
      box: ['exemple', 'Cependant, leur texture et leur effet sur la satiété peuvent être différents : la pomme entière se mâche et rassasie souvent davantage.'] },
    { title: 'Le piège à éviter', visual: V.transform(F('🍎', 'Pomme'), F('🍎', 'Pomme découpée'), 'Reste NOVA 1'),
      text: ['Un aliment emballé ou surgelé <b>n’est pas forcément ultra-transformé</b> !', 'Un paquet de légumes surgelés nature peut appartenir à NOVA 1.', 'Ce qui compte, ce n’est pas seulement l’emballage, mais la transformation réalisée et les ingrédients ajoutés.'],
      box: ['retenir', 'Un aliment transformé simplement peut rester proche de son état naturel.'] }
  ] },
  { key: 'n2', num: '2', small: 'NOVA 2', label: 'Ingrédients culinaires', c: 'n2', pages: [
    { title: 'À quoi servent les ingrédients culinaires ?', visual: V.foods([F('🫒', 'Huile d’olive'), F('🧈', 'Beurre'), F('🥄', 'Sucre'), F('🧂', 'Sel'), F('🍯', 'Miel')]),
      text: ['Les ingrédients NOVA 2 sont obtenus à partir d’aliments ou de ressources naturelles.', 'Ils sont principalement utilisés pour <b>préparer, cuisiner ou assaisonner</b> les repas.'],
      box: ['exemple', 'On les utilise généralement avec d’autres aliments plutôt que de les consommer seuls : un filet d’huile sur des légumes, une pincée de sel dans l’eau des pâtes.'] },
    { title: 'Comment sont-ils obtenus ?', visual: V.transform(F('🫒', 'Olives'), F('🫒', 'Huile d’olive'), 'Ingrédient culinaire : NOVA 2', 'pressage'),
      text: ['Certains ingrédients culinaires sont obtenus par <b>pressage, extraction ou raffinage</b>.', 'Par exemple, l’huile d’olive est obtenue en pressant des olives. Le sucre peut être extrait de la canne à sucre ou de la betterave.'],
      box: ['exemple', 'Même si ces ingrédients ont été transformés, ils peuvent être utilisés pour préparer des repas faits maison.'] },
    { title: 'Faut-il les éviter ?', visual: V.foods([F('🫒', 'Huile d’olive'), F('🧂', 'Sel'), F('🥄', 'Sucre')]),
      text: ['<b>Non !</b> Ces ingrédients peuvent avoir leur place dans une alimentation équilibrée.', 'L’huile d’olive apporte notamment des acides gras insaturés utiles à l’organisme.', 'En revanche, les quantités consommées restent importantes : une consommation excessive de sel ou de sucres ajoutés peut être défavorable à la santé.'],
      box: ['retenir', 'Un ingrédient transformé n’est pas automatiquement un mauvais aliment.'] }
  ] },
  { key: 'n3', num: '3', small: 'NOVA 3', label: 'Aliments transformés', c: 'n3', pages: [
    { title: 'Qu’est-ce qu’un aliment transformé ?', visual: V.transform(F('🥕', 'Aliment NOVA 1'), F('🥫', 'Aliment NOVA 3'), 'Base reconnaissable', '+ sel, sucre ou huile'),
      text: ['Un aliment NOVA 3 est généralement obtenu en <b>ajoutant un ou plusieurs ingrédients culinaires</b> à un aliment NOVA 1. Par exemple, on peut ajouter du sel, du sucre ou de l’huile.', 'Ces transformations servent souvent à conserver les aliments ou à modifier leur goût.'],
      box: ['exemple', 'L’aliment d’origine reste généralement reconnaissable.'] },
    { title: 'Pourquoi transforme-t-on les aliments ?', visual: V.transform(F('🥕', 'Légumes frais'), F('🥫', 'Légumes en conserve avec sel'), 'Peut devenir NOVA 3', '+ eau salée'),
      text: ['Imagine des légumes placés dans une conserve avec de l’eau salée. Le sel contribue à leur conservation.', 'Les légumes restent reconnaissables, mais leur préparation a changé.'],
      box: ['exemple', 'Transformer un aliment peut donc servir à prolonger sa conservation et à faciliter son utilisation.'] },
    { title: 'Quels aliments sont concernés ?', visual: V.foods([F('🥫', 'Légumes en conserve avec sel'), F('🐟', 'Sardines à l’huile'), F('🍞', 'Pain traditionnel'), F('🧀', 'Fromage')]),
      text: ['Plusieurs aliments du quotidien peuvent appartenir à NOVA 3 : certains légumes en conserve avec du sel, certains poissons conservés dans l’huile, les pains traditionnels, certains fromages.'],
      box: ['attention', 'Attention, deux produits portant le même nom peuvent appartenir à des groupes différents selon leur recette.'] },
    { title: 'Comment reconnaître NOVA 3 ?', visual: V.compare([{ e: '🍞', n: 'Pain traditionnel', g: '3', rows: ['Farine', 'Eau', 'Levure', 'Sel'] }, { e: '🍞', n: 'Pain industriel', g: '4', rows: ['Farine', 'Eau', 'Sucre', 'Émulsifiant', 'Arôme', '…'] }], 'Recettes données à titre d’exemple.'),
      text: ['Un produit NOVA 3 possède généralement une base alimentaire identifiable et quelques ingrédients ajoutés.', 'Un pain traditionnel peut être préparé avec de la farine, de l’eau, de la levure et du sel. Un pain industriel contenant des ingrédients caractéristiques d’une formulation ultra-transformée peut appartenir à NOVA 4. Il faut donc apprendre à comparer les recettes.'],
      box: ['retenir', 'Un aliment transformé peut tout à fait faire partie d’une alimentation équilibrée.'] }
  ] },
  { key: 'n4', num: '4', small: 'NOVA 4', label: 'Ultra-transformés', c: 'n4', pages: [
    { title: 'Qu’est-ce qu’un aliment ultra-transformé ?', visual: V.foods([F('🥤', 'Soda'), F('🍪', 'Biscuit fourré'), F('🍜', 'Nouilles instantanées')]),
      text: ['Un aliment NOVA 4 est généralement issu d’une <b>formulation industrielle</b>.', 'Il peut contenir des ingrédients ou des substances rarement utilisés dans une cuisine familiale. Ces ingrédients peuvent servir à modifier le goût, la texture, la couleur ou l’apparence du produit.'],
      box: ['exemple', 'L’objectif est de comprendre comment ces aliments sont fabriqués, sans considérer automatiquement tous les produits industriels comme identiques.'] },
    { title: 'Comment les reconnaître ?', visual: V.ingredients(F('🍪', 'Biscuit fourré'), [['Farine de blé'], ['Sucre'], ['Sirop de glucose', 'Un sirop industriel : il sucre et rend la texture moelleuse.'], ['Huile végétale'], ['Cacao maigre'], ['Émulsifiant : lécithines', 'Il aide à mélanger le gras et l’eau pour une texture régulière.'], ['Arôme', 'Il donne ou renforce un goût.'], ['Colorant', 'Il modifie la couleur du produit.']], 'Exemple fictif, construit pour apprendre à lire une étiquette.'),
      text: ['Pour reconnaître certains aliments ultra-transformés, il faut examiner la liste des ingrédients. On peut notamment trouver des arômes, certains émulsifiants, certains colorants, des édulcorants, des protéines isolées ou certains sirops industriels.', 'Ces éléments peuvent être des <b>indices</b> d’ultra-transformation.'],
      box: ['attention', 'Attention : tous les additifs ne suffisent pas, à eux seuls, à classer un produit NOVA 4. Et un additif n’est pas forcément dangereux : il a un rôle dans la fabrication.'] },
    { title: 'Exemples du quotidien', visual: V.foods([F('🥤', 'Soda'), F('🍬', 'Bonbons'), F('🍜', 'Nouilles instantanées'), F('🍪', 'Biscuits fourrés'), F('🍯', 'Céréales industrielles')]),
      text: ['Plusieurs produits consommés au quotidien peuvent appartenir à NOVA 4 : les sodas classiques, de nombreux bonbons, les nouilles instantanées aromatisées, les biscuits fourrés industriels, certaines céréales industrielles.'],
      box: ['attention', 'Cependant, il faut toujours vérifier la recette exacte du produit.'] },
    { title: 'Pourquoi faut-il faire attention ?', visual: V.foods([F('🥤', 'Soda'), F('🍪', 'Biscuits')]),
      text: ['De nombreux aliments ultra-transformés sont riches en sucres, en sel ou en graisses. Certains sont également faciles à consommer rapidement et en grande quantité.', 'Les recherches scientifiques associent une consommation <b>élevée</b> d’aliments ultra-transformés à plusieurs problèmes de santé.'],
      box: ['exemple', 'Cela ne signifie pas que chaque aliment ultra-transformé présente exactement les mêmes caractéristiques nutritionnelles ou les mêmes risques.'] },
    { title: 'Comment améliorer ses choix ?', visual: V.compare([{ e: '🥤', n: 'Soda', to: ['💧', 'Eau'] }, { e: '🍪', n: 'Biscuits fourrés', to: ['🥣', 'Fruit + yaourt nature'] }, { e: '🍜', n: 'Nouilles aromatisées', to: ['🍝', 'Pâtes, légumes et œuf'] }], ''),
      text: ['Il n’est pas nécessaire d’interdire tous les aliments ultra-transformés. L’objectif est surtout de privilégier plus régulièrement des <b>alternatives simples</b> : remplacer plus souvent un soda par de l’eau, choisir un fruit et un yaourt nature à la place de biscuits fourrés, préparer des pâtes avec des légumes et un œuf plutôt que des nouilles instantanées aromatisées.', 'Ces changements peuvent contribuer à améliorer progressivement la qualité globale de l’alimentation.'],
      box: ['retenir', 'Ce sont les habitudes alimentaires dans leur ensemble qui comptent.'] }
  ] },
  { key: 'quiz', num: '?', small: 'Vérification', label: 'Vérifie tes connaissances NOVA', c: 'quiz', quiz: true, pages: [
    { q: 'Des carottes surgelées nature sont-elles ultra-transformées ?', visual: V.foods([F('❄️', 'Carottes surgelées nature')]), opts: ['Oui, parce qu’elles sont surgelées.', 'Non, elles restent NOVA 1.', 'Oui, parce qu’elles sont emballées.'], a: 1, why: 'La congélation est une transformation simple qui permet de conserver les aliments. Des carottes surgelées sans ingrédients ajoutés restent NOVA 1.' },
    { q: 'Pourquoi l’huile d’olive appartient-elle à NOVA 2 ?', visual: V.foods([F('🫒', 'Huile d’olive')]), opts: ['Parce qu’elle est mauvaise pour la santé.', 'Parce qu’elle sert principalement d’ingrédient culinaire.', 'Parce qu’elle contient toujours des additifs.'], a: 1, why: 'L’huile d’olive est obtenue par extraction à partir des olives. Elle sert notamment à cuisiner et à assaisonner les repas.' },
    { q: 'Un produit emballé est-il forcément ultra-transformé ?', visual: V.foods([F('🫘', 'Lentilles en sachet'), F('🍪', 'Biscuits en sachet')]), opts: ['Oui, toujours.', 'Non, cela dépend de sa transformation et de ses ingrédients.', 'Oui, s’il est vendu en supermarché.'], a: 1, why: 'Un produit emballé peut être brut, peu transformé, transformé ou ultra-transformé. L’emballage seul ne permet pas de déterminer son groupe NOVA.' }
  ] },
  { key: 'end', num: '', small: 'Bravo', label: 'Cours NOVA terminé', c: 'end', final: true, pages: [
    { title: 'Bravo !', visual: V.prof('Bravo ! Tu as terminé le cours NOVA. Maintenant, utilise ce que tu as appris pour relever le défi du tri !') }
  ] }
];

/* =====================================================================
   COURS SIGA (présentation pédagogique en 7 niveaux de la fiche de cours)
   ===================================================================== */
const SIGA_SECTIONS = [
  { key: 'intro', num: '', small: 'Introduction', label: 'Comprendre la classification SIGA', c: 'intro', next: 'Commencer le cours : découvrir SIGA 1 →', pages: [
    { title: 'Comprendre la classification SIGA',
      text: ['Deux aliments peuvent appartenir au même groupe NOVA tout en ayant des compositions nutritionnelles différentes.', 'La classification SIGA propose une analyse plus détaillée des aliments. Elle prend notamment en compte des <b>marqueurs d’ultra-transformation</b> et certains aspects du <b>profil nutritionnel</b>.', 'Dans la présentation pédagogique utilisée ici, elle distingue <b>sept niveaux</b> :'],
      visual: V.scale([['1', 'Non transformé'], ['2', 'Peu transformé'], ['3', 'Transformé équilibré'], ['4', 'Transformé gourmand'], ['5', 'Ultra-transformé équilibré'], ['6', 'Ultra-transformé gourmand'], ['7', 'Ultra-transformé à limiter']], 'siga'),
      box: ['exemple', 'Ces niveaux permettent de mieux comprendre les différences entre les aliments, sans résumer toute la qualité d’un repas à un seul chiffre.'] }
  ] },
  { key: 's1', num: '1', small: 'SIGA 1', label: 'Non transformé', c: 's1', pages: [
    { title: 'Qu’est-ce qu’un aliment non transformé ?', visual: V.foods([F('🍎', 'Pomme fraîche'), F('🥕', 'Carotte entière'), F('🥚', 'Œuf'), F('🐟', 'Poisson frais')]),
      text: ['Un aliment non transformé est un <b>aliment brut</b> qui provient directement de la nature.', 'Il n’a subi aucune transformation importante. Il conserve ses caractéristiques naturelles.'] },
    { title: 'Comment reconnaître ces aliments ?', visual: V.transform(F('🍎', 'Pomme entière'), F('🍎', 'Pomme cuite'), 'À réévaluer selon SIGA', 'cuisson'),
      text: ['Ces aliments sont généralement présentés dans leur état naturel. Ils ne contiennent pas d’ingrédients ajoutés.', 'Une pomme entière est un exemple simple d’aliment non transformé.'],
      box: ['exemple', 'Lorsqu’elle est cuite ou préparée en compote, elle subit une transformation et doit être réévaluée selon les critères SIGA.'] },
    { title: 'Pourquoi en consommer ?', visual: V.foods([F('🥦', 'Brocoli'), F('🍊', 'Orange'), F('🫘', 'Lentilles'), F('🥚', 'Œuf')]),
      text: ['Les aliments bruts apportent différents nutriments utiles à l’organisme. Selon leur nature, ils peuvent fournir des fibres, des vitamines, des minéraux ou des protéines.', 'Ils constituent une base intéressante pour composer des repas variés.'],
      box: ['retenir', 'SIGA 1 correspond aux aliments bruts, sans transformation importante.'] }
  ] },
  { key: 's2', num: '2', small: 'SIGA 2', label: 'Peu transformé', c: 's2', pages: [
    { title: 'Qu’est-ce qu’un aliment peu transformé ?', visual: V.transform(F('🥛', 'Lait cru'), F('🥛', 'Lait pasteurisé'), 'Proche de l’aliment d’origine', 'pasteurisation'),
      text: ['Un aliment peu transformé a subi des <b>modifications simples</b>. Il peut avoir été cuit, pressé, découpé ou pasteurisé.', 'Ces procédés permettent souvent de mieux conserver ou préparer les aliments.'],
      box: ['exemple', 'L’aliment reste relativement proche de sa composition d’origine.'] },
    { title: 'Quels aliments sont concernés ?', visual: V.foods([F('🥛', 'Lait pasteurisé'), F('❄️', 'Légumes surgelés nature'), F('🍏', 'Compote 100 % fruits')]),
      text: ['Plusieurs aliments simples peuvent être peu transformés : le lait pasteurisé, les légumes surgelés nature, certaines compotes 100 % fruits.', 'Leur classement SIGA exact dépend du produit et du référentiel utilisé.'],
      box: ['exemple', 'La transformation ne signifie pas nécessairement que l’aliment a perdu son intérêt nutritionnel.'] },
    { title: 'Ce qu’il faut comprendre', visual: V.transform(F('🥕', 'Carotte crue'), F('🥕', 'Carotte cuite'), 'Des effets dans les deux sens', 'cuisson'),
      text: ['Les transformations simples peuvent parfois modifier certaines caractéristiques des aliments. Par exemple, la cuisson peut réduire la quantité de certaines vitamines sensibles à la chaleur.', 'Cependant, elle peut aussi faciliter la digestion ou rendre certains nutriments plus accessibles. Il faut donc éviter de penser que toutes les transformations sont mauvaises.'],
      box: ['retenir', 'Un aliment peu transformé peut conserver de nombreuses qualités nutritionnelles.'] }
  ] },
  { key: 's3', num: '3', small: 'SIGA 3', label: 'Transformé équilibré', c: 's3', pages: [
    { title: 'Qu’est-ce qu’un aliment transformé équilibré ?', visual: V.foods([F('🧀', 'Fromage'), F('🥫', 'Légumes préparés')]),
      text: ['Un aliment transformé équilibré est un produit dont la recette a été modifiée par l’<b>ajout d’ingrédients culinaires</b>.', 'Cependant, son profil nutritionnel reste relativement favorable selon les critères SIGA. Il peut contenir du sel, du sucre ou des matières grasses en quantités considérées comme modérées par le référentiel.'] },
    { title: 'Exemple concret', visual: V.transform(F('🥕', 'Légumes'), F('🥫', 'Légumes préparés'), 'Composition simple', '+ un peu d’huile et de sel'),
      text: ['Imagine des légumes préparés avec un peu d’huile d’olive et de sel. Ils ne sont plus totalement bruts, mais leur composition reste simple.', 'Certains produits traditionnels ou fromages peuvent également appartenir à cette catégorie selon leur composition exacte.'],
      box: ['exemple', 'D’après votre fiche de cours, le Babybel Original est classé SIGA 3.'] },
    { title: 'Comment reconnaître un produit équilibré ?', visual: V.compare([{ e: '🧀', n: 'Produit A', rows: ['Sel : modéré', 'Matières grasses : modérées'] }, { e: '🧀', n: 'Produit B', rows: ['Sel : élevé', 'Matières grasses : élevées'] }], 'Comparaison illustrative, sans valeurs officielles.'),
      text: ['Il faut observer la nature des ingrédients, mais aussi leur <b>quantité</b>. Deux produits similaires peuvent avoir des profils nutritionnels différents.', 'Il est notamment utile de comparer leur teneur en sel, en sucres et en matières grasses.'],
      box: ['retenir', 'Un produit transformé peut conserver un profil nutritionnel intéressant.'] }
  ] },
  { key: 's4', num: '4', small: 'SIGA 4', label: 'Transformé gourmand', c: 's4', pages: [
    { title: 'Que signifie « gourmand » ?', visual: V.foods([F('🍓', 'Confiture'), F('🥤', 'Boisson lactée aromatisée')]),
      text: ['Un aliment transformé gourmand est un produit dont la composition est <b>plus riche</b> en certains ingrédients comme le sucre, le sel ou les matières grasses.', 'Il ne contient pas nécessairement de marqueurs d’ultra-transformation. La distinction repose sur les critères nutritionnels définis par SIGA.'] },
    { title: 'Exemple concret', visual: V.compare([{ e: '🍓', n: 'Confiture A', rows: ['Sucres : 35 g / 100 g'] }, { e: '🍓', n: 'Confiture B', dark: true, rows: ['Sucres : 60 g / 100 g'] }], 'Valeurs fictives, pour comparer.'),
      text: ['Imagine deux confitures traditionnelles. La première contient une quantité modérée de sucre, la seconde une quantité de sucre beaucoup plus importante.', 'Même si elles sont préparées avec des ingrédients simples, leurs profils nutritionnels peuvent être différents.'],
      box: ['exemple', 'Cela montre pourquoi la composition nutritionnelle est importante.'] },
    { title: 'Comment faire un meilleur choix ?', visual: V.foods([F('🍓', 'Confiture')]),
      text: ['Il est possible de comparer les produits en regardant les quantités de sucres, de sel et de matières grasses. Il faut également tenir compte des <b>portions</b> consommées.', 'Un aliment gourmand peut être consommé occasionnellement dans une alimentation variée.'],
      box: ['retenir', 'Un aliment traditionnel ou peu complexe peut tout de même être riche en sucres, en sel ou en graisses.'] }
  ] },
  { key: 's5', num: '5', small: 'SIGA 5', label: 'Ultra-transformé équilibré', c: 's5', pages: [
    { title: 'Peut-on être ultra-transformé et équilibré ?', visual: V.foods([F('🍮', 'Dessert industriel aux fruits')]),
      text: ['<b>Oui, selon SIGA !</b> Un aliment peut contenir des marqueurs d’ultra-transformation tout en présentant un profil nutritionnel relativement favorable.', 'Cela montre que le degré de transformation et la composition nutritionnelle ne sont pas exactement la même chose.'] },
    { title: 'Comment est-ce possible ?', visual: V.ingredients(F('🍮', 'Dessert aux fruits'), [['Purée de pommes'], ['Purée de fraises'], ['Sucre'], ['Arôme', 'Un ingrédient caractéristique de l’ultra-transformation : il renforce le goût.']], 'Exemple fictif, construit pour apprendre à lire une étiquette.'),
      text: ['Imagine un dessert industriel contenant principalement des fruits. Il peut également contenir un ingrédient caractéristique de l’ultra-transformation.', 'Malgré cela, son profil nutritionnel peut être relativement favorable pour certains nutriments.'],
      box: ['attention', 'Il reste toutefois ultra-transformé.'] },
    { title: 'Est-ce forcément un aliment sain ?', visual: V.foods([F('🍮', 'Dessert aux fruits')]),
      text: ['<b>Non !</b> Le mot « équilibré » ne signifie pas que l’aliment est idéal ou qu’il faut en consommer à volonté.', 'Il indique simplement que son profil nutritionnel est plus favorable selon certains critères SIGA. Il faut aussi prendre en compte les quantités consommées et l’alimentation globale.'] },
    { title: 'Ce qu’il faut comprendre', visual: V.compare([{ e: '🍮', n: 'Ultra-transformé A', rows: ['Sucres : moins élevés'] }, { e: '🍮', n: 'Ultra-transformé B', rows: ['Sucres : très élevés'] }], 'Comparaison illustrative.'),
      text: ['Deux aliments ultra-transformés peuvent avoir des compositions très différentes. L’un peut être très riche en sucres, alors que l’autre en contient beaucoup moins.', 'Il est donc important de ne pas les considérer automatiquement comme identiques.'],
      box: ['retenir', 'Un produit ultra-transformé n’est pas automatiquement très riche en sucres, en sel ou en matières grasses.'] }
  ] },
  { key: 's6', num: '6', small: 'SIGA 6', label: 'Ultra-transformé gourmand', c: 's6', pages: [
    { title: 'Qu’est-ce qu’un ultra-transformé gourmand ?', visual: V.foods([F('🍗', 'Nuggets'), F('🍰', 'Gâteau enrobé')]),
      text: ['Il s’agit d’un produit qui contient des <b>marqueurs d’ultra-transformation</b>. Son profil nutritionnel est également plus riche en certains éléments comme les sucres, le sel ou les matières grasses.', 'Cette catégorie combine donc la notion d’ultra-transformation et celle de composition nutritionnelle.'] },
    { title: 'Exemple concret', visual: V.ingredients(F('🍮', 'Dessert lacté aromatisé'), [['Lait'], ['Sucre'], ['Crème'], ['Amidon modifié', 'Il épaissit le dessert.'], ['Carraghénanes', 'Un épaississant : il donne une texture onctueuse.'], ['Arôme', 'Il donne le goût vanille ou chocolat.']], 'Exemple fictif, construit pour apprendre à lire une étiquette.'),
      text: ['Imagine un dessert lacté industriel aromatisé. Il peut contenir du lait, du sucre, des arômes et des ingrédients destinés à modifier sa texture.', 'Selon sa recette, il peut être classé parmi les produits ultra-transformés gourmands.'],
      box: ['exemple', 'Pour connaître sa catégorie exacte, il faut examiner sa composition.'] },
    { title: 'Comment adapter sa consommation ?', visual: V.compare([{ e: '🍮', n: 'Dessert lacté aromatisé', to: ['🥣', 'Yaourt nature + fruits'] }], ''),
      text: ['Il est possible de comparer plusieurs produits et de choisir plus régulièrement des versions simples.', 'Par exemple, un yaourt nature accompagné de fruits peut remplacer occasionnellement un dessert lacté aromatisé.'],
      box: ['retenir', 'Un produit gourmand peut garder une place pour le plaisir ; on choisit plus souvent des versions simples au quotidien.'] }
  ] },
  /* SIGA 7 : contenu rédigé car absent du prompt reçu (à faire relire) */
  { key: 's7', num: '7', small: 'SIGA 7', label: 'Ultra-transformé à limiter', c: 's7', pages: [
    { title: 'Que signifie « à limiter » ?', visual: V.foods([F('🍜', 'Nouilles instantanées'), F('🍬', 'Bonbons')]),
      text: ['C’est le dernier niveau de la présentation SIGA utilisée ici.', 'Il regroupe des produits qui <b>cumulent plusieurs marqueurs d’ultra-transformation</b> selon le référentiel SIGA, avec souvent un profil nutritionnel moins favorable.'] },
    { title: 'Exemples', visual: V.foods([F('🍜', 'Nouilles instantanées'), F('🍬', 'Bonbons')]),
      text: ['D’après votre fiche de cours, des nouilles instantanées ou des bonbons peuvent appartenir à ce niveau.', 'Comme pour les autres niveaux, la catégorie exacte dépend de la composition du produit.'],
      box: ['attention', 'Deux produits du même rayon peuvent être classés différemment : il faut regarder la recette.'] },
    { title: 'Pourquoi « à limiter » ?', visual: V.foods([F('🍬', 'Bonbons')]),
      text: ['« À limiter » ne veut pas dire interdit. Cela signifie qu’il est préférable de ne pas en faire la base de l’alimentation quotidienne.', 'Ces produits sont souvent faciles à consommer rapidement et en grande quantité : les garder pour certaines occasions aide à garder une alimentation variée.'] },
    { title: 'Que choisir à la place, de temps en temps ?', visual: V.compare([{ e: '🍜', n: 'Nouilles instantanées', to: ['🍝', 'Pâtes + légumes'] }, { e: '🍬', n: 'Bonbons', to: ['🍊', 'Fruit'] }], ''),
      text: ['Il est possible de remplacer plus souvent ces produits par des alternatives simples : des pâtes avec des légumes à la place de nouilles instantanées, un fruit à la place de bonbons.'],
      box: ['retenir', 'SIGA 7 désigne des produits à garder pour des occasions, sans culpabiliser quand on en mange.'] }
  ] },
  { key: 'quiz', num: '?', small: 'Vérification', label: 'Vérifie tes connaissances SIGA', c: 'quiz', quiz: true, pages: [
    { q: 'Deux aliments NOVA 4 possèdent-ils forcément le même profil nutritionnel ?', visual: V.foods([F('🥤', 'Soda'), F('🍮', 'Dessert aux fruits')]), opts: ['Oui.', 'Non.', 'Uniquement s’ils sont de la même marque.'], a: 1, why: 'Deux aliments ultra-transformés peuvent avoir des quantités différentes de sucre, de sel ou de matières grasses. Leur profil nutritionnel n’est donc pas nécessairement identique.' },
    { q: 'Un produit ultra-transformé peut-il présenter un profil nutritionnel relativement favorable ?', visual: V.foods([F('🍮', 'Dessert aux fruits')]), opts: ['Oui, selon certains critères nutritionnels.', 'Non, jamais.', 'Seulement s’il est biologique.'], a: 0, why: 'Un produit ultra-transformé peut présenter un profil nutritionnel relativement favorable selon certains critères. Cela ne signifie pas qu’il est automatiquement idéal pour la santé.' },
    { q: 'Pourquoi faut-il comparer la composition des aliments ?', visual: V.foods([F('🍓', 'Confiture A'), F('🍓', 'Confiture B')]), opts: ['Pour choisir uniquement les produits les moins caloriques.', 'Pour comprendre leurs différences et faire des choix plus éclairés.', 'Pour supprimer tous les aliments transformés.'], a: 1, why: 'La liste d’ingrédients et le tableau nutritionnel permettent de mieux comprendre les caractéristiques d’un produit. Ils peuvent aider à comparer plusieurs aliments.' }
  ] },
  /* Synthèse : pages 1 à 3 rédigées car absentes du prompt reçu (à faire relire) ; page 4 fournie */
  { key: 'synth', num: '★', small: 'Synthèse', label: 'NOVA, SIGA et alimentation qualitative', c: 'synth', pages: [
    { title: 'NOVA et SIGA : deux questions différentes', visual: V.compare([{ e: '🏭', n: 'NOVA', rows: ['Comment l’aliment a-t-il été fabriqué ?', '4 groupes'] }, { e: '📊', n: 'SIGA', rows: ['Fabrication + marqueurs d’ultra-transformation + profil nutritionnel', '7 niveaux (présentation du cours)'] }], ''),
      text: ['<b>NOVA</b> regarde surtout la nature et le degré de transformation des aliments.', '<b>SIGA</b> ajoute des critères nutritionnels : deux produits du même groupe NOVA peuvent donc avoir des niveaux SIGA différents.'] },
    { title: 'Comparer plutôt que juger', visual: V.compare([{ e: '🍓', n: 'Confiture A', rows: ['Sucres : 35 g / 100 g'] }, { e: '🍓', n: 'Confiture B', dark: true, rows: ['Sucres : 60 g / 100 g'] }], 'Valeurs fictives.'),
      text: ['Ces classifications servent à <b>comparer</b> des produits proches, pas à juger un aliment ou une personne.', 'Deux produits similaires peuvent avoir des compositions différentes : la liste d’ingrédients et le tableau nutritionnel aident à les distinguer.'] },
    { title: 'La qualité ne se résume pas à un chiffre', visual: V.foods([F('🥦', 'Légumes'), F('🍚', 'Féculents'), F('🐟', 'Protéines'), F('💧', 'Eau')]),
      text: ['Un groupe NOVA ou un niveau SIGA décrit <b>un produit</b>. La qualité de l’alimentation dépend aussi de la diversité, des quantités, de la fréquence et de l’ensemble des repas.', 'Le plaisir, le budget, le temps disponible et les habitudes de chacun comptent également.'] },
    { title: 'Comment mieux manger au quotidien ?', visual: V.prof('Bravo ! Maintenant, tu connais les principales différences entre les classifications NOVA et SIGA. Tu vas pouvoir utiliser ces connaissances dans les jeux pour apprendre à reconnaître les aliments et à faire tes propres choix !'),
      text: ['Pour améliorer progressivement la qualité de son alimentation, plusieurs habitudes peuvent être adoptées :'],
      bullets: ['Varier les fruits et les légumes.', 'Consommer régulièrement des aliments bruts ou peu transformés.', 'Apprendre à lire les listes d’ingrédients.', 'Comparer les informations nutritionnelles.', 'Privilégier l’eau comme boisson principale.', 'Veiller à apporter suffisamment de protéines, de glucides, de lipides, de fibres, de vitamines et de minéraux.', 'Adapter les quantités aux besoins de son organisme.'],
      after: ['L’objectif n’est pas de manger parfaitement, mais d’apprendre à faire des choix alimentaires plus éclairés.'],
      box: ['retenir', 'Une alimentation qualitative repose sur la diversité, l’équilibre, la composition et les habitudes alimentaires globales.'] }
  ] },
  { key: 'end', num: '', small: 'Bravo', label: 'Cours terminés', c: 'end', final: true, pages: [
    { title: 'Bravo !', visual: V.prof('Bravo ! Tu as terminé les cours. Maintenant, utilise ce que tu as appris pour relever les défis !') }
  ] }
];

/* ---------- Lecteur de cours ---------- */
const COURSE_STORE = 'battle-course-';
function coursePlayer({ id, sections, tag, title, progress, play }) {
  let pos = { s: 0, p: 0, dir: 0 };
  try { const saved = JSON.parse(sessionStorage.getItem(COURSE_STORE + id) || 'null'); if (saved && sections[saved.s]) pos = { ...saved, dir: 0 }; } catch (e) {}
  if (state['course_' + id]) pos = { ...state['course_' + id], dir: 0 };
  const answers = state['answers_' + id] = state['answers_' + id] || {};
  shell(tag, title, '<div class="cp" id="cp"></div>', '', () => {}, '', false);
  if (typeof progress === 'number') refreshProgress(progress);
  document.querySelector('.actions')?.classList.add('hidden');
  const save = () => { state['course_' + id] = { s: pos.s, p: pos.p }; try { sessionStorage.setItem(COURSE_STORE + id, JSON.stringify({ s: pos.s, p: pos.p })); } catch (e) {} };
  const go = (s, p, dir) => { pos = { s, p, dir }; save(); draw(); document.querySelector('.gamecard')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const next = () => { const sec = sections[pos.s]; if (pos.p < sec.pages.length - 1) go(pos.s, pos.p + 1, 1); else if (pos.s < sections.length - 1) go(pos.s + 1, 0, 1); };
  const prev = () => { if (pos.p > 0) go(pos.s, pos.p - 1, -1); else if (pos.s > 0) go(pos.s - 1, sections[pos.s - 1].pages.length - 1, -1); };
  function draw() {
    const root = document.getElementById('cp'); if (!root) return;
    const sec = sections[pos.s], page = sec.pages[pos.p], lastPage = pos.p === sec.pages.length - 1, nextSec = sections[pos.s + 1];
    const qKey = sec.key + pos.p, answered = sec.quiz && answers[qKey] !== undefined;
    let nextLabel = 'Suivant →';
    if (lastPage && sec.next) nextLabel = sec.next;
    else if (lastPage && nextSec && !nextSec.final) nextLabel = nextSec.quiz ? 'Vérifier mes connaissances →' : `Découvrir ${nextSec.small} →`;
    else if (lastPage && nextSec?.final) nextLabel = 'Terminer le cours →';
    const mapChips = sections.filter(x => !x.final).map((x, i) => `<button type="button" class="cp-map-item c-${x.c} ${i === pos.s ? 'on' : ''} ${i < pos.s ? 'done' : ''}" data-s="${i}" aria-label="${x.small} : ${x.label}">${x.num || 'i'}</button>`).join('');
    root.className = `cp c-${sec.c}`;
    root.innerHTML = sec.final ? `
      <div class="cp-final">${renderVisual(page.visual)}
        <button type="button" class="cp-play">Compris, on joue !</button>
        <button type="button" class="cp-review">↺ Revoir le cours</button>
      </div>` : `
      <nav class="cp-map" aria-label="Parties du cours">${mapChips}</nav>
      <header class="cp-head"><span class="cp-num">${sec.num || 'i'}</span><div><small>${sec.small}</small><b>${sec.label}</b></div></header>
      <div class="cp-meta"><span>${sec.quiz ? 'Question' : 'Page'} ${pos.p + 1} sur ${sec.pages.length}</span><div class="cp-bar"><i style="width:${(pos.p + 1) / sec.pages.length * 100}%"></i></div></div>
      <article class="cp-page ${pos.dir > 0 ? 'from-right' : pos.dir < 0 ? 'from-left' : ''}">
        ${sec.quiz ? renderQuiz(page, answers[qKey]) : renderPage(page)}
      </article>
      <div class="cp-nav">
        <button type="button" class="cp-prev" ${pos.s === 0 && pos.p === 0 ? 'disabled' : ''}>← Précédent</button>
        <button type="button" class="cp-next ${lastPage ? 'cp-go' : ''}" ${sec.quiz && !answered ? 'disabled' : ''}>${sec.quiz && !answered ? 'Réponds pour continuer' : nextLabel}</button>
      </div>
      <div class="cp-tools">
        <button type="button" class="cp-restart">↺ Revoir le cours</button>
        ${nextSec && !lastPage ? `<button type="button" class="cp-skip">Passer à la catégorie suivante ⇥</button>` : ''}
      </div>`;
    root.querySelector('.cp-next')?.addEventListener('click', next);
    root.querySelector('.cp-prev')?.addEventListener('click', prev);
    root.querySelector('.cp-restart')?.addEventListener('click', () => go(0, 0, -1));
    root.querySelector('.cp-skip')?.addEventListener('click', () => go(pos.s + 1, 0, 1));
    root.querySelector('.cp-review')?.addEventListener('click', () => go(0, 0, -1));
    root.querySelector('.cp-play')?.addEventListener('click', () => { state['course_' + id] = null; try { sessionStorage.removeItem(COURSE_STORE + id); } catch (e) {} play(); });
    root.querySelectorAll('.cp-map-item').forEach(b => b.addEventListener('click', () => go(+b.dataset.s, 0, +b.dataset.s >= pos.s ? 1 : -1)));
    root.querySelectorAll('.cp-opt').forEach(b => b.addEventListener('click', () => { if (answers[qKey] !== undefined) return; answers[qKey] = +b.dataset.i; draw(); }));
    root.querySelectorAll('.cp-replay').forEach(b => b.addEventListener('click', () => { const v = b.closest('.cp-anim'); v.classList.remove('run'); void v.offsetWidth; v.classList.add('run'); }));
  }
  draw();
}

function cpFood(f, cls = '') { return `<span class="cp-food ${cls}"><b>${f[0]}</b><small>${f[1]}</small></span>`; }
function renderVisual(v) {
  if (!v) return '';
  if (v.type === 'foods') return `<div class="cp-visual cp-foods n${Math.min(v.items.length, 5)}">${v.items.map(f => cpFood(f)).join('')}</div>`;
  if (v.type === 'transform') return `<div class="cp-visual cp-anim run"><div class="cp-transform">${cpFood(v.from, 't-from')}<span class="t-arrow"><i>→</i>${v.via ? `<em>${v.via}</em>` : ''}</span>${cpFood(v.to, 't-to')}</div>${v.badge ? `<span class="t-badge">${v.badge}</span>` : ''}<button type="button" class="cp-replay" aria-label="Revoir l’animation">↻ Revoir l’animation</button></div>`;
  if (v.type === 'ingredients') return `<div class="cp-visual cp-anim run"><div class="cp-pack">${cpFood(v.product)}<div class="cp-ing"><b>Ingrédients :</b><ol>${v.items.map((it, i) => `<li class="${it[1] ? 'marker' : ''}" style="--d:${i * .35}s"><span>${it[0]}</span>${it[1] ? `<small>🔎 ${it[1]}</small>` : ''}</li>`).join('')}</ol></div></div>${v.note ? `<p class="cp-note">${v.note}</p>` : ''}<button type="button" class="cp-replay">↻ Revoir l’animation</button></div>`;
  if (v.type === 'compare') return `<div class="cp-visual cp-compare">${v.items.map(c => `<div class="cp-cmp ${c.g ? 'g' + c.g : ''} ${c.dark ? 'dark' : ''}">${cpFood([c.e, c.n])}${c.g ? `<em class="cp-tag n${c.g}">NOVA ${c.g}</em>` : ''}${c.rows ? `<ul>${c.rows.map(r => `<li>${r}</li>`).join('')}</ul>` : ''}${c.to ? `<span class="cp-swap">plus souvent →</span>${cpFood(c.to)}` : ''}</div>`).join('')}${v.note ? `<p class="cp-note">${v.note}</p>` : ''}</div>`;
  if (v.type === 'scale') return `<div class="cp-visual cp-scale ${v.kind}">${v.items.map(s => `<div class="cp-scale-item k${s[0]}"><b>${s[0]}</b><span>${s[1]}</span></div>`).join('')}</div>`;
  if (v.type === 'prof') return `<div class="cp-visual cp-prof"><span class="sprite sprite-strawberry" role="img" aria-label="Professeur Fraise"></span><p class="cp-speech">${v.msg}</p></div>`;
  return '';
}
function renderPage(p) {
  let h = `<h3>${p.title}</h3>${renderVisual(p.visual)}`;
  (p.text || []).forEach(t => h += `<p>${t}</p>`);
  if (p.bullets) h += `<ul class="cp-bullets">${p.bullets.map(b => `<li>${b}</li>`).join('')}</ul>`;
  (p.after || []).forEach(t => h += `<p>${t}</p>`);
  if (p.box) { const [k, t] = p.box, lbl = { retenir: '⭐ À RETENIR', exemple: '🍽️ Exemple concret', attention: '⚠️ Attention' }[k]; h += `<div class="cp-box ${k}"><b>${lbl}</b><p>${t}</p></div>`; }
  return h;
}
function renderQuiz(q, chosen) {
  const done = chosen !== undefined, ok = chosen === q.a, L = ['A', 'B', 'C'];
  return `<h3>${q.q}</h3>${renderVisual(q.visual)}
    <div class="cp-opts">${q.opts.map((o, i) => `<button type="button" class="cp-opt ${done && i === q.a ? 'right' : ''} ${done && i === chosen && !ok ? 'wrong' : ''}" data-i="${i}" ${done ? 'disabled' : ''}><b>${L[i]}</b><span>${o}</span></button>`).join('')}</div>
    ${done ? `<div class="cp-correction ${ok ? 'good' : 'soft'}"><span class="cp-check">${ok ? '✓' : '↺'}</span><div><strong>${ok ? 'Bonne réponse !' : 'Pas tout à fait !'}</strong>${ok ? '' : `<p class="cp-expected">La bonne réponse était <b>${L[q.a]}. ${q.opts[q.a]}</b></p>`}<p>${q.why}</p></div></div>` : ''}`;
}

/* ---------- Branchement : cours NOVA avant le tri, cours SIGA avant le jeu SIGA ---------- */
(() => {
  const prevLesson = renderLesson;
  renderLesson = function (which) {
    if (which === 'nova') return coursePlayer({ id: 'nova', sections: NOVA_SECTIONS, tag: 'Cours · classification NOVA', title: 'Comprendre NOVA', progress: 0, play: () => { state.idx = 0; renderNova(0); } });
    if (which === 'siga') return coursePlayer({ id: 'siga', sections: SIGA_SECTIONS, tag: 'Cours · classification SIGA', title: 'Comprendre SIGA', progress: 1, play: () => { state.idx = 1; renderSiga(0); } });
    prevLesson(which);
  };
  const prevHome = renderHome;
  renderHome = function () { state.course_nova = state.course_siga = null; state.answers_nova = state.answers_siga = null; prevHome(); };
})();
