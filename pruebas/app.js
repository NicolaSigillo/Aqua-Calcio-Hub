const DATA_PATH = 'data/aqua-calcio.json';

const dom = {
  leagueTitle: document.getElementById('league-title'),
  seasonLabel: document.getElementById('season-label'),
  heroSummary: document.getElementById('hero-summary'),
  brandLogo: document.getElementById('brand-logo'),
  brandFallback: document.getElementById('brand-fallback'),
  totalTeams: document.getElementById('total-teams'),
  totalGoals: document.getElementById('total-goals'),
  totalMatches: document.getElementById('total-matches'),
  standingsBody: document.getElementById('standings-body'),
  standingsNote: document.getElementById('standings-note'),
  matchdaysContainer: document.getElementById('matchdays-container'),
  playersBody: document.getElementById('players-body'),
  teamsContainer: document.getElementById('teams-container'),
  mediaContainer: document.getElementById('media-container')
};

const allPlayers = {};

document.addEventListener('DOMContentLoaded', init);

async function init() {
  try {
    const response = await fetch(DATA_PATH);
    if (!response.ok) {
      throw new Error('No se pudo cargar la data principal.');
    }

    const data = await response.json();
    hydratePlayerIndex(data.teams);
    applyBranding(data.league && data.league.branding ? data.league.branding : {});
    renderHeader(data);
    renderStandings(data);
    renderMatchdays(data);
    setupMatchLogToggles();
    renderPlayersRanking(data);
    renderTeams(data);
    renderMedia(data);
    setupRevealAnimations();
  } catch (error) {
    document.body.innerHTML = `<main style="padding:1.4rem;font-family:system-ui;color:#fff;background:#081825">Error cargando la pagina: ${error.message}</main>`;
  }
}

function hydratePlayerIndex(teams) {
  teams.forEach((team) => {
    team.players.forEach((player) => {
      allPlayers[player.id] = {
        ...player,
        teamId: team.id,
        teamName: team.name
      };
    });
  });
}

function renderHeader(data) {
  const totalMatches = data.matchdays.reduce((acc, md) => acc + md.matches.length, 0);
  const totalGoals = data.matchdays.reduce((acc, md) => {
    const goalsByDay = md.matches.reduce((sum, match) => sum + match.score.home + match.score.away, 0);
    return acc + goalsByDay;
  }, 0);

  dom.leagueTitle.textContent = data.league.name;
  dom.seasonLabel.textContent = `Temporada ${data.league.season}`;
  dom.totalTeams.textContent = data.teams.length;
  dom.totalGoals.textContent = totalGoals;
  dom.totalMatches.textContent = totalMatches;
  dom.heroSummary.textContent = 'Hub oficial de resultados, jornadas y estadisticas.';
}

function buildEmptyTeamStats(team) {
  return {
    teamId: team.id,
    teamName: team.name,
    teamLogo: team.logo,
    pj: 0,
    g: 0,
    e: 0,
    p: 0,
    gf: 0,
    gc: 0,
    dg: 0,
    pts: 0,
    form: []
  };
}

function renderStandings(data) {
  const scoring = data.league.scoringRules;
  const standingsMap = new Map(data.teams.map((team) => [team.id, buildEmptyTeamStats(team)]));

  data.matchdays
    .slice()
    .sort((a, b) => a.number - b.number)
    .forEach((matchday) => {
      matchday.matches.forEach((match) => {
        const home = standingsMap.get(match.homeTeamId);
        const away = standingsMap.get(match.awayTeamId);

        if (!home || !away) {
          return;
        }

        home.pj += 1;
        away.pj += 1;
        home.gf += match.score.home;
        home.gc += match.score.away;
        away.gf += match.score.away;
        away.gc += match.score.home;

        if (match.score.home > match.score.away) {
          home.g += 1;
          away.p += 1;
          home.pts += scoring.win;
          away.pts += scoring.loss;
          home.form.push('W');
          away.form.push('L');
        } else if (match.score.home < match.score.away) {
          away.g += 1;
          home.p += 1;
          away.pts += scoring.win;
          home.pts += scoring.loss;
          away.form.push('W');
          home.form.push('L');
        } else {
          home.e += 1;
          away.e += 1;
          home.pts += scoring.draw;
          away.pts += scoring.draw;
          home.form.push('D');
          away.form.push('D');
        }
      });
    });

  const standings = Array.from(standingsMap.values())
    .map((row) => ({ ...row, dg: row.gf - row.gc, form: row.form.slice(-5) }))
    .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf || a.teamName.localeCompare(b.teamName));

  dom.standingsBody.innerHTML = standings
    .map((team, index) => {
      const formHtml = team.form
        .map((result) => {
          if (result === 'W') {
            return '<span class="form-mark win" title="Ganado">✓</span>';
          }
          if (result === 'L') {
            return '<span class="form-mark loss" title="Perdido">x</span>';
          }
          return '<span class="form-mark draw" title="Empatado">-</span>';
        })
        .join('');

      return `
        <tr>
          <td class="rank">${index + 1}</td>
          <td>
            <div class="team-cell">
              <div class="team-logo">${team.teamName.slice(0, 2).toUpperCase()}</div>
              <span>${team.teamName}</span>
            </div>
          </td>
          <td>${team.pj}</td>
          <td>${team.g}</td>
          <td>${team.e}</td>
          <td>${team.p}</td>
          <td>${team.gf}</td>
          <td>${team.gc}</td>
          <td>${team.dg}</td>
          <td><strong>${team.pts}</strong></td>
          <td><div class="form-strip">${formHtml}</div></td>
        </tr>
      `;
    })
    .join('');

  dom.standingsNote.textContent = 'Criterio de desempate actual: Puntos, Diferencia de gol, Goles a favor.';
}

