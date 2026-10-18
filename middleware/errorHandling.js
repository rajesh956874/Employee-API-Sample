function errorHandling(err,req,res,next){
    console.log(err.message);

    res.status(500).json({
        message: 'Something went wrong'
    })
}

module.exports = errorHandling;