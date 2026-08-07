
export type TPayload = {
    sub: string,
    person_id: string
}

export type TUserData = {
    user_id: string,
    person_id: string,
    email: string,
    name: string,
    isEmailVerified: boolean
}