function renderMatchdays(data) {
  const ordered = data.matchdays.slice().sort((a, b) => a.number - b.number);

  dom.matchdaysContainer.innerHTML = ordered
    .map((matchday) => {
      const cards = matchday.matches
        .map((match) => {
          const home = getTeamName(data.teams, match.homeTeamId);
          const away = getTeamName(data.teams, match.awayTeamId);
          const mvpName = getPlayerName(match.mvpPlayerId);
          const topStats = [...match.playerStats]
            .filter((s) => s.rating !== null)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 3);

          const topStatsHtml = topStats
            .map((stat) => {
              const player = getPlayerName(stat.playerId);
              return `<div class="stat-pill"><strong>${player}</strong>Rating ${stat.rating} | G ${stat.goals} | A ${stat.assists}</div>`;
            })
            .join('');

          const logEntries = match.matchLog || [];
          const firstPhase = logEntries.length > 0 ? logEntries[0].phase : null;
          const phaseCount = new Set(logEntries.map((entry) => entry.phase)).size;

          const bitacora = logEntries
            .map((entry) => {
              const extraClass = firstPhase && entry.phase !== firstPhase ? 'extra-log-item' : '';
              return `
                <li class="${extraClass}">
                  <span class="log-phase">${entry.phase}</span>
                  <span class="log-desc">${entry.description}</span>
                </li>
              `;
            })
            .join('');
          const extraEvents = logEntries.filter((entry) => firstPhase && entry.phase !== firstPhase).length;
          const hasExtraEntries = phaseCount > 1 && extraEvents > 0;
          const bitacoraToggle = hasExtraEntries
            ? `<button type="button" class="log-toggle" aria-expanded="false" data-extra-events="${extraEvents}">Ver todos los innings (+${extraEvents} jugadas)</button>`
            : '';

          return `
            <article class="matchday-card reveal">
              <div class="scoreline">
                <span>${home}</span>
                <strong>${match.score.home} - ${match.score.away}</strong>
                <span>${away}</span>
              </div>
              <div class="mvp-chip">MVP: ${mvpName}</div>
              <div class="stat-grid">${topStatsHtml}</div>
              <ol class="bitacora collapsed">${bitacora}</ol>
              ${bitacoraToggle}
            </article>
          `;
        })
        .join('');

      return `
        <section class="section reveal" id="jornada-${matchday.number}">
          <div class="section-header">
            <h3>Jornada ${matchday.number}</h3>
            <small>${matchday.date}</small>
          </div>
          <div class="matchday-grid">${cards}</div>
        </section>
      `;
    })
    .join('');
}

function setupMatchLogToggles() {
  if (!dom.matchdaysContainer) {
    return;
  }

  dom.matchdaysContainer.addEventListener('click', (event) => {
    const button = event.target.closest('.log-toggle');
    if (!button) {
      return;
    }

    const card = button.closest('.matchday-card');
    if (!card) {
      return;
    }

    const bitacora = card.querySelector('.bitacora');
    if (!bitacora) {
      return;
    }

    const wasExpanded = button.getAttribute('aria-expanded') === 'true';
    const extraEvents = Number(button.dataset.extraEvents || 0);
    if (wasExpanded) {
      bitacora.classList.add('collapsed');
      button.setAttribute('aria-expanded', 'false');
      button.classList.remove('is-expanded');
      button.textContent = extraEvents > 0 ? `Ver todos los innings (+${extraEvents} jugadas)` : 'Ver todos los innings';
    } else {
      bitacora.classList.remove('collapsed');
      button.setAttribute('aria-expanded', 'true');
      button.classList.add('is-expanded');
      button.textContent = 'Ver solo Inning 1';
    }
  });
}

