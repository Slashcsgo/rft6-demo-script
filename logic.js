import { parseEvent, parseTicks } from '@laihoe/demoparser2'
import { fields } from './common.js'
import { readdirSync } from 'fs'

const events = {
    player: {
        death: 'player_death'
    },
    game: {
        round_end: 'round_end'
    }
}

const targetFields = [
    fields.agregate.kills_total,
    fields.agregate.deaths_total,
    // fields.agregate.headshot_kills_total,
    // fields.agregate.ace_rounds_total,
    // fields.player.score,
    // fields.player.mvps,
]

/**
 * 
 * @param {{
 *  deaths_total: number,
 *  kills_total: number,
 *  name: string,
 *  steamid: string,
 *  tick: number
 * }[]} scoreboard
 * @return {{
 *  [key: string]: {
 *  deaths_total: number,
 *  kills_total: number,
 *  name: string
 * }
 * }}
 */
const formatScoreboard = (scoreboard) => {
    return scoreboard.reduce((scoreMap, current) => {
        const { deaths_total, kills_total, name, steamid } = current

        scoreMap[steamid] = {
            deaths_total,
            kills_total,
            name,
        }

        return scoreMap
    }, {})
}

/**
 * 
 * @param {string} path
 */
const getGameScoreboard = (path) => {
    let gameEndTick = Math.max(...parseEvent(path, events.game.round_end).map(x => x.tick))

    const scoreboard = parseTicks(path, targetFields, [gameEndTick])

    return formatScoreboard(scoreboard)
}

/**
 * 
 * @param {string} dir 
 * @returns {string[]} List of files
 */
const getFilenames = (dir) => {
    return readdirSync(dir)
}

/**
 * 
 * @param {string} folder
 */
const getScoreboards = (folder) => {
    const filenames = getFilenames(folder)

    return filenames.map(name => getGameScoreboard(folder + name))
}

/**
 * 
 * @param {{
 *  [key: string]: {
 *  deaths_total: number,
 *  kills_total: number,
 *  name: string
 * }
 * }[]} scoreboards 
 * @returns {{
 *  [key: string]: {
 *  deaths_total: number,
 *  kills_total: number,
 *  kd: number,
 *  maps_played: number,
 *  name: string
 * }
 * }}
 */
const getTotalScoreboard = (scoreboards) => {
    const total = {}

    scoreboards.forEach(scoreboard => {
        const scoreboardEntries = Object.entries(scoreboard)

        scoreboardEntries.forEach(([key, value]) => {
            const totalEntry = total[key]

            if (!value) {
                return
            }

            if (!totalEntry) {
                total[key] = value
                total[key].maps_played = 1
                return
            }

            totalEntry.deaths_total += value.deaths_total
            totalEntry.kills_total += value.kills_total
            totalEntry.maps_played++
        })
    })

    Object.keys(total).forEach(id => {
        total[id].kd = total[id].kills_total / total[id].deaths_total
    })

    return total
}

/**
 * 
 * @param {{
 *  [key: string]: {
 *  deaths_total: number,
 *  kills_total: number,
 *  kd: number,
 *  maps_played: number,
 *  name: string
 * }
 * }} score 
 * @param {number} limit
 */
export const exportKillDeathScore = (score, limit = 0) => {
    const steamIds = Object.keys(score)
    const sortedSteamIds = steamIds.sort((a, b) => score[b].kd - score[a].kd)

    const sortedValue = sortedSteamIds.map(id => ({...score[id], steamid: id}))

    if (limit) {
        return sortedValue.slice(0, limit)
    }

    return sortedValue
}

/**
 * 
 * @param {string} folderPath 
 */
export const processDemos = (folderPath) => {
    const score = getScoreboards(folderPath)
    const totalScore = getTotalScoreboard(score)

    return totalScore
}