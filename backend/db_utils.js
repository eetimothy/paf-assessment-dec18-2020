const mkQuery = (sql, pool) => {
    return async (args) => {
        const conn = await pool.getConnection()
        try {
            const [ result, _ ] = await conn.query(sql, args)
            return result
        } catch(e) {
            console.error('ERROR: ', e)
            throw e
        } finally {
            conn.release()
        }
    }
}

module.exports = {mkQuery}