function renderPlayersRanking(data) {
  const playerAggregate = {};

  Object.values(allPlayers).forEach((player) => {
    playerAggregate[player.id] = {
      playerId: player.id,
      name: player.name,
      teamName: player.teamName,
      matches: 0,
      goals: 0,
      assists: 0,
      ratingSum: 0,
      ratedMatches: 0,
      mvp: 0,
      impact: 0
    };
  });

  data.matchdays.forEach((matchday) => {
    matchday.matches.forEach((match) => {
      match.playerStats.forEach((stat) => {
        if (!playerAggregate[stat.playerId]) {
          const playerMeta = allPlayers[stat.playerId] || { name: stat.playerId, teamName: stat.teamId };
          playerAggregate[stat.playerId] = {
            playerId: stat.playerId,
            name: playerMeta.name,
            teamName: playerMeta.teamName,
            matches: 0,
            goals: 0,
            assists: 0,
            ratingSum: 0,
            ratedMatches: 0,
            mvp: 0,
            impact: 0
          };
        }

        const row = playerAggregate[stat.playerId];
        row.matches += 1;
        row.goals += Number(stat.goals || 0);
        row.assists += Number(stat.assists || 0);

        if (typeof stat.rating === 'number') {
          row.ratingSum += stat.rating;
          row.ratedMatches += 1;
        }

        if (match.mvpPlayerId === stat.playerId) {
          row.mvp += 1;
        }
      });
    });
  });

  const ranking = Object.values(playerAggregate)
    .map((row) => {
      const avgRating = row.ratedMatches ? row.ratingSum / row.ratedMatches : 0;
      row.avgRating = avgRating;
      row.impact = avgRating * 10 + row.goals * 2 + row.assists * 1.5 + row.mvp * 3;
      return row;
    })
    .sort((a, b) => b.impact - a.impact || b.goals - a.goals || b.avgRating - a.avgRating);

  dom.playersBody.innerHTML = ranking
    .map((row, idx) => {
      const topClass = idx === 0 ? 'top-1' : idx === 1 ? 'top-2' : idx === 2 ? 'top-3' : '';
      return `
        <tr class="player-rank-row ${topClass}">
          <td class="rank" data-label="#">${idx + 1}</td>
          <td data-label="Jugador">${row.name}</td>
          <td data-label="Equipo">${row.teamName}</td>
          <td data-label="PJ">${row.matches}</td>
          <td data-label="Goles">${row.goals}</td>
          <td data-label="Asist.">${row.assists}</td>
          <td data-label="MVP">${row.mvp}</td>
          <td data-label="Rating Prom.">${row.avgRating.toFixed(2)}</td>
          <td data-label="Impacto"><strong>${row.impact.toFixed(1)}</strong></td>
        </tr>
      `;
    })
    .join('');
}

function renderTeams(data) {
  dom.teamsContainer.innerHTML = data.teams
    .map((team) => {
      const players = team.players
        .map((player) => `<li><strong>${player.name}</strong> - ${player.position}</li>`)
        .join('');

      return `
        <article class="team-card reveal">
          <h4>${team.name}</h4>
          <ul class="roster">${players}</ul>
        </article>
      `;
    })
    .join('');
}

function renderMedia(data) {
  const videoHighlights = data.highlights && Array.isArray(data.highlights.videos) ? data.highlights.videos : [];

  if (videoHighlights.length === 0) {
    dom.mediaContainer.innerHTML = `
      <div class="media-tile reveal">
        <div>
          <strong>Espacio listo para tus highlights</strong>
          <span>Cuando agregues videos en highlights.videos dentro del JSON apareceran aqui automaticamente.</span>
        </div>
      </div>
    `;
    return;
  }

  dom.mediaContainer.innerHTML = videoHighlights
    .map((item) => {
      const safeTitle = sanitizeHtml(item.title || 'Highlight Aqua Calcio');
      const safeDescription = sanitizeHtml(item.description || 'Sin descripcion');
      const safeDate = sanitizeHtml(item.postedAt || 'Fecha pendiente');
      const videoPath = sanitizeHtml(encodeURI(item.file || ''));

      return `
        <article class="highlight-card reveal">
          <video controls preload="metadata" class="highlight-video">
            <source src="${videoPath}" type="video/mp4">
            Tu navegador no soporta video embebido.
          </video>
          <div class="highlight-content">
            <h4>${safeTitle}</h4>
            <p>${safeDescription}</p>
            <small>Publicado: ${safeDate}</small>
          </div>
        </article>
      `;
    })
    .join('');
}

function applyBranding(branding) {
  const root = document.documentElement;

  if (branding.primaryColor) {
    root.style.setProperty('--primary', branding.primaryColor);
  }
  if (branding.secondaryColor) {
    root.style.setProperty('--secondary', branding.secondaryColor);
  }
  if (branding.accentColor) {
    root.style.setProperty('--accent', branding.accentColor);
  }

  const rawLogo = branding.logo || '';
  if (rawLogo && dom.brandLogo) {
    dom.brandLogo.src = encodeURI(rawLogo);
    dom.brandLogo.addEventListener('load', () => {
      dom.brandLogo.classList.remove('hidden');
      if (dom.brandFallback) {
        dom.brandFallback.classList.add('hidden');
      }
    });

    dom.brandLogo.addEventListener('error', () => {
      dom.brandLogo.classList.add('hidden');
      if (dom.brandFallback) {
        dom.brandFallback.classList.remove('hidden');
      }
    });
  }
}

function sanitizeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getTeamName(teams, teamId) {
  const team = teams.find((item) => item.id === teamId);
  return team ? team.name : teamId;
}

function getPlayerName(playerId) {
  return allPlayers[playerId] ? allPlayers[playerId].name : playerId;
}

function setupRevealAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  document.querySelectorAll('.reveal').forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 40, 280)}ms`;
    observer.observe(item);
  });
}
