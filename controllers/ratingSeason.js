const Season = require('../models/season');
const Rating = require('../models/ratingSeason');
const jwt = require('jsonwebtoken')
    // @desc      Add rating product
    // @route     POST /api/ratingSeason
    // @access    Public
exports.createRatingProduct = async(req, res) => {

    try {
        const user = jwt.decode(req.headers.authorization.slice(7))

        const rating = await new Rating({
            user: user.id,
            season: req.body.season,
            rating: req.body.rating
        });
        rating.save()
            .then(
                async() => {
                    const product = await Season.findByIdAndUpdate({ _id: req.body.season })
                    let costByProduct = await Rating
                        .find({ season: req.body.season })
                        .sort({ rating: 1 })

                    let result = 0;
                    for (let i = 0; i < costByProduct.length; i++) {
                        result += costByProduct[i].rating
                    }
                    let num = result / costByProduct.length
                    let rate = Number(num.toFixed(1))

                    product.rating = rate
                    product.save({ validateBeforeSave: false })
                        .then(() => {
                            res.send(rate)
                        })
                    res.send('rated')
                })
            .catch((e) => res.send(e))
    } catch {
        return res.status(500).json({
            status: false
        })
    }


};
exports.getRatings = async(req, res) => {
    try {
        res.send(await Rating.find().sort({ rating: -1 }))
    } catch {
        return res.status(500).json({
            status: false
        })
    }

}