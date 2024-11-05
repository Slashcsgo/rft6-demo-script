import { writeFileSync } from 'fs'

/**
 * 
 * @param {array} array 
 * @param {string[]} fields
 */
export const arrayToCSV = (array, fields) => {
    const headerString = fields.join(',')

    const stringArray = array.map(e => {
        const values = fields.map(key => e[key].toString()).join(',')

        return values
    })

    const csv = [headerString, ...stringArray].join('\n')

    return csv
}


/**
 * 
 * @param {string} path 
 * @param {string} content 
 */
export const writeFile = (path, content) => {
    writeFileSync(path, content)
}