export const validateCreateQuestionData = (req,res,next) =>{
    console.log(req.body);

    if(!req.body.title){
        return res.status(400).json({
            message: "Missing or invalid request data"
        })
    }

    if(!req.body.description){
        return res.status(400).json({
            message: "Missing or invalid request data"
        })
    }

    if(!req.body.category){
        return res.status(400).json({
            message: "Missing or invalid request data"
        })
    }

    next();
};

export const validateEditQuestionData = (req,res,next) =>{
    console.log(req.body);

    if(!req.body.title){
        return res.status(400).json({
            message: "Bad Request: Could not find your title, please complete filling your infomation."
        })
    }

    if(!req.body.description){
        return res.status(400).json({
            message: "Bad Request: Could not find your description, please complete filling your infomation."
        })
    }

    if(!req.body.category){
        return res.status(400).json({
            message: "Bad Request: Could not find your category, please complete filling your infomation."
        })
    }

    next();
};

