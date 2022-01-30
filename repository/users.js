import User from "../model/user";

const findById = async (id) =>{
    return await User.findById(id)
}

const findByEmail = async(email) =>{
    return await User.findOne({email})
}
const findByVerificationToken = async (token) =>{
    return await User.findOne({ token })
}

const create = async(body) =>{
    const user = new User(body)
    return await user.save()
}

const updateToken = async (id, token) => {
    return await User.updateOne({_id:id}, {token: token})
}

const updateVerify = async (id, status) => {
    return await User.updateOne({ _id: id }, { verify: status, verificationToken:null })
}

const updateUser = async(id, subscription) =>{
    return await User.updateOne({id: id, subscription: subscription})
}
const updateAvatar = async (id, avatar) => {
    return await User.updateOne({_id:id}, {avatar})
}

export default {
    findById,
    findByEmail,
    findByVerificationToken,
    create,
    updateToken,
    updateUser,
    updateAvatar,
    updateVerify,
}