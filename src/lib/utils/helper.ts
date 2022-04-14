import { Database } from "idb"
import type {Message, RawMessage, Conversation} from 'interfaces'
import {sendRequest} from './fetch'
import {API_URL} from 'interfaces'
import {v4} from 'uuid'

type D = Database<{conv:Conversation}>

export function initDB(){
    return new Database<{conv:Conversation}>('schat-data', {
      conv: [
          {name:'thumbnail'},
          {name:'with'},
          {name:'chat'},
          {name:'alias'}
      ]
  })
  }
  
  
  export async function getConversationList(db:D){
    await db.open()    
    const list = await db.tables.conv.retrieve(async c=>{
        const {chat, with: w, thumbnail} = c
        const {content, timeStamp, from, status, to, id} = chat[chat.length-1]
        return {
          with:w,
          pic: thumbnail,
          content, timeStamp, from, to, status, id,
          delete: async ()=>{
            await db.open()
            await (await db.tables.conv.findOne({with:w})).delete()
          }
      }
    })
    
    const x = await Promise.all([...list])
    return sortBy(x, 'timeStamp')
  }

  export function sortBy<T>(arr: T[], prop:keyof T, reverse:boolean=false){
    const sortMod = reverse ? -1 : 1
    const sort = (a: unknown, b: unknown) => {
      return a[prop] < b[prop] ? -1 * sortMod
          : a[prop] > b[prop] ? 1 * sortMod
          : 0
    }
    return [...arr].sort(sort)
  }
  
  export async function getConversationWith(db:D, u:string){
    await db.open()
    const chat = (await db.tables.conv.searchOne({with:u})).chat
    return sortBy(chat, 'timeStamp')
  }
  
  export async function sendMessage(db:D, c:RawMessage, {thumb, alias}:{thumb:string, alias:string}){
    const id:string = v4()
    const timeStamp = Date.now()
    const baseChat = {...c, id, timeStamp}

    await db.open()
    let conv = await db.tables.conv.findOne({with:c.to})
    if(!conv){
      await db.tables.conv.insertOne({thumbnail:thumb, chat:[{...baseChat, status:'sent'}], with:c.to, alias})
      conv = await db.tables.conv.findOne({with:c.to})
    }
    else{
      await conv.update({chat:[...conv.chat, {...baseChat, status:'sent'}]})
    }

    try {
      const res = await sendRequest(API_URL.MESSAGE_SEND, baseChat)
      if(res.ok){
        await db.open()
        const list = (await db.tables.conv.findOne({with:c.to})).chat.filter(c=>c.status==='pending')
        
        const plist = list.map(async (ch)=>{
          const r = await sendRequest(API_URL.MESSAGE_SEND, ch)
            if(r.ok){
              const chat = (await db.tables.conv.findOne({with:c.to})).chat
              await conv.update({chat:updateMessageStatus(chat, 'sent', ch.id)})
            }
          })
          
        await Promise.all(plist)
      }
      else {
        await db.open()
        await conv.update({chat:[...conv.chat, {...baseChat, status:'pending'}]})
      }
    } catch{
      await db.open()
      await conv.update({chat:[...conv.chat, {...baseChat, status:'pending'}]})
    }
    
  }

  export async function sync(db:D, data:{conv:Conversation[]}){
      await db.open()
      await Promise.all(data.conv.map(async c=>{
          const exist = await db.tables.conv.includes({with:c.with})
          if(!exist) await db.tables.conv.insertOne(c)
      }))
  }

  export function updateMessageStatus(chat:Message[], status:Message['status'], id:Message['id']|Message['id'][]){
    return chat.map(c=>{
      if(Array.isArray(id)){
        return id.includes(c.id) ? {...c, status} : c
      }
      return (c.id===id) ? {...c, status} : c
    })
  }
