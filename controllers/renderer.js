module.exports = function(data) {

    return new Promise(function(resolve, reject) {
        const {res, result} = data
        res.json(result)
        resolve()
    })

}