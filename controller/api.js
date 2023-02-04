const Cookies = require("cookies");
const dbModels = require("../models");
const {data} = require("express-session/session/cookie");
const {all} = require("express/lib/application");
const {Op, where} = require("sequelize");

/**
 * function to add comments to db using rout
 * @param req
 * @param res
 * @param next
 */
exports.addComment = (req, res, next) =>{
    let id = 0
    let picid = 0
    dbModels.User.findOne({
        where: {
            email: req.session.email,
        }
    }).then(async user => {

        dbModels.Picture.findOne({
            where: {
                date: req.body.picture,
            }
        }).then(async pic => {
                if(pic ===null)
                {
                    const [createdPic, created] = await dbModels.Picture.upsert(
                        { date: req.body.picture },
                        {lastUpdated: Date.now()}
                    );
                    picid = createdPic.id
                }
                else{
                    pic.set({
                        lastUpdated: Date.now()
                    });

                    pic = await pic.save();
                    picid = pic.id

                }
            const comm = await dbModels.Comment.create({
                pictureId: picid,
                text: req.body.commentText,
                userName: (req.session.firstName + ' ' + req.session.lastName)
            });
            res.send(JSON.stringify(comm.id));
        });
    }).catch(err => {
        console.log('in catch')
        req.session = null; //removes the session ID cookie
        res.redirect('/');
    });
}
/**
 * function to delete comments from db using rout
 * @param req
 * @param res
 * @param next
 */
exports.deleteComment = (req, res, next) =>{

        let id = req.params.id
        let picId = req.params.picId
        console.log(id,picId)
        dbModels.Comment.findOne({
            where: {
                id: id,
            }
        }).then(com => {
            com.destroy();

        }).catch(err => {
            console.log(err)
            req.session = null; //removes the session ID cookie
            res.redirect('/');
        });
}
/**
 * function to return all comments in db using rout
 * @param req
 * @param res
 * @param next
 */
exports.getAllComments = (req, res, next) => {
    const { Op } = require("sequelize");

    dbModels.Picture.findAll({
        include: [{ model: dbModels.Comment,
            attributes: ['pictureId','text','userName','id']}],
        where: {
            date:req.body.images,
            lastUpdated: {
                [Op.gt]: Date.now() - 15000,
            }
        },
    })
        .then((alldata) =>
        {
           res.json(alldata)
        })
        .catch((err) => {
            console.log(err)
            return res.send({message: err});
        });
};