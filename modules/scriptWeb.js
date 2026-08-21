function getScriptsWebHTML() {
  return `
    <section class="bg-white dark:bg-[#1f2937] rounded-2xl shadow-sm border border-gray-100/80 dark:border-gray-700 p-5">
      <h4 class="font-semibold text-gray-700 dark:text-gray-200 mb-3">Script web</h4>
      <div id="scriptsWebDiv" style="width: 100%; height: 600px;"></div>
      <div id="myList" style="width: 100%; border: 1px solid #ccc; overflow-y: auto;"></div>
    </section>
  `;
}

async function getLinks() {
  const counts = {};
  try {
    const response = await fetch("botc_scripts/all_scripts.json");
    if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
    const jsonData = await response.json();
    const scripts = jsonData.map(item => item.characters);

    for (let index = 0; index < scripts.length; index++) {
      const list_of_char = scripts[index];
      for (let i = 0; i < list_of_char.length; i++) {
        for (let j = i + 1; j < list_of_char.length; j++) {
          const character1 = list_of_char[i];
          const character2 = list_of_char[j];
          const pairKey = [character1, character2].sort().join('-');
          counts[pairKey] = (counts[pairKey] || 0) + 1;
        }
      }
    }
    const newMap = Object.entries(counts);
    const sortedMap = newMap.sort((item1, item2) => item2[1] - item1[1]);
    return sortedMap;
  } catch (err) {
    console.error("Erreur lors du chargement des liens:", err);
    return {};
  }
}

async function getCharacters() {
  try {
    const roles = await fetch("official_data/roles.json")
      .then(response => response.json())
      .then(json => json.map(item => ({ id: item.id, team: item.team })));
    return roles;
  } catch (err) {
    console.error("Erreur lors du chargement de rolesData:", err);
    return [];
  }
}

// Génère une image SVG en data URI avec le texte courbé le long d'un cercle
function makeCurvedTextDataUri(text, diameter, opts = {}) {
  const {
    fontSize = Math.max(6, diameter * 0.14),
    color = "#1630c2",
    fontFamily = "sans-serif",
    radiusRatio = 0.35
  } = opts;

  const size = diameter;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * radiusRatio;
  const pathId = `textPath-${Math.random().toString(36).slice(2)}`;

  // Chemin qui démarre à gauche et va vers la droite en passant par le BAS
  // (sweep-flag = 1 pour aller dans le sens horaire par le bas)
  const d = `M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <defs><path id="${pathId}" d="${d}" /></defs>
      <text font-family="${fontFamily}" font-size="${fontSize}" fill="${color}">
        <textPath href="#${pathId}" startOffset="50%" text-anchor="middle">${text}</textPath>
      </text>
    </svg>
  `;

  return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
}

// ===== ÉTAT GLOBAL (cache + sélection courante) =====
let allTokens = [];
let allLinks = [];
let selectedCharacters = new Set();

const TEAM_COLORS = {
  townsfolk: '#93c5fd',
  outsider: '#1e3a8a',
  minion: '#fca5a5',
  demon: '#991b1b'
};

const TEAM_BG_COLORS = {
  townsfolk: 'rgba(147, 197, 253, 0.15)', // bleu clair, léger
  outsider: 'rgba(30, 58, 138, 0.15)',    // bleu foncé, léger
  minion: 'rgba(252, 165, 165, 0.15)',    // rouge clair, léger
  demon: 'rgba(153, 27, 27, 0.15)'        // rouge foncé, léger
};

const TEAM_LABELS = {
  townsfolk: 'Townsfolk',
  outsider: 'Outsider',
  minion: 'Minion',
  demon: 'Demon'
};

