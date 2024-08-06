export const validateCreateAnswerData = (req,res,next) =>{
    console.log(req.body);

    if(!req.body.content){
        return res.status(400).json({
            message: "Missing or invalid request data"
        })
    }

    next();
};