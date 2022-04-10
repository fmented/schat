
export interface BaseChat{
    from:string,
    to:string,
    content:string
    timeStamp: number;
    id: string
}

export interface Chat extends BaseChat{
    status: 'sent'|'received'|'seen'|'pending'|'sending'
}


export interface Profile{
    username: BaseChat['from'] | BaseChat['to'],
    bio: string,
    avatar: string
}