async function initScriptsWeb(page) {
  if (!window.chartInstances) window.chartInstances = {};

  const div = document.getElementById('scriptsWebDiv');
  if (!div) return;

  const diagram = new go.Diagram("scriptsWebDiv", {
    "undoManager.isEnabled": true
  });
  diagram.layout = new go.ForceDirectedLayout({
    defaultElectricalCharge: 50, defaultSpringLength: 20
  });

  diagram.nodeTemplate =
    new go.Node("Spot", { locationSpot: go.Spot.Center })
      .add(
        new go.Shape("Circle", { fill: "#FFFFF0F0", stroke: null, strokeWidth: 3 })
          .bind("desiredSize", "size", go.Size.parse)
      )
      .add(
        new go.Picture({
          source: "icons/acrobat.svg",
          imageStretch: go.GraphObject.Uniform,
          alignment: go.Spot.Bottom,
          alignmentFocus: go.Spot.Bottom
        })
          .bind("desiredSize", "size", (sizeStr) => {
            const sz = go.Size.parse(sizeStr);
            return new go.Size(sz.width * 0.8, sz.height * 0.8);
          })
          .bind("source", "key", (key) => `icons/${key}.svg`)
      )
      .add(
        new go.Picture({ alignment: go.Spot.Center, alignmentFocus: go.Spot.Center })
          .bind("desiredSize", "size", go.Size.parse)
          .bind("source", "", (data) => {
            const sz = go.Size.parse(data.size);
            const diameter = Math.max(sz.width, sz.height);
            return makeCurvedTextDataUri(data.key, diameter);
          })
      );

  diagram.linkTemplate =
    new go.Link({ layerName: "Background" })
      .add(new go.Shape({ strokeWidth: 2, stroke: "#ffffff" })
        .bind("strokeWidth", "thickness")
      )
      .add(new go.TextBlock({ segmentOffset: new go.Point(0, -10), stroke: "white" })
        .bind("text", "label")
      );

  if (allTokens.length === 0) {
    const [tokens, links] = await Promise.all([getCharacters(), getLinks()]);
    allTokens = tokens;
    allLinks = links;
    //selectedCharacters = new Set(tokens.slice(0, 10).map(t => t.id));
  }

  window.chartInstances.scriptsWeb = diagram;

  renderCharacterLists(diagram);
  updateGraph(diagram);

  function animateStars() {
    const spread = new go.Animation();
    spread.duration = 500;
    const center = diagram.documentBounds.center;
    diagram.nodes.each(n => spread.add(n, "position", center, n.position));
    spread.start();
  }

  diagram.addDiagramListener("InitialLayoutCompleted", animateStars);

  window.redoLayout = () => {
    const am = diagram.animationManager;
    const center = diagram.documentBounds.center;
    am.isEnabled = false;
    diagram.commit(d => {
      d.nodes.each(n => n.position = center);
      d.layoutDiagram(true);
    });
    am.isEnabled = true;
    animateStars();
    diagram.zoomToFit();
  };

  diagram.div.style.backgroundColor = "#04092e";
}

function applyToggleStyle(item, team) {
  const isSelected = selectedCharacters.has(item.dataset.key);
  item.style.backgroundColor = isSelected ? TEAM_COLORS[team] : "";
  item.style.color = isSelected ? "white" : "";
}

// ===== Reconstruit le modèle GoJS à partir de selectedCharacters =====
function updateGraph(diagram) {
  const keys = allTokens
    .filter(character => selectedCharacters.has(character.id))
    .map(character => ({ key: character.id, size: "150 150" }));
  const links = allLinks
    .filter(([pair]) => {
      const [ch1, ch2] = pair.split('-');
      return selectedCharacters.has(ch1) && selectedCharacters.has(ch2);
    })
    .map(([pair, count]) => {
      const [ch1, ch2] = pair.split('-');
      return { from: ch1, to: ch2, thickness: count / 10, label: count };
    });
  diagram.model = new go.GraphLinksModel(keys, links);
}

function renderCharacterLists(diagram) {
  const listDiv = document.getElementById("myList");
  listDiv.innerHTML = '';

  listDiv.style.display = 'flex';
  listDiv.style.gap = '16px';
  listDiv.style.alignItems = 'flex-start';

  const teams = ['townsfolk', 'outsider', 'minion', 'demon'];

  teams.forEach(team => {
    const column = document.createElement('div');
    column.style.flex = '1';
    column.style.minWidth = '0';
    column.style.backgroundColor = TEAM_BG_COLORS[team];
    column.style.border = `1px solid ${TEAM_COLORS[team]}`;
    column.style.borderRadius = '10px';
    column.style.padding = '10px';

    const heading = document.createElement('h5');
    heading.textContent = TEAM_LABELS[team];
    heading.style.color = TEAM_COLORS[team];
    heading.style.fontWeight = 'bold';
    heading.style.marginBottom = '6px';
    column.appendChild(heading);

    const charactersInTeam = allTokens.filter(c => c.team === team);

    charactersInTeam.forEach(character => {
      const item = document.createElement("div");
      item.textContent = character.id;
      item.dataset.key = character.id;
      item.style.padding = "8px";
      item.style.cursor = "pointer";
      item.style.borderRadius = "6px";
      item.style.marginBottom = "4px";
      item.style.userSelect = "none";
      applyToggleStyle(item, team);

      item.onclick = () => {
        if (selectedCharacters.has(character.id)) {
          selectedCharacters.delete(character.id);
        } else {
          selectedCharacters.add(character.id);
        }
        applyToggleStyle(item, team);
        updateGraph(diagram);
      };

      column.appendChild(item);
    });

    listDiv.appendChild(column);
  });

  diagram.addDiagramListener("ChangedSelection", () => {
    const selectedNodeKeys = new Set();
    diagram.selection.each(part => {
      if (part instanceof go.Node) selectedNodeKeys.add(part.data.key);
    });

    listDiv.querySelectorAll('[data-key]').forEach(child => {
      child.style.outline = selectedNodeKeys.has(child.dataset.key)
        ? "2px solid orange"
        : "none";
    });
  });
}
