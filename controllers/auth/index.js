import { HttpCode } from '../../lib/constants'
import authService from '../../services/auth'
import { UploadFileService, LocalFileStorage } from '../../services/file-storage'
import { EmailService, SenderSendgrid } from '../../services/email'
import repositoryUsers from '../../repository/users'


// export const authService = new AuthService()

const signup = async (req, res, next) =>{
    try{
    const { email } = req.body
    const isUserExist = await authService.isUserExist(email)
    if(isUserExist) {
        return res.status(HttpCode.CONFLICT).json({
            status: 'error', 
            code: HttpCode.CONFLICT,
            message: "Email in use",
        })
    }
    const userData = await authService.create(req.body)
const emailService = new EmailService(process.env.NODE_ENV,
    new SenderSendgrid(),
    )
    const isSend = await emailService.sendVerifyEmail(email, userData.name, userData.verificationToken)
    delete userData.verificationToken

    res
    .status(HttpCode.CREATED)
    .json({status: 'success', code: HttpCode.CREATED, data: {...userData, isSendEmailVerify: isSend}})
    } catch (err) {
        next(err)
    }
}

const login = async (req, res, next) =>{
    const { email, password } = req.body
    const user = await authService.getUser(email, password)
    if(!user) {
        return res.status(HttpCode.UNAUTHORIZED).json({
            status: 'error', 
            code: HttpCode.UNAUTHORIZED,
            message: "Email or password is wrong"
        })
    }
    const token = authService.getToken(user)
    await authService.setToken(user.id, token)

    res.status(HttpCode.OK)
    .json({status: 'success', 
    code: HttpCode.OK, 
    data: { 
        token: token, 
        user: {email: user.email, subscription: user.subscription}
    }
})
}

const logout = async (req, res, next) => {
    await authService.setToken(req.user.id, null) 
    res
    .status(HttpCode.NO_CONTENT)
    .json({status: 'success', code: HttpCode.OK, data:{}
    }) 
}

const current = async(req, res, next)=>{
    const {email, subscription} = req.user;
    res.status(HttpCode.OK)
    .json({status: 'success', 
    code: HttpCode.OK, 
    data: { 
        email: email, 
        subscription: subscription}
    })

}

const updateUser = async(req,res,next) => {
    const {subscription} = req.body
    const{id, email}= req.user
    if(
        subscription ==='starter'||
        subscription ==='pro'||
        subscription==='business'
    ){
        authService.setSubscription(id, subscription)
        return res.status(HttpCode.OK).json({
        status: 'success', 
        code: HttpCode.OK,
        message: 'Subscription is updated successfully', 
        data: {
            email: email, 
            subscription: subscription
        }
        })
    }
    else{
        res.status(HttpCode.BAD_REQUEST).json({status: 'error', code: HttpCode.BAD_REQUEST, message: "Something went wrong"})
    
}
}

const uploadAvatar = async(req,res,next) => {
    const uploadService = new UploadFileService(
        LocalFileStorage,
        req.file,
        req.user
    )

    const avatarUrl = await uploadService.updateAvatar()
    
    res
    .status(HttpCode.OK)
    .json({status:'success', code: HttpCode.OK, data:{ avatarUrl }})
}

const verifyUser = async(req, res, _next) =>{
    const verifyToken = req.params.token
    const userFromToken =  await repositoryUsers.findByVerificationToken(verifyToken)
    if (userFromToken){
        await repositoryUsers.updateVerify(userFromToken.id, true)
        return res
        .status(HttpCode.OK)
        .json({status: 'success', code:HttpCode.OK, data: {message: 'Verification successful'}})
    }
    res
        .status(HttpCode.NOT_FOUND)
        .json({status: 'fail', code:HttpCode.NOT_FOUND, data: {message: 'User not found'}})

}
const repeatEmailForVerifyUser = async(req,res,next) =>{
   const {email} = req.body
   if(!email){
       return res
       .status(HttpCode.BAD_REQUEST)
       .json({status: 'fail', code:HttpCode.BAD_REQUEST, data: {message: 'missing required field email'}})  
   }
   const user = await repositoryUsers.findByEmail(email)
   if(user?.verify){
       return res
       .status(HttpCode.BAD_REQUEST)
       .json({status: 'fail', code:HttpCode.BAD_REQUEST, data: {message: 'Verification has already been passed'}})

   }
   if (user){
       const {email, name, verificationToken} = user
       const emailService = new EmailService(
           process.env.NODE_ENV,
           new SenderSendgrid(),
       )
       const isSend = await emailService.sendVerifyEmail(
           email, name, verificationToken,
       )
       if(isSend){
         return res
    .status(HttpCode.OK)
    .json({status: 'success', code:HttpCode.OK, data: {message: 'Verification email sent'}})  
       }
    return res
    .status(HttpCode.UNPROCESSABLE_ENTITY)
    .json({status: 'fail', code:HttpCode.UNPROCESSABLE_ENTITY, data: {message: 'Unprocessable entity'}})  
   }
   res.status(HttpCode.NOT_FOUND).json({
    status: 'error',
    code: HttpCode.NOT_FOUND,
    data: { message: 'User with email not found' },
  })
}



export { signup, login, logout, current, updateUser, uploadAvatar, verifyUser, repeatEmailForVerifyUser }