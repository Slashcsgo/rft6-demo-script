import { exportKillDeathScore, processDemos } from './logic.js'
import { arrayToCSV, writeFile } from './export.js'

const main = () => {
    const params = process.argv.slice(process.argv.findIndex(e => e === '--') + 1)
    
    const folderName = params[0]
    
    if (!folderName) {
        console.log('Missing dirname param')
        console.log('Try: npm run {dirname} [limit]')
        return
    }
    
    const limit = parseInt(params[1]) || 0
    
    const folderPath = `./demos/${folderName}/`
    
    console.time("execution");
    
    const kdstat = exportKillDeathScore(processDemos(folderPath), limit)
    
    const csv = arrayToCSV(kdstat, [
        'steamid',
        'deaths_total',
        'kills_total',
        'kd',
        // 'maps_played',
        'name',
    ])
    
    writeFile(`./${folderName}.csv`, csv)
    
    console.log(csv)
    
    console.timeEnd('execution')
}

main()