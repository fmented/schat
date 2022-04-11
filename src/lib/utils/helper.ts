import { Database } from "idb"
import type {Chat, RawChat, Profile} from 'interfaces'
import {sendRequest} from './fetch'
import {API_URL} from 'interfaces'
import {v4} from 'uuid'

export function initDB(name:string){
    return new Database<{chat:Chat, profile:Profile}>(name, {
      chat: [
          {name:'from'},
          {name:'to'},
          {name:'content'},
          {name:'timeStamp'},
          {name:'id', unique:true},
          {name:'status'}
      ],
      profile:[
          {name:'username', unique:true},
          {name:'bio'},
          {name:'avatar'}
      ]
  })
  }
  
  
  export async function getConversationList(db:Database<{chat:Chat, profile:Profile}>){
    await db.open()
    const profile = await db.tables.profile.all()
    const list = profile.map(async p=>{
      const {content, timeStamp, from, status, to, id} = await db.tables.chat.searchOne({from:p.username, to:p.username}, {direction:'prev'})
      return {
        with: p.username,
        pic: p.avatar,
        content, timeStamp, from, status, to, id,
        delete: async ()=>{
          await db.open()
          const list = await db.tables.chat.search({from:p.username, to:p.username})
          const proc = list.map(async x=> await x.delete())
          await Promise.all(proc)
          await db.close()
        }
      }
    })
    await db.close()
    const proc = await Promise.all(list)
    return sortBy(proc, 'timeStamp')
  }

  function sortBy<T>(arr: T[], prop:keyof T, reverse:boolean=false){
    const sortMod = reverse ? -1 : 1
    const sort = (a: unknown, b: unknown) => {
      return a[prop] < b[prop] ? -1 * sortMod
          : a[prop] > b[prop] ? 1 * sortMod
          : 0
    }
    return [...arr].sort(sort)
  }
  
  export async function getConversationWith(db:Database<{chat:Chat, profile:Profile}>, u:string){
    await db.open()
    const list = (await db.tables.chat.search({from:u, to:u})).map(c=>{
        return {...c, 
                delete: async ()=>{
                    await db.open()
                    await c.delete()
                    await db.close()
                }
            }
    })
    await db.close()
    return sortBy(list, 'timeStamp')
  }
  
  export async function sendMessage(db:Database<{chat:Chat, profile:Profile}>, c:RawChat){
    const id:string = v4()
    const timeStamp = Date.now()
    const baseChat = {...c, id, timeStamp}

    await db.open()
    const u = await db.tables.profile.has({username: c.to})
    if(!u){
      const res = await (await sendRequest(API_URL.AUTH_DETAIL, {username:c.to})).json()
      await db.tables.profile.insertOne({username:c.to, avatar:res.avatar, bio:res.bio})
    }
    await db.close()

    try {
      const res = await sendRequest(API_URL.MESSAGE_SEND, baseChat)
      if(res.ok){
        await db.open()
        await db.tables.chat.insertOne({...baseChat, status:'sent'})
        const list = (await db.tables.chat.find({status:'pending'})).map(async ch=>{
          try {
            const r = await sendRequest(API_URL.MESSAGE_SEND, ch)
            if(r.ok){
              await ch.update({status:'sent'})
            }
          } catch{
            return
          }
        })
        await Promise.all(list)
        await db.close()
      }
      else {
        await db.open()
        await db.tables.chat.insertOne({...baseChat, status:'pending'})
        await db.close()
      }
    } catch{
      await db.open()
      await db.tables.chat.insertOne({...baseChat, status:'pending'})
      await db.close()
    }
    
  }

  export async function markAs(db:Database<{chat:Chat, profile:Profile}>, as:'received'|'seen', id:string){
      await db.open()
      await (await db.tables.chat.findOne({id})).update({status:as})
      await db.close()
  }

  export async function sync(db:Database<{chat:Chat, profile:Profile}>, data:{chat:Chat[], profile:Profile[]}){
      await db.open()
      await Promise.all(data.chat.map(async c=>{
          const exist = await db.tables.chat.includes({id:c.id})
          if(!exist) await db.tables.chat.insertOne(c)
      }))
      await Promise.all(data.profile.map(async p=>{
        const exist = await db.tables.profile.includes({username:p.username})
        if(!exist) await db.tables.profile.insertOne(p)
      }))
      await db.close()
  }

