import res from "express/lib/response"
import { HttpCode } from "../../lib/constants"
import repositoryUsers from '../../repository/users'


const uploadAvatar = async(req,res,next) => {
    res.status(HttpCode.OK)
    .json({status:'success', code: HttpCode.OK, message: 'Success!'})
}

const verifyUser = async(req, rws, next) =>{
    const verificationToken = req.params.token
    const userFromToken =  repositoryUsers.findByVerificationToken(verificationToken)
    if (userFromToken){
        await repositoryUsers.updateVerify(userFromToken.id, true)
        res
        .status(HttpCode.OK)
        .json({status: 'success', code:HttpCode.OK, data: {message: 'Verification successful'}})
    }
    res
        .status(HttpCode.NOT_FOUND)
        .json({status: 'fail', code:HttpCode.NOT_FOUND, data: {message: 'User not found'}})

}

export {uploadAvatar, verifyUser}